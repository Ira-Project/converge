import { and } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../trpc";
import type { GetClassroomInput, GetClassroomStudentsInput, GetClassroomTeachersInput, GetOrCreateUserToClassroomInput, JoinClassroomInput } from "./classroom.input";
import { usersToClassrooms } from "@/server/db/schema/classroom";
import { Roles } from "@/lib/constants";
import { TRPCClientError } from "@trpc/client";

export const getClassroom = async (ctx: ProtectedTRPCContext, input: GetClassroomInput) => {
  return await ctx.db.query.classrooms.findFirst({
    where: (table, { eq }) => and(eq(table.id, input.id), eq(table.isDeleted, false)),
    columns: {
      id: true,
      name: true,
      code: true,
      description: true,
      grade: true,
    },
    with: {
      course: {
        columns: {
          name: true,
        },
        with: {
          subject: {
            columns: {
              name: true,
            }
          }
        }
      },
    }
  });
}

export const getClassroomTeachers = async (ctx: ProtectedTRPCContext, input: GetClassroomTeachersInput) => {
  return await ctx.db.query.usersToClassrooms.findMany({
    where: (table, { eq }) => 
      and(
        eq(table.classroomId, input.id), 
        eq(table.isDeleted, false),
        eq(table.role, Roles.Teacher)
      ),
    columns: {
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
  });
}

export const getClassroomStudents = async (ctx: ProtectedTRPCContext, input: GetClassroomStudentsInput) => {
  return await ctx.db.query.usersToClassrooms.findMany({
    where: (table, { eq }) => 
      and(
        eq(table.classroomId, input.id), 
        eq(table.isDeleted, false),
        eq(table.role, Roles.Student)
      ),
    columns: {
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
          course: {
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
    (member) => member.role === Roles.Teacher).map((member) => member.user.name?.toLocaleLowerCase() ?? "Anonymous");

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

export const getOrCreateUserToClassroom = async (ctx: ProtectedTRPCContext, input: GetOrCreateUserToClassroomInput) => {
  const userToClassroom = await ctx.db.query.usersToClassrooms.findFirst({
    where: (table, { eq }) => and(eq(table.userId, ctx.user.id), eq(table.classroomId, input.classroomId)),
    columns: {
      role: true,
    }
  });

  if(userToClassroom) return userToClassroom;
  
  const newUserToClassroom = await ctx.db.insert(usersToClassrooms).values({
    userId: ctx.user.id,
    classroomId: input.classroomId,
    role: Roles.Student,
  }).returning({
    role: usersToClassrooms.role,
  });

  return newUserToClassroom[0];
  
}