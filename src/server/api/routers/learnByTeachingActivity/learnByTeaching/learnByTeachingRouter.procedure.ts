import { createTRPCRouter, protectedProcedure } from "../../../trpc";
import * as services from "./learnByTeaching.service";
import * as inputs from "./learnByTeaching.input";

export const learnByTeachingRouter = createTRPCRouter({
  create: protectedProcedure
    .input(inputs.createTestAttemptSchema)
    .mutation(({ ctx, input }) => services.createTestAttempt(ctx, input)),

  submit: protectedProcedure
    .input(inputs.submitTestAttemptSchema)
    .mutation(({ ctx, input }) => services.submitTestAttempt(ctx, input)),
  
  getSubmissions: protectedProcedure
    .input(inputs.getSubmissionsInput)
    .query(({ ctx, input }) => services.getSubmissions(ctx, input)),

  getUnderstandingGaps: protectedProcedure
    .input(inputs.getUnderstandingGapsInput)
    .query(({ ctx, input }) => services.getUnderstandingGaps(ctx, input)),

  getAnalyticsCards: protectedProcedure
    .input(inputs.getAnalyticsCardsInput)
    .query(({ ctx, input }) => services.getAnalyticsCards(ctx, input)),

  getLearnByTeachingActivity: protectedProcedure
    .input(inputs.getLearnByTeachingActivityInput)
    .query(({ ctx, input }) => services.getLearnByTeachingActivity(ctx, input)),
});
