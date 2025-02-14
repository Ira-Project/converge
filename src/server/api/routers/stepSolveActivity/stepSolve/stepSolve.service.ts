import { asc, eq, sql } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../../trpc";
import { generateId } from "lucia";
import { ActivityType, Roles } from "@/lib/constants";
import { stepSolveQuestionToAssignment, stepSolveStep } from "@/server/db/schema/stepSolve/stepSolveQuestions";
import type { CreateStepSolveAssignmentAttemptInput, GetStepSolveAssignmentAnalyticsInput, GetStepSolveAssignmentInput, GetStepSolveAssignmentQuestionAnalyticsInput, GetStepSolveAssignmentSubmissionsInput, SubmitStepSolveAssignmentAttemptInput } from "./stepSolve.input";
import { stepSolveAssignmentAttempts,  } from "@/server/db/schema/stepSolve/stepSolveAssignment";


export const getStepSolveAssignment = async (ctx: ProtectedTRPCContext, input: GetStepSolveAssignmentInput) => {
  const activity = await ctx.db.query.activity.findFirst({
    where: (table, { eq }) => eq(table.id, input.activityId),
  });

  const assignmentId = activity?.assignmentId;

  if (!assignmentId || activity?.typeText !== ActivityType.StepSolve as string) {
    throw new Error("Assignment not found");
  }

  return await ctx.db.query.stepSolveAssignments.findFirst({
    where: (table, { eq }) => eq(table.id, assignmentId),
    columns: {
      id: true,
      name: true,
      createdAt: true,
      createdBy: true,
      description: true,
    },
    with: {
      topic: {
        columns: {
          name: true,
        }
      },
      stepSolveQuestions: {
        orderBy: [asc(stepSolveQuestionToAssignment.order)],
        with: {
          q: {
            columns: {
              id: true,
              questionText: true,
              questionImage: true,
            },
            with: {
              steps: {
                orderBy: [asc(stepSolveStep.stepNumber)],
                columns: {
                  id: true,
                  stepText: true,
                  stepTextPart2: true,
                  stepImage: true,
                  stepNumber: true,
                  stepSolveAnswer: true,
                  stepSolveAnswerUnits: true,
                },
                with: {
                  opt: {
                    columns: {
                      id: true,
                      optionText: true,
                      optionImage: true,
                    }
                  },
                }
              }
            }
          }
        }
      }
    }
  });
}

export const createStepSolveAssignmentAttempt = async (ctx: ProtectedTRPCContext, input: CreateStepSolveAssignmentAttemptInput) => {
  const id = generateId(21);
  await ctx.db.insert(stepSolveAssignmentAttempts).values({
    id: id,
    activityId: input.activityId,
    userId: ctx.user.id,
  });
  return id;
}

export const submitStepSolveAssignmentAttempt = async (ctx: ProtectedTRPCContext, input: SubmitStepSolveAssignmentAttemptInput) => {

  const activity = await ctx.db.query.activity.findFirst({
    where: (table, { eq }) => eq(table.id, input.activityId),
  });

  const assignmentId = activity?.assignmentId;

  if (!assignmentId || activity?.typeText !== ActivityType.StepSolve as string) {
    throw new Error("Assignment not found");
  }

  const assignment = await ctx.db.query.stepSolveAssignments.findFirst({
    where: (table, { eq }) => eq(table.id, assignmentId),
    with: {
      stepSolveQuestions: {
        columns: {
          id: true,
        }
      }
    }
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  const attempt = await ctx.db.query.stepSolveAssignmentAttempts.findFirst({
    where: (table, { eq }) => eq(table.id, input.attemptId),
    with: {
      qas: {
        columns: {
          id: true,
          score: true,
          reasoningScore: true,
          evaluationScore: true,
          stepsCompleted: true,
          correct: true,
        }, 
        with: {
          question: {
            columns: {
              id: true,
            }, 
            with: {
              steps: {
                columns: {
                  id: true,
                }
              }
            }
          }, 
        }
      } 
    }
  });

  if (!attempt) {
    throw new Error("Attempt not found");
  }

  let totalScore = 0;
  for (const questionAttempt of attempt.qas) {

    const questionScore = (questionAttempt.score ?? 0) * (questionAttempt.stepsCompleted ?? 0);
    const questionScoreNormalised = questionScore / questionAttempt.question.steps.length;
    totalScore += questionScoreNormalised;
  }

  const score = totalScore / assignment.stepSolveQuestions.length;

  let reasoningScore = attempt.qas.reduce((acc, curr) => acc + (curr.reasoningScore ?? 0), 0);
  reasoningScore = reasoningScore / attempt.qas.length;


  let evaluationScore = attempt.qas.reduce((acc, curr) => acc + (curr.evaluationScore ?? 0), 0);
  evaluationScore = evaluationScore / attempt.qas.length;


  await ctx.db.update(stepSolveAssignmentAttempts)
    .set({
      score: sql`${score}`,
      reasoningScore: sql`${reasoningScore}`,
      evaluationScore: sql`${evaluationScore}`,
      submittedAt: new Date(),
    })
    .where(eq(stepSolveAssignmentAttempts.id, input.attemptId))
}

export const getStepSolveAssignmentAnalytics = async (ctx: ProtectedTRPCContext, input: GetStepSolveAssignmentAnalyticsInput) => {
  let submissions = [];

  if (ctx.user.role === Roles.Student) {
    submissions = await ctx.db.query.stepSolveAssignmentAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.userId, ctx.user.id),
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        qas: {
          columns: {
            id: true,
            score: true,
            stepsCompleted: true,
            reasoningScore: true,
            evaluationScore: true,
          },
          with: {
            stepAttempts: {
              columns: {
                id: true,
                stepSolveStepId: true,
              }
            },
            question: {
              columns: {
                id: true,
              }, 
              with: {
                steps: {
                  columns: {
                    id: true,
                  }
                }
              }
            }
            
          }
        },
      }
    });
  } else {
    submissions = await ctx.db.query.stepSolveAssignmentAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        qas: {
          columns: {
            id: true,
            score: true,
            stepsCompleted: true,
            reasoningScore: true,
            evaluationScore: true,
          },
          with: {
            stepAttempts: {
              columns: {
                id: true,
                stepSolveStepId: true,
              }
            }, 
            question: {
              columns: {
                id: true,
              }, 
              with: {
                steps: {
                  columns: {
                    id: true,
                  }
                }
              }
            }
          }
        },
      }
    });
  }

  
  const averageScore = submissions.length > 0 
    ? submissions.reduce((a, b) => a + (b.score ?? 0), 0) / submissions.length 
    : 0;
  
  const averageReasoningScore = submissions.length > 0 
    ? submissions.reduce((a, b) => a + (b.reasoningScore ?? 0), 0) / submissions.length 
    : 0;
  
  const averageEvaluationScore = submissions.length > 0 
    ? submissions.reduce((a, b) => a + (b.evaluationScore ?? 0), 0) / submissions.length 
    : 0;
  
  return {
    averageScore: averageScore,
    reasoningErrorPercentage: 1 - averageReasoningScore,
    evaluationErrorPercentage: 1 - averageEvaluationScore,
  }
}

export const getStepSolveAssignmentSubmissions = async (ctx: ProtectedTRPCContext, input: GetStepSolveAssignmentSubmissionsInput) => {
  let submissions = [];

  if (ctx.user.role === Roles.Student) {
    submissions = await ctx.db.query.stepSolveAssignmentAttempts.findMany({
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
    submissions = await ctx.db.query.stepSolveAssignmentAttempts.findMany({
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

export const getStepSolveAssignmentQuestionAnalytics = async (ctx: ProtectedTRPCContext, input: GetStepSolveAssignmentQuestionAnalyticsInput) => {
  // First, get the assignment to fetch question details
  const activity = await ctx.db.query.activity.findFirst({
    where: (table, { eq }) => eq(table.id, input.activityId),
  });

  const assignmentId = activity?.assignmentId;
  
  if (!assignmentId || activity?.typeText !== ActivityType.StepSolve as string) {
    throw new Error("Assignment not found");
  }

  const assignment = await ctx.db.query.stepSolveAssignments.findFirst({
    where: (table, { eq }) => eq(table.id, assignmentId),
    with: {
      stepSolveQuestions: {
        with: {
          q: {
            columns: {
              id: true,
              questionText: true,
            },
            with: {
              steps: {
                columns: {
                  id: true,
                  stepNumber: true,
                  stepText: true,
                }
              }
            }
          }
        }
      }
    }
  });

  let submissions = [];
  if (ctx.user.role === Roles.Student) {
    submissions = await ctx.db.query.stepSolveAssignmentAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.userId, ctx.user.id),
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        qas: {
          columns: {
            id: true,
            questionId: true,
            correct: true,
          },
          with: {
            stepAttempts: {
              columns: {
                id: true,
                stepSolveStepId: true,
                isCorrect: true,
              }
            }
          }
        },
      }
    });
  } else {
    submissions = await ctx.db.query.stepSolveAssignmentAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        qas: {
          columns: {
            id: true,
            questionId: true,
            correct: true,
          },
          with: {
            stepAttempts: {
              columns: {
                id: true,
                stepSolveStepId: true,
                isCorrect: true,
              }
            }
          }
        },
      }
    });
  }

  // Create a map to store question and step attempts data
  const questionAnalytics = new Map<string, {
    questionText: string;
    steps: Map<string, { 
      stepText: string;
      stepNumber: number;
      correct: number; 
      total: number; 
    }>
  }>();

  // Initialize the map with questions and steps from the assignment
  assignment?.stepSolveQuestions.forEach(sq => {
    const question = sq.q;
    questionAnalytics.set(question.id, {
      questionText: question.questionText,
      steps: new Map(
        question.steps.map(step => [
          step.id,
          { stepText: step.stepText, stepNumber: step.stepNumber, correct: 0, total: 0 }
        ])
      )
    });
  });

  // Process all submissions
  for (const submission of submissions) {
    for (const questionAttempt of submission.qas) {
      const questionStats = questionAnalytics.get(questionAttempt.questionId);
      if (questionStats) {
        for (const stepAttempt of questionAttempt.stepAttempts) {
          const stepStats = questionStats.steps.get(stepAttempt.stepSolveStepId);
          if (stepStats) {
            stepStats.total++;
            if (stepAttempt.isCorrect) {
              stepStats.correct++;
            }
          }
        }
      }
    }
  }

  // Convert the map to an array of results with percentages
  const results = Array.from(questionAnalytics.entries()).map(([questionId, data]) => ({
    questionId,
    questionText: data.questionText,
    steps: Array.from(data.steps.entries()).map(([stepId, stats]) => ({
      stepId,
      stepNumber: stats.stepNumber,
      stepText: stats.stepText,
      percentageCorrect: stats.total > 0 ? (stats.correct / stats.total) : 0
    })).sort((a, b) => a.stepNumber - b.stepNumber)
  }));

  return results;
}