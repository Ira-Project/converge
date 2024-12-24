import { createTRPCRouter, protectedProcedure } from "../../../trpc";
import * as services from "./reasoning.service";
import * as inputs from "./reasoning.input";

export const reasoningRouter = createTRPCRouter({
  part1EvaluatePathway: protectedProcedure
    .input(inputs.part1EvaluatePathwaySchema)
    .mutation(({ ctx, input }) => services.part1EvaluatePathway(ctx, input)),

  part2CorrectPathway: protectedProcedure
    .input(inputs.part2CorrectPathwaySchema)
    .mutation(({ ctx, input }) => services.part2CorrectPathway(ctx, input)),

  part3FinalCorrectAnswer: protectedProcedure
    .input(inputs.part3FinalCorrectAnswerSchema)
    .mutation(({ ctx, input }) => services.part3FinalCorrectAnswer(ctx, input)),

});