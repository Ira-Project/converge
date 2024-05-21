import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as services from "./testAttempt.service";
import * as inputs from "./testAttempt.input";

export const testAttemptRouter = createTRPCRouter({
  create: protectedProcedure
    .input(inputs.createTestAttemptSchema)
    .mutation(({ ctx, input }) => services.createTestAttempt(ctx, input)),
});