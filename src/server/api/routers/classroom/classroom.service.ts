import { and, eq } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../trpc";
import type { GetClassroomInput, GetClassroomStudentsInput, GetClassroomTeachersInput, GetOrCreateUserToClassroomInput, JoinClassroomInput, CreateClassroomInput } from "./classroom.input";
import { usersToClassrooms, classrooms } from "@/server/db/schema/classroom";
import { knowledgeZapAssignments } from "@/server/db/schema/knowledgeZap/knowledgeZapAssignment";
import { stepSolveAssignments } from "@/server/db/schema/stepSolve/stepSolveAssignment";
import { reasoningAssignments } from "@/server/db/schema/reasoning/reasoningAssignment";
import { explainAssignments } from "@/server/db/schema/learnByTeaching/explainAssignment";
import { readAndRelayAssignments } from "@/server/db/schema/readAndRelay/readAndRelayAssignments";
import { conceptMappingAssignments } from "@/server/db/schema/conceptMapping/conceptMappingAssignments";
import { activity, activityToAssignment } from "@/server/db/schema/activity";

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
  const usersToClassrooms= await ctx.db.query.usersToClassrooms.findMany({
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
  return usersToClassrooms.map((userToClassroom) => userToClassroom.classroom).filter((classroom) => !classroom.isDeleted && classroom.isActive);
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

  if(ctx.user.email === "vignesh@iraproject.com" || 
    ctx.user.email === "likhit@iraproject.com" 
  ) {
    return {
      role: Roles.Teacher,
    }
  }

  if(ctx.user.email === "vig9295@gmail.com" || 
    ctx.user.email === "likhitnayak@gmail.com" 
  ) {
    return {
      role: Roles.Student,
    }
  }
  
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

  // Add user to the classroom as a teacher
  await ctx.db.insert(usersToClassrooms).values({
    userId: ctx.user.id,
    classroomId: classroom[0].id,
    role: Roles.Teacher,
    createdAt: new Date(),
  });

  return classroom[0].id;
}