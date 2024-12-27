import type { ProtectedTRPCContext } from "../../../trpc";
import { generateId } from "lucia";
import { type SubmitTestAttemptSchema, type CreateTestAttemptInput, type GetSubmissionsInput, type GetUnderstandingGapsInput, type GetAnalyticsCardsInput, type GetLearnByTeachingActivityInput } from "./learnByTeaching.input";
import { explainTestAttempts } from "@/server/db/schema/learnByTeaching/explainTestAttempt";
import { eq } from "drizzle-orm";
import { ActivityType, ConceptStatus, Roles } from "@/lib/constants";
import { explainAssignments } from "@/server/db/schema/learnByTeaching/explainAssignment";

export const createTestAttempt = async (ctx: ProtectedTRPCContext, input: CreateTestAttemptInput) => { 
  const id = generateId(21);
  await ctx.db.insert(explainTestAttempts).values({
    id, 
    activityId: input.activityId,
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
      explainComputedAnswers: true,
    }
  })
  
  const score = finalExplanation?.explainComputedAnswers?.filter((answer) => answer.isCorrect).length;
  const totalQuestions = finalExplanation?.explainComputedAnswers?.length;
  
  await ctx.db.update(explainTestAttempts)
    .set({
      score: score && totalQuestions ? score / totalQuestions : 0.0,
      submittedAt: submissionTime,
    })
    .where(eq(explainTestAttempts.id, input.testAttemptId))

};

export const getSubmissions = async (ctx: ProtectedTRPCContext, input: GetSubmissionsInput) => {
  const user = ctx.user.role;

  if (user === Roles.Student) {
    return await ctx.db.query.explainTestAttempts.findMany({
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
    return await ctx.db.query.explainTestAttempts.findMany({
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

export const getUnderstandingGaps = async (ctx: ProtectedTRPCContext, input: GetUnderstandingGapsInput) => {

  const user = ctx.user.role;
  let submissions = [];

  // Get submissions
  if (user === Roles.Student) {
    submissions = await ctx.db.query.explainTestAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.userId, ctx.user.id),
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        explanations: {
          columns: {
            id: true,
          },
          with: {
            explainConceptStatus: {
              with: {
                concept: {
                  columns: {
                    text: true,
                  }
                }
              }
            }
          }
        }
      }
    });
  } else {
    submissions = await ctx.db.query.explainTestAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        explanations: {
          columns: {
            id: true,
          },
          with: {
            explainConceptStatus: {
              with: {
                concept: {
                  columns: {
                    text: true,
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  // Calculate concept scores
  const conceptScores = new Map<string, { score: number; total: number; conceptName: string }>();

  submissions.forEach(submission => {
    submission.explanations.forEach(explanation => {
      explanation.explainConceptStatus.forEach(conceptStatus => {
        if(conceptScores.has(conceptStatus.conceptId)) {
          const scoreData = conceptScores.get(conceptStatus.conceptId)!;
          scoreData.total += 1;
          if(conceptStatus.status === ConceptStatus.CORRECT) {
            scoreData.score += 1;
          } else if(conceptStatus.status === ConceptStatus.INCORRECT) {
            scoreData.score -= 0.5;
          }
          conceptScores.set(conceptStatus.conceptId, scoreData);
        } else {
          conceptScores.set(conceptStatus.conceptId, {
            score: 0,
            total: 0,
            conceptName: conceptStatus.concept.text
          });
        }
      });
    });
  });


  // Convert to array and calculate percentages
  const conceptUnderstanding = Array.from(conceptScores.entries()).map(([conceptId, data]) => ({
    conceptId,
    conceptName: data.conceptName,
    score: data.total > 0 ? Math.max(0, (data.score / data.total) * 100) : 0, // Ensure score doesn't go below 0%
    totalOccurrences: data.total
  }));

  // Sort by score in descending order
  const conceptList = conceptUnderstanding.sort((a, b) => a.score - b.score).slice(0, 3);
  return conceptList;

}

export const getAnalyticsCards = async (ctx: ProtectedTRPCContext, input: GetAnalyticsCardsInput) => {

  const user = ctx.user.role;
  let submissions = [];

  if (user === Roles.Student) {
    submissions = await ctx.db.query.explainTestAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.userId, ctx.user.id),
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        explanations: {
          columns: {
            id: true,
          }
        }
      }
    });
  } else {
    submissions = await ctx.db.query.explainTestAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        explanations: {
          columns: {
            id: true,
          }
        }
      }
    });
  }

  const averageScore = submissions.reduce((a, b) => a + (b.score ?? 0), 0) / submissions.length;
  const submissionCount = submissions.length;
  const averageExplanationsPerSubmission = submissions.reduce((a, b) => a + (b.explanations.length ?? 0), 0) / submissions.length;
    
  return {
    averageScore,
    submissionCount,
    averageExplanationsPerSubmission
  };
}

export const getLearnByTeachingActivity = async (ctx: ProtectedTRPCContext, input: GetLearnByTeachingActivityInput) => {
  const activity = await ctx.db.query.activity.findFirst({
    where: (activity, { eq }) => eq(activity.id, input.activityId),
  });

  const assignmentId = activity?.assignmentId;

  if(!assignmentId || activity?.type !== ActivityType.LearnByTeaching) {
    throw new Error("Assignment not found");  
  }

  const assignment = await ctx.db.query.explainAssignments.findFirst({
    where: (assignment, { eq }) => eq(explainAssignments.id, assignmentId),
    with: {
      questionToAssignment: {
        with: {
          question: true,
        }
      }
    }
  });

  return assignment;

}