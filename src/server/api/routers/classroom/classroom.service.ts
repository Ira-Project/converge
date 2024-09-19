import { and } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../trpc";
import type { CreateClassroomInput, GetClassroomInput, GetClassroomStudentsInput, GetClassroomTeachersInput, JoinClassroomInput } from "./classroom.input";
import { generateId } from "lucia";
import { classrooms, usersToClassrooms } from "@/server/db/schema/classroom";
import { Roles } from "@/lib/constants";
import { TRPCClientError } from "@trpc/client";
import { assignments } from "@/server/db/schema/assignment";
import { questionToAssignment } from "@/server/db/schema/questions";

export const getClassroom = async (ctx: ProtectedTRPCContext, input: GetClassroomInput) => {
  return await ctx.db.query.classrooms.findFirst({
    where: (table, { eq }) => and(eq(table.id, input.id), eq(table.isDeleted, false)),
    columns: {
      id: true,
      name: true,
      code: true,
      description: true,
    },
    with: {
      course: {
        columns: {
          name: true,
        },
        with: {
          subject: {
            columns: {
              imageUrl: true,
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

export const createClassroom = async (ctx: ProtectedTRPCContext, input: CreateClassroomInput) => { 
  const id = generateId(21);
  await ctx.db.insert(classrooms).values({
    id: id, 
    name: input.name,
    description: input.description,
    courseId: input.course ? input.course : null,
    code: generateId(5).toUpperCase(),
    createdBy: ctx.user.id,  
  })

  const course = await ctx.db.query.courses.findFirst({
    where: (table, { eq }) => eq(table.id, input.course),
    columns: {
      name: true,
    },
    with: {
      topics: {
        columns: {
          id: true,
          name: true,
          conceptListId: true,
        },
        with: {
          questions: {
            columns: {
              id: true,
            }
          }
        }
      }
    }
  });

  if(!course) {
    throw new TRPCClientError(
      "Course not found. Please check the course and try again."
    )
  }

  for (const topic of course.topics) {

    const assignmentId = generateId(21);
    await ctx.db.insert(assignments).values({
      id: assignmentId,
      topicId: topic.id,
      classroomId: id,
      createdBy: ctx.user.id,
      conceptListId: topic.conceptListId,
      isLive: false,
      isLocked: topic.questions.length === 0,
    });

    for (const question of topic.questions) {
      await ctx.db.insert(questionToAssignment).values({
        id: generateId(21),
        questionId: question.id,
        assignmentId: assignmentId,
      });
    }
    
  }

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