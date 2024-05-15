import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as services from "./classroom.service";

export const classroomRouter = createTRPCRouter({
  list: protectedProcedure
    .query(({ ctx }) => services.listClassrooms(ctx)),
});