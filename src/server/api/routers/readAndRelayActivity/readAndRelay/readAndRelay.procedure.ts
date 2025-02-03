import { createTRPCRouter, protectedProcedure } from "../../../trpc";
import * as services from "./readAndRelay.service";
import * as inputs from "./readAndRelay.input";

export const readAndRelayRouter = createTRPCRouter({
  createAttempt: protectedProcedure
    .input(inputs.createAttemptSchema)
    .mutation(({ ctx, input }) => services.createAttempt(ctx, input)),

  submitAttempt: protectedProcedure
    .input(inputs.submitAttemptSchema)  
    .mutation(({ ctx, input }) => services.submitAttempt(ctx, input)),
  
  getSubmissions: protectedProcedure
    .input(inputs.getSubmissionsInput)
    .query(({ ctx, input }) => services.getSubmissions(ctx, input)),

  getStudentHighlights: protectedProcedure
    .input(inputs.getStudentHighlightsInput)
    .query(({ ctx, input }) => services.getStudentHighlights(ctx, input)),

  getAnalyticsCards: protectedProcedure
    .input(inputs.getAnalyticsCardsInput)
    .query(({ ctx, input }) => services.getAnalyticsCards(ctx, input)),

  getReadAndRelayActivity: protectedProcedure
    .input(inputs.getReadAndRelayActivityInput)
    .query(({ ctx, input }) => services.getReadAndRelayActivity(ctx, input)),
});
