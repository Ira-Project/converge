import { and } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../trpc";
import type { CreateClassroomInput, GetClassroomInput, JoinClassroomInput } from "./classroom.input";
import { generateId } from "lucia";
import { classrooms, usersToClassrooms } from "@/server/db/schema/classroom";
import { Roles } from "@/lib/constants";
import { TRPCClientError } from "@trpc/client";

export const getClassroom = async (ctx: ProtectedTRPCContext, input: GetClassroomInput) => {
  return await ctx.db.query.classrooms.findFirst({
    where: (table, { eq }) => and(eq(table.id, input.id), eq(table.isDeleted, false)),
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
          createdAt: true,
        },
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              avatar: true,
            }
          }
        }
      }
    }
  });
}

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
    code: generateId(5).toUpperCase(),
    createdBy: ctx.user.id,  
  })

  await ctx.db.insert(usersToClassrooms).values({
    userId: ctx.user.id,
    classroomId: id,
    role: Roles.Teacher,
  });

  return id;
};

export const joinClassroom = async (ctx: ProtectedTRPCContext, input: JoinClassroomInput) => { 

  const classroom = await ctx.db.query.classrooms.findFirst({
    where: (table, { eq }) => eq(table.code, input.code.toUpperCase()),
    with: {
      classroomMembers: {
        with: {
          user: {
            columns: {
              id: true,
              name: true,
            }
          }
        }
      }
    }
  });

  if (!classroom) {
    throw new TRPCClientError(
      "Classroom not found. Please check the code and try again."
    )
  }

  if(classroom.classroomMembers.some((member) => member.user.id === ctx.user.id)) {
    throw new TRPCClientError(
      "You are already a member of this classroom."
    )
  }

  const teachers = classroom.classroomMembers.filter(
    (member) => member.role === Roles.Teacher).map((member) => member.user.name.toLocaleLowerCase());

  if(!teachers.includes(input.name.toLocaleLowerCase().trim())) {
    throw new TRPCClientError(
      "Please check your teacher's name and try again!"
    )
  }

  await ctx.db.insert(usersToClassrooms).values({
    userId: ctx.user.id,
    classroomId: classroom.id,
    role: Roles.Student,
  });

  return classroom.id;

};