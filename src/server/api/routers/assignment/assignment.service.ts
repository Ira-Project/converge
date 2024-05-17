import { and } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../trpc";
import type { ListAssignmentsInput } from "./assignment.input";

export const listAssignments = async (ctx: ProtectedTRPCContext, input: ListAssignmentsInput) => {
  const assignments = await ctx.db.query.assignments.findMany({
    where: (table, { eq }) => and(eq(table.classroomId, input.classroomId), eq(table.isDeleted, false)),
    columns: {
      id: true,
      name: true,
      dueDate: true,
      createdAt: true,
      createdBy: true,
    }, 
  })
  const now = new Date();
  return {
    ongoingAssignments: assignments.filter(assignment => assignment.dueDate > now),
    pastAssignments: assignments.filter(assignment => assignment.dueDate <= now)
  }
};
