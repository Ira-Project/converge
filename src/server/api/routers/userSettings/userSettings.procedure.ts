import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as services from "./userSettings.service";
import * as inputs from "./userSettings.input";

export const userSettingsRouter = createTRPCRouter({
  getUserSettings: protectedProcedure
    .input(inputs.getUserSettingsSchema)
    .query(({ ctx }) => services.getUserSettings(ctx)),
  
  updateUserName: protectedProcedure
    .input(inputs.updateUserNameSchema)
    .mutation(({ ctx, input }) => services.updateUserName(ctx, input)),
  
  setDefaultClassroom: protectedProcedure
    .input(inputs.setDefaultClassroomSchema)
    .mutation(({ ctx, input }) => services.setDefaultClassroom(ctx, input)),
}); 