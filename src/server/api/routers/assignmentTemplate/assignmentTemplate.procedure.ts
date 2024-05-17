import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as services from "./assignmentTemplate.service";

export const assignmentTemplateRouter = createTRPCRouter({
  list: protectedProcedure
    .query(({ ctx }) => services.listAssignmentTemplates(ctx)),
});