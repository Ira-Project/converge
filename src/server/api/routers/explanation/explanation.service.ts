import type { ProtectedTRPCContext } from "../../trpc";
import { type ExplainInput } from "./explanation.input";
import { generateId } from "lucia";
import { explanations } from "@/server/db/schema/explanations";

export const explain = async (ctx: ProtectedTRPCContext, input: ExplainInput) => {
  
  // -----------
  // Create the explanation object
  // -----------

  const explanationId = generateId(21);

  await ctx.db.insert(explanations).values({
    id: explanationId,
    text: input.explanation,
    testAttemptId: input.testAttemptId!,
    createdBy: ctx.user.id,
  })
}