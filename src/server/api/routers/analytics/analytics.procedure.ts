import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as services from "./analytics.service";
import * as inputs from "./analytics.input";

export const analyticsRouter = createTRPCRouter({
  getTopics: protectedProcedure
    .input(inputs.getTopicsSchema)
    .query(({ ctx, input }) => services.getTopics(ctx, input)),
  getSubmissions: protectedProcedure
    .input(inputs.getSubmissionsSchema)   
    .query(({ ctx, input }) => services.getSubmissions(ctx, input)),
  topicBreakdown: protectedProcedure
    .input(inputs.topicBreakdownSchema)
    .query(({ ctx, input }) => services.topicBreakdown(ctx, input)),
});