import { and } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../trpc";
import type { CreateAssignmentInput, ListAssignmentsInput, GetAssignmentInput } from "./assignment.input";
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

export const createAssignment = async (ctx: ProtectedTRPCContext, input: CreateAssignmentInput) => {
  
  const id = generateId(21);

  await ctx.db.insert(assignments).values({
    id: id,
    name: input.assignmentName,
    classroomId: input.classId,
    dueDate: input.dueDate,
    maxPoints: input.maxPoints ? input.maxPoints : null,
    timeLimit: input.timeLimit ? input.timeLimit : null,
    createdBy: ctx.user.id,
    assignmentTemplateId: input.assignmentTemplateId,
  });

  return id;
}

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
    },
    with : {
      classroom: {
        columns: {
          id: true,
          name: true,
        }
      },
      assignmentTemplate: {
        with: {
          conceptGraphs: {
            with: {
              conceptToGraphs: {
                with: {
                  concept: true,
                },
              },
              conceptGraphEdges: true,
            },
          },
          questions: {
            columns: {
              id: true,
              question: true,
              answer: true,
            },
          }
        }
      }
    }
  });
}
