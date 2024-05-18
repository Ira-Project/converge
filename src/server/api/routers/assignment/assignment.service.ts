import { and } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../trpc";
import type { ListAssignmentsInput } from "./assignment.input";

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
      }, 
      with: {
        assignmentTemplate: {
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
      }, 
      with: {
        assignmentTemplate: {
          columns: {
            name: true,
          }
        }
      }
    })
  }
  
  const now = new Date();
  return {
    ongoingAssignments: assignments.filter(assignment => assignment.dueDate > now),
    pastAssignments: assignments.filter(assignment => assignment.dueDate <= now)
  }
};