import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as services from "./preloadedUsers.service";
import * as inputs from "./preloadedUsers.input";

export const preloadedUsersRouter = createTRPCRouter({
  updateUser: protectedProcedure
    .input(inputs.updateUserSchema)
    .mutation(({ ctx, input }) => services.updateUser(ctx, input)),
});