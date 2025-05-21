import { generateId } from "lucia/dist/crypto";

import { classrooms, usersToClassrooms } from "@/server/db/schema/classroom";
import { db } from "@/server/db";
import { ActivityType, Roles } from "@/lib/constants";
import { activity, activityToAssignment } from "@/server/db/schema/activity";
import { eq, and } from "drizzle-orm";
import { knowledgeZapAssignments } from "@/server/db/schema/knowledgeZap/knowledgeZapAssignment";
import { stepSolveAssignments } from "@/server/db/schema/stepSolve/stepSolveAssignment";
import { reasoningAssignments } from "@/server/db/schema/reasoning/reasoningAssignment";
import { explainAssignments } from "@/server/db/schema/learnByTeaching/explainAssignment";
import { readAndRelayAssignments } from "@/server/db/schema/readAndRelay/readAndRelayAssignments";
import { conceptMappingAssignments } from "@/server/db/schema/conceptMapping/conceptMappingAssignments";

export async function createClassroom(
  userId: string,
  name: string,
  // userCourses: string[],
  // userSubjects: string[],
  // userGrades: string[],
): Promise<string> {

  // For now we only have Physics content so we will create a classroom with Physics content
  const description = "Demo Classroom";
  
  const classroom = await db.insert(classrooms).values({
    id: generateId(21),
    name: `${name}'s Classroom`,
    isActive: true,
    description: description,
    code: generateId(6),
    createdBy: userId,
  }).returning({
    id: classrooms.id,
  });

  if(!classroom[0]?.id) {
    throw new Error("Failed to create classroom");
  }

  await db.insert(usersToClassrooms).values({
    role: Roles.Teacher,
    classroomId: classroom[0]?.id,
    userId: userId,
    createdAt: new Date(),
  });

  // Get all knowledge zap assignments
  const kza = await db.select().from(knowledgeZapAssignments).where(
    and(
      eq(knowledgeZapAssignments.isDeleted, false), 
      eq(knowledgeZapAssignments.isLatest, true)
    )
  );
  for(const knowledgeZapAssignment of kza) {
    await db.insert(activity).values({
      id: generateId(21),
      assignmentId: knowledgeZapAssignment.id,
      classroomId: classroom[0]?.id,
      name: knowledgeZapAssignment.name ?? "",
      topicId: knowledgeZapAssignment.topicId,
      typeText: ActivityType.KnowledgeZap,
      order: 0,
      points: 100,
    })
  }

  // Get all step solve assignments
  const ssa = await db.select().from(stepSolveAssignments).where(eq(stepSolveAssignments.isDeleted, false));
  
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
    
    await db.insert(activity).values({
      id: activityId,
      assignmentId: firstAssignment.id,
      classroomId: classroom[0]?.id,
      name: firstAssignment.name ?? "",
      topicId: topicId,
      typeText: ActivityType.StepSolve,
      order: 0,
      points: 100,
    });
    
    // Add all assignments to activityToAssignment
    for (const assignment of assignments) {
      await db.insert(activityToAssignment).values({
        id: generateId(21),
        activityId: activityId,
        stepSolveAssignmentId: assignment.id,
        createdAt: new Date(),
      });
    }
  }

  // Get all reasoning assignments
  const ra = await db.select().from(reasoningAssignments).where(eq(reasoningAssignments.isDeleted, false));
  for(const reasoningAssignment of ra) {
    await db.insert(activity).values({
      id: generateId(21),
      assignmentId: reasoningAssignment.id,
      classroomId: classroom[0]?.id,
      name: reasoningAssignment.name ?? "",
      topicId: reasoningAssignment.topicId,
      typeText: ActivityType.ReasonTrace,
      order: 0,
      points: 100,
    })
  }

  // Get all learn by teaching assignments
  const lbt = await db.select().from(explainAssignments).where(eq(explainAssignments.isDeleted, false));
  for(const learnByTeachingAssignment of lbt) {
    await db.insert(activity).values({
      id: generateId(21),
      assignmentId: learnByTeachingAssignment.id,
      classroomId: classroom[0]?.id,
      name: learnByTeachingAssignment.name ?? "",
      topicId: learnByTeachingAssignment.topicId,
      typeText: ActivityType.LearnByTeaching,
      order: 0,
      points: 100,
    })
  }

  // Get all read and relay assignments
  const rra = await db.select().from(readAndRelayAssignments).where(eq(readAndRelayAssignments.isDeleted, false));
  for(const readAndRelayAssignment of rra) {
    await db.insert(activity).values({  
      id: generateId(21),
      assignmentId: readAndRelayAssignment.id,
      classroomId: classroom[0]?.id,
      name: readAndRelayAssignment.name ?? "",
      topicId: readAndRelayAssignment.topicId,
      typeText: ActivityType.ReadAndRelay,
      order: 0,
      points: 100,
    })
  }

  // Get all concept mapping assignments
  const cma = await db.select().from(conceptMappingAssignments).where(eq(conceptMappingAssignments.isDeleted, false));
  for(const conceptMappingAssignment of cma) {
    await db.insert(activity).values({
      id: generateId(21),
      assignmentId: conceptMappingAssignment.id,
      classroomId: classroom[0]?.id,
      name: conceptMappingAssignment.name ?? "",
      topicId: conceptMappingAssignment.topicId,
      typeText: ActivityType.ConceptMapping,
      order: 0,
      points: 100,
    })
  }

  return classroom[0]?.id
}

