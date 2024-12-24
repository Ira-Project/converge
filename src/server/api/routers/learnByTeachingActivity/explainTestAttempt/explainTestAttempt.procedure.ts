import { createTRPCRouter, protectedProcedure } from "../../../trpc";
import * as services from "./explainTestAttempt.service";
import * as inputs from "./explainTestAttempt.input";

export const explainTestAttemptRouter = createTRPCRouter({
  create: protectedProcedure
    .input(inputs.createTestAttemptSchema)
    .mutation(({ ctx, input }) => services.createTestAttempt(ctx, input)),

  submit: protectedProcedure
    .input(inputs.submitTestAttemptSchema)
    .mutation(({ ctx, input }) => services.submitTestAttempt(ctx, input)),
});