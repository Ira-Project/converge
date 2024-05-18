import { and } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../trpc";
import type { CreateAssignmentInput, ListAssignmentsInput } from "./assignment.input";
import { assignments } from "@/server/db/schema/assignment";
import { generateId } from "lucia";

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
        topic: true,
      }, 
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
        topic: true,
      }, 
    })
  }
  
  const now = new Date();
  return {
    ongoingAssignments: assignments.filter(assignment => assignment.dueDate > now),
    pastAssignments: assignments.filter(assignment => assignment.dueDate <= now)
  }
};

export const createAssignment = async (ctx: ProtectedTRPCContext, input: CreateAssignmentInput) => {
  
  const id = generateId(21);

  await ctx.db.insert(assignments).values({
    id: id,
    name: input.name,
    classroomId: input.classId,
    dueDate: input.dueDate,
    maxPoints: input.maxPoints ? input.maxPoints : null,
    timeLimit: input.timeLimit ? input.timeLimit : null,
    createdBy: ctx.user.id,
  }).returning();

  return id;
}