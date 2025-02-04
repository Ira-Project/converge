import { asc, eq, sql } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../../trpc";
import type { CreateReasoningAssignmentAttemptInput, GetReasoningAssignmentInput, SubmitReasoningAssignmentAttemptInput, GetReasoningAssignmentAnalyticsInput, GetReasoningAssignmentSubmissionsInput, GetReasoningAssignmentQuestionAnalyticsInput } from "./reasonTrace.input";
import { reasoningAssignmentAttempts } from "@/server/db/schema/reasoning/reasoningAssignment";
import { reasoningQuestionToAssignment } from "@/server/db/schema/reasoning/reasoningQuestions";
import { generateId } from "lucia";
import { ActivityType, Roles } from "@/lib/constants";

export const getReasoningAssignment = async (ctx: ProtectedTRPCContext, input: GetReasoningAssignmentInput) => {
  const activity = await ctx.db.query.activity.findFirst({
    where: (table, { eq }) => eq(table.id, input.activityId),
  });

  const assignmentId = activity?.assignmentId;

  if (!assignmentId || activity?.type !== ActivityType.ReasonTrace ) {
    throw new Error("Assignment not found");
  }

  return await ctx.db.query.reasoningAssignments.findFirst({
    where: (table, { eq }) => eq(table.id, assignmentId),
    columns: {
      id: true,
      name: true,
      createdAt: true,
      createdBy: true,
      description: true,
    },
    with : {
      topic: {
        columns: {
          name: true,
        }
      },
      reasoningQuestions: {
        orderBy: [asc(reasoningQuestionToAssignment.order)],
        with: {
          question: {  
            columns: {
              id: true,
              topText: true,
              topImage: true,
              questionText: true,
              questionImage: true,
              answerText: true,
              answerImage: true,
              numberOfSteps: true,
            },
            with: {
              answerOptions: {
                columns: {
                  id: true,
                  optionText: true,
                  optionImage: true,
                },
              }
            }
          },
        }
      },
    }
  });
}

export const createReasoningAssignmentAttempt = async (ctx: ProtectedTRPCContext, input: CreateReasoningAssignmentAttemptInput) => {
  const id = generateId(21);
  await ctx.db.insert(reasoningAssignmentAttempts).values({
    id: id,
    activityId: input.activityId,
    userId: ctx.user.id,
  });
  return id;
}

export const submitReasoningAssignmentAttempt = async (ctx: ProtectedTRPCContext, input: SubmitReasoningAssignmentAttemptInput) => {

  let score = 0.0;
  for (const status of input.statuses) {
    if (status === 'complete') {
      score += 1;
    }
    if (status === 'part2') {
      score += 0.5;
    }
    if (status === 'part3') {
      score += 0.75;
    }
  }

  score = score / input.statuses.length;

  await ctx.db.update(reasoningAssignmentAttempts)
    .set({
      score: sql`${score}`,
      submittedAt: new Date(),
    })
    .where(eq(reasoningAssignmentAttempts.id, input.attemptId))
}

export const getReasoningAssignmentAnalytics = async (ctx: ProtectedTRPCContext, input: GetReasoningAssignmentAnalyticsInput) => {

  let submissions = [];

  if (ctx.user.role === Roles.Student) {
    submissions = await ctx.db.query.reasoningAssignmentAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.userId, ctx.user.id),
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        reasoningPathwayAttempts: {
          columns: {
            id: true,
          }
        },
        reasoningAttemptFinalAnswer: {
          columns: {
            id: true,
          }
        }
      }
    });
  } else {
    submissions = await ctx.db.query.reasoningAssignmentAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        reasoningPathwayAttempts: {
          columns: {
            id: true,
          }
        },
        reasoningAttemptFinalAnswer: {
          columns: {
            id: true,
          }
        }
      }
    });
  }

  const averageScore = submissions.length > 0 
    ? submissions.reduce((a, b) => a + (b.score ?? 0), 0) / submissions.length 
    : 0;
  const submissionCount = submissions.length;
  const pathwayAttempt = submissions.length > 0
    ? submissions.reduce((a, b) => a + (b.reasoningPathwayAttempts.length ?? 0), 0) / submissions.length
    : 0;
  const finalAnswers = submissions.length > 0
    ? submissions.reduce((a, b) => a + (b.reasoningAttemptFinalAnswer.length ?? 0), 0) / submissions.length
    : 0;
  const averageAttempts = submissions.length > 0
    ? (pathwayAttempt + finalAnswers) / (submissions.length)
    : 0;

  return {
    averageScore,
    submissionCount,
    averageAttempts,
  }

}

export const getReasoningAssignmentSubmissions = async (ctx: ProtectedTRPCContext, input: GetReasoningAssignmentSubmissionsInput) => {
  let submissions = [];

  if (ctx.user.role === Roles.Student) {
    submissions = await ctx.db.query.reasoningAssignmentAttempts.findMany({
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
    submissions = await ctx.db.query.reasoningAssignmentAttempts.findMany({
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

  return submissions;
}

export const getReasoningAssignmentQuestionAnalytics = async (ctx: ProtectedTRPCContext, input: GetReasoningAssignmentQuestionAnalyticsInput) => {

  let submissions = [];
  if (ctx.user.role === Roles.Student) {
    submissions = await ctx.db.query.reasoningAssignmentAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.userId, ctx.user.id),
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        reasoningPathwayAttempts: {
          columns: {
            id: true,
            questionId: true,
            part: true,
            correct: true,
          },
          with: {
            question: {
              columns: {
                questionText: true,
                topText: true,
              }
            }
          }
        },
        reasoningAttemptFinalAnswer: {
          columns: {
            id: true,
            questionId: true,
            isCorrect: true,
          },
          with: {
            question: {
              columns: {
                questionText: true,
                topText: true,
              }
            }
          }
        }
      }
    });
  } else {
    submissions = await ctx.db.query.reasoningAssignmentAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        reasoningPathwayAttempts: {
          columns: {
            id: true,
            questionId: true,
            part: true,
            correct: true,
          },
          with: {
            question: {
              columns: {
                questionText: true,
                topText: true,
              }
            }
          }
        },
        reasoningAttemptFinalAnswer: {
          columns: {
            id: true,
            questionId: true,
            isCorrect: true,
          },
          with: {
            question: {
              columns: {
                questionText: true,
                topText: true,
              }
            }
          }
        }
      }
    });
  }

  const results = new Map<string, { 
    questionText: string;
    step1: { correct: number; total: number; }, 
    step2: { correct: number; total: number; }, 
    step3: { correct: number; total: number; }
  }>();

  // Helper function to ensure question result exists
  const getOrCreateResult = (questionId: string, questionText: string) => {
    if (!results.has(questionId)) {
      results.set(questionId, {
        questionText,
        step1: { correct: 0, total: 0 },
        step2: { correct: 0, total: 0 },
        step3: { correct: 0, total: 0 }
      });
    }
    return results.get(questionId)!;
  };

  // Process all submissions in a single pass
  for (const submission of submissions) {
    // Process pathway attempts
    for (const pathwayAttempt of submission.reasoningPathwayAttempts) {
      const { questionId, part, correct, question } = pathwayAttempt;
      if (!questionId || !question) continue;

      const result = getOrCreateResult(questionId, question.topText ?? question.questionText ?? '');
      
      if (part === 1) {
        result.step1.total++;
        if (correct) result.step1.correct++;
      } else if (part === 2) {
        result.step2.total++;
        if (correct) result.step2.correct++;
      }
    }

    // Process final answers
    for (const finalAnswer of submission.reasoningAttemptFinalAnswer) {
      const { questionId, isCorrect, question } = finalAnswer;
      if (!questionId || !question) continue;

      const result = getOrCreateResult(questionId, question.topText ?? question.questionText ?? '');
      result.step3.total++;
      if (isCorrect) result.step3.correct++;
    }
  }

  // Calculate percentages
  return Array.from(results.entries()).map(([questionId, result]) => ({
    questionId,
    questionText: result.questionText,
    step1: result.step1.total > 0 ? result.step1.correct / result.step1.total : 0,
    step2: result.step2.total > 0 ? result.step2.correct / result.step2.total : 0,
    step3: result.step3.total > 0 ? result.step3.correct / result.step3.total : 0,
  }));
}