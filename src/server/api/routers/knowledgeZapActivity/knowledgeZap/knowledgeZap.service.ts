import type { ProtectedTRPCContext } from "../../../trpc";
import { generateId } from "lucia";
import type { SubmitAssignmentAttemptSchema, GetSubmissionsInput, GetAnalyticsCardsInput, CreateAssignmentAttemptInput, GetKnowledgeZapActivityInput, GetKnowledgeZapAssignmentInput, GetHeatMapInput, GetKnowledgeZapRevisionActivityInput, GetAssignmentConceptsInput, GetAssignmentConceptsByIdInput } from "./knowledgeZap.input";
import { eq } from "drizzle-orm";
import { ActivityType, MAX_CONCEPTS_TO_REVIEW_KNOWLEDGE, Roles } from "@/lib/constants";
import { knowledgeZapAssignmentAttempts } from "@/server/db/schema/knowledgeZap/knowledgeZapAssignment";
import { knowledgeZapAssignments } from "@/server/db/schema/knowledgeZap/knowledgeZapAssignment";
import { KnowledgeZapQuestionType } from "@/lib/constants";
import { type KnowledgeZapQuestionObjects } from "@/app/(main)/activity/[activityId]/knowledge-zap/live/types";

export const createAssignmentAttempt = async (ctx: ProtectedTRPCContext, input: CreateAssignmentAttemptInput) => { 
  const id = generateId(21);

  if(input.activityId) {
    await ctx.db.insert(knowledgeZapAssignmentAttempts).values({
      id, 
      activityId: input.activityId,
      userId: ctx.user.id,
    })
  } else {
    await ctx.db.insert(knowledgeZapAssignmentAttempts).values({
      id, 
      userId: ctx.user.id,
      isRevision: true,
    })
  }
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
        where: (multipleChoiceQuestion, { inArray, and }) => and(
          inArray(multipleChoiceQuestion.id, questionIds),
          eq(multipleChoiceQuestion.multipleCorrect, false)
        ),
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
    assignmentId: assignment.id,
    questions,
  };
}

export const getKnowledgeZapAssignment = async (ctx: ProtectedTRPCContext, input: GetKnowledgeZapAssignmentInput) => {
  const assignment = await ctx.db.query.knowledgeZapAssignments.findFirst({
    where: (assignment, { eq }) => eq(knowledgeZapAssignments.id, input.assignmentId),
    with: {
      topic: true,
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
        where: (multipleChoiceQuestion, { inArray, and }) => and(
          inArray(multipleChoiceQuestion.id, questionIds),
          eq(multipleChoiceQuestion.multipleCorrect, false)
        ),
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
    assignmentId: assignment.id,
    name: assignment.name,
    topicId: assignment.topicId,
    topic: assignment.topic,
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

export const getKnowledgeZapRevisionActivity = async (ctx: ProtectedTRPCContext, input: GetKnowledgeZapRevisionActivityInput) => {
  
  const questionIdsList:string[] = [];

  const activities = await ctx.db.query.activity.findMany({
    where: (activity, { and, eq }) => 
      and(
        eq(activity.classroomId, input.classroomId),
        eq(activity.typeText, ActivityType.KnowledgeZap as string),
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
      eq(conceptTracker.activityType, ActivityType.KnowledgeZap),
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
  if(conceptsToReview.length < MAX_CONCEPTS_TO_REVIEW_KNOWLEDGE) {

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

    if (conceptsToReview.length < Math.floor(MAX_CONCEPTS_TO_REVIEW_KNOWLEDGE * 0.5)) {
      // Add concepts with a score above 60%
      for(const [concept, score] of sortedConcepts) {
        if(conceptsToReview.length === MAX_CONCEPTS_TO_REVIEW_KNOWLEDGE) break;

        if(score < 0.5) {
          conceptsToReview.push(concept);
        }
      }
    }

    if(conceptsToReview.length < MAX_CONCEPTS_TO_REVIEW_KNOWLEDGE * 0.6) {
      // Add concepts with a score above 70%  
      for(const [concept, score] of sortedConcepts) {
        if(conceptsToReview.length === MAX_CONCEPTS_TO_REVIEW_KNOWLEDGE) break;

        if(score < 0.6) {
          conceptsToReview.push(concept);
        }
      }
    }
  }

  const concepts = await ctx.db.query.knowledgeZapQuestionsToConcepts.findMany({
    with: {
      question: {
        with: {
          topic: true,
        }
      }
    }
  });

  const liveConcepts = concepts.filter(c => topicSet.has(c.question.topic?.id ?? ''));

  // STEP 3: Add new concepts to the question list at random to reach the concept limit
  if(conceptsToReview.length < MAX_CONCEPTS_TO_REVIEW_KNOWLEDGE) {

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
    while(conceptsToReview.length < MAX_CONCEPTS_TO_REVIEW_KNOWLEDGE) {
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

    const questions = concepts.filter(c => c.conceptId === concept).map(c => c.questionId);
    // choose a random question from the list
    const question = questions[Math.floor(Math.random() * questions.length)];

    if(!question) {
      console.log("This should never happen");
      continue
    };
    // get the other concepts in the question
    const allConceptsInQuestion = concepts.filter(c => c.questionId === question).map(c => c.conceptId);

    // add the question to the question list
    questionIdsList.push(question);

    // add the other concepts to the conceptsAddedToQuestions
    allConceptsInQuestion.forEach(c => conceptsAddedToQuestions.add(c));
  }

  console.log("CONCEPTS TO REVIEW", conceptsToReview, conceptsToReview.length);
  console.log("CONCEPTS ADDED TO QUESTIONS", conceptsAddedToQuestions, conceptsAddedToQuestions.size);
  console.log("QUESTION IDS LIST", questionIdsList, questionIdsList.length);
  console.log("--------------------------------");

  const knowledgeZapQuestions = await ctx.db.query.knowledgeZapQuestions.findMany({
    where: (question, { and, inArray }) => 
      and(
        inArray(question.id, questionIdsList),
        inArray(question.topicId, Array.from(topicSet)), 
      ),
  });

  console.log("KNOWLEDGE ZAP QUESTIONS", knowledgeZapQuestions.length);
  const questions: KnowledgeZapQuestionObjects[] = [];
  console.log("KNOWLEDGE ZAP QUESTIONS", knowledgeZapQuestions.length);

  await Promise.all(knowledgeZapQuestions.map(async (question) => {
    const questionIds = question.questionId;

    if (!questionIds) return;

    let questionObject: KnowledgeZapQuestionObjects | null = null;

    if (question.type === KnowledgeZapQuestionType.MULTIPLE_CHOICE) {
      const multipleChoiceQuestions = await ctx.db.query.multipleChoiceQuestions.findMany({
        where: (multipleChoiceQuestion, { inArray, and }) => and(
          inArray(multipleChoiceQuestion.id, questionIds),
          eq(multipleChoiceQuestion.multipleCorrect, false)
        ),
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

  return {
    questions,
  };
}

export const getAssignmentConcepts = async (ctx: ProtectedTRPCContext, input: GetAssignmentConceptsInput) => {
  
  const activity = await ctx.db.query.activity.findFirst({
    where: (activity, { eq }) => eq(activity.id, input.activityId),
  });

  const assignmentId = activity?.assignmentId;

  if(!assignmentId || activity?.typeText !== ActivityType.KnowledgeZap as string) {
    throw new Error("Assignment not found");  
  }

  // Step 1: Get the assignment with questionToAssignment
  const assignment = await ctx.db.query.knowledgeZapAssignments.findFirst({
    where: (assignment, { eq }) => eq(knowledgeZapAssignments.id, assignmentId),
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

  // Step 2: Get all question IDs from the assignment
  const questionIds = assignment.questionToAssignment.map(qta => qta.questionId);

  // Step 3: Get questions with their concepts relationship
  const questions = await ctx.db.query.knowledgeZapQuestions.findMany({
    where: (question, { inArray }) => inArray(question.id, questionIds),
    with: {
      questionsToConcepts: {
        columns: {
          id: true,
          conceptId: true,
        }
      }
    }
  });

  // Step 4: Get all concept IDs
  const conceptIds = questions
    .flatMap(q => q.questionsToConcepts)
    .map(qtc => qtc.conceptId)
    .filter((id): id is string => id !== null);

  const uniqueConceptIds = [...new Set(conceptIds)];

  // Step 5: Get the actual concept data
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

export const getAssignmentConceptsById = async (ctx: ProtectedTRPCContext, input: GetAssignmentConceptsByIdInput) => {
  
  // Step 1: Get the assignment with questionToAssignment
  const assignment = await ctx.db.query.knowledgeZapAssignments.findFirst({
    where: (assignment, { eq }) => eq(knowledgeZapAssignments.id, input.assignmentId),
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

  // Step 2: Get all question IDs from the assignment
  const questionIds = assignment.questionToAssignment.map(qta => qta.questionId);

  // Step 3: Get questions with their concepts relationship
  const questions = await ctx.db.query.knowledgeZapQuestions.findMany({
    where: (question, { inArray }) => inArray(question.id, questionIds),
    with: {
      questionsToConcepts: {
        columns: {
          id: true,
          conceptId: true,
        }
      }
    }
  });

  // Step 4: Get all concept IDs
  const conceptIds = questions
    .flatMap(q => q.questionsToConcepts)
    .map(qtc => qtc.conceptId)
    .filter((id): id is string => id !== null);

  const uniqueConceptIds = [...new Set(conceptIds)];

  // Step 5: Get the actual concept data
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
