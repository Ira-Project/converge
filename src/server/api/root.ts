import { createTRPCRouter } from "./trpc";

import { classroomRouter } from "./routers/classroom/classroom.procedure";
import { fileUploadRouter } from "./routers/fileUpload/fileUpload.procedure";
import { userOnboardingRouter } from "./routers/userOnboarding/userOnboarding.procedure";
import { subjectRouter } from "./routers/subject/subject.procedure";

import { activitiesRouter } from "./routers/activities/activities.procedure";

import { explanationRouter } from "./routers/learnByTeachingActivity/explanation/explanation.procedure";
import { learnByTeachingRouter } from "./routers/learnByTeachingActivity/learnByTeaching/learnByTeachingRouter.procedure";

import { reasonTraceRouter } from "./routers/reasoningActivity/reasonTrace/reasonTrace.procedure";
import { reasoningRouter } from "./routers/reasoningActivity/reasoning/reasoning.procedure";

import { knowledgeZapRouter } from "./routers/knowledgeZapActivity/knowledgeZap/knowledgeZap.procedure";
import { knowledgeQuestionsRouter } from "./routers/knowledgeZapActivity/knowledgeQuestions/knowledgeQuestions.procedure";

export const appRouter = createTRPCRouter({
  classroom: classroomRouter,
  subject: subjectRouter,
  fileUpload: fileUploadRouter,
  userOnboardingRouter: userOnboardingRouter,
  activities: activitiesRouter,
  
  learnByTeaching: learnByTeachingRouter,
  explanation: explanationRouter,
  
  reasonTrace: reasonTraceRouter,
  reasoning: reasoningRouter,  

  knowledgeZap: knowledgeZapRouter,
  knowledgeQuestions: knowledgeQuestionsRouter,
});

export type AppRouter = typeof appRouter;
