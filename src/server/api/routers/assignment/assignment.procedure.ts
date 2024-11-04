import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as services from "./assignment.service";
import * as inputs from "./assignment.input";

export const assignmentRouter = createTRPCRouter({
  list: protectedProcedure
    .input(inputs.listAssignmentsSchema)
    .query(({ ctx, input }) => services.listAssignments(ctx, input)), 
});