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

// Additional imports for deletion function
import { knowledgeZapAssignmentAttempts } from "../schema/knowledgeZap/knowledgeZapAssignment";
import { knowledgeZapQuestionAttempts } from "../schema/knowledgeZap/knowledgeZapQuestions";
import { stepSolveAssignmentAttempts } from "../schema/stepSolve/stepSolveAssignment";
import { stepSolveQuestionAttempts, stepSolveQuestionAttemptSteps } from "../schema/stepSolve/stepSolveQuestionAttempts";
import { reasoningAssignmentAttempts } from "../schema/reasoning/reasoningAssignment";
import { reasoningPathwayAttempts, reasoningAttemptFinalAnswer, reasoningPathwayAttemptSteps } from "../schema/reasoning/reasoningQuestionAttempts";
import { readAndRelayAttempts } from "../schema/readAndRelay/readAndRelayAttempts";
import { readAndRelayCheatSheets, readAndRelayComputedAnswers } from "../schema/readAndRelay/readAndRelayAttempts";
import { conceptMappingAttempts, conceptMappingMapAttempt, conceptMappingAttemptNodes, conceptMappingAttemptEdges } from "../schema/conceptMapping/conceptMappingAttempts";
import { explainTestAttempts } from "../schema/learnByTeaching/explainTestAttempt";
import { explanations, explainComputedAnswers } from "../schema/learnByTeaching/explanations";
import { orderingAttempt, orderingAttemptSelection } from "../schema/knowledgeZap/orderingQuestions";
import { matchingAttempt, matchingAttemptSelection } from "../schema/knowledgeZap/matchingQuestions";
import { multipleChoiceAttempt } from "../schema/knowledgeZap/multipleChoiceQuestions";

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

export async function deleteNonLiveActivitiesFromAllClassrooms() {
  console.log("Starting deletion of non-live activities and their dependencies...");

  // Get all non-live activities
  const nonLiveActivities = await db.select().from(activity).where(
    and(
      eq(activity.isLive, false),
      eq(activity.isDeleted, false)
    )
  );

  console.log(`Found ${nonLiveActivities.length} non-live activities to delete`);

  for (const activityRecord of nonLiveActivities) {
    console.log(`Deleting activity: ${activityRecord.name} (${activityRecord.id})`);

    // Delete nested dependencies first based on activity type
    switch (activityRecord.typeText) {
      case ActivityType.KnowledgeZap:
        // Delete knowledge zap specific attempts and their nested data
        const kzAttempts = await db.select().from(knowledgeZapAssignmentAttempts)
          .where(eq(knowledgeZapAssignmentAttempts.activityId, activityRecord.id));
        
                for (const attempt of kzAttempts) {
          // Delete question attempts and their nested data
          const questionAttempts = await db.select().from(knowledgeZapQuestionAttempts)
            .where(eq(knowledgeZapQuestionAttempts.attemptId, attempt.id));
          
          for (const qa of questionAttempts) {
            // Delete ordering attempts and selections
            const orderingAttempts = await db.select().from(orderingAttempt)
              .where(eq(orderingAttempt.questionAttemptId, qa.id));
            for (const orderAttempt of orderingAttempts) {
              await db.delete(orderingAttemptSelection)
                .where(eq(orderingAttemptSelection.attemptId, orderAttempt.id));
            }
            await db.delete(orderingAttempt)
              .where(eq(orderingAttempt.questionAttemptId, qa.id));
            
            // Delete matching attempts and selections
            const matchingAttempts = await db.select().from(matchingAttempt)
              .where(eq(matchingAttempt.questionAttemptId, qa.id));
            for (const matchAttempt of matchingAttempts) {
              await db.delete(matchingAttemptSelection)
                .where(eq(matchingAttemptSelection.attemptId, matchAttempt.id));
            }
            await db.delete(matchingAttempt)
              .where(eq(matchingAttempt.questionAttemptId, qa.id));
            
            // Delete multiple choice attempts
            await db.delete(multipleChoiceAttempt)
              .where(eq(multipleChoiceAttempt.questionAttemptId, qa.id));
          }
          
          // Delete question attempts
          await db.delete(knowledgeZapQuestionAttempts)
            .where(eq(knowledgeZapQuestionAttempts.attemptId, attempt.id));
        }
        
        // Delete assignment attempts
        await db.delete(knowledgeZapAssignmentAttempts)
          .where(eq(knowledgeZapAssignmentAttempts.activityId, activityRecord.id));
        break;

      case ActivityType.StepSolve:
        // Delete step solve attempts and their nested data
        const ssAttempts = await db.select().from(stepSolveAssignmentAttempts)
          .where(eq(stepSolveAssignmentAttempts.activityId, activityRecord.id));
        
        for (const attempt of ssAttempts) {
          // Get all question attempts for this assignment attempt
          const questionAttempts = await db.select().from(stepSolveQuestionAttempts)
            .where(eq(stepSolveQuestionAttempts.attemptId, attempt.id));
          
          // Delete step attempt steps for each question attempt first
          for (const qa of questionAttempts) {
            await db.delete(stepSolveQuestionAttemptSteps)
              .where(eq(stepSolveQuestionAttemptSteps.questionAttemptId, qa.id));
          }
          
          // Then delete step solve question attempts
          await db.delete(stepSolveQuestionAttempts)
            .where(eq(stepSolveQuestionAttempts.attemptId, attempt.id));
        }
        
        // Delete assignment attempts
        await db.delete(stepSolveAssignmentAttempts)
          .where(eq(stepSolveAssignmentAttempts.activityId, activityRecord.id));
        break;

      case ActivityType.ReasonTrace:
        // Delete reasoning attempts and their nested data
        const raAttempts = await db.select().from(reasoningAssignmentAttempts)
          .where(eq(reasoningAssignmentAttempts.activityId, activityRecord.id));
        
        for (const attempt of raAttempts) {
          // Get all pathway attempts for this assignment attempt
          const pathwayAttempts = await db.select().from(reasoningPathwayAttempts)
            .where(eq(reasoningPathwayAttempts.attemptId, attempt.id));
          
          // Delete pathway attempt steps for each pathway attempt first
          for (const pathwayAttempt of pathwayAttempts) {
            await db.delete(reasoningPathwayAttemptSteps)
              .where(eq(reasoningPathwayAttemptSteps.questionAttemptId, pathwayAttempt.id));
          }
          
          // Then delete reasoning pathway attempts and final answers
          await db.delete(reasoningPathwayAttempts)
            .where(eq(reasoningPathwayAttempts.attemptId, attempt.id));
          await db.delete(reasoningAttemptFinalAnswer)
            .where(eq(reasoningAttemptFinalAnswer.attemptId, attempt.id));
        }
        
        // Delete assignment attempts
        await db.delete(reasoningAssignmentAttempts)
          .where(eq(reasoningAssignmentAttempts.activityId, activityRecord.id));
        break;

            case ActivityType.LearnByTeaching:
        // Delete learn by teaching attempts and their nested data
        const lbtAttempts = await db.select().from(explainTestAttempts)
          .where(eq(explainTestAttempts.activityId, activityRecord.id));
        
        for (const attempt of lbtAttempts) {
          // Get all explanations for this attempt
          const explanationList = await db.select().from(explanations)
            .where(eq(explanations.testAttemptId, attempt.id));
          
          // Delete computed answers for each explanation first
          for (const explanation of explanationList) {
            await db.delete(explainComputedAnswers)
              .where(eq(explainComputedAnswers.explanationId, explanation.id));
          }
          
          // Then delete explanations
          await db.delete(explanations)
            .where(eq(explanations.testAttemptId, attempt.id));
        }
        
        // Delete test attempts
        await db.delete(explainTestAttempts)
          .where(eq(explainTestAttempts.activityId, activityRecord.id));
        break;

      case ActivityType.ReadAndRelay:
        // Delete read and relay attempts and their nested data
        const rraAttempts = await db.select().from(readAndRelayAttempts)
          .where(eq(readAndRelayAttempts.activityId, activityRecord.id));
        
        for (const attempt of rraAttempts) {
          // Get all cheatsheets for this attempt
          const cheatsheets = await db.select().from(readAndRelayCheatSheets)
            .where(eq(readAndRelayCheatSheets.attemptId, attempt.id));
          
          // Delete computed answers for each cheatsheet first
          for (const cheatsheet of cheatsheets) {
            await db.delete(readAndRelayComputedAnswers)
              .where(eq(readAndRelayComputedAnswers.cheatsheetId, cheatsheet.id));
          }
          
          // Then delete cheatsheets
          await db.delete(readAndRelayCheatSheets)
            .where(eq(readAndRelayCheatSheets.attemptId, attempt.id));
        }
        
        // Delete attempts
        await db.delete(readAndRelayAttempts)
          .where(eq(readAndRelayAttempts.activityId, activityRecord.id));
        break;

      case ActivityType.ConceptMapping:
        // Delete concept mapping attempts and their nested data
        const cmAttempts = await db.select().from(conceptMappingAttempts)
          .where(eq(conceptMappingAttempts.activityId, activityRecord.id));
        
        for (const attempt of cmAttempts) {
          // Delete map attempts and their nested data
          const mapAttempts = await db.select().from(conceptMappingMapAttempt)
            .where(eq(conceptMappingMapAttempt.attemptId, attempt.id));
          
          for (const mapAttempt of mapAttempts) {
            // Delete nodes and edges
            await db.delete(conceptMappingAttemptNodes)
              .where(eq(conceptMappingAttemptNodes.mapAttemptId, mapAttempt.id));
            await db.delete(conceptMappingAttemptEdges)
              .where(eq(conceptMappingAttemptEdges.mapAttemptId, mapAttempt.id));
          }
          
          // Delete nodes and edges linked directly to attempt
          await db.delete(conceptMappingAttemptNodes)
            .where(eq(conceptMappingAttemptNodes.attemptId, attempt.id));
          await db.delete(conceptMappingAttemptEdges)
            .where(eq(conceptMappingAttemptEdges.attemptId, attempt.id));
          
          // Delete map attempts
          await db.delete(conceptMappingMapAttempt)
            .where(eq(conceptMappingMapAttempt.attemptId, attempt.id));
        }
        
        // Delete attempts
        await db.delete(conceptMappingAttempts)
          .where(eq(conceptMappingAttempts.activityId, activityRecord.id));
        break;
    }

    // Delete activity to assignment mappings
    await db.delete(activityToAssignment)
      .where(eq(activityToAssignment.activityId, activityRecord.id));

    // Finally, delete the activity itself
    await db.delete(activity)
      .where(eq(activity.id, activityRecord.id));

    console.log(`Successfully deleted activity: ${activityRecord.name}`);
  }

  console.log(`Completed deletion of ${nonLiveActivities.length} non-live activities and all their dependencies`);
}