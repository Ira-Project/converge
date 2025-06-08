import { createTRPCRouter, protectedProcedure } from "../../../trpc";
import * as services from "./conceptMapping.service";
import * as inputs from "./conceptMapping.input";

export const conceptMappingRouter = createTRPCRouter({
  createAttempt: protectedProcedure
    .input(inputs.createAttemptSchema)
    .mutation(({ ctx, input }) => services.createAttempt(ctx, input)),

  createAssignmentAttempt: protectedProcedure
    .input(inputs.createAssignmentAttemptSchema)
    .mutation(({ ctx, input }) => services.createAssignmentAttempt(ctx, input)),

  submitAttempt: protectedProcedure
    .input(inputs.submitAttemptSchema)  
    .mutation(({ ctx, input }) => services.submitAttempt(ctx, input)),
  
  getSubmissions: protectedProcedure
    .input(inputs.getSubmissionsInput)
    .query(({ ctx, input }) => services.getSubmissions(ctx, input)),

  getMostCommonMistakes: protectedProcedure
    .input(inputs.getMostCommonMistakesInput)
    .query(({ ctx, input }) => services.getMostCommonMistakes(ctx, input)),

  getAnalyticsCards: protectedProcedure
    .input(inputs.getAnalyticsCardsInput)
    .query(({ ctx, input }) => services.getAnalyticsCards(ctx, input)),

  getConceptMappingActivity: protectedProcedure
    .input(inputs.getConceptMappingActivityInput)
    .query(({ ctx, input }) => services.getConceptMappingActivity(ctx, input)),

  getConceptMappingAssignmentById: protectedProcedure
    .input(inputs.getConceptMappingAssignmentByIdInput)
    .query(({ ctx, input }) => services.getConceptMappingAssignmentById(ctx, input)),
});
