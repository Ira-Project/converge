import type { ProtectedTRPCContext } from "../../trpc";
import { type ExplainInput } from "./explanation.input";
import { generateId } from "lucia";
import { computedAnswers, explanations } from "@/server/db/schema/explanations";
import { actions } from "@/server/realtime_db/schema/actions";
import { AssignmentUpdateActionType, QuestionStatus } from "@/lib/constants";
import { readExplanation } from "@/lib/utils/readExplanation";

type ResponseType = {
  body: {
    isCorrect: boolean;
    working: string;
    answer: string;
    image?: string;
    imageHeight?: number;
    imageWidth?: number;
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
  })

  console.log("Explanation Created", Date.now())
  // -----------
  // Read Explanation
  // -----------

  const assignment = await ctx.db.query.assignments.findFirst({
    where: (table, { eq }) => eq(table.id, input.assignmentId),
    columns: {
      id: true,
      conceptListId: true,
    },
    with: {
      questionToAssignment: {
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

  const conceptListId = assignment?.conceptListId;
  console.log("Assignment Found", Date.now())
  // Remove this check once we have 
  let concepts: string[] = []
  let verificationJson = undefined
  if(conceptListId) {
    let conceptListConcepts = await ctx.db.query.conceptListConcepts.findMany({
      where: (table, { eq }) => eq(table.conceptListId, conceptListId),
      with: {
        concept: {
          columns: {
            text: true,
          }
        }
      },
    })
    console.log("Concepts Found", Date.now())
  
    if(!conceptListConcepts) {
      conceptListConcepts = []
    }
  
    concepts = conceptListConcepts?.map((conceptListConcept) => conceptListConcept?.concept?.text).filter(text => text !== undefined);
    if(!concepts) {
      concepts = []
    }
    verificationJson = await readExplanation(concepts, input.explanation)
    console.log("GROQ Done", Date.now())
  } 
  
  const questionList = assignment?.questionToAssignment.map(({ question }) => question) ?? [];

  const questionPromises = []

  const body = JSON.stringify({
    explanation: input.explanation,
    concepts: verificationJson ? verificationJson : undefined,
  })

  for(const [index, question] of questionList.entries()) {
      
    const response = fetch(question.lambdaUrl, {
      method: "POST",
      body: body
    })
    .then((response) => {
      console.log(index, "Lambda Responded", Date.now())
      return response.json()
    })
    .then(async (data) => {
      console.log(index, "Lambda JSON Conversion", Date.now())
      const responseJson = data as ResponseType;
      const body = responseJson.body;
      console.log(body)
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
}