import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as services from "./reasoning.service";
import * as inputs from "./reasoning.input";

export const reasoningRouter = createTRPCRouter({
  part1EvaluatePathway: protectedProcedure
    .input(inputs.part1EvaluatePathwaySchema)
    .mutation(({ ctx, input }) => services.part1EvaluatePathway(ctx, input))
});

// part2IncorrectOptionsInPathway: protectedProcedure
//   .input(inputs.part2IncorrectOptionsInPathwaySchema)
//   .query(({ ctx, input }) => services.part2EvaluateIncorrectOptionsInPathway(ctx, input)),
// part3FinalCorrectOptions: protectedProcedure
//   .input(inputs.part3FinalCorrectOptionsSchema)
//   .mutation(({ ctx, input }) => services.part3FinalCorrectOp(ctx, input)),