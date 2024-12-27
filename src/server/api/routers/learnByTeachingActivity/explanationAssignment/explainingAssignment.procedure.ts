import { createTRPCRouter, protectedProcedure } from "../../../trpc";
import * as services from "./explainingAssignment.service";
import * as inputs from "./explainingAssignment.input";

export const explanationAssignmentRouter = createTRPCRouter({
  get: protectedProcedure
    .input(inputs.getAssignmentSchema)
    .query(({ ctx, input }) => services.getAssignment(ctx, input)),
  makeLive: protectedProcedure
    .input(inputs.makeActivityLiveSchema)
    .mutation(({ ctx, input }) => services.makeActivityLive(ctx, input)),
});