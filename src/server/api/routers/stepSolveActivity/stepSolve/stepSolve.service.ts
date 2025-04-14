import { asc, eq, sql } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../../trpc";
import { generateId } from "lucia";
import { ActivityType, MAX_CONCEPTS_TO_REVIEW_STEP_SOLVE, Roles } from "@/lib/constants";
import { stepSolveQuestionToAssignment, stepSolveStep } from "@/server/db/schema/stepSolve/stepSolveQuestions";
import type { CreateStepSolveAssignmentAttemptInput, GetStepSolveAssignmentAnalyticsInput, GetStepSolveAssignmentInput, GetStepSolveAssignmentQuestionAnalyticsInput, GetStepSolveAssignmentSubmissionsInput, GetStepSolveRevisionActivityInput, SubmitStepSolveAssignmentAttemptInput } from "./stepSolve.input";
import { stepSolveAssignmentAttempts,  } from "@/server/db/schema/stepSolve/stepSolveAssignment";


export const getStepSolveAssignment = async (ctx: ProtectedTRPCContext, input: GetStepSolveAssignmentInput) => {
  
  console.log("Getting step solve assignment", input.activityId);
  const activityToAssignments = await ctx.db.query.activityToAssignment.findMany({
    where: (table, { eq }) => eq(table.activityId, input.activityId),
    with: {
      stepSolveAssignment: true
    }
  });

  console.log("Activity to assignments", activityToAssignments);

  // Check if we're in development environment
  const isDev = process.env.ENVIRONMENT === "dev";
  
  if (isDev && activityToAssignments.length > 1) {
    console.log("Development environment detected. Combining questions from all assignments.");
    
    // Use the first assignment as the base
    const firstAssignment = activityToAssignments[0]?.stepSolveAssignment;
    const assignmentId = firstAssignment?.id;
    
    if (!assignmentId) {
      throw new Error("Assignment not found");
    }
    
    // Get the base assignment details
    const baseAssignment = await ctx.db.query.stepSolveAssignments.findFirst({
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
        }
      }
    });
    
    if (!baseAssignment) {
      throw new Error("Base assignment not found");
    }
    
    // Collect all questions from all assignments
    const allQuestions = [];
    
    for (const activityAssignment of activityToAssignments) {
      const assignment = activityAssignment.stepSolveAssignment;
      if (!assignment?.id) continue;
      
      const assignmentWithQuestions = await ctx.db.query.stepSolveAssignments.findFirst({
        where: (table, { eq }) => eq(table.id, assignment.id),
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
        allQuestions.push(...assignmentWithQuestions.stepSolveQuestions);
      }
    }
    
    // Return the combined assignment
    return {
      ...baseAssignment,
      stepSolveQuestions: allQuestions,
    };
  } else {
    // Get a random assignment from the activity (original behavior)
    const randomAssignment = activityToAssignments[Math.floor(Math.random() * activityToAssignments.length)];
    const assignmentId = randomAssignment?.stepSolveAssignment?.id;

    if (!assignmentId) {
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
  // Get all assignments for this activity directly from activityToAssignment
  const activityAssignments = await ctx.db.query.activityToAssignment.findMany({
    where: (table, { eq }) => eq(table.activityId, input.activityId),
    with: {
      stepSolveAssignment: {
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
      }
    }
  });

  if (!activityAssignments.length) {
    throw new Error("No assignments found for this activity");
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
  activityAssignments.forEach(assignment => {
    assignment.stepSolveAssignment?.stepSolveQuestions.forEach(sq => {
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

  const concepts = await ctx.db.query.stepSolveStepConcepts.findMany({
    with: {
      step: {
        with: {
          question: {
            with: {
              topic: true,
            }
          }
        }
      }
    }
  });

  const liveConcepts = concepts.filter(c => topicSet.has(c.step?.question?.topic?.id ?? ''));

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

    let questions = concepts.filter(c => c.conceptId === concept).map(c => c.step?.question?.id);
    // First we will create a set of unique questions
    questions = Array.from(new Set<string>(questions.filter(q => q !== undefined)));

    // choose a random question from the list
    const question = questions[Math.floor(Math.random() * questions.length)];

    if(!question) {
      console.log("This should never happen");
      continue
    };
    // get the other concepts in the question
    const allConceptsInQuestion = concepts.filter(c => c.step?.question?.id === question).map(c => c.conceptId);

    // add the question to the question list
    questionIdsList.push(question);

    // add the other concepts to the conceptsAddedToQuestions
    allConceptsInQuestion.forEach(c => c && conceptsAddedToQuestions.add(c));
  }

  console.log("CONCEPTS TO REVIEW", conceptsToReview, conceptsToReview.length);
  console.log("CONCEPTS ADDED TO QUESTIONS", conceptsAddedToQuestions, conceptsAddedToQuestions.size);
  console.log("QUESTION IDS LIST", questionIdsList, questionIdsList.length);
  console.log("--------------------------------");

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

  return {
    stepSolveQuestions,
  };
}
