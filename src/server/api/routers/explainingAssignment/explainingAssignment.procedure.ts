import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as services from "./explainingAssignment.service";
import * as inputs from "./explainingAssignment.input";

export const assignmentRouter = createTRPCRouter({
  list: protectedProcedure
    .input(inputs.listAssignmentsSchema)
    .query(({ ctx, input }) => services.listAssignments(ctx, input)), 
  get: protectedProcedure
    .input(inputs.getAssignmentSchema)
    .query(({ ctx, input }) => services.getAssignment(ctx, input)),
  makeLive: protectedProcedure
    .input(inputs.makeAssignmentLiveSchema)
    .mutation(({ ctx, input }) => services.makeAssignmentLive(ctx, input)),
});