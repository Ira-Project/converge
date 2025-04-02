import { classrooms } from "../schema/classroom";
import { activity, activityToAssignment } from "../schema/activity";
import { eq, and } from "drizzle-orm";
import { db } from "..";
import { generateId } from "lucia";
import { knowledgeZapAssignments } from "../schema/knowledgeZap/knowledgeZapAssignment";
import { ActivityType } from "@/lib/constants";
import { stepSolveAssignments } from "../schema/stepSolve/stepSolveAssignment";
import { reasoningAssignments } from "../schema/reasoning/reasoningAssignment";
import { explainAssignments } from "../schema/learnByTeaching/explainAssignment";
import { readAndRelayAssignments } from "../schema/readAndRelay/readAndRelayAssignments";
import { conceptMappingAssignments } from "../schema/conceptMapping/conceptMappingAssignments";

export async function addActivitiesClassrooms() {

  const classes= await db.select().from(classrooms);
  for(const classroom of classes) {
    
    // Get all knowledge assignments
    const kza = await db.select().from(knowledgeZapAssignments).where(
      and(
        eq(knowledgeZapAssignments.isDeleted, false),
        eq(knowledgeZapAssignments.isLatest, true)
      )
    );
    for(const knowledgeZapAssignment of kza) {
      const existingActivity = await db.select().from(activity).where(
        and(
          eq(activity.assignmentId, knowledgeZapAssignment.id),
          eq(activity.classroomId, classroom.id),
        )
      )
      if(existingActivity.length === 0) {
        await db.insert(activity).values({
          id: generateId(21),
          assignmentId: knowledgeZapAssignment.id,
          classroomId: classroom.id,
          name: knowledgeZapAssignment.name ?? "",
          typeText: ActivityType.KnowledgeZap,
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
          typeText: ActivityType.StepSolve,
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
          typeText: ActivityType.ReasonTrace,
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
          typeText: ActivityType.LearnByTeaching,
          order: 0,
          points: 100,
        })
      }
    }

    // Get all read and relay assignments
    const rra = await db.select().from(readAndRelayAssignments).where(eq(readAndRelayAssignments.isDeleted, false));
    for(const readAndRelayAssignment of rra) {
      const existingActivity = await db.select().from(activity).where(
        and(
          eq(activity.assignmentId, readAndRelayAssignment.id),
          eq(activity.classroomId, classroom.id)
        )
      )
      if(existingActivity.length === 0) {
        await db.insert(activity).values({
          id: generateId(21),
          assignmentId: readAndRelayAssignment.id,
          classroomId: classroom.id,
          name: readAndRelayAssignment.name ?? "",
          typeText: ActivityType.ReadAndRelay,
          order: 0,
          points: 100,
        })
      }
    }

    // Get all concept mapping assignments
    const cma = await db.select().from(conceptMappingAssignments).where(eq(conceptMappingAssignments.isDeleted, false));
    for(const conceptMappingAssignment of cma) {
      const existingActivity = await db.select().from(activity).where(
        and(
          eq(activity.assignmentId, conceptMappingAssignment.id),
          eq(activity.classroomId, classroom.id)
        )
      )
      if(existingActivity.length === 0) {
        await db.insert(activity).values({
          id: generateId(21),
          assignmentId: conceptMappingAssignment.id,
          classroomId: classroom.id,
          name: conceptMappingAssignment.name ?? "",
          typeText: ActivityType.ConceptMapping,
          order: 0,
          points: 100,
        })
      }
    }
  }
}

export async function addActivityToAssignment() {
  const activities = await db.select().from(activity).where(eq(activity.isDeleted, false));
  for(const activity of activities) {
    switch(activity.typeText) {
      case ActivityType.KnowledgeZap:
        await db.insert(activityToAssignment).values({
          id: generateId(21),
          activityId: activity.id,
          knowledgeZapAssignmentId: activity.assignmentId,
        })
        break;
      case ActivityType.StepSolve:
        await db.insert(activityToAssignment).values({
          id: generateId(21),
          activityId: activity.id,
          stepSolveAssignmentId: activity.assignmentId,
        })
        break;
      case ActivityType.ReasonTrace:
        await db.insert(activityToAssignment).values({
          id: generateId(21),
          activityId: activity.id,
          reasonTraceAssignmentId: activity.assignmentId,
        })
        break;
      case ActivityType.LearnByTeaching:
        await db.insert(activityToAssignment).values({
          id: generateId(21),
          activityId: activity.id,
          learnByTeachingAssignmentId: activity.assignmentId,
        })
        break;
      case ActivityType.ReadAndRelay:
        await db.insert(activityToAssignment).values({
          id: generateId(21),
          activityId: activity.id,
          readAndRelayAssignmentId: activity.assignmentId,
        })
        break;
      case ActivityType.ConceptMapping:
        await db.insert(activityToAssignment).values({
          id: generateId(21),
          activityId: activity.id,
          conceptMappingAssignmentId: activity.assignmentId,
        })
        break;
    }
  }
}