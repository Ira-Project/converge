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

import { addConceptsToKnowledgeZapQuestions, computeQuestionsCompleted, createConceptTrackerForAllKnowledgeZapAttempts, createGeneratedKnowledgeZapAssignment, createKnowledgeZapAssignment, deleteKnowledgeZapAssignment, findConceptsWithoutKnowledgeZaps, findKnowledgeZapQuestionsWithoutConcepts, printConceptScores, seedKnowledgeZapAssignmentSubmission, updateKnowledgeZapAssignment } from "./knowledge/knowledge-seed";
import { addAssignmentIdToAttempts, createStepSolveAssignment, deleteStepSolveAssignment, updateStepSolveAssignmentAttempts, addConceptsToStepSolveSteps, findStepSolveStepsWithoutConcepts, createConceptTrackerForAllStepAttempts, createStepSolveToAssignment, findConceptsWithoutStepSolveSteps, createGeneratedStepSolveAssignment, createStepSolveAssignmentTemplate, clearStepSolveAssignmentTemplates, updateStepSolveActivityAssignmentIds } from "./stepSolve/stepSolve-seed";
import { computeAccuracyForReasoningAssignment, createReasoningAssignment, deleteReasoningAssignment } from "./reasoning/reasoning-seed";
import { createReadAndRelayAssignment, deleteReadAndRelayAssignment } from "./readAndRelay/readAndRelay-seed";
import { createConceptMappingAssignment, deleteConceptMappingAssignment } from "./conceptMapping/concept-mapping-seed";
import { addConceptsToQuestions, createLearnByTeachingAssignment } from "./learnByTeaching/learnByTeaching-seed";

import { deleteClassroom, deleteUser, checkUsersWithInvalidDefaultClassrooms, fixUsersWithInvalidDefaultClassrooms } from "./user/userSeed";
import { createTopics } from "./topics/topic-seed";
import { createConcepts, createGeneratedConcepts, mapAllConceptsToCourses, mapAllConceptsToGrades, mapAllConceptsToSubjects } from "./concept/concept-seed";
import { 
  mapConceptsToCourses, 
  mapConceptsToSubjects, 
  mapConceptsToGrades, 
  mapConceptsToGradesByCourse, 
  mapAllConceptRelationships, 
  getConceptMappingStats 
} from "./concept/concept-mapping-seed";
import { addActivityToAssignment, deleteNonLiveActivitiesFromAllClassrooms } from "./activity";
import { 
  mapKnowledgeZapAssignmentToCourse, 
  mapKnowledgeZapAssignmentToGrade, 
  mapKnowledgeZapAssignmentToSubject,
  mapStepSolveTemplateToCourse,
  mapStepSolveTemplateToGrade,
  mapStepSolveTemplateToSubject,
  mapReadAndRelayAssignmentToCourse,
  mapReadAndRelayAssignmentToGrade,
  mapReadAndRelayAssignmentToSubject,
  mapConceptMappingAssignmentToCourse,
  mapConceptMappingAssignmentToGrade,
  mapConceptMappingAssignmentToSubject,
  mapReasoningAssignmentToCourse,
  mapReasoningAssignmentToGrade,
  mapReasoningAssignmentToSubject,
  mapExplainAssignmentToCourse,
  mapExplainAssignmentToGrade,
  mapExplainAssignmentToSubject,
  mapAllAssignmentsToCourse,
  mapAllAssignmentsToSubject,
  mapAllAssignmentsToGrade,
} from "./assignmentMapping-seed";

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
const options = {
  "courseIds": ["EpIa!JC8*Gh^Q@0QuC&#G"], // TO DO: Need to replace this with IGCSE
  "subjectIds": ["ligzM4%#9I0wtF7&FT7b7"],
  "grades": ["9", "10"],
}

// Create concepts for all files from 1.1 to 6.2
const fileNames = [
  "1.1 - Physical quantities and measurement techniques",
  // "1.2 - Motion",
  // "1.3 - Mass and weight", 
  // "1.4 - Density",
  // "1.5 - Forces",
  // "1.6 - Momentum",
  // "1.7 - Energy, work and power",
  // "1.8 - Pressure",
  // "2.1 - Kinetic particle model of matter",
  // "2.2 - Thermal properties and temperature", 
  // "2.3 - Transfer of thermal energy",
  // "3.1 - General properties of waves",
  // "3.2 - Light",
  // "3.3 - Electromagnetic spectrum",
  // "3.4 - Sound",
  // "4.1 - Simple phenomena of magnetism",
  // "4.2 - Electrical quantities",
  // "4.3 - Electric circuits", 
  // "4.4 - Electrical safety",
  // "4.5 - Electromagnetic effects",
  // "5.1 - The nuclear model of the atom",
  // "5.2 - Radioactivity",
  // "6.1 - Earth and the Solar System",
  // "6.2 - Stars and the Universe"
];

// Process each concept file
// for (const fileName of fileNames) {
//   console.log(`Processing concept file: ${fileName}`);
//   await createConcepts(fileName, options);
// }

// await mapAllConceptsToSubjects(["2"]);
// await mapAllConceptsToGrades(["11", "12"]);
// await mapAllConceptsToCourses(["22", "23"]);


// LEARN BY TEACHING CREATION
// await createLearnByTeachingAssignment();
// await addConceptsToQuestions();

// KNOWLEDGE ZAP CREATION
// await deleteKnowledgeZapAssignment("eh5amb2jb5vs4vi8u2qo6");

// for (const fileName of fileNames) {
//   console.log(`Processing Knowledge Zap file: ${fileName}`);
//   await createKnowledgeZapAssignment(fileName, options);
// }


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
// await createStepSolveAssignment("1.1 0");

// // Create step solve assignments for all file names with different suffixes
for (const fileName of fileNames) {
  console.log(`Processing Step Solve file: ${fileName}`);
  
  // Create base file (file_name.json)
  await createStepSolveAssignment(fileName, options);
  
  // Create numbered variants (file_name_1.json to file_name_4.json)
  for (let i = 1; i <= 4; i++) {
    if(i === 2) continue;
    const numberedFileName = `${fileName}_${i}`;
    console.log(`Processing Step Solve file: ${numberedFileName}`);
    await createStepSolveAssignment(numberedFileName, options);
  }
}

// await deleteStepSolveAssignment("a598d77eb7004c39aa3d3");


// await findConceptsWithoutStepSolveSteps();
// await findStepSolveStepsWithoutConcepts();
// await updateStepSolveAssignmentAttempts();
// await addAssignmentIdToAttempts();
// await createConceptTrackerForAllStepAttempts();
// await createStepSolveToAssignment();

// READ AND RELAY CREATION AND DELETION
// await deleteReadAndRelayAssignment("na4cd9hfjx69milzqal6s");
// await createReadAndRelayAssignment();

// CONCEPT MAPPING CREATION AND DELETION
// await deleteConceptMappingAssignment("x68pe8l66n9nacdiz7ufz");
// await createConceptMappingAssignment();

// USER DELETION
// await deleteUser("vignesh@iraproject.com");
// await deleteClassroom("3eiin0pujtyg28x8gyiqp");

// MIGRATE ACTIVITY TYPE TO TEXT
// await migrateActivityTypeToText();

// await clearStepSolveAssignmentTemplates();
// await createStepSolveAssignmentTemplate();
// await updateStepSolveActivityAssignmentIds();
// await deleteNonLiveActivitiesFromAllClassrooms();

// await mapAllAssignmentsToSubject("2");
// await mapAllAssignmentsToGrade("11");
// await mapAllAssignmentsToGrade("12");
// await mapAllAssignmentsToCourse("22");
// await mapAllAssignmentsToCourse("23");