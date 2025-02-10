import type { ProtectedTRPCContext } from "../../../trpc";
import { generateId } from "lucia";
import type { CreateAttemptInput, GetSubmissionsInput, GetStudentHighlightsInput, GetAnalyticsCardsInput, GetReadAndRelayActivityInput, SubmitAttemptSchema } from "./readAndRelay.input";
import { readAndRelayAttempts } from "@/server/db/schema/readAndRelay/readAndRelayAttempts";
import { eq } from "drizzle-orm";
import { ActivityType, Roles } from "@/lib/constants";

export const createAttempt = async (ctx: ProtectedTRPCContext, input: CreateAttemptInput) => { 
  const id = generateId(21);
  const activity = await ctx.db.query.activity.findFirst({
    where: (activity, { eq }) => eq(activity.id, input.activityId),
  });

  if(!activity) {
    throw new Error("Activity not found");
  }

  await ctx.db.insert(readAndRelayAttempts).values({
    id, 
    activityId: input.activityId,
    assignmentId: activity.assignmentId,
    userId: ctx.user.id,
  })
  return id;
};

export const submitAttempt = async (ctx: ProtectedTRPCContext, input: SubmitAttemptSchema) => {

  const submissionTime = new Date();

  const finalCheatSheet = await ctx.db.query.readAndRelayCheatSheets.findFirst({
    where: (cheatSheet, { eq }) => eq(cheatSheet.attemptId, input.attemptId),
    orderBy: (cheatSheet, { desc }) => [desc(cheatSheet.createdAt)],
    with: {
      computedAnswers: true,
    }
  });

  let score = 0;
  if(finalCheatSheet) {
    const correctAnswers = finalCheatSheet?.computedAnswers.reduce((a, b) => a + (b.isCorrect ? 1 : 0), 0) ?? 0;
    const totalAnswers = finalCheatSheet?.computedAnswers.length ?? 0;
    score = correctAnswers / totalAnswers;
  }

  await ctx.db.update(readAndRelayAttempts).set({
    score,
    submittedAt: submissionTime,
  }).where(eq(readAndRelayAttempts.id, input.attemptId));
  
};

export const getSubmissions = async (ctx: ProtectedTRPCContext, input: GetSubmissionsInput) => {
  const user = ctx.user.role;

  if (user === Roles.Student) {
    return await ctx.db.query.readAndRelayAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.userId, ctx.user.id),
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        user: {
          columns: {
            name: true,
          }
        }
      }
    });
  } else {
    return await ctx.db.query.readAndRelayAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        user: {
          columns: {
            name: true,
          }
        }
      }
    });
  }
}

export const getStudentHighlights = async (ctx: ProtectedTRPCContext, input: GetStudentHighlightsInput) => {
  const user = ctx.user.role;
  let submissions = [];

  // Get submissions
  if (user === Roles.Student) {
    submissions = await ctx.db.query.readAndRelayAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.userId, ctx.user.id),
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        cheatsheets: true,
      }
    });
  } else {
    submissions = await ctx.db.query.readAndRelayAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        cheatsheets: true,
      }
    });
  }

  const allHighlights = submissions.map((submission) => 
    submission.cheatsheets.map((cheatSheet) => cheatSheet.highlights)
  ).flat(2); // Flatten the nested arrays

  // Count frequency of each highlight
  const highlightCounts = allHighlights.reduce((acc, highlight) => {
    if (highlight !== null) {
      acc[highlight] = (acc[highlight] ?? 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Convert to array of objects and sort by frequency
  const sortedHighlights = Object.entries(highlightCounts)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count);
  
  return sortedHighlights;
}

export const getAnalyticsCards = async (ctx: ProtectedTRPCContext, input: GetAnalyticsCardsInput) => {

  const user = ctx.user.role;
  let submissions = [];

  if (user === Roles.Student) {
    submissions = await ctx.db.query.readAndRelayAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.userId, ctx.user.id),
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        cheatsheets: true,
      }
    });
  } else {
    submissions = await ctx.db.query.readAndRelayAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        cheatsheets: true,
      }
    });
  }

  const averageScore = submissions.reduce((a, b) => a + (b.score ?? 0), 0) / submissions.length;
  const submissionCount = submissions.length;
  
  // Calculate average highlights per submission using only the last cheatsheet
  const averageHighlightsPerSubmission = submissions.reduce((sum, submission) => {
    const lastCheatsheet = submission.cheatsheets
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    const highlightCount = lastCheatsheet?.highlights?.length ?? 0;
    const formulasCount = lastCheatsheet?.formulas?.length ?? 0;
    return sum + highlightCount + formulasCount;
  }, 0) / submissionCount;
    
  return {
    averageScore,
    submissionCount,
    averageHighlightsPerSubmission
  };
}

export const getReadAndRelayActivity = async (ctx: ProtectedTRPCContext, input: GetReadAndRelayActivityInput) => {
  const activity = await ctx.db.query.activity.findFirst({
    where: (activity, { eq }) => eq(activity.id, input.activityId),
  });

  const assignmentId = activity?.assignmentId;

  if(!assignmentId || activity?.type !== ActivityType.ReadAndRelay) {
    throw new Error("Assignment not found");  
  }

  const assignment = await ctx.db.query.readAndRelayAssignments.findFirst({
    where: (assignment, { eq }) => eq(assignment.id, assignmentId),
    with: {
      questionsToAssignment: {
        with: {
          question: true,
        }
      }
    }
  });

  return assignment;

}