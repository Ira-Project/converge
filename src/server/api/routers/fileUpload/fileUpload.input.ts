import { z } from "zod";

export const preSignedUrlSchema = z.object({
  topicName: z.string(),
  fileName: z.string().optional(),
  file: z.instanceof(Object, {
    message: 'Select a valid file',
  }).nullable().optional()
});
export type PreSignedUrlInput = z.infer<typeof preSignedUrlSchema>;

export const uploadFileSchema = z.object({
  topicName: z.string(),
  fileName: z.string(),
  url: z.string().optional(),
})
export type UploadFileInput = z.infer<typeof uploadFileSchema>;

