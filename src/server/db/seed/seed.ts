/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "..";
import { and, eq } from "drizzle-orm";
import { generateId } from "lucia";

import { courses, subjects, topics } from "../schema/subject";
import { emailsToPreload } from './emailsToPreload'
import { preloadedUsers } from "../schema/user";
import { ActivityType, Roles } from "@/lib/constants";
import { classrooms } from "../schema/classroom";
import { activity } from "../schema/activity";

import { addConceptsToKnowledgeZapQuestions, computeQuestionsCompleted, createConceptTrackerForAllKnowledgeZapAttempts, createKnowledgeZapAssignment, deleteKnowledgeZapAssignment, findConceptsWithoutKnowledgeZaps, findKnowledgeZapQuestionsWithoutConcepts, printConceptScores, updateKnowledgeZapAssignment } from "./knowledge/knowledge-seed";
import { addAssignmentIdToAttempts, createStepSolveAssignment, deleteStepSolveAssignment, updateStepSolveAssignmentAttempts, addConceptsToStepSolveSteps, findStepSolveStepsWithoutConcepts, createConceptTrackerForAllStepAttempts, createStepSolveToAssignment, findConceptsWithoutStepSolveSteps } from "./stepSolve/stepSolve-seed";
import { computeAccuracyForReasoningAssignment, createReasoningAssignment, deleteReasoningAssignment } from "./reasoning/reasoning-seed";
import { createReadAndRelayAssignment, deleteReadAndRelayAssignment } from "./readAndRelay/readAndRelay-seed";
import { createConceptMappingAssignment, deleteConceptMappingAssignment } from "./conceptMapping/concept-mapping-seed";
import { addConceptsToQuestions, createLearnByTeachingAssignment } from "./learnByTeaching/learnByTeaching-seed";

import { deleteUser } from "./user/userSeed";
import { createTopics } from "./topics/topic-seed";
import { createConcepts } from "./concept/concept-seed";
import { addActivityToAssignment } from "./activity";

if(process.env.ENVIRONMENT === "prod") {
  console.log("WARNING: Running in production");
  console.log("If you'd like to stop this, press CTRL+C in the next 10 seconds");
  for (let i = 0; i < 10; i++) {
    console.log(10 - i, "seconds remaining");
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// ACTIVITY SCRIPTS
// THESE SHOULD NEVER BE NECESSARY. ONLY HERE FOR EMERGENCY PURPOSES
// await addActivitiesClassrooms();
// await addActivityToAssignment();

// TOPIC CREATION
// await createTopics();

// CONCEPT CREATION
// await createConcepts("A3 - Work, Energy and Power");


// LEARN BY TEACHING CREATION
// await createLearnByTeachingAssignment();
// await addConceptsToQuestions();

// KNOWLEDGE ZAP CREATION
// await deleteKnowledgeZapAssignment("tovzd9jjxz0s8wxodxkyv");
// await createKnowledgeZapAssignment("kinematics");
// await updateKnowledgeZapAssignment("thermodynamics2");
// await addConceptsToKnowledgeZapQuestions("thermal_energy_transfers");
// await findConceptsWithoutKnowledgeZaps();
// await findKnowledgeZapQuestionsWithoutConcepts();ß
// await createConceptTrackerForAllKnowledgeZapAttempts();
// await computeQuestionsCompleted();
// await printConceptScores();

// REASONING CREATION
// await deleteReasoningAssignment("v2f7ppwtin0zt6pkobuun");
// await createReasoningAssignment();
// await computeAccuracyForReasoningAssignment();
// await printConceptScores();

// STEP SOLVE CREATION AND DELETION 

// await deleteStepSolveAssignment("a38f5437a89b48bdbc033");
// await createStepSolveAssignment("A1 - Kinematics");

// await findConceptsWithoutStepSolveSteps();
// await findStepSolveStepsWithoutConcepts();
// await updateStepSolveAssignmentAttempts();
// await addAssignmentIdToAttempts();
// await createConceptTrackerForAllStepAttempts();
// await createStepSolveToAssignment();

// READ AND RELAY CREATION AND DELETION
// await createReadAndRelayAssignment();

// CONCEPT MAPPING CREATION AND DELETION
// await deleteConceptMappingAssignment("lwycgx4fs6lyx1ug3h94w");
// await createConceptMappingAssignment();

// USER DELETION
// await deleteUser("vignesh+1@iraproject.com");

// MIGRATE ACTIVITY TYPE TO TEXT
// await migrateActivityTypeToText();
