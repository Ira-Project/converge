import type { ProtectedTRPCContext } from "../../../trpc";
import { type EvaluateReadingInput } from "./evaluateReading.input";
import { generateId } from "lucia";
import { actions } from "@/server/realtime_db/schema/actions";
import { AssignmentUpdateActionType, QuestionStatus } from "@/lib/constants";
import { readAndRelayCheatSheets, readAndRelayComputedAnswers } from "@/server/db/schema/readAndRelay/readAndRelayAttempts";

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

export const evaluateReading = async (ctx: ProtectedTRPCContext, input: EvaluateReadingInput) => {
  
  // -----------
  // Create the explanation object
  // -----------

  console.log("Function Start", Date.now())
  const cheatsheetId = generateId(21);
  await ctx.db.insert(readAndRelayCheatSheets).values({
    id: cheatsheetId,
    highlights: input.highlights,
    formulas: input.formulas,
    attemptId: input.attemptId!,
    createdBy: ctx.user.id,
  })

  console.log("CheatSheet Created", Date.now())
  // -----------
  // Read Explanation
  // -----------

  const assignment = await ctx.db.query.readAndRelayAssignments.findFirst({
    where: (table, { eq }) => eq(table.id, input.assignmentId),
    columns: {
      id: true,
    },
    with: {
      questionsToAssignment: {
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
  const questionList = assignment?.questionsToAssignment.map(({ question }) => question) ?? [];

  for(const [index, question] of questionList.entries()) {
    const fetchUrl = `${process.env.BASE_REASONING_ENGINE_URL}${question.lambdaUrl}`;
    const response = fetch(fetchUrl, {
      method: "POST",
      body: JSON.stringify({
        highlights: input.highlights,
        formulas: input.formulas,
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
      console.log(index, "Reasoning Data", data, question.lambdaUrl)
      console.log(index, "Reasoning JSON Conversion", Date.now())
      const responseJson = data as ResponseType;
      const body = responseJson.body;
      
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
          cheatsheetId: cheatsheetId,
        }
      })
      .then(async () => {
          console.log(index, "Created RealtimeDB Object", Date.now())
          await ctx.db.insert(readAndRelayComputedAnswers).values({
            id: generateId(21),
            cheatsheetId: cheatsheetId,
            questionId: question.id,
            isCorrect: body.isCorrect,
            workingText: body.working,
            answer: body.answer,
            image: body.image ? body.image : undefined,
          })
          console.log(index, "Created Computed Answer Object", Date.now())
        });
      })
    questionPromises.push(response)
  }

  await Promise.all(questionPromises)
  return {
    cheatsheetId,
  }
}