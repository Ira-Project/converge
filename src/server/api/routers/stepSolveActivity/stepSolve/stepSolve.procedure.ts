import { createTRPCRouter, protectedProcedure } from "../../../trpc";
import * as services from "./stepSolve.service";
import * as inputs from "./stepSolve.input";

export const stepSolveRouter = createTRPCRouter({
  getAssignment: protectedProcedure
    .input(inputs.getStepSolveAssignmentSchema)
    .query(({ ctx, input }) => services.getStepSolveAssignment(ctx, input)),
  createAttempt: protectedProcedure
    .input(inputs.createStepSolveAssignmentAttemptSchema)
    .mutation(({ ctx, input }) => services.createStepSolveAssignmentAttempt(ctx, input)),
  submitAttempt: protectedProcedure
    .input(inputs.submitStepSolveAssignmentAttemptSchema)
    .mutation(({ ctx, input }) => services.submitStepSolveAssignmentAttempt(ctx, input)),
  getAnalytics: protectedProcedure
    .input(inputs.getStepSolveAssignmentAnalyticsSchema)
    .query(({ ctx, input }) => services.getStepSolveAssignmentAnalytics(ctx, input)),
  getSubmissions: protectedProcedure
    .input(inputs.getStepSolveAssignmentSubmissionsSchema)
    .query(({ ctx, input }) => services.getStepSolveAssignmentSubmissions(ctx, input)),
  getQuestionAnalytics: protectedProcedure
    .input(inputs.getStepSolveAssignmentQuestionAnalyticsSchema)
    .query(({ ctx, input }) => services.getStepSolveAssignmentQuestionAnalytics(ctx, input)),
});
