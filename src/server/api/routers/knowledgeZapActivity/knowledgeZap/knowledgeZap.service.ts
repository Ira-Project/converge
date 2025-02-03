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

  // TODO: Check the scoring system once again
  const submissionTime = new Date();
  const score = questionAttempts.filter((attempt) => attempt.isCorrect).length;
  const totalQuestions = questionAttempts.length;

  await ctx.db.update(knowledgeZapAssignmentAttempts)
    .set({
      score: score / totalQuestions,
      submittedAt: submissionTime,
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
        }
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
        }
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
            id: true,
          }
        }
      }
    });
  }

  const averageScore = submissions.reduce((a, b) => a + (b.score ?? 0), 0) / submissions.length;
  const submissionCount = submissions.length;
  const averageAttemptsPerSubmission = submissions.reduce((a, b) => a + (b.questionAttempts.length ?? 0), 0) / submissions.length;
    
  return {
    averageScore,
    submissionCount,
    averageAttemptsPerSubmission
  };
}

export const getKnowledgeZapActivity = async (ctx: ProtectedTRPCContext, input: GetKnowledgeZapActivityInput) => {
  const activity = await ctx.db.query.activity.findFirst({
    where: (activity, { eq }) => eq(activity.id, input.activityId),
  });

  const assignmentId = activity?.assignmentId;

  if(!assignmentId || activity?.type !== ActivityType.KnowledgeZap) {
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

  const questions:KnowledgeZapQuestionObjects[] = []

  for(const questionToAssignment of assignment.questionToAssignment) {
    
    const question = questionToAssignment.question;
    const questionIds = question.questionId;

    if(!questionIds) {
      continue;
    }

    if(question.type === KnowledgeZapQuestionType.MULTIPLE_CHOICE) {

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

      const variants = multipleChoiceQuestions.map((question) => {
        return {
          id: question.id,
          question: question.question,
          imageUrl: question.imageUrl,
          options: question.options.sort(() => Math.random() - 0.5),
        }
      })

      if(variants.length > 0) {
        questions.push({
          id: question.id,
          type: KnowledgeZapQuestionType.MULTIPLE_CHOICE,
          variants: variants,
        });
      }
    }

    if(question.type === KnowledgeZapQuestionType.MATCHING) {

      const variants = [];

      const matchingQuestions = await ctx.db.query.matchingQuestions.findMany({
        where: (matchingQuestion, { inArray }) => inArray(matchingQuestion.id, questionIds),
        with: {
          options: true,
        }
      });

      for(const matchingQuestion of matchingQuestions) {
        const optionAs = [];
        const optionBs = [];

        for(const option of matchingQuestion.options) {
          optionAs.push(option.optionA);
          optionBs.push(option.optionB);
        }

        variants.push({
          id: matchingQuestion.id,
          question: matchingQuestion.question,
          imageUrl: matchingQuestion.imageUrl,
          optionAs: optionAs.sort(() => Math.random() - 0.5),
          optionBs: optionBs.sort(() => Math.random() - 0.5),
        });
      }

      if(variants.length > 0) {
        questions.push({
          id: question.id,
          type: KnowledgeZapQuestionType.MATCHING,
          variants: variants,
        });
      }
    }

    if(question.type === KnowledgeZapQuestionType.ORDERING) {

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
      
      const variants = orderingQuestions.map((question) => {
        return {
          ...question,
          options: question.options.sort(() => Math.random() - 0.5),
        }
      })

      if(variants.length > 0) {
        questions.push({
          id: question.id,
          type: KnowledgeZapQuestionType.ORDERING,
          variants: variants,
        });
      }
    }

  }

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
    }[]
  }[] = [];

  for(const submission of submissions) {
    const attemptId = submission.id;
    const name = submission.user?.name ?? 'Anonymous';
    
    // Create initial map of questions with 0 attempts
    const questionAttemptsMap = new Map(
      assignment.questionToAssignment.map(q => [q.questionId, { id: q.id, attempts: 0 }])
    );


    // Update attempts count for each question attempt in submission
    for(const questionAttempt of submission.questionAttempts) {
      const questionId = questionAttempt.questionId;
      if(!questionId) continue;

      if (questionAttemptsMap.has(questionId)) {
        const currentAttempts = questionAttemptsMap.get(questionId);
        if (currentAttempts) {
          currentAttempts.attempts += 1;
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