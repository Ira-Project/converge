import { createTRPCRouter, protectedProcedure } from "../../../trpc";
import * as services from "./evaluateMap.service";
import * as inputs from "./evaluateMap.input";

export const evaluateMapRouter = createTRPCRouter({

  evaluateMap: protectedProcedure
    .input(inputs.evaluateMap)
    .mutation(({ ctx, input }) => services.evaluateMap(ctx, input)),

});