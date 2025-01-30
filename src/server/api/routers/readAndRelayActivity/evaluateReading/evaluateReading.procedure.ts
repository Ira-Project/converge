import { createTRPCRouter, protectedProcedure } from "../../../trpc";
import * as services from "./evaluateReading.service";
import * as inputs from "./evaluateReading.input";

export const evaluateReadingRouter = createTRPCRouter({

  evaluateReading: protectedProcedure
    .input(inputs.evaluateReadingSchema)
    .mutation(({ ctx, input }) => services.evaluateReading(ctx, input)),

});