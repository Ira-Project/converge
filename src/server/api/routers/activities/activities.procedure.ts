import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as services from "./activities.service";
import * as inputs from "./activities.input";

export const activitiesRouter = createTRPCRouter({
  getActivities: protectedProcedure
    .input(inputs.getActivitiesSchema)
    .query(({ ctx, input }) => services.getActivities(ctx, input)),

  getLiveActivities: protectedProcedure
    .input(inputs.getLiveActivitiesSchema)
    .query(({ ctx, input }) => services.getLiveActivities(ctx, input)),

  getActivity: protectedProcedure
    .input(inputs.getActivitySchema)
    .query(({ ctx, input }) => services.getActivity(ctx, input)),

  makeActivityLive: protectedProcedure
    .input(inputs.makeActivityLiveSchema)
    .mutation(({ ctx, input }) => services.makeActivityLive(ctx, input)),

  getRandomActivities: protectedProcedure
    .input(inputs.getRandomActivitiesSchema)
    .query(({ ctx, input }) => services.getRandomActivities(ctx, input)),
});