import { asc, eq, sql } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../../trpc";
import { generateId } from "lucia";
import { ActivityType, MAX_CONCEPTS_TO_REVIEW_STEP_SOLVE, Roles } from "@/lib/constants";
import { stepSolveQuestionToAssignment, stepSolveStep } from "@/server/db/schema/stepSolve/stepSolveQuestions";
import type { CreateStepSolveAssignmentAttemptInput, GetStepSolveAssignmentAnalyticsInput, GetStepSolveAssignmentInput, GetStepSolveAssignmentQuestionAnalyticsInput, GetStepSolveAssignmentSubmissionsInput, GetStepSolveRevisionActivityInput, SubmitStepSolveAssignmentAttemptInput, GetStepSolveAssignmentConceptsInput } from "./stepSolve.input";
import { stepSolveAssignmentAttempts } from "@/server/db/schema/stepSolve/stepSolveAssignment";

// Utility function to shuffle an array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp!;
  }
  return shuffled;
}

export const getStepSolveAssignment = async (ctx: ProtectedTRPCContext, input: GetStepSolveAssignmentInput) => {
  
  console.log("Getting step solve assignment", input.activityId);
  
  // Get the activity to find the template ID
  const activity = await ctx.db.query.activity.findFirst({
    where: (table, { eq }) => eq(table.id, input.activityId),
    columns: {
      id: true,
      assignmentId: true, // This now contains the template ID
    }
  });

  if (!activity?.assignmentId) {
    throw new Error("Activity or template not found");
  }

  // Get the step solve template
  const template = await ctx.db.query.stepSolveAssignmentTemplates.findFirst({
    where: (table, { eq }) => eq(table.id, activity.assignmentId!),
    columns: {
      id: true,
      assignmentIds: true,
    }
  });

  if (!template?.assignmentIds?.length) {
    throw new Error("Template or assignments not found");
  }

  console.log("Template assignments", template.assignmentIds);

  // Check if we're in development environment
  const isDev = process.env.ENVIRONMENT === "dev";
  
  if (isDev && template.assignmentIds.length > 1) {
    console.log("Development environment detected. Combining questions from all assignments.");
    
    // Get the first assignment for base details
    const firstAssignmentId = template.assignmentIds[0];
    
    if (!firstAssignmentId) {
      throw new Error("Assignment not found");
    }
    
    // Get the base assignment details
    const baseAssignment = await ctx.db.query.stepSolveAssignments.findFirst({
      where: (table, { eq }) => eq(table.id, firstAssignmentId),
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
        }
      }
    });
    
    if (!baseAssignment) {
      throw new Error("Base assignment not found");
    }
    
    // Collect all questions from all assignments in the template
    const allQuestions = [];
    
    for (const assignmentId of template.assignmentIds) {
      const assignmentWithQuestions = await ctx.db.query.stepSolveAssignments.findFirst({
        where: (table, { eq }) => eq(table.id, assignmentId),
        with: {
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
      
      if (assignmentWithQuestions?.stepSolveQuestions) {
        // Shuffle the options for each step
        const questionsWithShuffledOptions = assignmentWithQuestions.stepSolveQuestions.map(question => ({
          ...question,
          q: {
            ...question.q,
            steps: question.q.steps.map(step => ({
              ...step,
              opt: shuffleArray(step.opt)
            }))
          }
        }));
        allQuestions.push(...questionsWithShuffledOptions);
      }
    }
    
    // Return the combined assignment
    return {
      ...baseAssignment,
      stepSolveQuestions: allQuestions,
    } as typeof baseAssignment & { stepSolveQuestions: typeof allQuestions };
  } else {
    // Get a random assignment from the template (original behavior)
    const randomAssignmentId = template.assignmentIds[Math.floor(Math.random() * template.assignmentIds.length)];

    if (!randomAssignmentId) {
      throw new Error("Assignment not found");
    }

    const assignment = await ctx.db.query.stepSolveAssignments.findFirst({
      where: (table, { eq }) => eq(table.id, randomAssignmentId),
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

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    // Shuffle the options for each step
    const assignmentWithShuffledOptions = {
      ...assignment,
      stepSolveQuestions: assignment.stepSolveQuestions.map(question => ({
        ...question,
        q: {
          ...question.q,
          steps: question.q.steps.map(step => ({
            ...step,
            opt: shuffleArray(step.opt)
          }))
        }
      }))
    } as typeof assignment;

    return assignmentWithShuffledOptions;
  }
}

export const createStepSolveAssignmentAttempt = async (ctx: ProtectedTRPCContext, input: CreateStepSolveAssignmentAttemptInput) => {
  const id = generateId(21);
  if(input.activityId) {
    await ctx.db.insert(stepSolveAssignmentAttempts).values({
      id: id,
      assignmentId: input.assignmentId ?? "",
      activityId: input.activityId ?? "",
      userId: ctx.user.id,
    })
  } else {
    await ctx.db.insert(stepSolveAssignmentAttempts).values({
      id: id,
      userId: ctx.user.id,
      isRevision: true,
    });
  }
  return id;
}

export const submitStepSolveAssignmentAttempt = async (ctx: ProtectedTRPCContext, input: SubmitStepSolveAssignmentAttemptInput) => {

  const assignment = await ctx.db.query.stepSolveAssignments.findFirst({
    where: (table, { eq }) => eq(table.id, input.assignmentId),
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
  let totalStepsCompleted = 0;
  let totalSteps = 0;
  const completion = [];
  
  for (const questionAttempt of attempt.qas) {

    const questionScore = (questionAttempt.score ?? 0) * (questionAttempt.stepsCompleted ?? 0);
    const questionScoreNormalised = questionScore / questionAttempt.question.steps.length;
    totalScore += questionScoreNormalised;
    totalStepsCompleted += questionAttempt.stepsCompleted ?? 0;
    totalSteps += questionAttempt.question.steps.length;
    completion.push(totalStepsCompleted / totalSteps);
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
      completionRate: sql`${completion.reduce((acc, curr) => acc + curr, 0) / assignment.stepSolveQuestions.length}`,
      stepsCompleted: totalStepsCompleted,
      stepsTotal: totalSteps,
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
    ? submissions.reduce((a, b) => a + (b.completionRate ?? 0), 0) / submissions.length 
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
  // Get the activity to find the template ID
  const activity = await ctx.db.query.activity.findFirst({
    where: (table, { eq }) => eq(table.id, input.activityId),
    columns: {
      id: true,
      assignmentId: true, // This now contains the template ID
    }
  });

  if (!activity?.assignmentId) {
    throw new Error("Activity or template not found");
  }

  // Get the step solve template
  const template = await ctx.db.query.stepSolveAssignmentTemplates.findFirst({
    where: (table, { eq }) => eq(table.id, activity.assignmentId!),
    columns: {
      id: true,
      assignmentIds: true,
    }
  });

  if (!template?.assignmentIds?.length) {
    throw new Error("Template or assignments not found");
  }

  // Get all assignments from the template
  const assignments = await ctx.db.query.stepSolveAssignments.findMany({
    where: (table, { inArray }) => inArray(table.id, template.assignmentIds),
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

  if (!assignments.length) {
    throw new Error("No assignments found for this template");
  }

  // Get all submissions for this activity
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

  // Initialize the map with questions and steps from all assignments
  assignments.forEach(assignment => {
    assignment.stepSolveQuestions.forEach(sq => {
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

export const getStepSolveRevisionActivity = async (ctx: ProtectedTRPCContext, input: GetStepSolveRevisionActivityInput) => {
  
  const questionIdsList:string[] = [];

  const activities = await ctx.db.query.activity.findMany({
    where: (activity, { and, eq }) => 
      and(
        eq(activity.classroomId, input.classroomId),
        eq(activity.typeText, ActivityType.StepSolve as string),
        eq(activity.isLive, true),
      ),
    columns: {
      topicId: true,
    }
  });

  const topicSet = new Set(activities.map(a => a.topicId ?? ''));

  const conceptTracker = await ctx.db.query.conceptTracking.findMany({
    where: (conceptTracker, { and, eq }) => and(
      eq(conceptTracker.userId, ctx.user.id),
      eq(conceptTracker.activityType, ActivityType.StepSolve),
    ),
  });

  const conceptsToReview: string[] = [];
  const conceptsAddedToQuestions = new Set<string>();

  // STEP 1: Get the concept ids where the users last attempt was incorrect
  const processedConcepts = new Set<string>();
  for(const concept of conceptTracker) {
    if(!concept.conceptId) continue;

    if(concept.isCorrect) {
      processedConcepts.add(concept.conceptId);
    } else {
      if (!processedConcepts.has(concept.conceptId)) {
        conceptsToReview.push(concept.conceptId);
      }
    }
  }
  
  // STEP 2: Add concepts with previous mistakes to the question list only if the revision has less than concept limit
  if(conceptsToReview.length < MAX_CONCEPTS_TO_REVIEW_STEP_SOLVE) {

    const conceptScoreMap = new Map<string, number>();

    const processedConcepts = new Set<string>();

    for(const concept of conceptTracker) {

      if(!concept.conceptId) continue;

      // If the concept has already been added to the question list, skip it
      if(conceptsToReview.includes(concept.conceptId)) continue;
      if(processedConcepts.has(concept.conceptId)) continue;

      processedConcepts.add(concept.conceptId);

      // Get all the concept tracker entries for the concept
      const conceptTrackerForConcept = conceptTracker.filter(c => c.conceptId === concept.conceptId);

      // Get the scores for the concept
      const yesterdayConcepts = conceptTrackerForConcept.filter(c => c.createdAt > new Date(new Date().setDate(new Date().getDate() - 1)));
      const yesterdayScore = yesterdayConcepts.reduce((a, b) => a + (b.isCorrect ? 1 : 0), 0) / yesterdayConcepts.length;
      const weekConcepts = conceptTrackerForConcept.filter(c => c.createdAt > new Date(new Date().setDate(new Date().getDate() - 7)));
      const weekScore = weekConcepts.reduce((a, b) => a + (b.isCorrect ? 1 : 0), 0) / weekConcepts.length;
      const monthConcepts = conceptTrackerForConcept.filter(c => c.createdAt > new Date(new Date().setDate(new Date().getDate() - 30)));
      const monthScore = monthConcepts.reduce((a, b) => a + (b.isCorrect ? 1 : 0), 0) / monthConcepts.length;
      const overallScore = conceptTrackerForConcept.reduce((a, b) => a + (b.isCorrect ? 1 : 0), 0) / conceptTrackerForConcept.length;

      const scores = [yesterdayScore, weekScore, monthScore, overallScore];
      const eligibleScores = scores.filter(s => !Number.isNaN(s));

      if(eligibleScores.length === 0) {
        console.log("No scores how did this happen", concept);
      };

      // Create a weighted average of the scores
      const averageScore = eligibleScores.reduce((a, b) => a + b, 0) / eligibleScores.length; 
      conceptScoreMap.set(concept.conceptId, averageScore);
    }

    // Sort the concepts by score
    const sortedConcepts = Array.from(conceptScoreMap.entries()).sort((a, b) => b[1] - a[1]);

    // Iterate through the concepts and add them to the conceptsAddedToQuestions depending on how many concepts are left to review
    // We will add concepts with a score below 50% first

    for(const [concept, score] of sortedConcepts) {
      if(conceptsToReview.length === 0) break;

      if(score < 0.4) {
        conceptsToReview.push(concept);
      }
    }

    if (conceptsToReview.length < Math.floor(MAX_CONCEPTS_TO_REVIEW_STEP_SOLVE * 0.5)) {
      // Add concepts with a score above 60%
      for(const [concept, score] of sortedConcepts) {
        if(conceptsToReview.length === MAX_CONCEPTS_TO_REVIEW_STEP_SOLVE) break;

        if(score < 0.5) {
          conceptsToReview.push(concept);
        }
      }
    }

    if(conceptsToReview.length < MAX_CONCEPTS_TO_REVIEW_STEP_SOLVE * 0.6) {
      // Add concepts with a score above 70%  
      for(const [concept, score] of sortedConcepts) {
        if(conceptsToReview.length === MAX_CONCEPTS_TO_REVIEW_STEP_SOLVE) break;

        if(score < 0.6) {
          conceptsToReview.push(concept);
        }
      }
    }
  }

  // Step 1: Get step concepts with limited nesting
  const stepConcepts = await ctx.db.query.stepSolveStepConcepts.findMany({
    columns: {
      id: true,
      stepId: true,
      conceptId: true,
    }
  });

  // Step 2: Get all step IDs and query steps with questions
  const stepIds = stepConcepts.map(sc => sc.stepId).filter((id): id is string => id !== null);
  const uniqueStepIds = [...new Set(stepIds)];

  if (uniqueStepIds.length === 0) {
    return {
      stepSolveQuestions: [],
    };
  }

  const steps = await ctx.db.query.stepSolveStep.findMany({
    where: (step, { inArray }) => inArray(step.id, uniqueStepIds),
    columns: {
      id: true,
      questionId: true,
    }
  });

  // Step 3: Get all question IDs and query questions with topics
  const questionIds = steps.map(s => s.questionId).filter((id): id is string => id !== null);
  const uniqueQuestionIds = [...new Set(questionIds)];

  if (uniqueQuestionIds.length === 0) {
    return {
      stepSolveQuestions: [],
    };
  }

  const questions = await ctx.db.query.stepSolveQuestions.findMany({
    where: (question, { inArray }) => inArray(question.id, uniqueQuestionIds),
    columns: {
      id: true,
      topicId: true,
    }
  });

  // Step 4: Create mappings for efficient filtering
  const stepToQuestionMap = new Map<string, string>();
  steps.forEach(s => {
    if (s.questionId) {
      stepToQuestionMap.set(s.id, s.questionId);
    }
  });

  const questionToTopicMap = new Map<string, string>();
  questions.forEach(q => {
    if (q.topicId) {
      questionToTopicMap.set(q.id, q.topicId);
    }
  });

  // Step 5: Build the concepts array with topic filtering
  const concepts = stepConcepts.map(sc => {
    const questionId = stepToQuestionMap.get(sc.stepId ?? '');
    const topicId = questionId ? questionToTopicMap.get(questionId) : undefined;
    
    return {
      id: sc.id,
      stepId: sc.stepId,
      conceptId: sc.conceptId,
      step: {
        id: sc.stepId,
        questionId: questionId,
        question: questionId ? {
          id: questionId,
          topicId: topicId,
          topic: {
            id: topicId,
          }
        } : undefined
      }
    };
  });

  const liveConcepts = concepts.filter(c => {
    const topicId = c.step?.question?.topic?.id;
    return topicId && topicSet.has(topicId);
  });

  // STEP 3: Add new concepts to the question list at random to reach the concept limit
  if(conceptsToReview.length < MAX_CONCEPTS_TO_REVIEW_STEP_SOLVE) {

    const conceptsToAddFromConceptTracker = liveConcepts.filter(c => c.conceptId && !conceptsToReview.includes(c.conceptId));
    // Get unique concept IDs from the filtered concept tracker
    const uniqueConceptIds = [...new Set<string>(
      conceptsToAddFromConceptTracker
        .map(c => c.conceptId)
        .filter(c => c !== null && c !== undefined)
      )
    ];
    
    // Shuffle the concept IDs to randomize selection
    const shuffledConcepts = [...uniqueConceptIds].sort(() => Math.random() - 0.5);
    
    let count = 0;
    // Add concepts up to the limit
    while(conceptsToReview.length < MAX_CONCEPTS_TO_REVIEW_STEP_SOLVE) {
      count++;
      if(count > 100) {
        console.log("This should never happen");
        break;
      }

      const concept = shuffledConcepts.shift();
      if (concept !== undefined && concept !== null) {
        conceptsToReview.push(concept);
      }
      if(!concept) break;
    }
  }

  // Add question Ids to the list based on the concepts
  for(const concept of conceptsToReview) {
    if(conceptsAddedToQuestions.has(concept)) continue;

    const questionsForConcept = concepts
      .filter(c => c.conceptId === concept)
      .map(c => c.step?.question?.id)
      .filter((id): id is string => id !== undefined);
    
    // First we will create a set of unique questions
    const uniqueQuestions = Array.from(new Set(questionsForConcept));

    // choose a random question from the list
    const question = uniqueQuestions[Math.floor(Math.random() * uniqueQuestions.length)];

    if(!question) {
      console.log("This should never happen");
      continue
    };
    
    // get the other concepts in the question
    const allConceptsInQuestion = concepts
      .filter(c => c.step?.question?.id === question)
      .map(c => c.conceptId)
      .filter((id): id is string => id !== null && id !== undefined);

    // add the question to the question list
    questionIdsList.push(question);

    // add the other concepts to the conceptsAddedToQuestions
    allConceptsInQuestion.forEach(conceptId => conceptsAddedToQuestions.add(conceptId));
  }


  const stepSolveQuestions = await ctx.db.query.stepSolveQuestions.findMany({
    where: (question, { and, inArray }) => 
      and(
        inArray(question.id, questionIdsList),
        inArray(question.topicId, Array.from(topicSet)), 
      ),
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
  });

  // Shuffle the options for each step
  const questionsWithShuffledOptions = stepSolveQuestions.map(question => ({
    ...question,
    steps: question.steps.map(step => ({
      ...step,
      opt: shuffleArray(step.opt)
    }))
  }));

  return {
    stepSolveQuestions: questionsWithShuffledOptions,
  };
}

export const getStepSolveAssignmentConcepts = async (ctx: ProtectedTRPCContext, input: GetStepSolveAssignmentConceptsInput) => {
  
  console.log("Getting step solve assignment concepts", input.activityId);
  
  // Step 1: Get the activity to find the template ID
  const activity = await ctx.db.query.activity.findFirst({
    where: (table, { eq }) => eq(table.id, input.activityId),
    columns: {
      id: true,
      assignmentId: true, // This now contains the template ID
    }
  });

  if (!activity?.assignmentId) {
    throw new Error("Activity or template not found");
  }

  // Step 2: Get the step solve template
  const template = await ctx.db.query.stepSolveAssignmentTemplates.findFirst({
    where: (table, { eq }) => eq(table.id, activity.assignmentId!),
    columns: {
      id: true,
      assignmentIds: true,
    }
  });

  if (!template?.assignmentIds?.length) {
    throw new Error("Template or assignments not found");
  }

  // Step 3: Get all assignments from the template
  const assignments = await ctx.db.query.stepSolveAssignments.findMany({
    where: (table, { inArray }) => inArray(table.id, template.assignmentIds),
    with: {
      stepSolveQuestions: {
        columns: {
          id: true,
          questionId: true,
        }
      }
    }
  });

  if (!assignments.length) {
    throw new Error("Assignments not found");
  }

  // Step 4: Get all question IDs from all assignments
  const questionIds = assignments.flatMap(assignment => 
    assignment.stepSolveQuestions.map(q => q.questionId)
  );

  const uniqueQuestionIds = [...new Set(questionIds)];

  // Step 3: Get questions with their steps
  const questions = await ctx.db.query.stepSolveQuestions.findMany({
    where: (question, { inArray }) => inArray(question.id, uniqueQuestionIds),
    with: {
      steps: {
        columns: {
          id: true,
        }
      }
    }
  });

  // Step 4: Get all step IDs
  const stepIds = questions.flatMap(q => q.steps.map(s => s.id));

  // Step 5: Get step concepts
  const stepConcepts = await ctx.db.query.stepSolveStepConcepts.findMany({
    where: (stepConcept, { inArray }) => inArray(stepConcept.stepId, stepIds),
    columns: {
      id: true,
      conceptId: true,
    }
  });

  // Step 6: Get all concept IDs
  const conceptIds = stepConcepts
    .map(sc => sc.conceptId)
    .filter((id): id is string => id !== null);

  const uniqueConceptIds = [...new Set(conceptIds)];

  // Step 7: Get the actual concept data
  const concepts = await ctx.db.query.concepts.findMany({
    where: (concept, { inArray }) => inArray(concept.id, uniqueConceptIds),
    columns: {
      id: true,
      text: true,
      answerText: true,
    }
  });

  return concepts;
};
