import { createTRPCRouter, protectedProcedure } from "../../../trpc";
import * as services from "./reasonTrace.service";
import * as inputs from "./reasonTrace.input";

export const reasonTraceRouter = createTRPCRouter({
  get: protectedProcedure
    .input(inputs.getReasoningAssignmentSchema)
    .query(({ ctx, input }) => services.getReasoningAssignment(ctx, input)),
  getById: protectedProcedure
    .input(inputs.getReasoningAssignmentByIdSchema)
    .query(({ ctx, input }) => services.getReasoningAssignmentById(ctx, input)),
  createAttempt: protectedProcedure
    .input(inputs.createReasoningAssignmentAttemptSchema)
    .mutation(({ ctx, input }) => services.createReasoningAssignmentAttempt(ctx, input)),
  submitAttempt: protectedProcedure
    .input(inputs.submitReasoningAssignmentAttemptSchema)
    .mutation(({ ctx, input }) => services.submitReasoningAssignmentAttempt(ctx, input)),
  getAnalytics: protectedProcedure
    .input(inputs.getReasoningAssignmentAnalyticsSchema)
    .query(({ ctx, input }) => services.getReasoningAssignmentAnalytics(ctx, input)),
  getSubmissions: protectedProcedure
    .input(inputs.getReasoningAssignmentSubmissionsSchema)
    .query(({ ctx, input }) => services.getReasoningAssignmentSubmissions(ctx, input)),
  getQuestionAnalytics: protectedProcedure
    .input(inputs.getReasoningAssignmentQuestionAnalyticsSchema)
    .query(({ ctx, input }) => services.getReasoningAssignmentQuestionAnalytics(ctx, input)),
});
