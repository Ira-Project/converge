import { createTRPCRouter, protectedProcedure } from "../../trpc";
import * as services from "./fileUpload.service";
import * as inputs from "./fileUpload.input";

export const fileUploadRouter = createTRPCRouter({

  getPreSignedUrl: protectedProcedure
    .input(inputs.preSignedUrlSchema)
    .mutation(({ ctx, input }) => services.getPreSignedUrl(ctx, input)),

  uploadLessonPlan: protectedProcedure
    .input(inputs.uploadFileSchema)
    .mutation(({ ctx, input }) => services.uploadLessonPlan(ctx, input)),

});