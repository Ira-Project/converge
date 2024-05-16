import { classroomRouter } from "./routers/classroom/classroom.procedure";
import { subjectRouter } from "./routers/subject/subject.procedure";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  classroom: classroomRouter,
  subject: subjectRouter
});

export type AppRouter = typeof appRouter;
