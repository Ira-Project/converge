import { createTRPCRouter, protectedProcedure } from "../../../trpc";
import * as services from "./knowledgeZap.service";
import * as inputs from "./knowledgeZap.input";

export const knowledgeZapRouter = createTRPCRouter({
  createAssignmentAttempt: protectedProcedure
    .input(inputs.createAssignmentAttemptSchema)
    .mutation(({ ctx, input }) => services.createAssignmentAttempt(ctx, input)),

  submitAssignmentAttempt: protectedProcedure
    .input(inputs.submitAssignmentAttemptSchema)
    .mutation(({ ctx, input }) => services.submitAssignmentAttempt(ctx, input)),
  
  getSubmissions: protectedProcedure
    .input(inputs.getSubmissionsInput)
    .query(({ ctx, input }) => services.getSubmissions(ctx, input)),

  getAnalyticsCards: protectedProcedure
    .input(inputs.getAnalyticsCardsInput)
    .query(({ ctx, input }) => services.getAnalyticsCards(ctx, input)),

  getKnowledgeZapActivity: protectedProcedure
    .input(inputs.getKnowledgeZapActivityInput)
    .query(({ ctx, input }) => services.getKnowledgeZapActivity(ctx, input)),

  getHeatMap: protectedProcedure
    .input(inputs.getHeatMapInput)
    .query(({ ctx, input }) => services.getHeatMap(ctx, input)),
});
