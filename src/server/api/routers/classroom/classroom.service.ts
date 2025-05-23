import { and, eq } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../trpc";
import type { GetClassroomInput, GetClassroomStudentsInput, GetClassroomTeachersInput, GetOrCreateUserToClassroomInput, JoinClassroomInput, CreateClassroomInput, UpdateClassroomInput, RemoveStudentInput, ArchiveClassroomInput } from "./classroom.input";
import { usersToClassrooms, classrooms } from "@/server/db/schema/classroom";
import { knowledgeZapAssignments } from "@/server/db/schema/knowledgeZap/knowledgeZapAssignment";
import { stepSolveAssignments } from "@/server/db/schema/stepSolve/stepSolveAssignment";
import { reasoningAssignments } from "@/server/db/schema/reasoning/reasoningAssignment";
import { explainAssignments } from "@/server/db/schema/learnByTeaching/explainAssignment";
import { readAndRelayAssignments } from "@/server/db/schema/readAndRelay/readAndRelayAssignments";
import { conceptMappingAssignments } from "@/server/db/schema/conceptMapping/conceptMappingAssignments";
import { activity, activityToAssignment } from "@/server/db/schema/activity";
import { users } from "@/server/db/schema/user";

import { Roles } from "@/lib/constants";
import { TRPCClientError } from "@trpc/client";
import { ActivityType } from "@/lib/constants";

export const getClassroom = async (ctx: ProtectedTRPCContext, input: GetClassroomInput) => {
  return await ctx.db.query.classrooms.findFirst({
    where: (table, { eq }) => and(eq(table.id, input.id), eq(table.isDeleted, false)),
    columns: {
      id: true,
      name: true,
      code: true,
      description: true,
      grade: true,
      showLeaderboardStudents: true,
      showLeaderboardTeachers: true,
      year: true,
      isActive: true,
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

export const getClassrooms = async (ctx: ProtectedTRPCContext) => {
  // First, try to get active classrooms where user is not deleted
  const activeUsersToClassrooms = await ctx.db.query.usersToClassrooms.findMany({
    where: (table, { eq }) => and(
      eq(table.userId, ctx.user.id),
      eq(table.isDeleted, false)
    ),
    with: {
      classroom: {
        columns: {
          id: true,
          name: true,
          code: true,
          description: true,
          isDeleted: true,
          isActive: true,
        },
      }
    }
  });
  
  const activeClassrooms = activeUsersToClassrooms
    .map((userToClassroom) => userToClassroom.classroom)
    .filter((classroom) => !classroom.isDeleted && classroom.isActive);
  
  if (activeClassrooms.length > 0) {
    return activeClassrooms;
  }
  
  // If no active classrooms, try archived classrooms (not active but not deleted)
  const archivedClassrooms = activeUsersToClassrooms
    .map((userToClassroom) => userToClassroom.classroom)
    .filter((classroom) => !classroom.isDeleted && !classroom.isActive);
  
  if (archivedClassrooms.length > 0) {
    return archivedClassrooms;
  }
  
  // If no archived classrooms, get classrooms where user was removed (isDeleted = true)
  const deletedUsersToClassrooms = await ctx.db.query.usersToClassrooms.findMany({
    where: (table, { eq }) => and(
      eq(table.userId, ctx.user.id),
      eq(table.isDeleted, true)
    ),
    with: {
      classroom: {
        columns: {
          id: true,
          name: true,
          code: true,
          description: true,
          isDeleted: true,
          isActive: true,
        },
      }
    }
  });
  
  return deletedUsersToClassrooms
    .map((userToClassroom) => userToClassroom.classroom)
    .filter((classroom) => !classroom.isDeleted); // Don't show completely deleted classrooms
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
          email: true,
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

  if(ctx.user.email === "vignesh@iraproject.com" || 
    ctx.user.email === "likhit@iraproject.com" 
  ) {
    return {
      role: Roles.Teacher,
      isDeleted: false,
    }
  }

  if(ctx.user.email === "vig9295@gmail.com" || 
    ctx.user.email === "likhitnayak@gmail.com" 
  ) {
    return {
      role: Roles.Student,
      isDeleted: false,
    }
  }

    // Check if user's default classroom is deleted and needs to be replaced
    const user = await ctx.db.query.users.findFirst({
      where: (table, { eq }) => eq(table.id, ctx.user.id),
      columns: {
        defaultClassroomId: true,
      }
    });
  
    if (user?.defaultClassroomId) {
      // Check if the default classroom is deleted or inactive
      const defaultClassroom = await ctx.db.query.classrooms.findFirst({
        where: (table, { eq }) => eq(table.id, user.defaultClassroomId!),
        columns: {
          isDeleted: true,
          isActive: true,
        }
      });
  
      if (defaultClassroom?.isDeleted ?? !defaultClassroom?.isActive) {
        // Find an alternative active classroom where the user is a member
        const activeClassrooms = await ctx.db.query.usersToClassrooms.findMany({
          where: (table, { eq, and }) => and(
            eq(table.userId, ctx.user.id),
            eq(table.isDeleted, false)
          ),
          with: {
            classroom: {
              columns: {
                id: true,
                isActive: true,
                isDeleted: true,
              }
            }
          }
        });
  
        // Filter to find the first active and non-deleted classroom
        const alternativeClassroom = activeClassrooms.find(
          c => c.classroom?.isActive && !c.classroom?.isDeleted
        );
  
        if (alternativeClassroom?.classroom?.id) {
          // Update the user's default classroom
          await ctx.db.update(users)
            .set({
              defaultClassroomId: alternativeClassroom.classroom.id,
              updatedAt: new Date(),
            })
            .where(eq(users.id, ctx.user.id));
        }
      }
    }
  
  const userToClassroom = await ctx.db.query.usersToClassrooms.findFirst({
    where: (table, { eq }) => and(eq(table.userId, ctx.user.id), eq(table.classroomId, input.classroomId)),
    columns: {
      role: true,
      isDeleted: true,
    }
  });

  if(userToClassroom) return userToClassroom;
  
  const newUserToClassroom = await ctx.db.insert(usersToClassrooms).values({
    userId: ctx.user.id,
    classroomId: input.classroomId,
    role: Roles.Student,
  }).returning({
    role: usersToClassrooms.role,
    isDeleted: usersToClassrooms.isDeleted,
  });

  return newUserToClassroom[0];
  
}

export const createClassroom = async (ctx: ProtectedTRPCContext, input: CreateClassroomInput) => {
  const { generateId } = await import("lucia/dist/crypto");
  
  const { name, description } = input;
  
  const classroom = await ctx.db.insert(classrooms).values({
    id: generateId(21),
    name: name,
    isActive: true,
    description: description ?? "",
    code: generateId(6),
    createdBy: ctx.user.id,
  }).returning({
    id: classrooms.id,
  });

  if(!classroom[0]?.id) {
    throw new TRPCClientError("Failed to create classroom");
  }

  await ctx.db.insert(usersToClassrooms).values({
    role: Roles.Teacher,
    classroomId: classroom[0].id,
    userId: ctx.user.id,
    createdAt: new Date(),
  });

  // Get all knowledge zap assignments
  const kza = await ctx.db.select().from(knowledgeZapAssignments).where(
    and(
      eq(knowledgeZapAssignments.isDeleted, false), 
      eq(knowledgeZapAssignments.isLatest, true)
    )
  );
  for(const knowledgeZapAssignment of kza) {
    await ctx.db.insert(activity).values({
      id: generateId(21),
      assignmentId: knowledgeZapAssignment.id,
      classroomId: classroom[0].id,
      name: knowledgeZapAssignment.name ?? "",
      topicId: knowledgeZapAssignment.topicId,
      typeText: ActivityType.KnowledgeZap,
      order: 0,
      points: 100,
    });
  }

  // Get all step solve assignments
  const ssa = await ctx.db.select().from(stepSolveAssignments).where(eq(stepSolveAssignments.isDeleted, false));
  
  // Group step solve assignments by topic
  const stepSolveByTopic: Record<string, typeof ssa> = {};
  
  for (const assignment of ssa) {
    if (!assignment.topicId) continue;
    if (!stepSolveByTopic[assignment.topicId]) {
      stepSolveByTopic[assignment.topicId] = [];
    }
    stepSolveByTopic[assignment.topicId]?.push(assignment);
  }

  // Create one activity per topic and add all assignments to activityToAssignment
  for (const [topicId, assignments] of Object.entries(stepSolveByTopic)) {
    if (assignments.length === 0) continue;
    
    // Use the first assignment to create the activity
    const firstAssignment = assignments[0];
    if (!firstAssignment) continue;
    
    const activityId = generateId(21);
    
    await ctx.db.insert(activity).values({
      id: activityId,
      assignmentId: firstAssignment.id,
      classroomId: classroom[0].id,
      name: firstAssignment.name ?? "",
      topicId: topicId,
      typeText: ActivityType.StepSolve,
      order: 0,
      points: 100,
    });
    
    // Add all assignments to activityToAssignment
    for (const assignment of assignments) {
      await ctx.db.insert(activityToAssignment).values({
        id: generateId(21),
        activityId: activityId,
        stepSolveAssignmentId: assignment.id,
        createdAt: new Date(),
      });
    }
  }

  // Get all reasoning assignments
  const ra = await ctx.db.select().from(reasoningAssignments).where(eq(reasoningAssignments.isDeleted, false));
  for(const reasoningAssignment of ra) {
    await ctx.db.insert(activity).values({
      id: generateId(21),
      assignmentId: reasoningAssignment.id,
      classroomId: classroom[0].id,
      name: reasoningAssignment.name ?? "",
      topicId: reasoningAssignment.topicId,
      typeText: ActivityType.ReasonTrace,
      order: 0,
      points: 100,
    });
  }

  // Get all learn by teaching assignments
  const lbt = await ctx.db.select().from(explainAssignments).where(eq(explainAssignments.isDeleted, false));
  for(const learnByTeachingAssignment of lbt) {
    await ctx.db.insert(activity).values({
      id: generateId(21),
      assignmentId: learnByTeachingAssignment.id,
      classroomId: classroom[0].id,
      name: learnByTeachingAssignment.name ?? "",
      topicId: learnByTeachingAssignment.topicId,
      typeText: ActivityType.LearnByTeaching,
      order: 0,
      points: 100,
    });
  }

  // Get all read and relay assignments
  const rra = await ctx.db.select().from(readAndRelayAssignments).where(eq(readAndRelayAssignments.isDeleted, false));
  for(const readAndRelayAssignment of rra) {
    await ctx.db.insert(activity).values({  
      id: generateId(21),
      assignmentId: readAndRelayAssignment.id,
      classroomId: classroom[0].id,
      name: readAndRelayAssignment.name ?? "",
      topicId: readAndRelayAssignment.topicId,
      typeText: ActivityType.ReadAndRelay,
      order: 0,
      points: 100,
    });
  }

  // Get all concept mapping assignments
  const cma = await ctx.db.select().from(conceptMappingAssignments).where(eq(conceptMappingAssignments.isDeleted, false));
  for(const conceptMappingAssignment of cma) {
    await ctx.db.insert(activity).values({
      id: generateId(21),
      assignmentId: conceptMappingAssignment.id,
      classroomId: classroom[0].id,
      name: conceptMappingAssignment.name ?? "",
      topicId: conceptMappingAssignment.topicId,
      typeText: ActivityType.ConceptMapping,
      order: 0,
      points: 100,
    });
  }

  return classroom[0].id;
}

export const updateClassroom = async (ctx: ProtectedTRPCContext, input: UpdateClassroomInput) => {
  // First check if the user is a teacher for this classroom
  const userToClassroom = await ctx.db.query.usersToClassrooms.findFirst({
    where: (table, { eq, and }) => and(
      eq(table.userId, ctx.user.id),
      eq(table.classroomId, input.id),
      eq(table.isDeleted, false)
    ),
    columns: {
      role: true,
    }
  });

  if (!userToClassroom || userToClassroom.role !== Roles.Teacher) {
    throw new TRPCClientError("You don't have permission to update this classroom");
  }

  // Update the classroom
  const [updatedClassroom] = await ctx.db.update(classrooms)
    .set({
      name: input.name,
      description: input.description ?? "",
      year: input.year,
      showLeaderboardStudents: input.showLeaderboardStudents,
      showLeaderboardTeachers: input.showLeaderboardTeachers,
      updatedAt: new Date(),
    })
    .where(eq(classrooms.id, input.id))
    .returning();

  return updatedClassroom;
};

export const removeStudent = async (ctx: ProtectedTRPCContext, input: RemoveStudentInput) => {
  // First check if the user is a teacher for this classroom
  const userToClassroom = await ctx.db.query.usersToClassrooms.findFirst({
    where: (table, { eq, and }) => and(
      eq(table.userId, ctx.user.id),
      eq(table.classroomId, input.classroomId),
      eq(table.isDeleted, false)
    ),
    columns: {
      role: true,
    }
  });

  if (!userToClassroom || userToClassroom.role !== Roles.Teacher) {
    throw new TRPCClientError("You don't have permission to remove students from this classroom");
  }

  // Soft delete the student from the classroom
  await ctx.db.update(usersToClassrooms)
    .set({
      isDeleted: true,
      deletedAt: new Date(),
    })
    .where(
      and(
        eq(usersToClassrooms.classroomId, input.classroomId),
        eq(usersToClassrooms.userId, input.studentId)
      )
    );

  return { success: true };
};

export const archiveClassroom = async (ctx: ProtectedTRPCContext, input: ArchiveClassroomInput) => {
  // First check if the user is a teacher for this classroom
  const userToClassroom = await ctx.db.query.usersToClassrooms.findFirst({
    where: (table, { eq, and }) => and(
      eq(table.userId, ctx.user.id),
      eq(table.classroomId, input.id),
      eq(table.isDeleted, false)
    ),
    columns: {
      role: true,
    }
  });

  if (!userToClassroom || userToClassroom.role !== Roles.Teacher) {
    throw new TRPCClientError("You don't have permission to archive this classroom");
  }

  // Update the classroom's isActive status to false
  const [updatedClassroom] = await ctx.db.update(classrooms)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(classrooms.id, input.id))
    .returning();

  // Check if this is the user's default classroom
  const user = await ctx.db.query.users.findFirst({
    where: (table, { eq }) => eq(table.id, ctx.user.id),
    columns: {
      defaultClassroomId: true,
    }
  });

  // If this is the user's default classroom, find another active classroom and set it as default
  if (user?.defaultClassroomId === input.id) {
    // Find another active classroom where the user is a member
    const activeClassrooms = await ctx.db.query.usersToClassrooms.findMany({
      where: (table, { eq, and }) => and(
        eq(table.userId, ctx.user.id),
        eq(table.isDeleted, false)
      ),
      with: {
        classroom: {
          columns: {
            id: true,
            isActive: true,
            isDeleted: true,
          }
        }
      }
    });

    // Filter to find the first active and non-deleted classroom that's not the one being archived
    const alternativeClassroom = activeClassrooms.find(
      c => c.classroom?.id !== input.id && c.classroom?.isActive && !c.classroom?.isDeleted
    );

    if (alternativeClassroom?.classroom?.id) {
      // Update the user's default classroom
      await ctx.db.update(users)
        .set({
          defaultClassroomId: alternativeClassroom.classroom.id,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id));
    } else {
      // If no alternative classroom exists, set defaultClassroomId to null
      await ctx.db.update(users)
        .set({
          defaultClassroomId: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id));
    }
  }

  return updatedClassroom;
};