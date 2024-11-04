import { assignmentRouter } from "./routers/explainingAssignment/explainingAssignment.procedure";
import { classroomRouter } from "./routers/classroom/classroom.procedure";
import { explanationRouter } from "./routers/explanation/explanation.procedure";
import { fileUploadRouter } from "./routers/fileUpload/fileUpload.procedure";
import { preloadedUsersRouter } from "./routers/preloadedUsers/preloadedUsers.procedure";
import { subjectRouter } from "./routers/subject/subject.procedure";
import { testAttemptRouter } from "./routers/testAttempt/testAttempt.procedure";
import { createTRPCRouter } from "./trpc";
import { reasoningAssignmentRouter } from "./routers/reasoningAssignment/reasoningAssignment.procedure";
import { reasoningRouter } from "./routers/reasoning/reasoning.procedure";

export const appRouter = createTRPCRouter({
  classroom: classroomRouter,
  subject: subjectRouter,
  assignment: assignmentRouter,
  explanation: explanationRouter,
  testAttempt: testAttemptRouter,
  fileUpload: fileUploadRouter,
  preloadedUsers: preloadedUsersRouter,
  reasoningAssignment: reasoningAssignmentRouter,
  reasoning: reasoningRouter,
});

export type AppRouter = typeof appRouter;
