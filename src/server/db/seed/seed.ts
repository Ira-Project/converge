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

import { addConceptsToKnowledgeZapQuestions, computeQuestionsCompleted, createConceptTrackerForAllKnowledgeZapAttempts, createKnowledgeZapAssignment, deleteKnowledgeZapAssignment, findConceptsWithoutKnowledgeZaps, findKnowledgeZapQuestionsWithoutConcepts, updateKnowledgeZapAssignment } from "./knowledge/knowledge-seed";
import { addAssignmentIdToAttempts, createStepSolveAssignment, deleteStepSolveAssignment, updateStepSolveAssignmentAttempts } from "./stepSolve/stepSolve-seed";
import { computeAccuracyForReasoningAssignment, createReasoningAssignment, deleteReasoningAssignment } from "./reasoning/reasoning-seed";
import { createReadAndRelayAssignment, deleteReadAndRelayAssignment } from "./readAndRelay/readAndRelay-seed";
import { deleteUser } from "./user/userSeed";
import { createConceptMappingAssignment, deleteConceptMappingAssignment } from "./conceptMapping/concept-mapping-seed";
import { addConceptsToQuestions, createLearnByTeachingAssignment } from "./learnByTeaching/learnByTeaching-seed";
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

// ADD ACTIVITIES TO CLASSROOMS
// THIS SHOULD NEVER BE NECESSARY. ONLY HERE FOR EMERGENCY PURPOSES
// await addActivitiesClassrooms();
// await addActivityToAssignment();

// TOPIC CREATION
// await createTopics();

// CONCEPT CREATION
// await createConcepts("A1 - Kinematics");
// await createConcepts("A2 - Forces and Momentum");
// await createConcepts("A3 - Work, Energy and Power");
// await createConcepts("A4 - Rigid Body Mechanics");
// await createConcepts("A5 - Galilean and Special Relativity");
// await createConcepts("B1 - Thermal Energy Transfers");
// await createConcepts("B2 - Greenhouse Effect");
// await createConcepts("B3 - Gas Laws");
// await createConcepts("B4 - Thermodynamics");
// await createConcepts("B5 - Current and Circuits");
// await createConcepts("C1 - Simple Harmonic Motion");
// await createConcepts("C2 - Wave Model");
// await createConcepts("C3 - Wave Phenomena");
// await createConcepts("C4 - Standing Waves and Resonance");
// await createConcepts("C5 - Doppler Effect");
// await createConcepts("D1 - Gravitational Fields");
// await createConcepts("D2 - Electric and Magnetic Fields");
// await createConcepts("D3 - Motion in Electric and Magnetic Fields");
// await createConcepts("D4 - Electromagnetic Induction");
// await createConcepts("E1 - Structure of the Atom");
// await createConcepts("E2 - Quantum Physics");
// await createConcepts("E3 - Radioactive Decay");
// await createConcepts("E4 - Fission");
// await createConcepts("E5 - Fusion and Stars");


// LEARN BY TEACHING CREATION
// await createLearnByTeachingAssignment();
// await addConceptsToQuestions();

// KNOWLEDGE ZAP CREATION
// await deleteKnowledgeZapAssignment("tovzd9jjxz0s8wxodxkyv");

// await createKnowledgeZapAssignment("kinematics");
// await createKnowledgeZapAssignment("forces_and_momentum");
// await createKnowledgeZapAssignment("work_energy_and_power");
// await createKnowledgeZapAssignment("rigid_body_mechanics");
// await createKnowledgeZapAssignment("galilean_and_special_relativity");
// await createKnowledgeZapAssignment("thermal_energy_transfers");
// await createKnowledgeZapAssignment("greenhouse_effect");
// await createKnowledgeZapAssignment("gas_laws"); 
// await createKnowledgeZapAssignment("thermodynamics");
// await createKnowledgeZapAssignment("current_and_circuits");
// await createKnowledgeZapAssignment("simple_harmonic_motion");
// await createKnowledgeZapAssignment("wave_model");
// await createKnowledgeZapAssignment("wave_phenomena");
// await createKnowledgeZapAssignment("standing_waves_and_resonance");
// await createKnowledgeZapAssignment("doppler_effect");
// await createKnowledgeZapAssignment("gravitational_fields");
// await createKnowledgeZapAssignment("electric_and_magnetic_fields");
// await createKnowledgeZapAssignment("motion_in_electric_and_magnetic_fields");
// await createKnowledgeZapAssignment("electromagnetic_induction");
// await createKnowledgeZapAssignment("structure_of_the_atom");
// await createKnowledgeZapAssignment("quantum_physics");
// await createKnowledgeZapAssignment("radioactive_decay");
// await createKnowledgeZapAssignment("fission");
// await createKnowledgeZapAssignment("fusion_and_stars");

// await updateKnowledgeZapAssignment("thermodynamics2");

// await addConceptsToKnowledgeZapQuestions("thermal_energy_transfers");
// await addConceptsToKnowledgeZapQuestions("thermodynamics");
// await addConceptsToKnowledgeZapQuestions("simple_harmonic_motion");
// await addConceptsToKnowledgeZapQuestions("radioactive_decay");

// await findConceptsWithoutKnowledgeZaps();
// await findKnowledgeZapQuestionsWithoutConcepts();
// await createConceptTrackerForAllKnowledgeZapAttempts();
// await computeQuestionsCompleted();

// REASONING CREATION
// await deleteReasoningAssignment("v2f7ppwtin0zt6pkobuun");
// await createReasoningAssignment();
// await computeAccuracyForReasoningAssignment();

// STEP SOLVE CREATION AND DELETION
// await deleteStepSolveAssignment("6uyBKuPSx22HEHjHxBdmh");
// await deleteStepSolveAssignment("r2GZSPW3y2jpC359DVteN");
// await createStepSolveAssignment("B4 - Thermodynamics");
// await createStepSolveAssignment("thermodynamics");
// await updateStepSolveAssignmentAttempts();
await addAssignmentIdToAttempts();

// READ AND RELAY CREATION AND DELETION
// await createReadAndRelayAssignment();

// CONCEPT MAPPING CREATION AND DELETION
// await deleteConceptMappingAssignment("lwycgx4fs6lyx1ug3h94w");
// await createConceptMappingAssignment();

// USER DELETION
// await deleteUser("vigfb@gmail.com");

// MIGRATE ACTIVITY TYPE TO TEXT
// await migrateActivityTypeToText();
