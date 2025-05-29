import { createTRPCRouter, protectedProcedure } from "../../../trpc";
import * as services from "./reasoning.service";
import * as inputs from "./reasoning.input";

export const reasoningRouter = createTRPCRouter({
  part1IdentifyCorrectPathway: protectedProcedure
    .input(inputs.part1IdentifyCorrectPathwaySchema)
    .mutation(({ ctx, input }) => services.part1IdentifyCorrectPathway(ctx, input)),

  part2ComputeCorrectAnswer: protectedProcedure
    .input(inputs.part2ComputeCorrectAnswerSchema)
    .mutation(({ ctx, input }) => services.part2ComputeCorrectAnswer(ctx, input)),

  part3ErrorAnalysis: protectedProcedure
    .input(inputs.part3ErrorAnalysisSchema)
    .mutation(({ ctx, input }) => services.part3ErrorAnalysis(ctx, input)),

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