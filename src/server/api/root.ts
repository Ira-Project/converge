import { classroomRouter } from "./routers/classroom/classroom.procedure";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  classroom: classroomRouter,
});

export type AppRouter = typeof appRouter;
