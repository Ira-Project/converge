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

  // Get all cheatsheets for this attempt
  const cheatSheets = await ctx.db.query.readAndRelayCheatSheets.findMany({
    where: (cheatSheet, { eq }) => eq(cheatSheet.attemptId, input.attemptId),
    with: {
      computedAnswers: true,
    }
  });

  // Calculate total accuracy across all cheatsheets
  let totalCorrect = 0;
  let totalAnswers = 0;
  let bestScore = 0;

  cheatSheets.forEach(cheatSheet => {
    const correctAnswers = cheatSheet.computedAnswers.reduce((a, b) => a + (b.isCorrect ? 1 : 0), 0);
    const answers = cheatSheet.computedAnswers.length;
    totalCorrect += correctAnswers;
    totalAnswers += answers;

    // Calculate this cheatsheet's score
    const cheatSheetScore = answers > 0 ? correctAnswers / answers : 0;
    bestScore = Math.max(bestScore, cheatSheetScore);
  });

  const score = bestScore;
  
  await ctx.db.update(readAndRelayAttempts).set({
    score,
    accuracy: totalCorrect / totalAnswers,
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
        cheatsheets: {
          with: {
            computedAnswers: true,
          }
        }
      }
    });
  } else {
    submissions = await ctx.db.query.readAndRelayAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        cheatsheets: {
          with: {
            computedAnswers: true,
          }
        }
      }
    });
  }

  const averageScore = submissions.reduce((a, b) => a + (b.score ?? 0), 0) / submissions.length;
  const submissionCount = submissions.length;
  
  // Calculate average highlights per submission using the cheatsheet with most correct answers
  const averageHighlightsPerSubmission = submissions.reduce((sum, submission) => {
    const bestCheatsheet = submission.cheatsheets
      .reduce((best, current) => {
        const currentCorrect = current.computedAnswers?.reduce((acc, answer) => 
          acc + (answer.isCorrect ? 1 : 0), 0) ?? 0;
        const bestCorrect = best?.computedAnswers?.reduce((acc, answer) => 
          acc + (answer.isCorrect ? 1 : 0), 0) ?? -1;
        return currentCorrect > bestCorrect ? current : best;
      }, submission.cheatsheets[0]);

    const highlightCount = bestCheatsheet?.highlights?.length ?? 0;
    return sum + highlightCount;
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

  if(!assignmentId || activity?.typeText !== ActivityType.ReadAndRelay as string) {
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