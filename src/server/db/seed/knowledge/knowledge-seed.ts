/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "../..";
import { and, eq, not, isNull } from "drizzle-orm";
import { generateId } from "lucia";

import { knowledgeZapAssignmentAttempts, knowledgeZapAssignments } from "../../schema/knowledgeZap/knowledgeZapAssignment";
import { multipleChoiceAnswerOptions, multipleChoiceAttempt, multipleChoiceQuestions } from "../../schema/knowledgeZap/multipleChoiceQuestions";
import { ActivityType, KnowledgeZapQuestionType } from "@/lib/constants";
import { knowledgeZapQuestionAttempts, knowledgeZapQuestions, knowledgeZapQuestionsToConcepts, knowledgeZapQuestionToAssignment } from "../../schema/knowledgeZap/knowledgeZapQuestions";
import { matchingAnswerOptions, matchingAttempt, matchingAttemptSelection, matchingQuestions } from "../../schema/knowledgeZap/matchingQuestions";
import { orderingAnswerOptions, orderingAttempt, orderingAttemptSelection, orderingQuestions } from "../../schema/knowledgeZap/orderingQuestions";

import { activity } from "../../schema/activity";
import { classrooms } from "../../schema/classroom";

import { topics } from "../../schema/subject";

export async function createKnowledgeZapAssignment(topicName: string) {
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
      await db.insert(activity).values({
        id: generateId(21),
        assignmentId: knowledgeZapAssignment.id,
        classroomId: classroom.id,
        name: json.name,
        topicId: topicId,
        type: ActivityType.KnowledgeZap,
        typeText: ActivityType.KnowledgeZap,
        order: 0,
        points: 100,
      })
    }
  }

  console.log("Knowledge Zap creation complete");
  console.log("--------------------------------");
}

export async function deleteKnowledgeZapAssignment(assignmentId: string) {
  const assignment = await db.select().from(knowledgeZapAssignments).where(eq(knowledgeZapAssignments.id, assignmentId));
  if(assignment.length === 0) {
    console.log("Knowledge Zap assignment not found");
    return;
  }

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