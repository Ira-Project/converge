import { eq, and } from "drizzle-orm";
import { db } from "../..";
import { activity, activityToAssignment } from "../../schema/activity";
import { classrooms, usersToClassrooms } from "../../schema/classroom";
import { ActivityType } from "@/lib/constants";
import { stepSolveAssignmentAttempts } from "../../schema/stepSolve/stepSolveAssignment";
import { stepSolveQuestionAttempts, stepSolveQuestionAttemptSteps } from "../../schema/stepSolve/stepSolveQuestionAttempts";
import { emailVerificationCodes, passwordResetTokens, sessions, teacherCourses, teacherGrades, teacherSubjects, users } from "../../schema/user";
import { readAndRelayAttempts, readAndRelayCheatSheets, readAndRelayComputedAnswers } from "../../schema/readAndRelay/readAndRelayAttempts";
import { reasoningAssignmentAttempts } from "../../schema/reasoning/reasoningAssignment";
import { reasoningAttemptFinalAnswer, reasoningPathwayAttempts, reasoningPathwayAttemptSteps } from "../../schema/reasoning/reasoningQuestionAttempts";
import { matchingAttemptSelection } from "../../schema/knowledgeZap/matchingQuestions";
import { multipleChoiceAttempt } from "../../schema/knowledgeZap/multipleChoiceQuestions";
import { knowledgeZapQuestionAttempts } from "../../schema/knowledgeZap/knowledgeZapQuestions";
import { matchingAttempt } from "../../schema/knowledgeZap/matchingQuestions";
import { orderingAttemptSelection } from "../../schema/knowledgeZap/orderingQuestions";
import { orderingAttempt } from "../../schema/knowledgeZap/orderingQuestions";
import { knowledgeZapAssignmentAttempts } from "../../schema/knowledgeZap/knowledgeZapAssignment";
import { explainTestAttempts } from "../../schema/learnByTeaching/explainTestAttempt";
import { explainComputedAnswers, explanations } from "../../schema/learnByTeaching/explanations";
import { conceptMappingAttemptEdges, conceptMappingAttemptNodes, conceptMappingAttempts, conceptMappingMapAttempt } from "../../schema/conceptMapping/conceptMappingAttempts";
import { conceptTracking, concepts, conceptEdges, conceptsToTopics } from "../../schema/concept";
import { explainQuestionConcepts } from "../../schema/learnByTeaching/explainQuestions";
import { stepSolveStepConcepts } from "../../schema/stepSolve/stepSolveQuestions";
import { knowledgeZapQuestionsToConcepts } from "../../schema/knowledgeZap/knowledgeZapQuestions";


async function deleteStepSolveAttempt(attemptId: string) {
  console.log(`Deleting Step Solve attempt ${attemptId}`);
  const ssQuestionAttempts = await db.select().from(stepSolveQuestionAttempts)
    .where(eq(stepSolveQuestionAttempts.attemptId, attemptId));
  console.log(`Found ${ssQuestionAttempts.length} question attempts to delete`);

  for(const questionAttempt of ssQuestionAttempts) {
    if(!questionAttempt.id) continue;
    await db.delete(stepSolveQuestionAttemptSteps)
      .where(eq(stepSolveQuestionAttemptSteps.questionAttemptId, questionAttempt.id));
    await db.delete(stepSolveQuestionAttempts)
      .where(eq(stepSolveQuestionAttempts.id, questionAttempt.id));
  }

  await db.delete(stepSolveAssignmentAttempts)
    .where(eq(stepSolveAssignmentAttempts.id, attemptId));
}

async function deleteReadAndRelayAttempt(attemptId: string) {
  console.log(`Deleting Read and Relay attempt ${attemptId}`);
  const rrCheatSheetAttempts = await db.select().from(readAndRelayCheatSheets)
    .where(eq(readAndRelayCheatSheets.attemptId, attemptId));
  console.log(`Found ${rrCheatSheetAttempts.length} cheat sheets to delete`);

  for(const cheatSheetAttempt of rrCheatSheetAttempts) {
    if(!cheatSheetAttempt.id) continue;
    await db.delete(readAndRelayComputedAnswers)
      .where(eq(readAndRelayComputedAnswers.cheatsheetId, cheatSheetAttempt.id));
    await db.delete(readAndRelayCheatSheets)
      .where(eq(readAndRelayCheatSheets.id, cheatSheetAttempt.id));
  }

  await db.delete(readAndRelayAttempts)
    .where(eq(readAndRelayAttempts.id, attemptId));
}

async function deleteReasoningAttempt(attemptId: string) {
  console.log(`Deleting Reasoning attempt ${attemptId}`);
  const rtQuestionAttempts = await db.select().from(reasoningPathwayAttempts)
    .where(eq(reasoningPathwayAttempts.attemptId, attemptId));
  console.log(`Found ${rtQuestionAttempts.length} pathway attempts to delete`);

  for(const questionAttempt of rtQuestionAttempts) {
    if(!questionAttempt.id) continue;
    await db.delete(reasoningPathwayAttemptSteps)
      .where(eq(reasoningPathwayAttemptSteps.questionAttemptId, questionAttempt.id));
    await db.delete(reasoningPathwayAttempts)
      .where(eq(reasoningPathwayAttempts.id, questionAttempt.id));
  }

  await db.delete(reasoningAttemptFinalAnswer)
    .where(eq(reasoningAttemptFinalAnswer.attemptId, attemptId));
  await db.delete(reasoningAssignmentAttempts)
    .where(eq(reasoningAssignmentAttempts.id, attemptId));
}

async function deleteKnowledgeZapAttempt(attemptId: string) {
  console.log(`Deleting Knowledge Zap attempt ${attemptId}`);
  const kzQuestionAttempts = await db.select().from(knowledgeZapQuestionAttempts)
    .where(eq(knowledgeZapQuestionAttempts.attemptId, attemptId));
  console.log(`Found ${kzQuestionAttempts.length} question attempts to delete`);

  for(const questionAttempt of kzQuestionAttempts) {
    if(!questionAttempt.id) continue; 

    // Delete multiple choice attempts
    await db.delete(multipleChoiceAttempt)
      .where(eq(multipleChoiceAttempt.questionAttemptId, questionAttempt.id));

    // Delete matching attempts and their selections
    const matchingAttempts = await db.select().from(matchingAttempt)
      .where(eq(matchingAttempt.questionAttemptId, questionAttempt.id));
    
    for(const attempt of matchingAttempts) {
      if(!attempt.id) continue;
      // Delete selections first
      await db.delete(matchingAttemptSelection)
        .where(eq(matchingAttemptSelection.attemptId, attempt.id));
    }
    // Then delete the attempts
    await db.delete(matchingAttempt)
      .where(eq(matchingAttempt.questionAttemptId, questionAttempt.id));  

    // Delete ordering attempts and their selections
    const orderingAttempts = await db.select().from(orderingAttempt)
      .where(eq(orderingAttempt.questionAttemptId, questionAttempt.id));
    
    for(const attempt of orderingAttempts) {
      if(!attempt.id) continue;
      // Delete selections first
      await db.delete(orderingAttemptSelection)
        .where(eq(orderingAttemptSelection.attemptId, attempt.id));
    }
    // Then delete the attempts
    await db.delete(orderingAttempt)
      .where(eq(orderingAttempt.questionAttemptId, questionAttempt.id));
  }

  // Delete the question attempts
  await db.delete(knowledgeZapQuestionAttempts)
    .where(eq(knowledgeZapQuestionAttempts.attemptId, attemptId));

  // Finally delete the assignment attempt
  await db.delete(knowledgeZapAssignmentAttempts)
    .where(eq(knowledgeZapAssignmentAttempts.id, attemptId));
}

async function deleteExplainTestAttempt(attemptId: string) {
  console.log(`Deleting Explain Test attempt ${attemptId}`);
  const attemptExplanations = await db.select().from(explanations)
    .where(eq(explanations.testAttemptId, attemptId));
  console.log(`Found ${attemptExplanations.length} explanations to delete`);

  for (const explanation of attemptExplanations) {
    if (!explanation.id) continue;
    
    // Delete computed answers first
    await db.delete(explainComputedAnswers)
      .where(eq(explainComputedAnswers.explanationId, explanation.id));
    
  }

  // Delete all explanations
  await db.delete(explanations)
    .where(eq(explanations.testAttemptId, attemptId));

  // Finally delete the test attempt itself
  await db.delete(explainTestAttempts)
    .where(eq(explainTestAttempts.id, attemptId));
}

async function deleteConceptMappingAttempt(attemptId: string) {
  console.log(`Deleting Concept Mapping attempt ${attemptId}`);
  const mapAttempts = await db.select().from(conceptMappingMapAttempt)
    .where(eq(conceptMappingMapAttempt.attemptId, attemptId));
  console.log(`Found ${mapAttempts.length} Concept Mapping map attempts to delete`);

  for(const mapAttempt of mapAttempts) {
    if(!mapAttempt.id) continue;
    await db.delete(conceptMappingAttemptNodes)
      .where(eq(conceptMappingAttemptNodes.mapAttemptId, mapAttempt.id));
    await db.delete(conceptMappingAttemptEdges)
      .where(eq(conceptMappingAttemptEdges.mapAttemptId, mapAttempt.id));
    await db.delete(conceptMappingMapAttempt)
      .where(eq(conceptMappingMapAttempt.id, mapAttempt.id));
  }

  await db.delete(conceptMappingAttempts)
    .where(eq(conceptMappingAttempts.id, attemptId));
}

async function deleteUserConcepts(userId: string) {
  console.log(`Deleting concepts created by user: ${userId}`);
  
  // Get all concepts created by the user
  const userConcepts = await db.select().from(concepts)
    .where(eq(concepts.createdBy, userId));
  console.log(`Found ${userConcepts.length} concepts to delete`);

  for (const concept of userConcepts) {
    if (!concept.id) continue;

    // Delete all junction table references to this concept
    await db.delete(conceptsToTopics)
      .where(eq(conceptsToTopics.conceptId, concept.id));
    
    await db.delete(explainQuestionConcepts)
      .where(eq(explainQuestionConcepts.conceptId, concept.id));
    
    await db.delete(stepSolveStepConcepts)
      .where(eq(stepSolveStepConcepts.conceptId, concept.id));
    
    await db.delete(knowledgeZapQuestionsToConcepts)
      .where(eq(knowledgeZapQuestionsToConcepts.conceptId, concept.id));

    // Delete concept tracking records for this concept
    await db.delete(conceptTracking)
      .where(eq(conceptTracking.conceptId, concept.id));

    // Delete concept edges where this concept is either the source or target
    await db.delete(conceptEdges)
      .where(eq(conceptEdges.conceptId, concept.id));
    
    await db.delete(conceptEdges)
      .where(eq(conceptEdges.relatedConceptId, concept.id));
  }

  // Finally delete the concepts themselves
  await db.delete(concepts)
    .where(eq(concepts.createdBy, userId));

  console.log(`Successfully deleted ${userConcepts.length} concepts and related data`);
}

export async function deleteClassroom(classroomId: string) {
  console.log(`Starting deletion process for classroom: ${classroomId}`);

  const classroom = await db.select().from(classrooms).where(eq(classrooms.id, classroomId));
  if(!classroom[0]) {
    console.log('Classroom not found');
    throw new Error("Classroom not found");
  }

  console.log(`Processing classroom: ${classroomId}`);
  const activities = await db.select().from(activity).where(eq(activity.classroomId, classroomId));
  console.log(`Found ${activities.length} activities in classroom ${classroomId}`);

  for(const act of activities) {
    if(act.typeText === ActivityType.StepSolve) {
      const ssAttempts = await db.select().from(stepSolveAssignmentAttempts).where(eq(stepSolveAssignmentAttempts.activityId, act.id));

      console.log(`Found ${ssAttempts.length} Step Solve attempts to delete`);

      for(const attempt of ssAttempts) {
        if(!attempt.id) continue;
        await deleteStepSolveAttempt(attempt.id);
      }
    }

    if(act.typeText === ActivityType.ReadAndRelay) {
      const rrAttempts = await db.select().from(readAndRelayAttempts).where(eq(readAndRelayAttempts.activityId, act.id));

      console.log(`Found ${rrAttempts.length} Read and Relay attempts to delete`);

      for(const attempt of rrAttempts) {
        if(!attempt.id) continue;
        await deleteReadAndRelayAttempt(attempt.id);
      }
    }

    if(act.typeText === ActivityType.ReasonTrace) {
      const rtAttempts = await db.select().from(reasoningAssignmentAttempts).where(eq(reasoningAssignmentAttempts.activityId, act.id));

      console.log(`Found ${rtAttempts.length} Reasoning attempts to delete`);

      for(const attempt of rtAttempts) {
        if(!attempt.id) continue;
        await deleteReasoningAttempt(attempt.id);
      }
    }

    if(act.typeText === ActivityType.KnowledgeZap) {
      const kzAttempts = await db.select().from(knowledgeZapAssignmentAttempts)
        .where(eq(knowledgeZapAssignmentAttempts.activityId, act.id));

      console.log(`Found ${kzAttempts.length} Knowledge Zap attempts to delete`);

      for(const attempt of kzAttempts) {
        if(!attempt.id) continue;
        await deleteKnowledgeZapAttempt(attempt.id);
      }
    }

    if(act.typeText === ActivityType.LearnByTeaching) {
      const explainAttempts = await db.select().from(explainTestAttempts)
        .where(eq(explainTestAttempts.activityId, act.id));

      console.log(`Found ${explainAttempts.length} Explain Test attempts to delete`);

      for(const attempt of explainAttempts) {
        if(!attempt.id) continue;
        await deleteExplainTestAttempt(attempt.id);
      }
    }

    if(act.typeText === ActivityType.ConceptMapping) {
      const mapAttempts = await db.select().from(conceptMappingAttempts)
        .where(eq(conceptMappingAttempts.activityId, act.id));

      console.log(`Found ${mapAttempts.length} Concept Mapping attempts to delete`);

      for(const attempt of mapAttempts) {
        if(!attempt.id) continue;
        await deleteConceptMappingAttempt(attempt.id);
      }
    }

    await db.delete(activityToAssignment).where(eq(activityToAssignment.activityId, act.id));
    await db.delete(activity).where(eq(activity.id, act.id));
  }

  await db.delete(usersToClassrooms).where(eq(usersToClassrooms.classroomId, classroomId));
  await db.delete(conceptTracking).where(eq(conceptTracking.classroomId, classroomId));
  await db.delete(classrooms).where(eq(classrooms.id, classroomId));

  console.log(`Successfully deleted classroom ${classroomId} and all related data`);
}

export async function deleteUser(email: string) {
  console.log(`Starting deletion process for user: ${email}`);

  const user = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
  if(!user[0]) {
    console.log('User not found');
    throw new Error("User not found");
  }

  const userId = user[0].id;
  console.log(`Found user with ID: ${userId}`);

  // Delete all attempts created by the user
  const ssAttempts = await db.select().from(stepSolveAssignmentAttempts)
    .where(eq(stepSolveAssignmentAttempts.userId, userId));
  console.log(`Found ${ssAttempts.length} Step Solve attempts to delete`);

  for (const attempt of ssAttempts) {
    if (!attempt.id) continue;
    await deleteStepSolveAttempt(attempt.id);
  }

  const rrAttempts = await db.select().from(readAndRelayAttempts)
    .where(eq(readAndRelayAttempts.userId, userId));
  console.log(`Found ${rrAttempts.length} Read and Relay attempts to delete`);
  for (const attempt of rrAttempts) {
    if (!attempt.id) continue;
    await deleteReadAndRelayAttempt(attempt.id);
  }

  const rtAttempts = await db.select().from(reasoningAssignmentAttempts)
    .where(eq(reasoningAssignmentAttempts.userId, userId));
  console.log(`Found ${rtAttempts.length} Reasoning attempts to delete`);
  for (const attempt of rtAttempts) {
    if (!attempt.id) continue;
    await deleteReasoningAttempt(attempt.id);
  }

  const kzAttempts = await db.select().from(knowledgeZapAssignmentAttempts)
    .where(eq(knowledgeZapAssignmentAttempts.userId, userId));
  console.log(`Found ${kzAttempts.length} Knowledge Zap attempts to delete`);
  for (const attempt of kzAttempts) {
    if (!attempt.id) continue;
    await deleteKnowledgeZapAttempt(attempt.id);
  }

  const explainAttempts = await db.select().from(explainTestAttempts)
    .where(eq(explainTestAttempts.userId, userId));
  console.log(`Found ${explainAttempts.length} Explain Test attempts to delete`);
  for (const attempt of explainAttempts) {
    if (!attempt.id) continue;
    await deleteExplainTestAttempt(attempt.id);
  }

  const mapAttempts = await db.select().from(conceptMappingAttempts)
    .where(eq(conceptMappingAttempts.userId, userId));
  console.log(`Found ${mapAttempts.length} Concept Mapping attempts to delete`);
  for (const attempt of mapAttempts) {
    if (!attempt.id) continue;
    await deleteConceptMappingAttempt(attempt.id);
  }

  // Delete all concepts created by the user
  await deleteUserConcepts(userId);

  // Delete all classrooms created by the user
  const classes = await db.select().from(classrooms).where(eq(classrooms.createdBy, userId));
  console.log(`Found ${classes.length} classrooms to delete`);

  for(const classroom of classes) {
    await deleteClassroom(classroom.id);
  }

  await db.delete(teacherCourses).where(eq(teacherCourses.userId, userId));
  await db.delete(teacherGrades).where(eq(teacherGrades.userId, userId));
  await db.delete(teacherSubjects).where(eq(teacherSubjects.userId, userId));
  await db.delete(sessions).where(eq(sessions.userId, userId));
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  await db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.userId, userId));
  await db.delete(usersToClassrooms).where(eq(usersToClassrooms.userId, userId));
  await db.delete(conceptTracking).where(eq(conceptTracking.userId, userId));

  await db.delete(users).where(eq(users.id, userId));

  console.log(`Successfully deleted user ${email} and all related data`);
}

export async function checkUsersWithInvalidDefaultClassrooms() {
  console.log("Checking for users with invalid default classroom IDs...");

  // Query users that have a defaultClassroomId set
  const usersWithDefaultClassrooms = await db
    .select({
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      defaultClassroomId: users.defaultClassroomId,
    })
    .from(users);

  // Filter users who have a defaultClassroomId
  const usersWithDefaults = usersWithDefaultClassrooms.filter(
    user => user.defaultClassroomId !== null && user.defaultClassroomId !== undefined
  );

  console.log(`Found ${usersWithDefaults.length} users with default classroom IDs set`);

  if (usersWithDefaults.length === 0) {
    console.log("No users with default classroom IDs found");
    return [];
  }

  const orphanedUsers = [];

  // Check each user's default classroom ID
  for (const user of usersWithDefaults) {
    const classroom = await db
      .select({ id: classrooms.id })
      .from(classrooms)
      .where(and(
        eq(classrooms.id, user.defaultClassroomId!),
        eq(classrooms.isDeleted, false)
      ));

    if (classroom.length === 0) {
      console.log(`❌ User ${user.userEmail} (${user.userId}) has invalid default classroom ID: ${user.defaultClassroomId}`);
      orphanedUsers.push({
        userId: user.userId,
        userName: user.userName,
        userEmail: user.userEmail,
        invalidClassroomId: user.defaultClassroomId,
      });
    } else {
      console.log(`✅ User ${user.userEmail} has valid default classroom ID: ${user.defaultClassroomId}`);
    }
  }

  if (orphanedUsers.length > 0) {
    console.log(`\n⚠️  Found ${orphanedUsers.length} users with invalid default classroom IDs:`);
    orphanedUsers.forEach(user => {
      console.log(`   - ${user.userEmail} (${user.userId}) -> ${user.invalidClassroomId}`);
    });
  } else {
    console.log("\n✅ All users with default classroom IDs have valid references");
  }

  return orphanedUsers;
}

export async function fixUsersWithInvalidDefaultClassrooms() {
  console.log("Fixing users with invalid default classroom IDs...");
  
  const orphanedUsers = await checkUsersWithInvalidDefaultClassrooms();
  
  if (orphanedUsers.length === 0) {
    console.log("No users with invalid default classroom IDs to fix");
    return;
  }

  console.log(`Fixing ${orphanedUsers.length} users by setting their defaultClassroomId to null...`);
  
  for (const user of orphanedUsers) {
    await db
      .update(users)
      .set({ defaultClassroomId: null })
      .where(eq(users.id, user.userId));
    
    console.log(`✅ Fixed user ${user.userEmail} - set defaultClassroomId to null`);
  }
  
  console.log(`Successfully fixed ${orphanedUsers.length} users`);
}