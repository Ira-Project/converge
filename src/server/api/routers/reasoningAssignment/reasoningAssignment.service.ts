import { asc, eq } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../trpc";
import type { CreateReasoningAssignmentAttemptInput, GetReasoningAssignmentInput, MakeReasoningAssignmentLiveInput } from "./reasoningAssignment.input";
import { reasoningAssignmentAttempts, reasoningAssignments } from "@/server/db/schema/reasoningAssignment";
import { reasoningQuestionToAssignment } from "@/server/db/schema/reasoningQuestions";
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

// TODO: Implement submit reasoning assignment attempt