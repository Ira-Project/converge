import { z } from "zod";

export const preSignedUrlSchema = z.object({
  topicName: z.string(),
  fileName: z.string().optional(),
  file: z.instanceof(Object, {
    message: 'Select a valid file',
  }).nullable().optional(),
  skills: z.array(z.string()),
});
export type PreSignedUrlInput = z.infer<typeof preSignedUrlSchema>;

export const uploadFileSchema = z.object({
  topicName: z.string(),
  fileName: z.string().optional(),
  url: z.string().optional(),
  skills: z.array(z.string()),
})
export type UploadFileInput = z.infer<typeof uploadFileSchema>;

