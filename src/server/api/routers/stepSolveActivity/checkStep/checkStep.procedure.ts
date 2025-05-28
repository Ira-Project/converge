import { createTRPCRouter, protectedProcedure } from "../../../trpc";
import * as services from "./checkStep.service";
import * as inputs from "./checkStep.input";

export const stepSolveCheckStepRouter = createTRPCRouter({
  checkStep: protectedProcedure
    .input(inputs.checkStepSchema)
    .mutation(({ ctx, input }) => services.checkStep(ctx, input)),

  flagStep: protectedProcedure
    .input(inputs.flagStepInput)
    .mutation(({ ctx, input }) => services.flagStep(ctx, input)),
});