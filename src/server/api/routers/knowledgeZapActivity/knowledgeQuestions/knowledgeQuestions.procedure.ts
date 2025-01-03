import { createTRPCRouter, protectedProcedure } from "../../../trpc";
import * as services from "./knowledgeQuestions.service";
import * as inputs from "./knowledgeQuestions.input";

export const knowledgeQuestionsRouter = createTRPCRouter({

  checkMatchingAnswer: protectedProcedure
    .input(inputs.checkMatchingAnswerInput)
    .mutation(({ ctx, input }) => services.checkMatchingAnswer(ctx, input)),

  checkMultipleChoiceAnswer: protectedProcedure
    .input(inputs.checkMultipleChoiceAnswerInput)
    .mutation(({ ctx, input }) => services.checkMultipleChoiceAnswer(ctx, input)),

  checkOrderingAnswer: protectedProcedure
    .input(inputs.checkOrderingAnswerInput)
    .mutation(({ ctx, input }) => services.checkOrderingAnswer(ctx, input)),

});
