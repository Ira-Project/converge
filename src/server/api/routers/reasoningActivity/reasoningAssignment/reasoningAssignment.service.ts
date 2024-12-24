import { asc, eq, sql } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../../trpc";
import type { CreateReasoningAssignmentAttemptInput, GetReasoningAssignmentInput, MakeReasoningAssignmentLiveInput, SubmitReasoningAssignmentAttemptInput } from "./reasoningAssignment.input";
import { reasoningAssignmentAttempts, reasoningAssignments } from "@/server/db/schema/reasoning/reasoningAssignment";
import { reasoningQuestionToAssignment } from "@/server/db/schema/reasoning/reasoningQuestions";
import { generateId } from "lucia";

export const getReasoningAssignment = async (ctx: ProtectedTRPCContext, input: GetReasoningAssignmentInput) => {
  return await ctx.db.query.reasoningAssignments.findFirst({
    where: (table, { eq }) => eq(table.id, input.assignmentId),
    columns: {
      id: true,
      name: true,
      dueDate: true,
      createdAt: true,
      createdBy: true,
      maxPoints: true,
      timeLimit: true,
      description: true,
      imageUrl: true,
      isLive: true,
    },
    with : {
      topic: {
        columns: {
          name: true,
        }
      },
      classroom: {
        columns: {
          id: true,
          name: true,
        }
      },
      reasoningQuestions: {
        orderBy: [asc(reasoningQuestionToAssignment.order)],
        with: {
          question: {  
            columns: {
              id: true,
              questionText: true,
              questionImage: true,
              answerText: true,
              answerImage: true,
              numberOfSteps: true,
            },
            with: {
              answerOptions: {
                columns: {
                  id: true,
                  optionText: true,
                  optionImage: true,
                },
              }
            }
          },
        }
      },
    }
  });
}

export const makeReasoningAssignmentLive = async (ctx: ProtectedTRPCContext, input: MakeReasoningAssignmentLiveInput) => {

  return await ctx.db.update(reasoningAssignments).set({
    isLive: true,
    name: input.assignmentName,
    dueDate: input.dueDate,
  }).where(eq(reasoningAssignments.id, input.assignmentId));
  
}

export const createReasoningAssignmentAttempt = async (ctx: ProtectedTRPCContext, input: CreateReasoningAssignmentAttemptInput) => {
  const id = generateId(21);
  await ctx.db.insert(reasoningAssignmentAttempts).values({
    id: id,
    assignmentId: input.assignmentId,
    userId: ctx.user.id,
  });
  return id;
}

export const submitReasoningAssignmentAttempt = async (ctx: ProtectedTRPCContext, input: SubmitReasoningAssignmentAttemptInput) => {

  let score = 0.0;
  for (const status of input.statuses) {
    if (status === 'complete') {
      score += 1;
    }
    if (status === 'part2') {
      score += 0.5;
    }
    if (status === 'part3') {
      score += 0.75;
    }
  }

  await ctx.db.update(reasoningAssignmentAttempts)
    .set({
      score: sql`${score}`,
      submittedAt: new Date(),
    })
    .where(eq(reasoningAssignmentAttempts.id, input.attemptId))
}