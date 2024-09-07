import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as services from "./subject.service";

export const subjectRouter = createTRPCRouter({
  listCourses: protectedProcedure
    .query(({ ctx }) => services.listCourses(ctx)),
});