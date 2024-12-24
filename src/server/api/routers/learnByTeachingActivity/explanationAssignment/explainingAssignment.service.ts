import { and, asc, desc, eq } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../../trpc";
import type { ListAssignmentsInput, GetAssignmentInput, MakeAssignmentLiveInput } from "./explainingAssignment.input";
import { questionToAssignment } from "@/server/db/schema/learnByTeaching/questions";
import { explainAssignments } from "@/server/db/schema/learnByTeaching/explainAssignment";

export const listAssignments = async (ctx: ProtectedTRPCContext, input: ListAssignmentsInput) => {
  
    const assignmentList = await ctx.db.query.explainAssignments.findMany({
      where: (table, { eq }) => and(eq(table.classroomId, input.classroomId!), eq(table.isDeleted, false)),
      columns: {
        id: true,
        name: true,
        dueDate: true,
        createdAt: true,
        createdBy: true,
        description: true,
        imageUrl: true,
        isLive: true,
        isLocked: true,
      }, 
      with: {
        topic: {
          columns: {
            name: true,
            imageUrl: true,
          }
        }
      },
      orderBy: [asc(explainAssignments.dueDate), desc(explainAssignments.isLive), asc(explainAssignments.isLocked)],
    })

    const now = new Date();
    let activeIndex = 0;

    for (const [, assignment]  of assignmentList.entries()) {
      if (assignment.dueDate && assignment.dueDate < now) {
        activeIndex++;
      }
    }

    return {
      assignmentList,
      activeIndex,
    }

};

export const getAssignment = async (ctx: ProtectedTRPCContext, input: GetAssignmentInput) => {
  return await ctx.db.query.explainAssignments.findFirst({
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
      showAnswers: true,
      showConcepts: true,
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

export const makeAssignmentLive = async (ctx: ProtectedTRPCContext, input: MakeAssignmentLiveInput) => {

  return await ctx.db.update(explainAssignments).set({
    isLive: true,
    name: input.assignmentName,
    dueDate: input.dueDate,
  }).where(eq(explainAssignments.id, input.assignmentId));
  
}
