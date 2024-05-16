import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as services from "./subject.service";

export const subjectRouter = createTRPCRouter({
  list: protectedProcedure
    .query(({ ctx }) => services.listSubjects(ctx)),
});