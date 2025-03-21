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

import { computeQuestionsCompleted, createKnowledgeZapAssignment, deleteKnowledgeZapAssignment } from "./knowledge/knowledge-seed";
import { createStepSolveAssignment, deleteStepSolveAssignment, updateStepSolveAssignmentAttempts } from "./stepSolve/stepSolve-seed";
import { computeAccuracyForReasoningAssignment, createReasoningAssignment, deleteReasoningAssignment } from "./reasoning/reasoning-seed";
import { createReadAndRelayAssignment, deleteReadAndRelayAssignment } from "./readAndRelay/readAndRelay-seed";
import { deleteUser } from "./user/userSeed";
import { createConceptMappingAssignment, deleteConceptMappingAssignment } from "./conceptMapping/concept-mapping-seed";
import { migrateActivityTypeToText } from "./otherSeed";
import { addConceptsToQuestions, createLearnByTeachingAssignment } from "./learnByTeaching/learnByTeaching-seed";
import { createTopics } from "./topics/topic-seed";

if(process.env.ENVIRONMENT === "prod") {
  console.log("WARNING: Running in production");
  console.log("If you'd like to stop this, press CTRL+C in the next 10 seconds");
  for (let i = 0; i < 10; i++) {
    console.log(10 - i, "seconds remaining");
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}


// ADD ACTIVITIES TO CLASSROOMS
// THIS SHOULD NEVER BE NECESSARY. ONLY HERE FOR EMERGENCY PURPOSES
// await addActivitiesClassrooms();

// LEARN BY TEACHING CREATION
// await createLearnByTeachingAssignment();
// await addConceptsToQuestions();

// KNOWLEDGE ZAP CREATION
// await deleteKnowledgeZapAssignment("zf5w5pkx1bpjtp827uewh");
// await createKnowledgeZapAssignment();
// await computeQuestionsCompleted();

// REASONING CREATION
// await deleteReasoningAssignment("v2f7ppwtin0zt6pkobuun");
// await createReasoningAssignment();
// await computeAccuracyForReasoningAssignment();

// STEP SOLVE CREATION AND DELETION
// await deleteStepSolveAssignment("9bec9vz7cy115oso3pmlz");
// await createStepSolveAssignment();
// await updateStepSolveAssignmentAttempts();

// READ AND RELAY CREATION AND DELETION
// await createReadAndRelayAssignment();

// CONCEPT MAPPING CREATION AND DELETION
// await deleteConceptMappingAssignment("lwycgx4fs6lyx1ug3h94w");
// await createConceptMappingAssignment();

// USER DELETION
// await deleteUser();

// MIGRATE ACTIVITY TYPE TO TEXT
// await migrateActivityTypeToText();

// TOPIC CREATION
// await createTopics();