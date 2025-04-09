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

await createStepSolveAssignment("A1 - Kinematics");
await createStepSolveAssignment("A1 - Kinematics_1");
await createStepSolveAssignment("A1 - Kinematics_2");
await createStepSolveAssignment("A1 - Kinematics_3");
await createStepSolveAssignment("A1 - Kinematics_4");
await createStepSolveAssignment("A2 - Forces and Momentum");
await createStepSolveAssignment("A2 - Forces and Momentum_1");
await createStepSolveAssignment("A2 - Forces and Momentum_2");
await createStepSolveAssignment("A2 - Forces and Momentum_3");
await createStepSolveAssignment("A2 - Forces and Momentum_4");
await createStepSolveAssignment("A3 - Work, Energy and Power");
await createStepSolveAssignment("A3 - Work, Energy and Power_1");
await createStepSolveAssignment("A3 - Work, Energy and Power_2");
await createStepSolveAssignment("A3 - Work, Energy and Power_3");
await createStepSolveAssignment("A3 - Work, Energy and Power_4");
await createStepSolveAssignment("A4 - Rigid Body Mechanics");
await createStepSolveAssignment("A4 - Rigid Body Mechanics_1");
await createStepSolveAssignment("A4 - Rigid Body Mechanics_2");
await createStepSolveAssignment("A4 - Rigid Body Mechanics_3");
await createStepSolveAssignment("A4 - Rigid Body Mechanics_4");
await createStepSolveAssignment("A5 - Galilean and Special Relativity");
await createStepSolveAssignment("A5 - Galilean and Special Relativity_1");
await createStepSolveAssignment("A5 - Galilean and Special Relativity_2");
await createStepSolveAssignment("A5 - Galilean and Special Relativity_3");
await createStepSolveAssignment("A5 - Galilean and Special Relativity_4")

// await createStepSolveAssignment("B1 - Thermal Energy Transfers_1");
// await createStepSolveAssignment("B1 - Thermal Energy Transfers_2");
// await createStepSolveAssignment("B1 - Thermal Energy Transfers_3");
// await createStepSolveAssignment("B1 - Thermal Energy Transfers_4");
// await createStepSolveAssignment("B2 - Greenhouse Effect");
// await createStepSolveAssignment("B2 - Greenhouse Effect_1");
// await createStepSolveAssignment("B2 - Greenhouse Effect_2");
// await createStepSolveAssignment("B2 - Greenhouse Effect_3");
// await createStepSolveAssignment("B2 - Greenhouse Effect_4");
// await createStepSolveAssignment("B3 - Gas Laws");
// await createStepSolveAssignment("B3 - Gas Laws_1");
// await createStepSolveAssignment("B3 - Gas Laws_2");
// await createStepSolveAssignment("B3 - Gas Laws_3");
// await createStepSolveAssignment("B3 - Gas Laws_4");
// await createStepSolveAssignment("B4 - Thermodynamics_1");
// await createStepSolveAssignment("B4 - Thermodynamics_2");
// await createStepSolveAssignment("B4 - Thermodynamics_3");
// await createStepSolveAssignment("B4 - Thermodynamics_4");
// await createStepSolveAssignment("B5 - Current and Circuits");
// await createStepSolveAssignment("B5 - Current and Circuits_1");
// await createStepSolveAssignment("B5 - Current and Circuits_2");
// await createStepSolveAssignment("B5 - Current and Circuits_3");
// await createStepSolveAssignment("B5 - Current and Circuits_4");

// await createStepSolveAssignment("C1 - Simple Harmonic Motion_1");
// await createStepSolveAssignment("C1 - Simple Harmonic Motion_2");
// await createStepSolveAssignment("C1 - Simple Harmonic Motion_3");
// await createStepSolveAssignment("C1 - Simple Harmonic Motion_4");
// await createStepSolveAssignment("C2 - Wave Model");
// await createStepSolveAssignment("C2 - Wave Model_1");
// await createStepSolveAssignment("C2 - Wave Model_2");
// await createStepSolveAssignment("C2 - Wave Model_3");
// await createStepSolveAssignment("C2 - Wave Model_4");
// await createStepSolveAssignment("C3 - Wave Phenomena");
// await createStepSolveAssignment("C3 - Wave Phenomena_1");
// await createStepSolveAssignment("C3 - Wave Phenomena_2");
// await createStepSolveAssignment("C3 - Wave Phenomena_3");
// await createStepSolveAssignment("C3 - Wave Phenomena_4");
// await createStepSolveAssignment("C4 - Standing Waves and Resonance");
// await createStepSolveAssignment("C4 - Standing Waves and Resonance_1");
// await createStepSolveAssignment("C4 - Standing Waves and Resonance_2");
// await createStepSolveAssignment("C4 - Standing Waves and Resonance_3");
// await createStepSolveAssignment("C4 - Standing Waves and Resonance_4");
// await createStepSolveAssignment("C5 - Doppler Effect");
// await createStepSolveAssignment("C5 - Doppler Effect_1");
// await createStepSolveAssignment("C5 - Doppler Effect_2");
// await createStepSolveAssignment("C5 - Doppler Effect_3");
// await createStepSolveAssignment("C5 - Doppler Effect_4");

// await createStepSolveAssignment("D1 - Gravitational Fields");
// await createStepSolveAssignment("D1 - Gravitational Fields_1");
// await createStepSolveAssignment("D1 - Gravitational Fields_2");
// await createStepSolveAssignment("D1 - Gravitational Fields_3");
// await createStepSolveAssignment("D1 - Gravitational Fields_4");
// await createStepSolveAssignment("D2 - Electric and Magnetic Fields");
// await createStepSolveAssignment("D2 - Electric and Magnetic Fields_1");
// await createStepSolveAssignment("D2 - Electric and Magnetic Fields_2");
// await createStepSolveAssignment("D2 - Electric and Magnetic Fields_3");
// await createStepSolveAssignment("D2 - Electric and Magnetic Fields_4");
// await createStepSolveAssignment("D3 - Motion in Electric and Magnetic Fields");
// await createStepSolveAssignment("D3 - Motion in Electric and Magnetic Fields_1");
// await createStepSolveAssignment("D3 - Motion in Electric and Magnetic Fields_2");
// await createStepSolveAssignment("D3 - Motion in Electric and Magnetic Fields_3");
// await createStepSolveAssignment("D3 - Motion in Electric and Magnetic Fields_4");
// await createStepSolveAssignment("D4 - Electromagnetic Induction");
// await createStepSolveAssignment("D4 - Electromagnetic Induction_1");
// await createStepSolveAssignment("D4 - Electromagnetic Induction_2");
// await createStepSolveAssignment("D4 - Electromagnetic Induction_3");
// await createStepSolveAssignment("D4 - Electromagnetic Induction_4");

// await createStepSolveAssignment("E1 - Structure of the Atom");
// await createStepSolveAssignment("E1 - Structure of the Atom_1");
// await createStepSolveAssignment("E1 - Structure of the Atom_2");
// await createStepSolveAssignment("E1 - Structure of the Atom_3");
// await createStepSolveAssignment("E1 - Structure of the Atom_4");
// await createStepSolveAssignment("E2 - Quantum Physics");
// await createStepSolveAssignment("E2 - Quantum Physics_1");
// await createStepSolveAssignment("E2 - Quantum Physics_2");
// await createStepSolveAssignment("E2 - Quantum Physics_3");
// await createStepSolveAssignment("E2 - Quantum Physics_4");
// await createStepSolveAssignment("E3 - Radioactive Decay_1");
// await createStepSolveAssignment("E3 - Radioactive Decay_2");
// await createStepSolveAssignment("E3 - Radioactive Decay_3");
// await createStepSolveAssignment("E3 - Radioactive Decay_4");
// await createStepSolveAssignment("E4 - Fission");
// await createStepSolveAssignment("E4 - Fission_1");
// await createStepSolveAssignment("E4 - Fission_2");
// await createStepSolveAssignment("E4 - Fission_3");
// await createStepSolveAssignment("E4 - Fission_4");
// await createStepSolveAssignment("E5 - Fusion and Stars");
// await createStepSolveAssignment("E5 - Fusion and Stars_1");
// await createStepSolveAssignment("E5 - Fusion and Stars_2");
// await createStepSolveAssignment("E5 - Fusion and Stars_3");
// await createStepSolveAssignment("E5 - Fusion and Stars_4");

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
// await deleteUser("vignesh+2@iraproject.com");

// MIGRATE ACTIVITY TYPE TO TEXT
// await migrateActivityTypeToText();
