import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as services from "./subject.service";
import { z } from "zod";

export const subjectRouter = createTRPCRouter({
  listCourses: protectedProcedure
    .query(({ ctx }) => services.listCourses(ctx)),
  listSubjects: protectedProcedure
    .query(({ ctx }) => services.listSubjects(ctx)),
  getCoursesBySubject: protectedProcedure
    .input(z.object({ subjectId: z.string() }))
    .query(({ ctx, input }) => services.getCoursesBySubject(ctx, input.subjectId)),
});