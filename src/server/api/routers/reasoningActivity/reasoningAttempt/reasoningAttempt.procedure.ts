import { createTRPCRouter, protectedProcedure } from "../../../trpc";
import * as services from "./reasoningAttempt.service";
import * as inputs from "./reasoningAttempt.input";

export const reasoningAssignmentRouter = createTRPCRouter({
  get: protectedProcedure
    .input(inputs.getReasoningAssignmentSchema)
    .query(({ ctx, input }) => services.getReasoningAssignment(ctx, input)),
  createAttempt: protectedProcedure
    .input(inputs.createReasoningAssignmentAttemptSchema)
    .mutation(({ ctx, input }) => services.createReasoningAssignmentAttempt(ctx, input)),
  submitAttempt: protectedProcedure
    .input(inputs.submitReasoningAssignmentAttemptSchema)
    .mutation(({ ctx, input }) => services.submitReasoningAssignmentAttempt(ctx, input)),
});
