import { explanationAssignmentRouter } from "./routers/learnByTeachingActivity/explanationAssignment/explainingAssignment.procedure";
import { classroomRouter } from "./routers/classroom/classroom.procedure";
import { explanationRouter } from "./routers/learnByTeachingActivity/explanation/explanation.procedure";
import { fileUploadRouter } from "./routers/fileUpload/fileUpload.procedure";
import { userOnboardingRouter } from "./routers/userOnboarding/userOnboarding.procedure";
import { subjectRouter } from "./routers/subject/subject.procedure";
import { explainTestAttemptRouter } from "./routers/learnByTeachingActivity/explainTestAttempt/explainTestAttempt.procedure";
import { createTRPCRouter } from "./trpc";
import { reasoningAssignmentRouter } from "./routers/reasoningActivity/reasoningAssignment/reasoningAssignment.procedure";
import { reasoningRouter } from "./routers/reasoningActivity/reasoning/reasoning.procedure";

export const appRouter = createTRPCRouter({
  classroom: classroomRouter,
  subject: subjectRouter,
  explanationAssignment: explanationAssignmentRouter,
  explanation: explanationRouter,
  explainTestAttempt: explainTestAttemptRouter,
  fileUpload: fileUploadRouter,
  userOnboardingRouter: userOnboardingRouter,
  reasoningAssignment: reasoningAssignmentRouter,
  reasoning: reasoningRouter,
});

export type AppRouter = typeof appRouter;
