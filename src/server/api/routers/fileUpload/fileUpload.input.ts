import { z } from "zod";

export const preSignedUrlSchema = z.object({
  fileName: z.string(),
  file: z.instanceof(Object, {
    message: 'Select a valid file',
  }).nullable()
  .superRefine((arg, ctx) => {
    if (!(arg instanceof Object)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select a valid file',
        fatal: true, // Abort early on this error
      });
    }
    return z.NEVER; // Prevent null from being a valid output
  }),
});
export type PreSignedUrlInput = z.infer<typeof preSignedUrlSchema>;

export const uploadFileSchema = z.object({
  fileName: z.string(),
  url: z.string(),
})
export type UploadFileInput = z.infer<typeof uploadFileSchema>;

