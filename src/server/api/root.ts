import { assignmentRouter } from "./routers/assignment/assignment.procedure";
import { assignmentTemplateRouter } from "./routers/assignmentTemplate/assignmentTemplate.procedure";
import { classroomRouter } from "./routers/classroom/classroom.procedure";
import { subjectRouter } from "./routers/subject/subject.procedure";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  classroom: classroomRouter,
  subject: subjectRouter,
  assignment: assignmentRouter,
  assignmentTemplate: assignmentTemplateRouter,
});

export type AppRouter = typeof appRouter;
