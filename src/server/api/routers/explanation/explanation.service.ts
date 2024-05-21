import { cosineSimilarity, createEmbedding, getEmbeddingThreshold, getNoExplanationResponse } from "@/lib/utils/aiUtils";
import type { ProtectedTRPCContext } from "../../trpc";
import { type ExplainInput } from "./explanation.input";
import { AssignmentUpdateActionType, QuestionStatus } from "@/lib/constants";
import { generateId } from "lucia";
import { actions } from "@/server/realtime_db/schema/actions";
import { type CleanConceptGraph, getValidAndIsolatedNodes, getMissingParentsFromIsolatedNodes, getConceptQuestions } from "@/lib/utils/graphUtils";
import { type ConceptWithSimilarConcepts } from "@/lib/utils/graphUtils";
import { explanations } from "@/server/db/schema/explanations";
import { getResponseForMissingConcepts } from "@/lib/utils/missingConceptsAssistant";


export const explain = async (ctx: ProtectedTRPCContext, input: ExplainInput) => {
  
  // -----------
  // Create the explanation object along with embedding
  // -----------

  const explanationEmbeddingVector = await createEmbedding(input.explanation);
  // const explanationId = generateId(21);

  // await ctx.db.insert(explanations).values({
  //   id: explanationId,
  //   text: input.explanation,
  //   assignmentTemplateId: input.assignmentTemplateId,
  //   testAttemptId: input.testAttemptId!,
  //   embedding: explanationEmbeddingVector,
  //   createdBy: ctx.user.id,
  // })

  // -----------
  // RAG Process to Determine which concepts are present in the explanation
  // -----------

  const threshold = getEmbeddingThreshold(input.explanation);

  const conceptsInGraph = await ctx.db.query.assignmentTemplates.findFirst({
    where: (table, { eq }) => eq(table.id, input.assignmentTemplateId),
    with: {
      conceptGraphs: {
        with: {
          conceptToGraphs: {
            with: { 
              concept: {
                with: {
                  conceptAnswers: {
                    columns: {
                      id: true,
                      text: true,
                      embedding: true,
                    }
                  },
                  similarConceptFrom: {
                    columns: {
                      conceptToId: true
                    },
                  },
                }
              }
            }
          }
        }
      }
    }
  })

  const concepts = conceptsInGraph?.conceptGraphs?.conceptToGraphs?.map(({ concept }) => concept) ?? [];
  const conceptDictionary: Record<string, string> = concepts.reduceRight((acc, concept) => {
      acc[concept.id] = concept.text;
      return acc;
    }, {} as Record<string, string>
  )
  

  if (!concepts.length) {
    throw new Error("No concepts found in the assignment template");
  }

  const conceptsPresentInExplanation = []

  for (const concept of concepts) {
    let maxSimilarity = 0;
    for (const conceptAnswer of concept.conceptAnswers) {
      const similarity = cosineSimilarity(explanationEmbeddingVector, conceptAnswer.embedding as number[]);
      maxSimilarity = Math.max(similarity, maxSimilarity);
    }
    if(maxSimilarity >= threshold) {
      conceptsPresentInExplanation.push(concept);
    }
  }

  // -----------
  // Handle case where no concepts are present in the explanation
  // -----------

  if (!conceptsPresentInExplanation.length) {

    const questionIds = await ctx.db.query.questions.findMany({
      where: (table, { eq }) => eq(table.assignmentTemplateId, input.assignmentTemplateId),
      columns: {
        id: true
      },
    })

    for (const question of questionIds) {

      // TO DO: create the computed answers object

      await ctx.realtimeDb.insert(actions).values({
        id: generateId(21),
        channelId: input.channelName,
        actionType: AssignmentUpdateActionType.UPDATE_EXPLANATION_AND_STATUS,
        payload: {
          questionId: question.id,
          newStatus: QuestionStatus.INCORRECT,
          explanation: getNoExplanationResponse(),
        }
      })
    }
  }

  // -----------
  // Get the valid and isolated nodes from the explanation 
  // -----------

  const questions = await ctx.db.query.questions.findMany({
    where: (table, { eq }) => eq(table.assignmentTemplateId, input.assignmentTemplateId),
    columns: {
      id: true,
      question: true
    },
    with: {
      conceptGraph: {
        with: { 
          conceptToGraphs: {
            with: {
              concept: {
                columns: { id: true}
              }
            }
          },
          conceptGraphToRoots: {
            with: {
              conceptRoot: {
                columns: { id: true }
              }
            }
          },
          conceptGraphEdges: {
            columns: { id: true, parent: true, child: true }
          }
        }
      }
    }
  })

  const promises = [];

  for(const question of questions) {

    const questionGraph:CleanConceptGraph = {
      nodes: question.conceptGraph?.conceptToGraphs?.map(({ concept }) => concept.id) ?? [],
      edges: question.conceptGraph?.conceptGraphEdges?.map(({ parent, child }) => ({ source: parent, target: child })) ?? [],
      roots: question.conceptGraph?.conceptGraphToRoots?.map(({ conceptRoot }) => conceptRoot.id) ?? [],
    };

    const conceptsPresentInExplanationIds = 
      conceptsPresentInExplanation.filter(({ id }) => questionGraph.nodes.includes(id)).map(({ id }) => id);

    const { validNodes, isolatedNodes } = getValidAndIsolatedNodes(
      conceptsPresentInExplanationIds,
      questionGraph
    );

    // -----------
    // Handle case where no valid nodes are found in the explanation
    // -----------

    if(validNodes.length == 0) {
      const missingParents = getMissingParentsFromIsolatedNodes(isolatedNodes, questionGraph);

      const conceptsWithSimilarConcepts:ConceptWithSimilarConcepts[] = concepts.map(
        ({id, similarConceptFrom}) => {
          const similarConcepts = similarConceptFrom.filter(({conceptToId}) => questionGraph.nodes.includes(conceptToId));
          return {
            id, 
            similarConcepts: similarConcepts.map(({conceptToId}) => conceptToId)
          }
        }).filter(({id}) => questionGraph.nodes.includes(id));

      const missingConceptQuestionStrings = getConceptQuestions(
        missingParents,
        ' OR ', 
        conceptsWithSimilarConcepts, 
        conceptDictionary
      );

      promises.push(
        getResponseForMissingConcepts(missingConceptQuestionStrings, input.explanation)
          .then(async (response) => {
            // TO DO: create the computed answers object
            await ctx.realtimeDb.insert(actions).values({
              id: generateId(21),
              channelId: input.channelName,
              actionType: AssignmentUpdateActionType.UPDATE_EXPLANATION_AND_STATUS,
              payload: {
                questionId: question.id,
                newStatus: QuestionStatus.INCORRECT,
                explanation: response,
              }
            })
          })
      );
    }      

      
    
      
  }

  await Promise.all(promises);

}