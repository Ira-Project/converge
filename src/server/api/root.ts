import { createTRPCRouter } from "./trpc";

import { classroomRouter } from "./routers/classroom/classroom.procedure";
import { fileUploadRouter } from "./routers/fileUpload/fileUpload.procedure";
import { userOnboardingRouter } from "./routers/userOnboarding/userOnboarding.procedure";
import { userSettingsRouter } from "./routers/userSettings/userSettings.procedure";
import { subjectRouter } from "./routers/subject/subject.procedure";

import { activitiesRouter } from "./routers/activities/activities.procedure";

import { explanationRouter } from "./routers/learnByTeachingActivity/explanation/explanation.procedure";
import { learnByTeachingRouter } from "./routers/learnByTeachingActivity/learnByTeaching/learnByTeachingRouter.procedure";

import { reasonTraceRouter } from "./routers/reasoningActivity/reasonTrace/reasonTrace.procedure";
import { reasoningRouter } from "./routers/reasoningActivity/reasoning/reasoning.procedure";

import { knowledgeZapRouter } from "./routers/knowledgeZapActivity/knowledgeZap/knowledgeZap.procedure";
import { knowledgeQuestionsRouter } from "./routers/knowledgeZapActivity/knowledgeQuestions/knowledgeQuestions.procedure";
import { stepSolveRouter } from "./routers/stepSolveActivity/stepSolve/stepSolve.procedure";
import { stepSolveCheckStepRouter } from "./routers/stepSolveActivity/checkStep/checkStep.procedure";
import { readAndRelayRouter } from "./routers/readAndRelayActivity/readAndRelay/readAndRelay.procedure";
import { evaluateReadingRouter } from "./routers/readAndRelayActivity/evaluateReading/evaluateReading.procedure";
import { conceptMappingRouter } from "./routers/conceptMappingActivity/conceptMapping/conceptMapping.procedure";
import { evaluateMapRouter } from "./routers/conceptMappingActivity/evaluateMap/evaluateMap.procedure";
import { leaderboardRouter } from "./routers/leaderboard/leaderboard.procedure";
import { analyticsRouter } from "./routers/analytics/analytics.procedure";
export const appRouter = createTRPCRouter({
  classroom: classroomRouter,
  subject: subjectRouter,
  fileUpload: fileUploadRouter,
  userOnboardingRouter: userOnboardingRouter,
  userSettings: userSettingsRouter,
  activities: activitiesRouter,
  leaderboard: leaderboardRouter,
  analytics: analyticsRouter,
  
  learnByTeaching: learnByTeachingRouter,
  explanation: explanationRouter,
  
  reasonTrace: reasonTraceRouter,
  reasoning: reasoningRouter,  

  knowledgeZap: knowledgeZapRouter,
  knowledgeQuestions: knowledgeQuestionsRouter,

  stepSolve: stepSolveRouter,
  stepSolveCheckStep: stepSolveCheckStepRouter,

  readAndRelay: readAndRelayRouter,
  evaluateReading: evaluateReadingRouter,

  conceptMapping: conceptMappingRouter,
  evaluateMap: evaluateMapRouter,
});

export type AppRouter = typeof appRouter;
