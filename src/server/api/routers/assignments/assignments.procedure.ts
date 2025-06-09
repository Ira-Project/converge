import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as services from "./assignments.service";
import * as inputs from "./assignments.input";

export const assignmentsRouter = createTRPCRouter({
  getAssignments: protectedProcedure
    .input(inputs.getAssignmentsSchema)
    .query(({ ctx, input }) => services.getAssignments(ctx, input)),
}); 