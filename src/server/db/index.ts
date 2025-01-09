import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";

import * as assignment from "./schema/learnByTeaching/explainAssignment";
import * as classroom from "./schema/classroom";
import * as subject from "./schema/subject";
import * as user from "./schema/user";
import * as concept from "./schema/learnByTeaching/concept";
import * as assignmentDetails from "./schema/learnByTeaching/explainQuestions";
import * as explanations from "./schema/learnByTeaching/explanations";
import * as testAttempts from "./schema/learnByTeaching/explainTestAttempt";
import * as lessonPlanFiles from "./schema/lessonPlan";
import * as reasoningQuestions from "./schema/reasoning/reasoningQuestions";
import * as reasoningQuestionAttempts from "./schema/reasoning/reasoningQuestionAttempts";
import * as reasoningAssignments from "./schema/reasoning/reasoningAssignment";
import * as activity from "./schema/activity";
import * as knowledgeZapAssignment from "./schema/knowledgeZap/knowledgeZapAssignment";
import * as knowledgeZapQuestions from "./schema/knowledgeZap/knowledgeZapQuestions";
import * as matchingQuestions from "./schema/knowledgeZap/matchingQuestions";
import * as multipleChoiceQuestions from "./schema/knowledgeZap/multipleChoiceQuestions";
import * as orderingQuestions from "./schema/knowledgeZap/orderingQuestions";
import * as stepSolveQuestions from "./schema/stepSolve/stepSolveQuestions";
import * as stepSolveAssignment from "./schema/stepSolve/stepSolveAssignment";
import * as stepSolveQuestionAttempts from "./schema/stepSolve/stepSolveQuestionAttempts";

export const client = postgres(env.DATABASE_URL, {
  max_lifetime: 10, 
  prepare: false,
  onnotice: () => {return},
});

export const db = drizzle(client, { schema: {
  ...assignment, 
  ...classroom, 
  ...subject, 
  ...user,
  ...concept,
  ...assignmentDetails,
  ...explanations,
  ...testAttempts,
  ...lessonPlanFiles,
  ...reasoningAssignments,
  ...reasoningQuestionAttempts,
  ...reasoningQuestions,
  ...activity,
  ...knowledgeZapAssignment,
  ...knowledgeZapQuestions,
  ...matchingQuestions,
  ...multipleChoiceQuestions,
  ...orderingQuestions,
  ...stepSolveQuestions,
  ...stepSolveAssignment,
  ...stepSolveQuestionAttempts,
}});
