import type { ProtectedTRPCContext } from "../../trpc";
import { generateId } from "lucia";
import { type SubmitTestAttemptSchema, type CreateTestAttemptInput } from "./testAttempt.input";
import { testAttempts } from "@/server/db/schema/testAttempt";
import { eq } from "drizzle-orm";

export const createTestAttempt = async (ctx: ProtectedTRPCContext, input: CreateTestAttemptInput) => { 
  const id = generateId(21);
  await ctx.db.insert(testAttempts).values({
    id, 
    assignmentId: input.assignmentId,
    userId: ctx.user.id,
  })
  return id;
};

export const submitTestAttempt = async (ctx: ProtectedTRPCContext, input: SubmitTestAttemptSchema) => {

  const submissionTime = new Date();
  const finalExplanation = await ctx.db.query.explanations.findFirst({
    where: (explanation, { eq }) => eq(explanation.testAttemptId, input.testAttemptId),
    orderBy: (explanation, { desc }) => [desc(explanation.createdAt)],
    with: {
      computedAnswers: true,
    }
  })
  
  const score = finalExplanation?.computedAnswers?.filter((answer) => answer.isCorrect).length;
  
  await ctx.db.update(testAttempts)
    .set({
      score: score,
      submittedAt: submissionTime,
    })
    .where(eq(testAttempts.id, input.testAttemptId))

};