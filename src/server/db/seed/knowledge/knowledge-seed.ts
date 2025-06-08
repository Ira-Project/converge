/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "../..";
import { and, eq, not, isNull } from "drizzle-orm";
import { generateId } from "lucia";

import { 
  knowledgeZapAssignmentAttempts, 
  knowledgeZapAssignments, 
  knowledgeZapAssignmentToCourse, 
  knowledgeZapAssignmentToGrade, 
  knowledgeZapAssignmentToSubject 
} from "../../schema/knowledgeZap/knowledgeZapAssignment";
import { multipleChoiceAnswerOptions, multipleChoiceAttempt, multipleChoiceQuestions } from "../../schema/knowledgeZap/multipleChoiceQuestions";
import { ActivityType, KnowledgeZapQuestionType, Roles } from "@/lib/constants";
import { knowledgeZapQuestionAttempts, knowledgeZapQuestions, knowledgeZapQuestionsToConcepts, knowledgeZapQuestionToAssignment } from "../../schema/knowledgeZap/knowledgeZapQuestions";
import { matchingAnswerOptions, matchingAttempt, matchingAttemptSelection, matchingQuestions } from "../../schema/knowledgeZap/matchingQuestions";
import { orderingAnswerOptions, orderingAttempt, orderingAttemptSelection, orderingQuestions } from "../../schema/knowledgeZap/orderingQuestions";

import { activity, activityToAssignment } from "../../schema/activity";
import { classrooms } from "../../schema/classroom";

import { topics } from "../../schema/subject";
import { concepts, conceptTracking } from "../../schema/concept";
import { users } from "../../schema/user";

import { 
  mapKnowledgeZapAssignmentToCourse,
  mapKnowledgeZapAssignmentToGrade,
  mapKnowledgeZapAssignmentToSubject
} from "../assignmentMapping-seed";

export async function createKnowledgeZapAssignment(
  topicName: string,
  options?: {
    courseIds?: string[];
    subjectIds?: string[];
    grades?: string[];
  }
) {
  const { courseIds, subjectIds, grades } = options ?? {};

  const { default: json } = await import( `./${topicName}.json`, { assert: { type: "json" } });

  const topic = await db.select().from(topics).where(eq(topics.name, json.name as string))

  if(!topic[0]?.id) {
    console.log("Topic not found", json.name)
    return
  }
  
  const topicId = topic[0].id
  // Check if assignment already exists
  const existingAssignment = await db.select().from(knowledgeZapAssignments).where(eq(knowledgeZapAssignments.topicId, topicId));

  let knowledgeZapAssignment;

  if (existingAssignment.length > 0) {
    console.log("Knowledge Zap assignment already exists");
    knowledgeZapAssignment = existingAssignment[0];
  } else {
    console.log("Creating knowledge zap assignment", json.name);
    const kza = await db.insert(knowledgeZapAssignments).values({
      id: generateId(21),
      name: json.name,
      description: "Knowledge Zap",
      topicId: topicId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning({
      id: knowledgeZapAssignments.id,
    });
    knowledgeZapAssignment = kza[0];
  }

  if(!knowledgeZapAssignment?.id) {
    throw new Error("Failed to create knowledge zap assignment");
  }

  const questionsIds = []

  for (const questions of json.multipleChoiceQuestions) {
    // Check if question already exists
    const existingQuestions = await db.select().from(knowledgeZapQuestions).where(eq(knowledgeZapQuestions.id, questions.id as string));
    
    if (existingQuestions.length > 0) {
      console.log(`Multiple choice question already exists`, questions.id);
      continue;
    }

    console.log(`Creating multiple choice question`, questions.id);
    await db.insert(knowledgeZapQuestions).values({
      id: questions.id.substring(0, 21),
      question: "Knowledge Zap Question",
      type: KnowledgeZapQuestionType.MULTIPLE_CHOICE, 
      topicId: topicId,
      questionId: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      deletedAt: null,
    })

    console.log(`Creating concepts for question`, questions.id);
    for (const concept of questions.concepts) {
      console.log(`Creating concept`, concept);
      await db.insert(knowledgeZapQuestionsToConcepts).values({
        id: generateId(21),
        questionId: questions.id.substring(0, 21),
        conceptId: concept,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    const multipleChoiceQuestionIds = []

    for (const question of questions.variants) {
      const existingMCQuestion = await db.select().from(multipleChoiceQuestions).where(eq(multipleChoiceQuestions.id, question.id as string));

      if (existingMCQuestion.length > 0) {
        console.log(`Multiple choice sub-question "${question.question}" already exists`);
        continue;
      }

      console.log(`Creating multiple choice variant "${(question.question as string).substring(0, 30)}"`);
      await db.insert(multipleChoiceQuestions).values({
        id: question.id.substring(0, 21),
        question: question.question,
        questionId: questions.id.substring(0, 21),
        multipleCorrect: !question.single_correct,
        imageUrl: question?.image ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        deletedAt: null,
      })
      multipleChoiceQuestionIds.push(question.id.substring(0, 21));
      for (const option of question.options) {
        console.log(`Creating multiple choice option "${(option.option_text as string).substring(0, 30)}"`);
        await db.insert(multipleChoiceAnswerOptions).values({
          id: generateId(21).substring(0, 21),
          questionId: question.id.substring(0, 21),
          imageUrl: option?.image ?? null,
          option: option.option_text ?? "",
          isCorrect: option.is_correct,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        })
      }
    }

    console.log(`Updating knowledge zap question with mcq ${questions.id} - ${multipleChoiceQuestionIds.length}`);
    await db.update(knowledgeZapQuestions).set({
      questionId: multipleChoiceQuestionIds,
    }).where(eq(knowledgeZapQuestions.id, (questions.id as string).substring(0, 21)));

    questionsIds.push(questions.id.substring(0, 21));

  }

  for(const questions of json.matchingQuestions) {
    const existingQuestion = await db.select().from(knowledgeZapQuestions).where(eq(knowledgeZapQuestions.id, questions.id as string));

    if (existingQuestion.length > 0) {
      console.log(`Matching question ${questions.id} already exists`);
      continue;
    }
    
    console.log(`Creating matching question ${questions.id}`);
    await db.insert(knowledgeZapQuestions).values({
      id: questions.id.substring(0, 21),
      question: "Knowledge Zap Question",
      type: KnowledgeZapQuestionType.MATCHING, 
      topicId: topicId,
      questionId: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      deletedAt: null,
    })

    console.log(`Creating concepts for question`, questions.id);
    for (const concept of questions.concepts) {
      console.log(`Creating concept`, concept);
      await db.insert(knowledgeZapQuestionsToConcepts).values({
        id: generateId(21),
        questionId: questions.id.substring(0, 21),
        conceptId: concept,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    const matchingQuestionIds = []
    for (const question of questions.variants) {
      console.log(`Creating matching variant "${(question.question as string).substring(0, 30)}"`);
      await db.insert(matchingQuestions).values({
        id: question.id.substring(0, 21),
        imageUrl: question?.image ?? null,
        question: question.question,
        questionId: questions.id.substring(0, 21),
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        deletedAt: null,
      })
      matchingQuestionIds.push(question.id.substring(0, 21));
      
      console.log(`Creating matching options for ${(question.question as string).substring(0, 30)}`);
      await Promise.all(question.options.map((option: unknown) => 
        db.insert(matchingAnswerOptions).values({
          id: generateId(21),
          questionId: question.id.substring(0, 21),
          optionA: (option as { optionA: string }).optionA,
          optionB: (option as { optionB: string }).optionB,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        })
      ));
    }
    
    console.log(`Updating knowledge zap question with matching question id ${questions.id}`);
    await db.update(knowledgeZapQuestions).set({
      questionId: matchingQuestionIds,
    }).where(eq(knowledgeZapQuestions.id, (questions.id as string).substring(0, 21)));

    questionsIds.push(questions.id.substring(0, 21));

  }

  for(const questions of json.orderingQuestions) {

    const existingQuestion = await db.select().from(knowledgeZapQuestions).where(eq(knowledgeZapQuestions.id, questions.id as string));

    if (existingQuestion.length > 0) {
      console.log(`Ordering question ${questions.id} already exists`);
      continue;
    }

    console.log(`Creating ordering question ${questions.id}`);
    await db.insert(knowledgeZapQuestions).values({
      id: questions.id,
      question: "Knowledge Zap Question",
      type: KnowledgeZapQuestionType.ORDERING, 
      topicId: topicId,
      questionId: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      deletedAt: null,
    })

    console.log(`Creating concepts for question`, questions.id);
    for (const concept of questions.concepts) {
      console.log(`Creating concept`, concept);
      await db.insert(knowledgeZapQuestionsToConcepts).values({
        id: generateId(21),
        questionId: questions.id.substring(0, 21),
        conceptId: concept,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    const orderingQuestionIds = []
    for (const question of questions.variants) {
      console.log(`Creating ordering variant "${question.question.substring(0, 30)}"`);
      await db.insert(orderingQuestions).values({
        id: question.id.substring(0, 21),
        question: question.question,
        questionId: questions.id.substring(0, 21),
        isDescending: question.isDescending ?? false,
        topLabel: question.topLabel ?? "Smallest",
        bottomLabel: question.bottomLabel ?? "Biggest",
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        deletedAt: null,
      })

      console.log(`Creating ordering options for ${question.question.substring(0, 30)}`);
      await Promise.all(question.options.map((option: unknown) => 
        db.insert(orderingAnswerOptions).values({
          id: generateId(21),
          questionId: question.id.substring(0, 21),
          order: (option as { order: number }).order,
          option: (option as { text: string }).text,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false, 
          deletedAt: null,
        })
      ));

      orderingQuestionIds.push(question.id.substring(0, 21));
    }

    console.log(`Updating knowledge zap question with ordering question id ${questions.id}`);
    await db.update(knowledgeZapQuestions).set({
      questionId: orderingQuestionIds,
    }).where(eq(knowledgeZapQuestions.id, (questions.id as string).substring(0, 21)));

    questionsIds.push(questions.id.substring(0, 21));

  }

  for (const questionId of questionsIds) {
    console.log(`Creating knowledge zap question to assignment ${questionId}`);
    await db.insert(knowledgeZapQuestionToAssignment).values({
      id: generateId(21),
      questionId: questionId.substring(0, 21),
      assignmentId: knowledgeZapAssignment.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      deletedAt: null,
    })
  }

  console.log("Knowledge Zap creation complete");
  console.log("--------------------------------");

  // Create mappings to courses
  if (courseIds && courseIds.length > 0) {
    console.log("Creating course mappings...");
    for (const courseId of courseIds) {
      await mapKnowledgeZapAssignmentToCourse(knowledgeZapAssignment.id, courseId);
    }
  }

  // Create mappings to subjects
  if (subjectIds && subjectIds.length > 0) {
    console.log("Creating subject mappings...");
    for (const subjectId of subjectIds) {
      await mapKnowledgeZapAssignmentToSubject(knowledgeZapAssignment.id, subjectId);
    }
  }

  // Create mappings to grades
  if (grades && grades.length > 0) {
    console.log("Creating grade mappings...");
    for (const grade of grades) {
      await mapKnowledgeZapAssignmentToGrade(knowledgeZapAssignment.id, grade);
    }
  }
}

export async function updateKnowledgeZapAssignment(
  topicName: string,
  options?: {
    courseIds?: string[];
    subjectIds?: string[];
    grades?: string[];
  }
) {
  const { courseIds, subjectIds, grades } = options ?? {};

  const { default: json } = await import( `./${topicName}.json`, { assert: { type: "json" } });
  const topic = await db.select().from(topics).where(eq(topics.name, json.name as string))

  if(!topic[0]?.id) {
    console.log("Topic not found", json.name)
    return
  }
  
  const topicId = topic[0].id
  // Check if assignment already exists
  const existingAssignment = await db.select().from(knowledgeZapAssignments).where(eq(knowledgeZapAssignments.topicId, topicId));


  if (existingAssignment.length > 0) {
    console.log("Knowledge Zap assignment already exists");
  } 


  const kza = await db.insert(knowledgeZapAssignments).values({
    id: generateId(21),
    name: json.name,
    description: "Knowledge Zap",
    topicId: topicId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning({
    id: knowledgeZapAssignments.id,
  });

  const knowledgeZapAssignment = kza[0];

  if(!knowledgeZapAssignment?.id) {
    throw new Error("Failed to create knowledge zap assignment");
  }

  const questionsIds = []

  for (const questions of json.multipleChoiceQuestions) {
    // Check if question already exists
    const existingQuestions = await db.select().from(knowledgeZapQuestions).where(eq(knowledgeZapQuestions.id, questions.id as string));
    
    if (existingQuestions.length > 0) {
      console.log(`Multiple choice question already exists`, questions.id);
      continue;
    }

    console.log(`Creating multiple choice question`, questions.id);
    await db.insert(knowledgeZapQuestions).values({
      id: questions.id.substring(0, 21),
      question: "Knowledge Zap Question",
      type: KnowledgeZapQuestionType.MULTIPLE_CHOICE, 
      topicId: topicId,
      questionId: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      deletedAt: null,
    })

    console.log(`Creating concepts for question`, questions.id);
    for (const concept of questions.concepts) {
      console.log(`Creating concept`, concept);
      await db.insert(knowledgeZapQuestionsToConcepts).values({
        id: generateId(21),
        questionId: questions.id.substring(0, 21),
        conceptId: concept,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    const multipleChoiceQuestionIds = []

    for (const question of questions.variants) {
      const existingMCQuestion = await db.select().from(multipleChoiceQuestions).where(eq(multipleChoiceQuestions.id, question.id as string));

      if (existingMCQuestion.length > 0) {
        console.log(`Multiple choice sub-question "${question.question}" already exists`);
        continue;
      }

      console.log(`Creating multiple choice variant "${(question.question as string).substring(0, 30)}"`);
      await db.insert(multipleChoiceQuestions).values({
        id: question.id.substring(0, 21),
        question: question.question,
        questionId: questions.id.substring(0, 21),
        multipleCorrect: !question.single_correct,
        imageUrl: question?.image ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        deletedAt: null,
      })
      multipleChoiceQuestionIds.push(question.id.substring(0, 21));
      for (const option of question.options) {
        console.log(`Creating multiple choice option "${(option.option_text as string).substring(0, 30)}"`);
        await db.insert(multipleChoiceAnswerOptions).values({
          id: generateId(21).substring(0, 21),
          questionId: question.id.substring(0, 21),
          imageUrl: option?.image ?? null,
          option: option.option_text ?? "",
          isCorrect: option.is_correct,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        })
      }
    }

    console.log(`Updating knowledge zap question with mcq ${questions.id} - ${multipleChoiceQuestionIds.length}`);
    await db.update(knowledgeZapQuestions).set({
      questionId: multipleChoiceQuestionIds,
    }).where(eq(knowledgeZapQuestions.id, (questions.id as string).substring(0, 21)));

    questionsIds.push(questions.id.substring(0, 21));

  }

  for(const questions of json.matchingQuestions) {
    const existingQuestion = await db.select().from(knowledgeZapQuestions).where(eq(knowledgeZapQuestions.id, questions.id as string));

    if (existingQuestion.length > 0) {
      console.log(`Matching question ${questions.id} already exists`);
      continue;
    }
    
    console.log(`Creating matching question ${questions.id}`);
    await db.insert(knowledgeZapQuestions).values({
      id: questions.id.substring(0, 21),
      question: "Knowledge Zap Question",
      type: KnowledgeZapQuestionType.MATCHING, 
      topicId: topicId,
      questionId: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      deletedAt: null,
    })

    console.log(`Creating concepts for question`, questions.id);
    for (const concept of questions.concepts) {
      console.log(`Creating concept`, concept);
      await db.insert(knowledgeZapQuestionsToConcepts).values({
        id: generateId(21),
        questionId: questions.id.substring(0, 21),
        conceptId: concept,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    const matchingQuestionIds = []
    for (const question of questions.variants) {
      console.log(`Creating matching variant "${(question.question as string).substring(0, 30)}"`);
      await db.insert(matchingQuestions).values({
        id: question.id.substring(0, 21),
        imageUrl: question?.image ?? null,
        question: question.question,
        questionId: questions.id.substring(0, 21),
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        deletedAt: null,
      })
      matchingQuestionIds.push(question.id.substring(0, 21));
      
      console.log(`Creating matching options for ${(question.question as string).substring(0, 30)}`);
      await Promise.all(question.options.map((option: unknown) => 
        db.insert(matchingAnswerOptions).values({
          id: generateId(21),
          questionId: question.id.substring(0, 21),
          optionA: (option as { optionA: string }).optionA,
          optionB: (option as { optionB: string }).optionB,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        })
      ));
    }
    
    console.log(`Updating knowledge zap question with matching question id ${questions.id}`);
    await db.update(knowledgeZapQuestions).set({
      questionId: matchingQuestionIds,
    }).where(eq(knowledgeZapQuestions.id, (questions.id as string).substring(0, 21)));

    questionsIds.push(questions.id.substring(0, 21));

  }

  for(const questions of json.orderingQuestions) {

    const existingQuestion = await db.select().from(knowledgeZapQuestions).where(eq(knowledgeZapQuestions.id, questions.id as string));

    if (existingQuestion.length > 0) {
      console.log(`Ordering question ${questions.id} already exists`);
      continue;
    }

    console.log(`Creating ordering question ${questions.id}`);
    await db.insert(knowledgeZapQuestions).values({
      id: questions.id,
      question: "Knowledge Zap Question",
      type: KnowledgeZapQuestionType.ORDERING, 
      topicId: topicId,
      questionId: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      deletedAt: null,
    })

    console.log(`Creating concepts for question`, questions.id);
    for (const concept of questions.concepts) {
      console.log(`Creating concept`, concept);
      await db.insert(knowledgeZapQuestionsToConcepts).values({
        id: generateId(21),
        questionId: questions.id.substring(0, 21),
        conceptId: concept,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    const orderingQuestionIds = []
    for (const question of questions.variants) {
      console.log(`Creating ordering variant "${question.question.substring(0, 30)}"`);
      await db.insert(orderingQuestions).values({
        id: question.id.substring(0, 21),
        question: question.question,
        questionId: questions.id.substring(0, 21),
        isDescending: question.isDescending ?? false,
        topLabel: question.topLabel ?? "Smallest",
        bottomLabel: question.bottomLabel ?? "Biggest",
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        deletedAt: null,
      })

      console.log(`Creating ordering options for ${question.question.substring(0, 30)}`);
      await Promise.all(question.options.map((option: unknown) => 
        db.insert(orderingAnswerOptions).values({
          id: generateId(21),
          questionId: question.id.substring(0, 21),
          order: (option as { order: number }).order,
          option: (option as { text: string }).text,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false, 
          deletedAt: null,
        })
      ));

      orderingQuestionIds.push(question.id.substring(0, 21));
    }

    console.log(`Updating knowledge zap question with ordering question id ${questions.id}`);
    await db.update(knowledgeZapQuestions).set({
      questionId: orderingQuestionIds,
    }).where(eq(knowledgeZapQuestions.id, (questions.id as string).substring(0, 21)));

    questionsIds.push(questions.id.substring(0, 21));

  }

  for (const questionId of questionsIds) {
    console.log(`Creating knowledge zap question to assignment ${questionId}`);
    await db.insert(knowledgeZapQuestionToAssignment).values({
      id: generateId(21),
      questionId: questionId.substring(0, 21),
      assignmentId: knowledgeZapAssignment.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      deletedAt: null,
    })
  }

  const classes= await db.select().from(classrooms);
  for(const classroom of classes) {
    // Check if activity already exists in the classroom
    const existingActivity = await db.select().from(activity).where(
      and(
        eq(activity.assignmentId, knowledgeZapAssignment.id),
        eq(activity.classroomId, classroom.id)
      )
    )

    // If activity does not exist, create it
    if(existingActivity.length === 0) {
      console.log("Adding assignment to classroom. Creating activity", knowledgeZapAssignment.id, classroom.id);
      const activityId = generateId(21);
      await db.insert(activity).values({
        id: activityId,
        assignmentId: knowledgeZapAssignment.id,
        classroomId: classroom.id,
        name: json.name,
        topicId: topicId,
        typeText: ActivityType.KnowledgeZap,
        order: 0,
        points: 100,
      })
      await db.insert(activityToAssignment).values({
        id: generateId(21),
        activityId: activityId,
        knowledgeZapAssignmentId: knowledgeZapAssignment.id,
      })
    } else {
      console.log("Checking if activity has attempts", knowledgeZapAssignment.id, classroom.id);
      const attempts = await db.select().from(knowledgeZapAssignmentAttempts).where(
        and(
          eq(knowledgeZapAssignmentAttempts.activityId, existingActivity[0]?.id ?? ""),
          not(isNull(knowledgeZapAssignmentAttempts.submittedAt))
        )
      );
      if(attempts.length === 0) {
        console.log("Updating activity with new assignmentId.", knowledgeZapAssignment.id, classroom.id);
        await db.update(activity).set({
          assignmentId: knowledgeZapAssignment.id,
        }).where(eq(activity.id, existingActivity[0]?.id ?? ""));
      }
    }
  }

  console.log("Updating old knowledge zap assignment to not be latest", existingAssignment[0]?.id);
  await db.update(knowledgeZapAssignments).set({
    isLatest: false,
  }).where(eq(knowledgeZapAssignments.id, existingAssignment[0]?.id ?? ""));

  console.log("Knowledge Zap creation complete");
  console.log("--------------------------------");

  // Create mappings to courses
  if (courseIds && courseIds.length > 0) {
    console.log("Creating course mappings...");
    for (const courseId of courseIds) {
      await mapKnowledgeZapAssignmentToCourse(knowledgeZapAssignment.id, courseId);
    }
  }

  // Create mappings to subjects
  if (subjectIds && subjectIds.length > 0) {
    console.log("Creating subject mappings...");
    for (const subjectId of subjectIds) {
      await mapKnowledgeZapAssignmentToSubject(knowledgeZapAssignment.id, subjectId);
    }
  }

  // Create mappings to grades
  if (grades && grades.length > 0) {
    console.log("Creating grade mappings...");
    for (const grade of grades) {
      await mapKnowledgeZapAssignmentToGrade(knowledgeZapAssignment.id, grade);
    }
  }
}

export async function deleteKnowledgeZapAssignment(assignmentId: string) {
  const assignment = await db.select().from(knowledgeZapAssignments).where(eq(knowledgeZapAssignments.id, assignmentId));
  if(assignment.length === 0) {
    console.log("Knowledge Zap assignment not found");
    return;
  }

  // Delete associated assignment-to-course mappings
  console.log("Deleting knowledge zap assignment to course mappings", assignmentId);
  await db.delete(knowledgeZapAssignmentToCourse).where(eq(knowledgeZapAssignmentToCourse.assignmentId, assignmentId));

  // Delete associated assignment-to-grade mappings
  console.log("Deleting knowledge zap assignment to grade mappings", assignmentId);
  await db.delete(knowledgeZapAssignmentToGrade).where(eq(knowledgeZapAssignmentToGrade.assignmentId, assignmentId));

  // Delete associated assignment-to-subject mappings
  console.log("Deleting knowledge zap assignment to subject mappings", assignmentId);
  await db.delete(knowledgeZapAssignmentToSubject).where(eq(knowledgeZapAssignmentToSubject.assignmentId, assignmentId));

  const questionsToAssignment = await db.select().from(knowledgeZapQuestionToAssignment).where(eq(knowledgeZapQuestionToAssignment.assignmentId, assignmentId));
  for(const questionToAssignment of questionsToAssignment) {

    const question = await db.select().from(knowledgeZapQuestions).where(eq(knowledgeZapQuestions.id, questionToAssignment.questionId));

    if(!question[0]?.id) {
      console.log("Question not found", questionToAssignment.questionId);
      continue;
    }

    if(question[0].type === KnowledgeZapQuestionType.MULTIPLE_CHOICE && question[0].questionId) {

      for(const mcqId of question[0].questionId) {
        const mcq = await db.select().from(multipleChoiceQuestions).where(eq(multipleChoiceQuestions.id, mcqId));
        if(!mcq[0]?.id) {
          console.log("Multiple choice question not found", mcqId);
          continue;
        }

        console.log("Deleting multiple choice question attempts", mcq[0].question.substring(0, 30));
        await db.delete(multipleChoiceAttempt).where(eq(multipleChoiceAttempt.questionId, mcqId));

        console.log("Deleting multiple choice options", mcq[0].question.substring(0, 30));
        await db.delete(multipleChoiceAnswerOptions).where(eq(multipleChoiceAnswerOptions.questionId, mcq[0].id));

        console.log("Deleting multiple choice question", mcq[0].question.substring(0, 30));
        await db.delete(multipleChoiceQuestions).where(eq(multipleChoiceQuestions.id, mcqId));
      }
    }

    if(question[0].type === KnowledgeZapQuestionType.MATCHING && question[0].questionId) {
      
      for(const mqId of question[0].questionId) {
        const mq = await db.select().from(matchingQuestions).where(eq(matchingQuestions.id, mqId));
        if(!mq[0]?.id) {
          console.log("Matching question not found", mq[0]?.id);
          continue;
        }

        const attempts = await db.select().from(matchingAttempt).where(eq(matchingAttempt.questionId, mqId));
        for(const attempt of attempts) {

          console.log("Deleting matching attempt selection", mq[0].question.substring(0, 30));
          await db.delete(matchingAttemptSelection).where(eq(matchingAttemptSelection.attemptId, attempt.id));

          console.log("Deleting matching question attempt", mq[0].question.substring(0, 30));
          await db.delete(matchingAttempt).where(eq(matchingAttempt.id, attempt.id));
        }

        console.log("Deleting matching options", mq[0].question.substring(0, 30));
        await db.delete(matchingAnswerOptions).where(eq(matchingAnswerOptions.questionId, mq[0].id));

        console.log("Deleting matching question", mq[0].question.substring(0, 30));
        await db.delete(matchingQuestions).where(eq(matchingQuestions.id, mqId));
      }
    }

    if(question[0].type === KnowledgeZapQuestionType.ORDERING && question[0].questionId) {
      
      for(const ordId of question[0].questionId) {
        const ord = await db.select().from(orderingQuestions).where(eq(orderingQuestions.id, ordId));
        if(!ord[0]?.id) {
          console.log("Ordering question not found", ord[0]?.id);
          continue;
        }

        const attempts = await db.select().from(orderingAttempt).where(eq(orderingAttempt.questionId, ordId));
        for(const attempt of attempts) {

          console.log("Deleting ordering attempt selection", ord[0].question.substring(0, 30));
          await db.delete(orderingAttemptSelection).where(eq(orderingAttemptSelection.attemptId, attempt.id));

          console.log("Deleting ordering question attempt", ord[0].question.substring(0, 30));
          await db.delete(orderingAttempt).where(eq(orderingAttempt.id, attempt.id));
        }

        console.log("Deleting ordering options", ord[0].question.substring(0, 30));
        await db.delete(orderingAnswerOptions).where(eq(orderingAnswerOptions.questionId, ord[0].id));

        console.log("Deleting ordering question", ord[0].question.substring(0, 30));
        await db.delete(orderingQuestions).where(eq(orderingQuestions.id, ordId));
      }
    }

    console.log("Deleting concepts for question", question[0].question);
    await db.delete(knowledgeZapQuestionsToConcepts).where(eq(knowledgeZapQuestionsToConcepts.questionId, question[0].id));

    console.log("Deleting knowledge zap question attempts", question[0].question);
    await db.delete(knowledgeZapQuestionAttempts).where(eq(knowledgeZapQuestionAttempts.questionId, question[0].id));
    
    console.log("Deleting knowledge zap question to assignment", questionToAssignment.id);
    await db.delete(knowledgeZapQuestionToAssignment).where(eq(knowledgeZapQuestionToAssignment.id, questionToAssignment.id));

    console.log("Deleting knowledge zap question", question[0].question);
    await db.delete(knowledgeZapQuestions).where(eq(knowledgeZapQuestions.id, question[0].id));
  }

  const activities = await db.select().from(activity).where(eq(activity.assignmentId, assignmentId));
  for(const act of activities) {
    console.log("Deleting knowledge zap assignment attempts", act.id);
    await db.delete(knowledgeZapAssignmentAttempts).where(eq(knowledgeZapAssignmentAttempts.activityId, act.id));

    console.log("Deleting activity to assignment", act.id);
    await db.delete(activityToAssignment).where(eq(activityToAssignment.knowledgeZapAssignmentId, assignmentId));

    console.log("Deleting activity", act.id);
    await db.delete(activity).where(eq(activity.id, act.id));
  }

  await db.delete(knowledgeZapAssignments).where(eq(knowledgeZapAssignments.id, assignmentId));
}

export async function computeQuestionsCompleted() {
  const kza = await db.select().from(knowledgeZapAssignmentAttempts).where(not(isNull(knowledgeZapAssignmentAttempts.submittedAt)));

  for(const attempt of kza) {
    const questionAttempts = await db.select().from(knowledgeZapQuestionAttempts).where(eq(knowledgeZapQuestionAttempts.attemptId, attempt.id));
    const totalAttempts = questionAttempts.length;
    const questionsCompleted = questionAttempts.filter(q => q.isCorrect).length;
    await db.update(knowledgeZapAssignmentAttempts).set({
      totalAttempts: totalAttempts,
      questionsCompleted: questionsCompleted,
    }).where(eq(knowledgeZapAssignmentAttempts.id, attempt.id));
  }
}

export async function addConceptsToKnowledgeZapQuestions(topicName: string) {
  const { default: json } = await import( `./${topicName}.json`, { assert: { type: "json" } });

  const topic = await db.select().from(topics).where(eq(topics.name, json.name as string))

  if(!topic[0]?.id) {
    console.log("Topic not found", json.name)
    return
  }

  for (const question of json.multipleChoiceQuestions) {
    console.log("Updating question concepts for", question.id)
    for (const concept of question.concepts) {
      console.log("Creating concept", concept)
      await db.insert(knowledgeZapQuestionsToConcepts).values({
        id: generateId(21),
        questionId: question.id,
        conceptId: concept,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
  }

  for (const question of json.matchingQuestions) {
    console.log("Updating question concepts for", question.id )
    for (const concept of question.concepts) {
      console.log("Creating concept", concept)
      await db.insert(knowledgeZapQuestionsToConcepts).values({
        id: generateId(21),
        questionId: question.id,
        conceptId: concept,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
  }
  
  for (const question of json.orderingQuestions) {
    console.log("Updating question concepts for", question.id)
    for (const concept of question.concepts) {
      console.log("Creating concept", concept)
      await db.insert(knowledgeZapQuestionsToConcepts).values({
        id: generateId(21),
        questionId: question.id,
        conceptId: concept,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
  }
}

export async function findConceptsWithoutKnowledgeZaps() {
  // Get all concepts that don't have any associated knowledge zap questions
  const conceptsWithoutZaps = await db
    .select({
      id: concepts.id,
      text: concepts.text,
    })
    .from(concepts)
    .leftJoin(
      knowledgeZapQuestionsToConcepts,
      eq(knowledgeZapQuestionsToConcepts.conceptId, concepts.id)
    )
    .where(isNull(knowledgeZapQuestionsToConcepts.id));

  if (conceptsWithoutZaps.length === 0) {
    console.log("All concepts have knowledge zap questions.");
    return [];
  }

  console.log(`Found ${conceptsWithoutZaps.length} concepts without knowledge zaps:`);
  conceptsWithoutZaps.forEach(concept => {
    console.log(`- Concept ID: ${concept.id}, Text: ${concept.text}`);
  });
} 

export async function findKnowledgeZapQuestionsWithoutConcepts() {
  // Get all knowledge zap questions that don't have any associated concepts
  const questionsWithoutConcepts = await db
    .select({
      id: knowledgeZapQuestions.id,
      question: knowledgeZapQuestions.question,
      type: knowledgeZapQuestions.type
    })
    .from(knowledgeZapQuestions)
    .leftJoin(
      knowledgeZapQuestionsToConcepts,
      eq(knowledgeZapQuestionsToConcepts.questionId, knowledgeZapQuestions.id)
    )
    .where(isNull(knowledgeZapQuestionsToConcepts.id));

  if (questionsWithoutConcepts.length === 0) {
    console.log("All knowledge zap questions have concepts associated.");
    return [];
  }

  console.log(`Found ${questionsWithoutConcepts.length} questions without concepts:`);
  questionsWithoutConcepts.forEach(question => {
    console.log(`- Question ID: ${question.id}, Type: ${question.type}`);
  });

  return questionsWithoutConcepts;
}

export async function createConceptTrackerForAllKnowledgeZapAttempts() {
  const attempts = await db
    .select({
      questionAttemptId: knowledgeZapQuestionAttempts.id,
      userId: knowledgeZapAssignmentAttempts.userId,
      activityId: knowledgeZapAssignmentAttempts.activityId,
      classroomId: activity.classroomId,
      questionId: knowledgeZapQuestionAttempts.questionId,
      conceptId: knowledgeZapQuestionsToConcepts.conceptId,
      isCorrect: knowledgeZapQuestionAttempts.isCorrect,
      createdAt: knowledgeZapQuestionAttempts.createdAt
    })
    .from(knowledgeZapQuestionAttempts)
    .innerJoin(
      knowledgeZapAssignmentAttempts,
      eq(knowledgeZapQuestionAttempts.attemptId, knowledgeZapAssignmentAttempts.id)
    )
    .innerJoin(
      knowledgeZapQuestionsToConcepts,
      eq(knowledgeZapQuestionAttempts.questionId, knowledgeZapQuestionsToConcepts.questionId)
    )
    .innerJoin(
      activity,
      eq(knowledgeZapAssignmentAttempts.activityId, activity.id)
    );

  // Print summary statistics
  console.log(`Total attempts found: ${attempts.length}`);
  console.log(`Unique users: ${new Set(attempts.map(a => a.userId)).size}`);
  console.log(`Unique concepts: ${new Set(attempts.map(a => a.conceptId)).size}`);
  console.log("\nDetailed attempts data:");
  
  // Print the data in table format with date
  console.table(attempts.map(attempt => ({
    Date: attempt.createdAt,
    User: attempt.userId?.substring(0, 8) + "...",
    Activity: attempt.activityId?.substring(0, 8) + "...",
    Question: attempt.questionId?.substring(0, 8) + "...",
    Concept: attempt.conceptId?.substring(0, 8) + "...",
    Correct: attempt.isCorrect ? "✓" : "✗"
  })));

  // Create concept tracking records for each attempt
  for (const attempt of attempts) {
    await db.insert(conceptTracking).values({
      id: generateId(21),
      isCorrect: attempt.isCorrect,
      conceptId: attempt.conceptId,
      userId: attempt.userId,
      classroomId: attempt.classroomId,
      activityType: ActivityType.KnowledgeZap,
      createdAt: attempt.createdAt,
      updatedAt: attempt.createdAt,
    });
  }
}

export async function calculateUserConceptScore(userId: string, conceptId: string) {
  const conceptTrackers = await db.select().from(conceptTracking).where(
    and(
      eq(conceptTracking.userId, userId), 
      eq(conceptTracking.conceptId, conceptId)
    )
  );
  
  const total = conceptTrackers.length;
  const totalCorrect = conceptTrackers.filter(a => a.isCorrect).length;
  const totalScore = total > 0 ? (totalCorrect / total) * 100 : 0;

  const dayTrack = conceptTrackers.filter(a => a.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000));
  const dayCorrect = dayTrack.filter(a => a.isCorrect).length;
  const dayTotal = dayTrack.length;
  const dayScore = (dayCorrect / dayTotal) * 100;

  const weekTrack = conceptTrackers.filter(a => a.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const weekCorrect = weekTrack.filter(a => a.isCorrect).length;
  const weekTotal = weekTrack.length;
  const weekScore = (weekCorrect / weekTotal) * 100;

  const biWeekTrack = conceptTrackers.filter(a => a.createdAt > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000));
  const biWeekCorrect = biWeekTrack.filter(a => a.isCorrect).length;
  const biWeekTotal = biWeekTrack.length;
  const biWeekScore = (biWeekCorrect / biWeekTotal) * 100;

  const monthTrack = conceptTrackers.filter(a => a.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const monthCorrect = monthTrack.filter(a => a.isCorrect).length;
  const monthTotal = monthTrack.length;
  const monthScore = (monthCorrect / monthTotal) * 100;

  const threeMonthTrack = conceptTrackers.filter(a => a.createdAt > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
  const threeMonthCorrect = threeMonthTrack.filter(a => a.isCorrect).length;
  const threeMonthTotal = threeMonthTrack.length;
  const threeMonthScore = threeMonthTotal > 0 ? (threeMonthCorrect / threeMonthTotal) * 100 : 0;

  const avgScore = calculateAverageScore([totalScore, dayScore, weekScore, biWeekScore, monthScore, threeMonthScore]);

  console.log(`${dayScore}, ${weekScore}, ${biWeekScore}, ${monthScore}, ${threeMonthScore}, ${avgScore}`);

  return {
    userId,
    conceptId,
    totalAttempts: total,
    totalCorrect,
    totalScore: totalScore.toFixed(2),
    dayScore: dayScore.toFixed(2),
    weekScore: weekScore.toFixed(2),
    biWeekScore: biWeekScore.toFixed(2),
    monthScore: monthScore.toFixed(2),
    threeMonthScore: threeMonthScore.toFixed(2),
    averageScore: calculateAverageScore([totalScore, dayScore, weekScore, biWeekScore, monthScore, threeMonthScore])
  };
}

function calculateAverageScore(scores: number[]): string {
  const validScores = scores.filter(score => !isNaN(score));
  if (validScores.length === 0) return "0.00";
  
  const sum = validScores.reduce((acc, score) => acc + score, 0);
  return (sum / validScores.length).toFixed(2);
}

export async function printConceptScores() {
  // Get all unique user-concept pairs from conceptTracking
  const userConceptPairs = await db
    .select({
      userId: conceptTracking.userId,
      conceptId: conceptTracking.conceptId,
    })
    .from(conceptTracking)
    .where(
      and(
        eq(conceptTracking.activityType, ActivityType.KnowledgeZap),
        not(isNull(conceptTracking.userId)),
        not(isNull(conceptTracking.conceptId))
      )
    )
    .groupBy(conceptTracking.userId, conceptTracking.conceptId);
  
  console.log(`Found ${userConceptPairs.length} unique user-concept pairs`);
  
  // Get concept text for better output
  const conceptsMap = new Map();
  const conceptIds = [...new Set(userConceptPairs.map(pair => pair.conceptId))];
  
  for (const conceptId of conceptIds) {
    if (conceptId) {
      const concept = await db.select().from(concepts).where(eq(concepts.id, conceptId));
      if (concept.length > 0 && concept[0]?.text) {
        conceptsMap.set(conceptId, concept[0].text);
      }
    }
  }
  
  // Get user information (name, email, role)
  const userMap = new Map();
  const userIds = [...new Set(userConceptPairs.map(pair => pair.userId))];
  
  const excludedEmails = [
    'vignesh@iraproject.com',
    'likhit@iraproject.com',
    'vig9295@gmail.com',
    'likhitnayak@gmail.com'
  ];
  
  const filteredUserIds = [];
  
  for (const userId of userIds) {
    if (userId) {
      const userResults = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role
      }).from(users).where(eq(users.id, userId));
      
      if (userResults.length > 0 && userResults[0]) {
        const userData = userResults[0];
        
        // Skip users with excluded emails or role 'teacher'
        if (
          excludedEmails.includes(userData.email ?? '') || 
          userData.role === Roles.Teacher
        ) {
          continue;
        }
        
        userMap.set(userId, {
          name: userData.name ?? 'Unknown',
          email: userData.email ?? 'Unknown',
          role: userData.role ?? 'Unknown'
        });
        
        filteredUserIds.push(userId);
      }
    }
  }
  
  console.log(`Found ${filteredUserIds.length} users after filtering out excluded emails and teachers`);
  
  // Calculate scores for each pair
  const results = [];
  
  for (const pair of userConceptPairs) {
    if (pair.userId && pair.conceptId && filteredUserIds.includes(pair.userId)) {
      const score = await calculateUserConceptScore(pair.userId, pair.conceptId);
      const userData = userMap.get(pair.userId) ?? { name: 'Unknown', email: 'Unknown', role: 'Unknown' };
      
      results.push({
        UserId: pair.userId,
        UserName: userData.name,
        UserEmail: userData.email,
        UserRole: userData.role,
        ConceptId: pair.conceptId,
        ConceptName: conceptsMap.get(pair.conceptId) ?? pair.conceptId,
        TotalAttempts: score.totalAttempts,
        TotalCorrect: score.totalCorrect,
        TotalScore: score.totalScore,
        DayScore: score.dayScore,
        WeekScore: score.weekScore,
        MonthScore: score.monthScore,
        AverageScore: score.averageScore
      });
    }
  }
  
  // Print CSV header
  // console.log("UserId,UserName,UserEmail,UserRole,ConceptId,ConceptName,TotalAttempts,TotalCorrect,TotalScore,DayScore,WeekScore,MonthScore,AverageScore");
  
  // // Print CSV rows
  // for (const result of results) {
  //   console.log(
  //     `${result.UserId},` +
  //     `"${result.UserName}",` +
  //     `"${result.UserEmail}",` +
  //     `${result.UserRole},` +
  //     `${result.ConceptId},` +
  //     `"${result.ConceptName.replace(/"/g, '""')}",` + // Escape quotes in CSV
  //     `${result.TotalAttempts},` +
  //     `${result.TotalCorrect},` +
  //     `${result.TotalScore},` +
  //     `${result.DayScore},` +
  //     `${result.WeekScore},` +
  //     `${result.MonthScore},` +
  //     `${result.AverageScore}`
  //   );
  // }
  
  // // Also print in table format for convenience
  // console.log("\nUser-Concept Score Summary (Table Format):");
  // console.table(results.map(result => ({
  //   UserId: result.UserId.substring(0, 8) + "...",
  //   UserName: result.UserName,
  //   UserEmail: result.UserEmail,
  //   UserRole: result.UserRole,
  //   Concept: result.ConceptName.substring(0, 15) + "...",
  //   TotalAttempts: result.TotalAttempts,
  //   TotalScore: result.TotalScore + "%",
  //   AverageScore: result.AverageScore + "%"
  // })));
}

export async function createGeneratedKnowledgeZapAssignment(
  topicName: string, 
  userId: string,
  options?: {
    courseIds?: string[];
    subjectIds?: string[];
    grades?: string[];
  }
) {
  const { courseIds, subjectIds, grades } = options ?? {};
  const { default: json } = await import( `./${topicName}.json`, { assert: { type: "json" } });

  const topic = await db.select().from(topics).where(eq(topics.name, json.name as string))

  if(!topic[0]?.id) {
    console.log("Topic not found", json.name)
    return
  }
  
  const topicId = topic[0].id

  console.log("Creating generated knowledge zap assignment", json.name);
  const kza = await db.insert(knowledgeZapAssignments).values({
    id: generateId(21),
    name: json.name,
    description: "Generated Knowledge Zap",
    topicId: topicId,
    generated: true,
    createdBy: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning({
    id: knowledgeZapAssignments.id,
  });
  
  const knowledgeZapAssignment = kza[0];

  if(!knowledgeZapAssignment?.id) {
    throw new Error("Failed to create generated knowledge zap assignment");
  }

  const questionsIds = []

  for (const questions of json.multipleChoiceQuestions) {
    console.log(`Creating multiple choice question`, questions.id);
    await db.insert(knowledgeZapQuestions).values({
      id: questions.id.substring(0, 21),
      question: "Knowledge Zap Question",
      type: KnowledgeZapQuestionType.MULTIPLE_CHOICE, 
      topicId: topicId,
      questionId: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      deletedAt: null,
    })

    console.log(`Creating concepts for question`, questions.id);
    for (const concept of questions.concepts) {
      console.log(`Creating concept`, concept);
      await db.insert(knowledgeZapQuestionsToConcepts).values({
        id: generateId(21),
        questionId: questions.id.substring(0, 21),
        conceptId: concept,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    const multipleChoiceQuestionIds = []

    for (const question of questions.variants) {
      console.log(`Creating multiple choice variant "${(question.question as string).substring(0, 30)}"`);
      await db.insert(multipleChoiceQuestions).values({
        id: question.id.substring(0, 21),
        question: question.question,
        questionId: questions.id.substring(0, 21),
        multipleCorrect: !question.single_correct,
        imageUrl: question?.image ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        deletedAt: null,
      })
      multipleChoiceQuestionIds.push(question.id.substring(0, 21));
      for (const option of question.options) {
        console.log(`Creating multiple choice option "${(option.option_text as string).substring(0, 30)}"`);
        await db.insert(multipleChoiceAnswerOptions).values({
          id: generateId(21).substring(0, 21),
          questionId: question.id.substring(0, 21),
          imageUrl: option?.image ?? null,
          option: option.option_text ?? "",
          isCorrect: option.is_correct,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        })
      }
    }

    console.log(`Updating knowledge zap question with mcq ${questions.id} - ${multipleChoiceQuestionIds.length}`);
    await db.update(knowledgeZapQuestions).set({
      questionId: multipleChoiceQuestionIds,
    }).where(eq(knowledgeZapQuestions.id, (questions.id as string).substring(0, 21)));

    questionsIds.push(questions.id.substring(0, 21));
  }

  for(const questions of json.matchingQuestions) {
    console.log(`Creating matching question ${questions.id}`);
    await db.insert(knowledgeZapQuestions).values({
      id: questions.id.substring(0, 21),
      question: "Knowledge Zap Question",
      type: KnowledgeZapQuestionType.MATCHING, 
      topicId: topicId,
      questionId: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      deletedAt: null,
    })

    console.log(`Creating concepts for question`, questions.id);
    for (const concept of questions.concepts) {
      console.log(`Creating concept`, concept);
      await db.insert(knowledgeZapQuestionsToConcepts).values({
        id: generateId(21),
        questionId: questions.id.substring(0, 21),
        conceptId: concept,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    const matchingQuestionIds = []
    for (const question of questions.variants) {
      console.log(`Creating matching variant "${(question.question as string).substring(0, 30)}"`);
      await db.insert(matchingQuestions).values({
        id: question.id.substring(0, 21),
        imageUrl: question?.image ?? null,
        question: question.question,
        questionId: questions.id.substring(0, 21),
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        deletedAt: null,
      })
      matchingQuestionIds.push(question.id.substring(0, 21));
      
      console.log(`Creating matching options for ${(question.question as string).substring(0, 30)}`);
      await Promise.all(question.options.map((option: unknown) => 
        db.insert(matchingAnswerOptions).values({
          id: generateId(21),
          questionId: question.id.substring(0, 21),
          optionA: (option as { optionA: string }).optionA,
          optionB: (option as { optionB: string }).optionB,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        })
      ));
    }
    
    console.log(`Updating knowledge zap question with matching question id ${questions.id}`);
    await db.update(knowledgeZapQuestions).set({
      questionId: matchingQuestionIds,
    }).where(eq(knowledgeZapQuestions.id, (questions.id as string).substring(0, 21)));

    questionsIds.push(questions.id.substring(0, 21));
  }

  for(const questions of json.orderingQuestions) {
    console.log(`Creating ordering question ${questions.id}`);
    await db.insert(knowledgeZapQuestions).values({
      id: questions.id,
      question: "Knowledge Zap Question",
      type: KnowledgeZapQuestionType.ORDERING, 
      topicId: topicId,
      questionId: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      deletedAt: null,
    })

    console.log(`Creating concepts for question`, questions.id);
    for (const concept of questions.concepts) {
      console.log(`Creating concept`, concept);
      await db.insert(knowledgeZapQuestionsToConcepts).values({
        id: generateId(21),
        questionId: questions.id.substring(0, 21),
        conceptId: concept,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    const orderingQuestionIds = []
    for (const question of questions.variants) {
      console.log(`Creating ordering variant "${question.question.substring(0, 30)}"`);
      await db.insert(orderingQuestions).values({
        id: question.id.substring(0, 21),
        question: question.question,
        questionId: questions.id.substring(0, 21),
        isDescending: question.isDescending ?? false,
        topLabel: question.topLabel ?? "Smallest",
        bottomLabel: question.bottomLabel ?? "Biggest",
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        deletedAt: null,
      })

      console.log(`Creating ordering options for ${question.question.substring(0, 30)}`);
      await Promise.all(question.options.map((option: unknown) => 
        db.insert(orderingAnswerOptions).values({
          id: generateId(21),
          questionId: question.id.substring(0, 21),
          order: (option as { order: number }).order,
          option: (option as { text: string }).text,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false, 
          deletedAt: null,
        })
      ));

      orderingQuestionIds.push(question.id.substring(0, 21));
    }

    console.log(`Updating knowledge zap question with ordering question id ${questions.id}`);
    await db.update(knowledgeZapQuestions).set({
      questionId: orderingQuestionIds,
    }).where(eq(knowledgeZapQuestions.id, (questions.id as string).substring(0, 21)));

    questionsIds.push(questions.id.substring(0, 21));
  }

  for (const questionId of questionsIds) {
    console.log(`Creating knowledge zap question to assignment ${questionId}`);
    await db.insert(knowledgeZapQuestionToAssignment).values({
      id: generateId(21),
      questionId: questionId.substring(0, 21),
      assignmentId: knowledgeZapAssignment.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      deletedAt: null,
    })
  }

  // Only get classrooms created by the specified user
  const userClassrooms = await db.select().from(classrooms).where(eq(classrooms.createdBy, userId));
  
  for(const classroom of userClassrooms) {
    console.log("Adding generated assignment to user's classroom. Creating activity", knowledgeZapAssignment.id, classroom.id);
    const activityId = generateId(21);
    await db.insert(activity).values({
      id: activityId,
      assignmentId: knowledgeZapAssignment.id,
      classroomId: classroom.id,
      name: json.name,
      generated: true,
      topicId: topicId,
      typeText: ActivityType.KnowledgeZap,
      order: 0,
      points: 100,
    })
    await db.insert(activityToAssignment).values({
      id: generateId(21),
      activityId: activityId,
      knowledgeZapAssignmentId: knowledgeZapAssignment.id,
    })
  }

  console.log("Generated Knowledge Zap creation complete");
  console.log("--------------------------------");

  // Create mappings to courses
  if (courseIds && courseIds.length > 0) {
    console.log("Creating course mappings...");
    for (const courseId of courseIds) {
      await mapKnowledgeZapAssignmentToCourse(knowledgeZapAssignment.id, courseId);
    }
  }

  // Create mappings to subjects
  if (subjectIds && subjectIds.length > 0) {
    console.log("Creating subject mappings...");
    for (const subjectId of subjectIds) {
      await mapKnowledgeZapAssignmentToSubject(knowledgeZapAssignment.id, subjectId);
    }
  }

  // Create mappings to grades
  if (grades && grades.length > 0) {
    console.log("Creating grade mappings...");
    for (const grade of grades) {
      await mapKnowledgeZapAssignmentToGrade(knowledgeZapAssignment.id, grade);
    }
  }
  
  return knowledgeZapAssignment;
}

export async function seedKnowledgeZapAssignmentSubmission(
  assignmentAttemptId: string,
  assignmentId: string,
  options: {
    mode: 'trial' | 'proper';
  } = { mode: 'trial' }
) {
  const { mode } = options;

  console.log(`🎯 Starting ${mode} mode knowledge zap assignment submission`);
  console.log(`Assignment Attempt ID: ${assignmentAttemptId}`);
  console.log(`Assignment ID: ${assignmentId}`);

  // Get the assignment attempt and related data
  const attempt = await db.query.knowledgeZapAssignmentAttempts.findFirst({
    where: (attempt, { eq }) => eq(attempt.id, assignmentAttemptId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
        }
      }
    }
  });

  if (!attempt) {
    throw new Error(`Assignment attempt not found: ${assignmentAttemptId}`);
  }

  // Get the assignment separately using the provided assignmentId
  const assignment = await db.query.knowledgeZapAssignments.findFirst({
    where: (assignment, { eq }) => eq(assignment.id, assignmentId),
    with: {
      questionToAssignment: true,
    }
  });

  if (!assignment) {
    throw new Error(`Assignment not found: ${assignmentId}`);
  }

  if (attempt.submittedAt) {
    console.log(`⚠️  Warning: This attempt has already been submitted at ${attempt.submittedAt.toISOString()}`);
    if (mode === 'proper') {
      throw new Error("Cannot resubmit an already submitted attempt in proper mode");
    }
  }

  console.log(`📝 User: ${attempt.user?.name ?? 'Unknown'} (${attempt.user?.email ?? 'Unknown'})`);
  console.log(`📚 Assignment: ${assignment.name ?? 'Unknown'}`);

  // Get all question attempts for this assignment attempt
  const questionAttempts = await db.query.knowledgeZapQuestionAttempts.findMany({
    where: (questionAttempt, { eq }) => eq(questionAttempt.attemptId, assignmentAttemptId),
  });

  console.log(`🔍 Found ${questionAttempts.length} question attempts`);

  // Calculate the score using the same logic as the service
  const submissionTime = new Date();
  const correctAttempts = questionAttempts.filter((attempt) => attempt.isCorrect);
  const score = (correctAttempts.length * correctAttempts.length) / (questionAttempts.length * assignment.questionToAssignment.length);
  const questionsCompleted = correctAttempts.length;
  const totalAttempts = questionAttempts.length;

  console.log(`\n📊 SUBMISSION SUMMARY:`);
  console.log(`   Total questions in assignment: ${assignment.questionToAssignment.length}`);
  console.log(`   Questions attempted: ${totalAttempts}`);
  console.log(`   Correct answers: ${questionsCompleted}`);
  console.log(`   Final score: ${score.toFixed(3)} (${(score * 100).toFixed(1)}%)`);
  console.log(`   Score calculation: (${questionsCompleted} × ${questionsCompleted}) ÷ (${totalAttempts} × ${assignment.questionToAssignment.length})`);

  if (mode === 'trial') {
    console.log(`\n🧪 TRIAL MODE COMPLETE - No database changes made`);
    console.log(`   This attempt would have been submitted with:`);
    console.log(`   - Score: ${score.toFixed(3)}`);
    console.log(`   - Questions Completed: ${questionsCompleted}`);
    console.log(`   - Total Attempts: ${totalAttempts}`);
    console.log(`   - Submitted At: ${submissionTime.toISOString()}`);
    
    return {
      mode: 'trial',
      assignmentAttemptId,
      assignmentId,
      score,
      questionsCompleted,
      totalAttempts,
      submissionTime,
      questionAttempts: questionAttempts.map(qa => ({
        id: qa.id,
        questionId: qa.questionId,
        isCorrect: qa.isCorrect,
      })),
    };
  }

  // Submit the attempt using the same logic as the service (proper mode)
  await db.update(knowledgeZapAssignmentAttempts)
    .set({
      score: score,
      submittedAt: submissionTime,
      questionsCompleted: questionsCompleted,
      totalAttempts: totalAttempts,
      updatedAt: submissionTime,
    })
    .where(eq(knowledgeZapAssignmentAttempts.id, assignmentAttemptId));

  console.log(`\n✅ PROPER MODE COMPLETE - Assignment attempt submitted!`);
  console.log(`   Submitted at: ${submissionTime.toISOString()}`);
  console.log(`   Database record updated with final scores`);

  return {
    mode: 'proper',
    assignmentAttemptId,
    assignmentId,
    score,
    questionsCompleted,
    totalAttempts,
    submittedAt: submissionTime,
    questionAttempts: questionAttempts.map(qa => ({
      id: qa.id,
      questionId: qa.questionId,
      isCorrect: qa.isCorrect,
    })),
  };
}