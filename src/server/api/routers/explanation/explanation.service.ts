import { cosineSimilarity, createEmbedding, getEmbeddingThreshold, getNoExplanationResponse } from "@/lib/utils/aiUtils";
import type { ProtectedTRPCContext } from "../../trpc";
import { type ExplainInput } from "./explanation.input";
import { AssignmentUpdateActionType, QuestionStatus } from "@/lib/constants";
import { generateId } from "lucia";
import { actions } from "@/server/realtime_db/schema/actions";
import { type CleanConceptGraph, getValidAndIsolatedNodes } from "@/lib/utils/graphUtils";


export const explain = async (ctx: ProtectedTRPCContext, input: ExplainInput) => {
  
  // await ctx.realtimeDb.insert(actions).values({
  //   id: generateId(21),
  //   channelId: input.channelName,
  //   actionType: AssignmentUpdateActionType.SET_LOADING,
  //   payload: {}
  // })

  // -----------
  // Create the explanation object along with embedding
  // -----------

  const explanationEmbeddingVector = await createEmbedding(input.explanation);

  // await ctx.db.insert(explanations).values({
  //   id: generateId(21),
  //   text: input.explanation,
  //   assignmentTemplateId: input.assignmentTemplateId,
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
                  }
                }
              }
            }
          }
        }
      }
    }
  })

  const concepts = conceptsInGraph?.conceptGraphs?.conceptToGraphs?.map(({ concept }) => concept) ?? [];

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
  }

}