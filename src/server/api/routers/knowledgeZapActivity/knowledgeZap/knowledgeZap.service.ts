import type { ProtectedTRPCContext } from "../../../trpc";
import { generateId } from "lucia";
import type { SubmitAssignmentAttemptSchema, GetSubmissionsInput, GetAnalyticsCardsInput, CreateAssignmentAttemptInput, GetKnowledgeZapActivityInput, GetHeatMapInput } from "./knowledgeZap.input";
import { eq } from "drizzle-orm";
import { ActivityType, Roles } from "@/lib/constants";
import { knowledgeZapAssignmentAttempts } from "@/server/db/schema/knowledgeZap/knowledgeZapAssignment";
import { knowledgeZapAssignments } from "@/server/db/schema/knowledgeZap/knowledgeZapAssignment";
import { KnowledgeZapQuestionType } from "@/lib/constants";
import { type KnowledgeZapQuestionObjects } from "@/app/(main)/activity/[activityId]/knowledge-zap/live/types";

export const createAssignmentAttempt = async (ctx: ProtectedTRPCContext, input: CreateAssignmentAttemptInput) => { 
  const id = generateId(21);
  await ctx.db.insert(knowledgeZapAssignmentAttempts).values({
    id, 
    activityId: input.activityId,
    userId: ctx.user.id,
  })
  return id;
};

export const submitAssignmentAttempt = async (ctx: ProtectedTRPCContext, input: SubmitAssignmentAttemptSchema) => {

  const questionAttempts = await ctx.db.query.knowledgeZapQuestionAttempts.findMany({
    where: (questionAttempt, { eq }) => eq(questionAttempt.attemptId, input.assignmentAttemptId),
  });

  const assignment = await ctx.db.query.knowledgeZapAssignments.findFirst({
    where: (assignment, { eq }) => eq(assignment.id, input.assignmentId),
    with: {
      questionToAssignment: true,
    }
  });
  if(!assignment?.questionToAssignment) {
    throw new Error("Assignment not found");
  }

  const submissionTime = new Date();
  const score = questionAttempts.filter((attempt) => attempt.isCorrect).length;  

  await ctx.db.update(knowledgeZapAssignmentAttempts)
    .set({
      score: (score * score) / (questionAttempts.length * assignment?.questionToAssignment.length),
      submittedAt: submissionTime,
      questionsCompleted: questionAttempts.filter((attempt) => attempt.isCorrect).length,
      totalAttempts: questionAttempts.length,
    })
  .where(eq(knowledgeZapAssignmentAttempts.id, input.assignmentAttemptId))
  

};

export const getSubmissions = async (ctx: ProtectedTRPCContext, input: GetSubmissionsInput) => {
  const user = ctx.user.role;

  if (user === Roles.Student) {
    return await ctx.db.query.knowledgeZapAssignmentAttempts.findMany({
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
        },
      }
    });
  } else {
    return await ctx.db.query.knowledgeZapAssignmentAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        user: {
          columns: {
            name: true,
          }
        },
      }
    });
  }
}

export const getAnalyticsCards = async (ctx: ProtectedTRPCContext, input: GetAnalyticsCardsInput) => {

  const user = ctx.user.role;
  let submissions = [];

  if (user === Roles.Student) {
    submissions = await ctx.db.query.knowledgeZapAssignmentAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.userId, ctx.user.id),
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        questionAttempts: {
          columns: {
            isCorrect: true,
            id: true,
          }
        }
      }
    });
  } else {
    submissions = await ctx.db.query.knowledgeZapAssignmentAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        questionAttempts: {
          columns: {
            isCorrect: true,
            id: true,
          }
        }
      }
    });
  }

  const averageQuestionsCompleted = submissions.reduce((a, b) => a + (b.questionAttempts.filter((attempt) => attempt.isCorrect).length ?? 0), 0) / submissions.length;
  
  // Get unique user count instead of submission count
  const uniqueUserIds = new Set(submissions.map(submission => submission.userId));
  const uniqueUserCount = uniqueUserIds.size;
  
  const averageAttemptsPerSubmission = submissions.reduce((a, b) => a + (b.questionAttempts.length ?? 0), 0) / submissions.length;
    
  return {    
    averageQuestionsCompleted,
    submissionCount: uniqueUserCount,
    averageAttemptsPerSubmission
  };
}

export const getKnowledgeZapActivity = async (ctx: ProtectedTRPCContext, input: GetKnowledgeZapActivityInput) => {

  const startTime = new Date().getTime();
  const activity = await ctx.db.query.activity.findFirst({
    where: (activity, { eq }) => eq(activity.id, input.activityId),
  });

  const assignmentId = activity?.assignmentId;

  if(!assignmentId || activity?.typeText !== ActivityType.KnowledgeZap as string) {
    throw new Error("Assignment not found");  
  }

  const assignment = await ctx.db.query.knowledgeZapAssignments.findFirst({
    where: (assignment, { eq }) => eq(knowledgeZapAssignments.id, assignmentId),
    with: {
      questionToAssignment: {
        with: {
          question: true,
        }
      }
    }
  });

  if(!assignment) {
    throw new Error("Assignment not found");
  }

  const questions: KnowledgeZapQuestionObjects[] = [];

  // Convert the loop to use Promise.all for parallel execution
  await Promise.all(assignment.questionToAssignment.map(async (questionToAssignment) => {
    const question = questionToAssignment.question;
    const questionIds = question.questionId;

    if (!questionIds) return;

    let questionObject: KnowledgeZapQuestionObjects | null = null;

    if (question.type === KnowledgeZapQuestionType.MULTIPLE_CHOICE) {
      const multipleChoiceQuestions = await ctx.db.query.multipleChoiceQuestions.findMany({
        where: (multipleChoiceQuestion, { inArray }) => inArray(multipleChoiceQuestion.id, questionIds),
        with: {
          options: {
            columns: {
              id: true,
              option: true,
              imageUrl: true,
            }
          }
        }
      });

      if (multipleChoiceQuestions.length > 0) {
        questionObject = {
          id: question.id,
          type: KnowledgeZapQuestionType.MULTIPLE_CHOICE,
          variants: multipleChoiceQuestions.map((q) => ({
            id: q.id,
            question: q.question,
            imageUrl: q.imageUrl,
            options: q.options.sort(() => Math.random() - 0.5),
          })),
        };
      }
    }

    if (question.type === KnowledgeZapQuestionType.MATCHING) {
      const matchingQuestions = await ctx.db.query.matchingQuestions.findMany({
        where: (matchingQuestion, { inArray }) => inArray(matchingQuestion.id, questionIds),
        with: {
          options: true,
        }
      });

      if (matchingQuestions.length > 0) {
        questionObject = {
          id: question.id,
          type: KnowledgeZapQuestionType.MATCHING,
          variants: matchingQuestions.map((matchingQuestion) => ({
            id: matchingQuestion.id,
            question: matchingQuestion.question,
            imageUrl: matchingQuestion.imageUrl,
            optionAs: matchingQuestion.options.map(o => o.optionA).sort(() => Math.random() - 0.5),
            optionBs: matchingQuestion.options.map(o => o.optionB).sort(() => Math.random() - 0.5),
          })),
        };
      }
    }

    if (question.type === KnowledgeZapQuestionType.ORDERING) {
      const orderingQuestions = await ctx.db.query.orderingQuestions.findMany({
        where: (orderingQuestion, { inArray }) => inArray(orderingQuestion.id, questionIds),
        with: {
          options: {
            columns: {
              id: true,
              option: true,
            }
          }
        }
      });

      if (orderingQuestions.length > 0) {
        questionObject = {
          id: question.id,
          type: KnowledgeZapQuestionType.ORDERING,
          variants: orderingQuestions.map((q) => ({
            ...q,
            options: q.options.sort(() => Math.random() - 0.5),
          })),
        };
      }
    }

    if (questionObject) {
      questions.push(questionObject);
    }
  }));

  // Randomly sort the questions array before returning
  questions.sort(() => Math.random() - 0.5);

  return {
    ...assignment,
    questions,
  };
}

export const getHeatMap = async (ctx: ProtectedTRPCContext, input: GetHeatMapInput) => {
  const user = ctx.user.role;
  let submissions = [];

  if (user === Roles.Student) {
    submissions = await ctx.db.query.knowledgeZapAssignmentAttempts.findMany({
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
        },
        questionAttempts: {
          columns: {
            id: true,
            questionId: true,
            isCorrect: true,
          }
        }
      }
    });
  } else {
    submissions = await ctx.db.query.knowledgeZapAssignmentAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        user: {
          columns: {
            name: true,
          }
        },
        questionAttempts: {
          columns: {
            id: true,
            questionId: true,
            isCorrect: true,
          }
        }
      }
    });
  }

  const activity = await ctx.db.query.activity.findFirst({
    where: (activity, { eq }) => eq(activity.id, input.activityId),
  });

  const assignment = await ctx.db.query.knowledgeZapAssignments.findFirst({
    where: (assignment, { eq }) => eq(assignment.id, activity?.assignmentId ?? ''),
    with: {
      questionToAssignment: {
        columns: {
          id: true,
          questionId: true,
        }
      }
    }
  });

  if(!assignment) {
    throw new Error("Assignment not found");
  }

  const heatMap: {
    attemptId: string;
    name: string;
    questionAttempts: {
      id: string;
      attempts: number;
      isCorrect: boolean;
    }[]
  }[] = [];

  for(const submission of submissions) {
    console.log(submission.submittedAt);
    const attemptId = submission.id;
    const name = submission.user?.name ?? 'Anonymous';
    
    // Create initial map of questions with 0 attempts
    const questionAttemptsMap = new Map(
      assignment.questionToAssignment.map(q => [q.questionId, { id: q.id, attempts: 0, isCorrect: false }])
    );

    // Update attempts count for each question attempt in submission
    for(const questionAttempt of submission.questionAttempts) {
      const questionId = questionAttempt.questionId;
      if(!questionId) continue;

      if (questionAttemptsMap.has(questionId)) {
        const currentAttempts = questionAttemptsMap.get(questionId);
        if (currentAttempts) {
          currentAttempts.attempts += 1;
          if (questionAttempt.isCorrect) {
            currentAttempts.isCorrect = true;
          }
          questionAttemptsMap.set(questionId, currentAttempts);
        }
      }
    }

    // Add to heatmap
    heatMap.push({
      attemptId,
      name,
      questionAttempts: Array.from(questionAttemptsMap.values())
    });

  }

  return {
    noOfQuestions: assignment.questionToAssignment.length,
    heatMap,
  }

}