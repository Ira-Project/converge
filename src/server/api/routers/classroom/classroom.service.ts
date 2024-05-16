import { and } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../trpc";
import type { CreateClassroomInput } from "./classroom.input";
import { generateId } from "lucia";
import { classrooms, usersToClassrooms } from "@/server/db/schema";
import { Roles } from "@/lib/constants";

export const listClassrooms = async (ctx: ProtectedTRPCContext) => {
  return await ctx.db.query.usersToClassrooms.findMany({
    where: (table, { eq }) => and(eq(table.userId, ctx.user.id), eq(table.isDeleted, false)),
    columns: {
      userId: true,
      classroomId: true,
    }, 
    with: {
      classroom: {
        columns: {
          id: true,
          name: true,
          description: true,
        }, 
        with: {
          subject: {
            columns: {
              name: true,
            }
          },
          classroomMembers: {
            columns: {
              role: true,
            },
          }
        },
      }
    }
  });
};

export const createClassroom = async (ctx: ProtectedTRPCContext, input: CreateClassroomInput) => {
  
  const id = generateId(21);
  await ctx.db.insert(classrooms).values({
    id, 
    name: input.name,
    description: input.description,
    subjectId: input.subject ? Number(input.subject) : null,
    code: generateId(5),
    createdBy: ctx.user.id,  
  })

  await ctx.db.insert(usersToClassrooms).values({
    userId: ctx.user.id,
    classroomId: id,
    role: Roles.Teacher,
  });

  return id;

};