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
  const explanations = await ctx.db.query.explanations.findMany({
    where: (explanation, { eq }) => eq(explanation.testAttemptId, input.testAttemptId),
    orderBy: (explanation, { desc }) => [desc(explanation.createdAt)],
    with: {
      explainComputedAnswers: true,
    }
  })

  let maxScore = 0;
  let scoreSum = 0;
  const totalQuestions = explanations[0]?.explainComputedAnswers?.length;

  for (const explanation of explanations) {
    const score = explanation.explainComputedAnswers?.filter((answer) => answer.isCorrect).length;
    if(score && score > maxScore) {
      maxScore = score;
    }
    scoreSum += score;
  }

  const averageScore = scoreSum / (explanations.length * (totalQuestions ?? 1));
  
  await ctx.db.update(explainTestAttempts)
    .set({
      score2: maxScore && totalQuestions ? maxScore / totalQuestions : 0.0,
      averageScore,
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

  const activity = await ctx.db.query.activity.findFirst({
    where: (activity, { eq }) => eq(activity.id, input.activityId),
  });

  if(!activity) {
    throw new Error("Activity not found");
  }

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
            explainComputedAnswers: {
              with: {
                question: {
                  with: {
                    explainQuestionConcepts: {
                      with: {
                        concept: true,
                      }
                    }
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
          orderBy: (explanation, { desc }) => [desc(explanation.createdAt)],
          with: { 
            explainComputedAnswers: {
              with: {
                question: true
              }
            }
          }
        }
      }
    });
  }

  const questions = await ctx.db.query.explainQuestionToAssignment.findMany({
    where: (question, { eq }) => eq(question.assignmentId, activity.assignmentId ?? ""),
  });

  const questionConceptsMap = new Map<string, string[]>();

  for (const question of questions) {
    const questionConcept = await ctx.db.query.explainQuestionConcepts.findMany({
      where: (questionConcept, { eq }) => eq(questionConcept.questionId, question.questionId),
      with: {
        concept: true,
      }
    });
    if(!questionConcept) continue;
    for (const concept of questionConcept) {
      const conceptName = concept.concept?.text ?? "";
      if(questionConceptsMap.has(question.questionId)) {
        questionConceptsMap.set(question.questionId, [...questionConceptsMap.get(question.questionId) ?? [], conceptName]);
      } else {  
        questionConceptsMap.set(question.questionId, [conceptName]);
      }
    }
  }

  // Calculate concept scores
  const conceptScores = new Map<string, { score: number; total: number; conceptName: string }>();

  for (const submission of submissions) {
    // Find the explanation with the highest score
    let bestExplanation = null;
    let bestScore = -1;

    for (const explanation of submission.explanations) {
      const correctAnswers = explanation.explainComputedAnswers.filter(answer => answer.isCorrect).length;
      const totalAnswers = explanation.explainComputedAnswers.length;
      const score = totalAnswers > 0 ? correctAnswers / totalAnswers : 0;

      if (score > bestScore) {
        bestScore = score;
        bestExplanation = explanation;
      }
    }

    if (!bestExplanation) continue;
    
    for (const computedAnswer of bestExplanation.explainComputedAnswers) {
      const question = computedAnswer.question;
      if (!question) continue;
      const questionConcepts = questionConceptsMap.get(question.id);
      if(!questionConcepts) continue;
      for (const questionConcept of questionConcepts) {
        const score = computedAnswer.isCorrect ? 1 : 0;
        const total = 1;
        if(conceptScores.has(questionConcept)) {
          const existingData = conceptScores.get(questionConcept);
          if(existingData) {
            existingData.score += score;
            existingData.total += total;
            conceptScores.set(questionConcept, existingData);
          }
        } else {
          conceptScores.set(questionConcept, { score, total, conceptName: questionConcept });
        }
      }
    }
  }

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

  const averageScore = submissions.reduce((a, b) => a + (b.score2 ?? 0), 0) / submissions.length;
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

  if(!assignmentId || activity?.typeText !== ActivityType.LearnByTeaching as string) {
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