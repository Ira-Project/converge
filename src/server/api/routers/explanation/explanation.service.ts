import { cosineSimilarity, createEmbedding, getEmbeddingThreshold, getIrrelevantExplanationResponse, getNoExplanationResponse } from "@/lib/utils/aiUtils";
import type { ProtectedTRPCContext } from "../../trpc";
import { type ExplainInput } from "./explanation.input";
import { AssignmentUpdateActionType, QuestionStatus } from "@/lib/constants";
import { generateId } from "lucia";
import { actions } from "@/server/realtime_db/schema/actions";
import { type CleanConceptGraph, getValidAndIsolatedNodes, getMissingParentsFromIsolatedNodes, getConceptQuestions } from "@/lib/utils/graphUtils";
import { type ConceptWithSimilarConcepts } from "@/lib/utils/graphUtils";
import { explanations } from "@/server/db/schema/explanations";
import { getResponseForMissingConcepts } from "@/lib/utils/missingConceptsAssistant";
import { checkConceptWithExplanation } from "@/lib/utils/conceptPresentAssistant";
import { applyConcepts } from "@/lib/utils/applyConceptsAssistant";
import { compareAnswers } from "@/lib/utils/questionUtils";


export const explain = async (ctx: ProtectedTRPCContext, input: ExplainInput) => {
  
  // -----------
  // Create the explanation object along with embedding
  // -----------

  const explanationEmbeddingVector = await createEmbedding(input.explanation);
  const explanationId = generateId(21);

  await ctx.db.insert(explanations).values({
    id: explanationId,
    text: input.explanation,
    assignmentTemplateId: input.assignmentTemplateId,
    testAttemptId: input.testAttemptId!,
    embedding: explanationEmbeddingVector,
    createdBy: ctx.user.id,
  })

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

  const conceptIdsPresentInExplanation = conceptsPresentInExplanation.map(({ id }) => id);
  
  await ctx.realtimeDb.insert(actions).values({
    id: generateId(21),
    channelId: input.channelName,
    actionType: AssignmentUpdateActionType.UPDATE_VALID_NODES,
    payload: {
      validNodeIds: conceptIdsPresentInExplanation,
    }
  })

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
  // Get the list of questions
  // -----------

  const questions = await ctx.db.query.questions.findMany({
    where: (table, { eq }) => eq(table.assignmentTemplateId, input.assignmentTemplateId),
    columns: {
      id: true,
      question: true,
      answer: true,
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
          conceptGraphRoots: {
            with: {
              rootConcept: {
                columns: { id: true }
              }
            }
          },
          conceptGraphEdges: {
            columns: { id: true, parent: true, child: true }
          },
        }
      }
    }
  })

  // -----------
  // Handle the cases where explanation is not sufficient for computation
  // -----------

  const noValidNodesPromises = [];
  const remainingQuestions: {
    id: number,
    questionText: string,
    questionGraph: CleanConceptGraph;
    answer: string,
  }[] = [];
  
  for(const question of questions) {

    const questionGraph:CleanConceptGraph = {
      nodes: question.conceptGraph?.conceptToGraphs?.map(({ concept }) => concept.id) ?? [],
      edges: question.conceptGraph?.conceptGraphEdges?.map(({ parent, child }) => ({ source: parent, target: child })) ?? [],
      roots: question.conceptGraph?.conceptGraphRoots?.map(({ rootConcept }) => rootConcept.id) ?? [],
    };

    const conceptsPresentInExplanationIds = 
      conceptsPresentInExplanation.filter(({ id }) => questionGraph.nodes.includes(id)).map(({ id }) => id);


    // -----------
    // Handle case where concepts present are irrelevant to the question
    // -----------

    if(!conceptsPresentInExplanationIds.length) {

      // TO DO: create the computed answers object
      await ctx.realtimeDb.insert(actions).values({
        id: generateId(21),
        channelId: input.channelName,
        actionType: AssignmentUpdateActionType.UPDATE_EXPLANATION_AND_STATUS,
        payload: {
          questionId: question.id,
          newStatus: QuestionStatus.INCORRECT,
          explanation: getIrrelevantExplanationResponse(),
        }
      })

      continue;
    }

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

      noValidNodesPromises.push(
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
      continue;
    }      
    
    remainingQuestions.push({
      id: question.id,
      questionText: question.question,
      questionGraph: questionGraph,
      answer: question.answer
    })
      
  }

  if(remainingQuestions.length === 0) {
    await Promise.all(noValidNodesPromises);
    return;
  } 
  void Promise.all(noValidNodesPromises);
  
  // -----------
  // Handle the cases where explanation is not sufficient for computation
  // -----------

  const conceptPresentAssistantId = conceptsInGraph?.conceptPresentAssistantId ?? "";
  const conceptPresentPromises = [
    ...concepts.map(async (concept) => 
      await checkConceptWithExplanation(conceptPresentAssistantId, input.explanation, concept.text, concept.id))
  ]
  const answersWithAnswerPresent = await Promise.all(conceptPresentPromises);
  const answersPresent = answersWithAnswerPresent.filter(({ answerPresent }) => answerPresent);

  const conceptApplyPromises = [];

  for (const question of remainingQuestions) {

    const answersForQuestion = answersPresent.filter(({ conceptId }) => 
      question.questionGraph.nodes.includes(conceptId)).map((answer) => answer.conceptId);

    const { validNodes,  isolatedNodes } = getValidAndIsolatedNodes(
      answersForQuestion,
      question.questionGraph
    );

    if(validNodes.length == 0) {
      const missingParents = getMissingParentsFromIsolatedNodes(isolatedNodes, question.questionGraph);
      const conceptsWithSimilarConcepts:ConceptWithSimilarConcepts[] = concepts.map(
        ({id, similarConceptFrom}) => {
          const similarConcepts = similarConceptFrom.filter(({conceptToId}) => question.questionGraph.nodes.includes(conceptToId));
          return {
            id, 
            similarConcepts: similarConcepts.map(({conceptToId}) => conceptToId)
          }
        }).filter(({id}) => question.questionGraph.nodes.includes(id));

      const missingConceptQuestionStrings = getConceptQuestions(
        missingParents,
        ' OR ', 
        conceptsWithSimilarConcepts, 
        conceptDictionary
      );

      noValidNodesPromises.push(
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
      continue;
    }

    const validNodeIds = validNodes.map((id) => { 
      const concept = concepts.find(({ id: conceptId }) => conceptId === id);
      return {
        id: id, 
        answer: answersPresent.find(({ conceptId }) => conceptId === id)?.answer ?? "", 
        calculationRequired: concept?.calculationRequired ?? false 
      }
    });

    const nodesToRemove:string[] = [];
    const nodesVisited:string[] = [];
    for(const validNodeId of validNodeIds) {
      nodesVisited.push(validNodeId.id);
      const similarConceptIds = concepts.find(({ id }) => id === validNodeId.id)?.similarConceptFrom.map(({ conceptToId }) => conceptToId) ?? [];
      const similarConceptsToRemove = similarConceptIds.filter((id) => !nodesVisited.includes(id));
      nodesToRemove.push(...similarConceptsToRemove);
    }

    const validNodeIdsFiltered = validNodeIds.filter(({ id }) => !nodesToRemove.includes(id));

    conceptApplyPromises.push(
      applyConcepts(ctx, question.id, question.questionText, validNodeIdsFiltered, input.channelName)
        .then(async ({ finalWorking, finalAnswer }) => {
          const isCorrect = compareAnswers(finalAnswer!, question.answer);
          await ctx.realtimeDb.insert(actions).values({
            id: generateId(21),
            channelId: input.channelName,
            actionType: AssignmentUpdateActionType.UPDATE_STATUS,
            payload: {
              questionId: question.id,
              newStatus: isCorrect ? QuestionStatus.CORRECT : QuestionStatus.INCORRECT,
              explanation: finalWorking,
              computedAnswer: finalAnswer, 
              isLast: true
            }
          })
        }
      )
    )
  }

  await Promise.all(conceptApplyPromises);
}