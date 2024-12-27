import { asc, eq } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../../trpc";
import type { GetAssignmentInput, MakeActivityLiveInput } from "./explainingAssignment.input";
import { questionToAssignment } from "@/server/db/schema/learnByTeaching/questions";
import { activity } from "@/server/db/schema/activity";

export const getAssignment = async (ctx: ProtectedTRPCContext, input: GetAssignmentInput) => {

  const activity = await ctx.db.query.activity.findFirst({
    where: (table, { eq }) => eq(table.id, input.activityId),
  });

  const assignmentId = activity?.assignmentId;

  if (!assignmentId) throw new Error("Activity not found");

  return await ctx.db.query.explainAssignments.findFirst({
    where: (table, { eq }) => eq(table.id, assignmentId),
    columns: {
      id: true,
      name: true,
      dueDate: true,
      createdAt: true,
      createdBy: true,
      timeLimit: true,
      description: true,
      showAnswers: true,
      showConcepts: true,
    },
    with : {
      topic: {
        columns: {
          name: true,
        }
      },
      questionToAssignment: {
        where: (table, { eq }) => eq(table.isDeleted, false),
        orderBy: [asc(questionToAssignment.order)],
        with: {
          question: {
            columns: {
              id: true,
              question: true,
              image: true,
            }
          },
        }
      },
    }
  });
}

export const makeActivityLive = async (ctx: ProtectedTRPCContext, input: MakeActivityLiveInput) => {

  return await ctx.db.update(activity).set({
    isLive: true,
    dueDate: input.dueDate,
  }).where(eq(activity.id, input.activityId));
  
} 
