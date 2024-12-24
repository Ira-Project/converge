import type { ProtectedTRPCContext } from "../../../trpc";
import { type ExplainInput } from "./explanation.input";
import { generateId } from "lucia";
import { computedAnswers, conceptStatus, explanations } from "@/server/db/schema/learnByTeaching/explanations";
import { actions } from "@/server/realtime_db/schema/actions";
import { AssignmentUpdateActionType, ConceptStatus, QuestionStatus } from "@/lib/constants";

type ResponseType = {
  body: {
    isCorrect: boolean;
    working: string;
    answer: string;
    image?: string;
    imageHeight?: number;
    imageWidth?: number;
    concepts?: {
      text: string;
      status: ConceptStatus
    }[];
  }
}

export const explain = async (ctx: ProtectedTRPCContext, input: ExplainInput) => {

  
  // -----------
  // Create the explanation object
  // -----------

  console.log("Function Start", Date.now())
  const explanationId = generateId(21);
  await ctx.db.insert(explanations).values({
    id: explanationId,
    text: input.explanation,
    testAttemptId: input.testAttemptId!,
    createdBy: ctx.user.id,
    formula: input.formula?.join("\n"),
  })

  console.log("Explanation Created", Date.now())
  // -----------
  // Read Explanation
  // -----------

  const assignment = await ctx.db.query.explainAssignments.findFirst({
    where: (table, { eq }) => eq(table.id, input.assignmentId),
    columns: {
      id: true,
      conceptListId: true,
    },
    with: {
      questionToAssignment: {
        where: (table, { eq }) => eq(table.isDeleted, false),
        with: {
          question: {
            columns: {
              id: true,
              lambdaUrl: true,
            }
          }
        }
      },
    }
  });

  const questionPromises = []

  const conceptListId = assignment?.conceptListId;
  console.log("Assignment Found", Date.now())

  let concepts: {
    text: string
    id: string
    status: ConceptStatus
  }[] = []
  
  if(conceptListId) {
    console.log("ConceptList Found", Date.now())
    let conceptListConcepts = await ctx.db.query.conceptListConcepts.findMany({
      where: (table, { eq }) => eq(table.conceptListId, conceptListId),
      with: {
        concept: {
          columns: {
            id: true,
            text: true,
          }
        }
      },
    })
    console.log("Concepts Found", Date.now())
  
    if(!conceptListConcepts) {
      conceptListConcepts = []
    }
  
    concepts = conceptListConcepts.map(({ concept }) => ({
      text: concept.text,
      id: concept.id,
      status: ConceptStatus.NOT_PRESENT,
    }))
  } 

  
  const questionList = assignment?.questionToAssignment.map(({ question }) => question) ?? [];


  for(const [index, question] of questionList.entries()) {
    const fetchUrl = `${process.env.BASE_REASONING_ENGINE_URL}${question.lambdaUrl}`;
    const response = fetch(fetchUrl, {
      method: "POST",
      body: JSON.stringify({
        explanation: input.explanation,
        formula: input.formula,
      }),
      headers: {
        "content-type": "application/json",
        'Accept': 'application/json',
      },
    })
    .then((response) => {
      console.log(index, "Reasoning Responded", Date.now())
      return response.json()
    })
    .then(async (data) => {
      console.log(index, "Reasoning JSON Conversion", Date.now())
      const responseJson = data as ResponseType;
      const body = responseJson.body;
      
      if(body.concepts) {
        for(const concept of body.concepts) {
          concepts = concepts.map((c) => {
            if(c.text === concept.text) {
              return {
                ...c,
                status: concept.status,
              }
            }
            return c
          })
        }
      }

      await ctx.realtimeDb.insert(actions).values({
        id: generateId(21),
        channelId: input.channelName,
        actionType: AssignmentUpdateActionType.UPDATE_EXPLANATION_AND_STATUS,
        payload: {
          questionId: question.id,
          newStatus: body.isCorrect ? QuestionStatus.CORRECT : QuestionStatus.INCORRECT,
          explanation: body.working,
          computedAnswer: body.answer,
          image: body.image ? body.image : undefined,
          imageHeight: body.imageHeight ? body.imageHeight : undefined,
          imageWidth: body.imageWidth ? body.imageWidth : undefined,
          explanationId: explanationId,
        }
      })
      .then(async () => {
          console.log(index, "Created RealtimeDB Object", Date.now())
          await ctx.db.insert(computedAnswers).values({
            id: generateId(21),
            explanationId: explanationId,
            questionId: question.id,
            isCorrect: body.isCorrect,
            workingText: body.working,
            computedAnswer: body.answer,
          })
          console.log(index, "Created Computed Answer Object", Date.now())
        });
      })
    questionPromises.push(response)
  }

  await Promise.all(questionPromises)
  for (const concept of concepts) {
    console.log("Concept: ", concept)
    await ctx.db.insert(conceptStatus).values({
      id: generateId(21),
      explanationId: explanationId,
      conceptId: concept.id,
      status: concept.status,
    })
  }
  return concepts;
}