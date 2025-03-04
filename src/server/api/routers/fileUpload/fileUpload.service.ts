import { lessonPlanFiles } from "@/server/db/schema/lessonPlan";
import type { ProtectedTRPCContext } from "../../trpc";
import type { UploadFileInput, PreSignedUrlInput } from "./fileUpload.input";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { generateId } from "lucia";
import { EmailTemplate, sendMail } from "@/lib/email";
import { EMAIL_SENDER } from "@/lib/constants";
import { FileUploadType } from "@/lib/email/templates/file-uploaded";
import { TRPCClientError } from "@trpc/client";

export const getPreSignedUrl = async (ctx: ProtectedTRPCContext, input: PreSignedUrlInput) => {

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new TRPCClientError('AWS credentials not found');
  }

  const s3 = new S3Client({
    region: 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  const command = new PutObjectCommand(
    { 
      Bucket: 'converge-ira-project', 
      Key: `${ctx.user.email}-${input.topicName}-${input.fileName}` 
    }
  );
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return url;

}

export const uploadLessonPlan = async (ctx: ProtectedTRPCContext, input: UploadFileInput) => {
  const id = generateId(21);

  await ctx.db.insert(lessonPlanFiles).values({
    id: id,
    name: input.topicName,
    url: input.url,
    createdBy: ctx.user.id,
    skills: input.skills,
  });

  await sendMail(
    EMAIL_SENDER,
    EmailTemplate.FileUploaded, 
    { 
      userEmail: ctx.user.email, 
      fileName: input.fileName,
      topicName: input.topicName,
      type: FileUploadType.LESSON_PLAN 
    }
  );
  
}
