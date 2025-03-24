import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as services from "./analytics.service";
import * as inputs from "./analytics.input";

export const analyticsRouter = createTRPCRouter({
  getSubmissions: protectedProcedure
    .input(inputs.getSubmissionsSchema)   
    .query(({ ctx, input }) => services.getSubmissions(ctx, input)),
  
  getConceptTracking: protectedProcedure
    .input(inputs.getConceptTrackingSchema)
    .query(({ ctx, input }) => services.getConceptTracking(ctx, input)),
  
});