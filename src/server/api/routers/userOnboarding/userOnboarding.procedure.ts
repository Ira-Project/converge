import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as services from "./userOnboarding.service";
import * as inputs from "./userOnboarding.input";

export const userOnboardingRouter = createTRPCRouter({
  updateUser: protectedProcedure
    .input(inputs.updateUserSchema)
    .mutation(({ ctx, input }) => services.updateUser(ctx, input)),
});