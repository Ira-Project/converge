import { generateId } from "lucia/dist/crypto";

import { classrooms, usersToClassrooms } from "@/server/db/schema/classroom";
import { db } from "@/server/db";
import { ActivityType, Roles } from "@/lib/constants";
import { activity } from "@/server/db/schema/activity";
import { eq } from "drizzle-orm";
import { knowledgeZapAssignments } from "@/server/db/schema/knowledgeZap/knowledgeZapAssignment";
import { stepSolveAssignments } from "@/server/db/schema/stepSolve/stepSolveAssignment";
import { reasoningAssignments } from "@/server/db/schema/reasoning/reasoningAssignment";
import { explainAssignments } from "@/server/db/schema/learnByTeaching/explainAssignment";

export async function createClassroom(
  userId: string,
  name: string,
  // userCourses: string[],
  // userSubjects: string[],
  // userGrades: string[],
): Promise<string> {

  // For now we only have Physics content so we will hardcode it
  const description = "Demo Classroom";
  
  const classroom = await db.insert(classrooms).values({
    id: generateId(21),
    name: `${name}'s Classroom`,
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

  const kza = await db.select().from(knowledgeZapAssignments).where(eq(knowledgeZapAssignments.isDeleted, false));
  for(const knowledgeZapAssignment of kza) {
    await db.insert(activity).values({
      id: generateId(21),
      assignmentId: knowledgeZapAssignment.id,
      classroomId: classroom[0]?.id,
      name: knowledgeZapAssignment.name ?? "",
      type: ActivityType.KnowledgeZap,
      order: 0,
      points: 100,

    })
  }

  // Get all step solve assignments
  const ssa = await db.select().from(stepSolveAssignments).where(eq(stepSolveAssignments.isDeleted, false));
  for(const stepSolveAssignment of ssa) {
    await db.insert(activity).values({
      id: generateId(21),
      assignmentId: stepSolveAssignment.id,
      classroomId: classroom[0]?.id,
      name: stepSolveAssignment.name ?? "",
      type: ActivityType.StepSolve,
      order: 0,
      points: 100,
    })
  }

  // Get all reasoning assignments
  const ra = await db.select().from(reasoningAssignments).where(eq(reasoningAssignments.isDeleted, false));
  for(const reasoningAssignment of ra) {
    await db.insert(activity).values({
      id: generateId(21),
      assignmentId: reasoningAssignment.id,
      classroomId: classroom[0]?.id,
      name: reasoningAssignment.name ?? "",
      type: ActivityType.ReasonTrace,
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
      type: ActivityType.LearnByTeaching,
      order: 0,
      points: 100,
    })
  }

  return classroom[0]?.id
}

