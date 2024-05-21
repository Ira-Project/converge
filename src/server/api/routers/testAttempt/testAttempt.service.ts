import type { ProtectedTRPCContext } from "../../trpc";
import { generateId } from "lucia";
import { type CreateTestAttemptInput } from "./testAttempt.input";
import { testAttempts } from "@/server/db/schema/testAttempt";

export const createTestAttempt = async (ctx: ProtectedTRPCContext, input: CreateTestAttemptInput) => { 
  const id = generateId(21);
  await ctx.db.insert(testAttempts).values({
    id, 
    assignmentId: input.assignmentId,
    userId: ctx.user.id,
  })
  return id;
};