import { createTRPCRouter, protectedProcedure } from "../../../trpc";
import * as services from "./reasoningAssignment.service";
import * as inputs from "./reasoningAssignment.input";

export const reasoningAssignmentRouter = createTRPCRouter({
  get: protectedProcedure
    .input(inputs.getReasoningAssignmentSchema)
    .query(({ ctx, input }) => services.getReasoningAssignment(ctx, input)),
  makeLive: protectedProcedure
    .input(inputs.makeReasoningAssignmentLiveSchema)
    .mutation(({ ctx, input }) => services.makeReasoningAssignmentLive(ctx, input)),
  createAttempt: protectedProcedure
    .input(inputs.createReasoningAssignmentAttemptSchema)
    .mutation(({ ctx, input }) => services.createReasoningAssignmentAttempt(ctx, input)),
  submitAttempt: protectedProcedure
    .input(inputs.submitReasoningAssignmentAttemptSchema)
    .mutation(({ ctx, input }) => services.submitReasoningAssignmentAttempt(ctx, input)),
});
