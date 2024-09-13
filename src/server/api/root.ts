import { assignmentRouter } from "./routers/assignment/assignment.procedure";
import { classroomRouter } from "./routers/classroom/classroom.procedure";
import { explanationRouter } from "./routers/explanation/explanation.procedure";
import { fileUploadRouter } from "./routers/fileUpload/fileUpload.procedure";
import { preloadedUsersRouter } from "./routers/preloadedUsers/preloadedUsers.procedure";
import { subjectRouter } from "./routers/subject/subject.procedure";
import { testAttemptRouter } from "./routers/testAttempt/testAttempt.procedure";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  classroom: classroomRouter,
  subject: subjectRouter,
  assignment: assignmentRouter,
  explanation: explanationRouter,
  testAttempt: testAttemptRouter,
  fileUpload: fileUploadRouter,
  preloadedUsers: preloadedUsersRouter,
});

export type AppRouter = typeof appRouter;
