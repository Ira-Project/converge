import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as services from "./classroom.service";
import * as inputs from "./classroom.input";

export const classroomRouter = createTRPCRouter({
  list: protectedProcedure
    .query(({ ctx }) => services.listClassrooms(ctx)),  
  create: protectedProcedure
    .input(inputs.createClassroomSchema)
    .mutation(({ ctx, input }) => services.createClassroom(ctx, input)),
  join: protectedProcedure
    .input(inputs.joinClassroomSchema)
    .mutation(({ ctx, input }) => services.joinClassroom(ctx, input)),
});