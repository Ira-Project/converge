import { createTRPCRouter, protectedProcedure } from "../../../trpc";
import * as services from "./explanation.service";
import * as inputs from "./explanation.input";

export const explanationRouter = createTRPCRouter({

  explain: protectedProcedure
    .input(inputs.explainSchema)
    .mutation(({ ctx, input }) => services.explain(ctx, input)),

});