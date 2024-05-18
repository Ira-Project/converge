import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { getAssignmentTemplateSchema } from "./assignmentTemplate.input";
import * as services from "./assignmentTemplate.service";

export const assignmentTemplateRouter = createTRPCRouter({
  list: protectedProcedure
    .query(({ ctx }) => services.listAssignmentTemplates(ctx)),
  get: protectedProcedure
    .input(getAssignmentTemplateSchema)
    .query(({ ctx, input }) => services.getAssignmentTemplate(ctx, input))
});