import { classrooms } from "../schema/classroom";
import { activity } from "../schema/activity";
import { eq, and } from "drizzle-orm";
import { db } from "..";
import { generateId } from "lucia";
import { knowledgeZapAssignments } from "../schema/knowledgeZap/knowledgeZapAssignment";
import { ActivityType } from "@/lib/constants";
import { stepSolveAssignments } from "../schema/stepSolve/stepSolveAssignment";
import { reasoningAssignments } from "../schema/reasoning/reasoningAssignment";
import { explainAssignments } from "../schema/learnByTeaching/explainAssignment";

async function addActivitiesClassrooms(classroomId: string) {

  const classes= await db.select().from(classrooms);
  for(const classroom of classes) {
    
    // Get all knowledge assignments
    const kza = await db.select().from(knowledgeZapAssignments).where(eq(knowledgeZapAssignments.isDeleted, false));
    for(const knowledgeZapAssignment of kza) {
      const existingActivity = await db.select().from(activity).where(
        and(
          eq(activity.assignmentId, knowledgeZapAssignment.id),
          eq(activity.classroomId, classroom.id)
        )
      )
      if(existingActivity.length === 0) {
        await db.insert(activity).values({
          id: generateId(21),
          assignmentId: knowledgeZapAssignment.id,
          classroomId: classroom.id,
          name: knowledgeZapAssignment.name ?? "",
          type: ActivityType.KnowledgeZap,
          order: 0,
          points: 100,

        })
      }
    }

    // Get all step solve assignments
    const ssa = await db.select().from(stepSolveAssignments).where(eq(stepSolveAssignments.isDeleted, false));
    for(const stepSolveAssignment of ssa) {
      const existingActivity = await db.select().from(activity).where(
        and(
          eq(activity.assignmentId, stepSolveAssignment.id),
          eq(activity.classroomId, classroom.id)
        )
      )
      if(existingActivity.length === 0) {
        await db.insert(activity).values({
          id: generateId(21),
          assignmentId: stepSolveAssignment.id,
          classroomId: classroom.id,
          name: stepSolveAssignment.name ?? "",
          type: ActivityType.StepSolve,
          order: 0,
          points: 100,
        })
      }
    }

    // Get all reasoning assignments
    const ra = await db.select().from(reasoningAssignments).where(eq(reasoningAssignments.isDeleted, false));
    for(const reasoningAssignment of ra) {
      const existingActivity = await db.select().from(activity).where(
        and(
          eq(activity.assignmentId, reasoningAssignment.id),
          eq(activity.classroomId, classroom.id)
        )
      )
      if(existingActivity.length === 0) {
        await db.insert(activity).values({
          id: generateId(21),
          assignmentId: reasoningAssignment.id,
          classroomId: classroom.id,
          name: reasoningAssignment.name ?? "",
          type: ActivityType.ReasonTrace,
          order: 0,
          points: 100,
        })
      }
    }

    // Get all learn by teaching assignments
    const lbt = await db.select().from(explainAssignments).where(eq(explainAssignments.isDeleted, false));
    for(const learnByTeachingAssignment of lbt) {
      const existingActivity = await db.select().from(activity).where(
        and(
          eq(activity.assignmentId, learnByTeachingAssignment.id),
          eq(activity.classroomId, classroom.id)
        )
      )
      if(existingActivity.length === 0) {
        await db.insert(activity).values({
          id: generateId(21),
          assignmentId: learnByTeachingAssignment.id,
          classroomId: classroom.id,
          name: learnByTeachingAssignment.name ?? "",
          type: ActivityType.LearnByTeaching,
          order: 0,
          points: 100,
        })
      }
    }

  }

}
