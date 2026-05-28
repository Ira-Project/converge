import { lessonPlanFiles } from "@/server/db/schema/lessonPlan";
import type { ProtectedTRPCContext } from "../../trpc";
import type { UploadFileInput, PreSignedUrlInput } from "./fileUpload.input";
import { generateId } from "lucia";
import { EmailTemplate, sendMail } from "@/lib/email";
import { EMAIL_SENDER } from "@/lib/constants";
import { FileUploadType } from "@/lib/email/templates/file-uploaded";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { env } from "@/env";
import { TRPCError } from "@trpc/server";

const sanitizePathPart = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getPreSignedUrl = async (ctx: ProtectedTRPCContext, input: PreSignedUrlInput) => {
  if (!input.fileName) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "File name is required",
    });
  }

  const bucket = env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;
  const path = [
    sanitizePathPart(ctx.user.id),
    `${generateId(21)}-${sanitizePathPart(input.topicName)}-${sanitizePathPart(input.fileName)}`,
  ].join("/");

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);

  return {
    path: data.path,
    signedUrl: data.signedUrl,
    token: data.token,
    publicUrl,
  };
};

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
  
};
