import { and } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../trpc";
import type { ListAssignmentsInput, GetAssignmentInput } from "./assignment.input";

export const listAssignments = async (ctx: ProtectedTRPCContext, input: ListAssignmentsInput) => {
  let assignments;
  if (input.classroomId !== undefined) {
    assignments = await ctx.db.query.assignments.findMany({
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
      }, 
      with: {
        topic: {
          columns: {
            name: true,
          }
        }
      }
    })
  } else {
    assignments = await ctx.db.query.assignments.findMany({
      where: (table, { eq }) => and(eq(table.isDeleted, false), eq(table.createdBy, ctx.user.id)),
      columns: {
        id: true,
        name: true,
        dueDate: true,
        createdAt: true,
        createdBy: true,
        description: true,
        imageUrl: true,
        isLive: true,
      }, 
      with: {
        topic: {
          columns: {
            name: true,
          }
        }
      }
    })
  }
  
  const now = new Date();
  return {
    ongoingAssignments: assignments.filter(assignment => assignment.dueDate ? assignment.dueDate > now : true),
    pastAssignments: assignments.filter(assignment => assignment.dueDate ? assignment.dueDate <= now : false)
  }
};

export const getAssignment = async (ctx: ProtectedTRPCContext, input: GetAssignmentInput) => {
  return await ctx.db.query.assignments.findFirst({
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
      questions: {
        columns: {
          id: true,
          question: true,
        },
      }
    }
  });
}
