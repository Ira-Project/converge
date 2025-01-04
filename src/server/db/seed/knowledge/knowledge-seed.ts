/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "../..";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";

import { knowledgeZapAssignments } from "../../schema/knowledgeZap/knowledgeZapAssignment";
import { multipleChoiceAnswerOptions, multipleChoiceQuestions } from "../../schema/knowledgeZap/multipleChoiceQuestions";
import { KnowledgeZapQuestionType } from "@/lib/constants";
import { knowledgeZapQuestions, knowledgeZapQuestionToAssignment } from "../../schema/knowledgeZap/knowledgeZapQuestions";
import { matchingAnswerOptions, matchingQuestions } from "../../schema/knowledgeZap/matchingQuestions";
import { orderingAnswerOptions, orderingQuestions } from "../../schema/knowledgeZap/orderingQuestions";

import json from "./simple_harmonic_motion.json";

export async function createKnowledgeZapAssignment() {

  const topicId = process.env.ENVIRONMENT === "prod" ? json.topicIdProd : json.topicIdDev;
  // Check if assignment already exists
  const existingAssignment = await db.select().from(knowledgeZapAssignments).where(eq(knowledgeZapAssignments.topicId, topicId));

  let knowledgeZapAssignment;

  if (existingAssignment.length > 0) {
    console.log("Knowledge Zap assignment already exists");
    knowledgeZapAssignment = existingAssignment[0];
  } else {
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
    const existingQuestions = await db.select().from(knowledgeZapQuestions).where(eq(knowledgeZapQuestions.id, questions.id));
    
    if (existingQuestions.length > 0) {
      console.log(`Multiple choice question already exists`, questions.id);
      continue;
    }

    await db.insert(knowledgeZapQuestions).values({
      id: questions.id,
      question: "Knowledge Zap Question",
      type: KnowledgeZapQuestionType.MULTIPLE_CHOICE, 
      topicId: topicId,
      questionId: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      deletedAt: null,
    })

    const multipleChoiceQuestionIds = []

    for (const question of questions.variants) {
      const existingMCQuestion = await db.select().from(multipleChoiceQuestions).where(eq(multipleChoiceQuestions.id, question.id));

      if (existingMCQuestion.length > 0) {
        console.log(`Multiple choice sub-question "${question.question}" already exists`);
        continue;
      }

      await db.insert(multipleChoiceQuestions).values({
        id: question.id,
        question: question.question,
        questionId: questions.id,
        imageUrl: question.image,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        deletedAt: null,
      })
      multipleChoiceQuestionIds.push(question.id);
      for (const option of question.options) {
        await db.insert(multipleChoiceAnswerOptions).values({
          id: generateId(21),
          questionId: question.id,
          imageUrl: option.image,
          option: option.text ?? "",
          isCorrect: option.isCorrect,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        })
      }
    }

    await db.update(knowledgeZapQuestions).set({
      questionId: multipleChoiceQuestionIds,
    }).where(eq(knowledgeZapQuestions.id, questions.id));

    questionsIds.push(questions.id);

  }

  for(const questions of json.matchingQuestions) {
    const existingQuestion = await db.select().from(knowledgeZapQuestions).where(eq(knowledgeZapQuestions.id, questions.id));

    if (existingQuestion.length > 0) {
      console.log(`Matching question ${questions.id} already exists`);
      continue;
    }
    
    await db.insert(knowledgeZapQuestions).values({
      id: questions.id,
      question: "Knowledge Zap Question",
      type: KnowledgeZapQuestionType.MATCHING, 
      topicId: topicId,
      questionId: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      deletedAt: null,
    })

    const matchingQuestionIds = []
    for (const question of questions.variants) {
      await db.insert(matchingQuestions).values({
        id: question.id,
        imageUrl: question.image,
        question: question.question,
        questionId: questions.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        deletedAt: null,
      })
      matchingQuestionIds.push(question.id);
      
      await Promise.all(question.options.map(option => 
        db.insert(matchingAnswerOptions).values({
          id: generateId(21),
          questionId: question.id,
          optionA: option.optionA,
          optionB: option.optionB,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          deletedAt: null,
        })
      ));
    }
    
    await db.update(knowledgeZapQuestions).set({
      questionId: matchingQuestionIds,
    }).where(eq(knowledgeZapQuestions.id, questions.id));

    questionsIds.push(questions.id);

  }

  for(const questions of json.orderingQuestions) {

    const existingQuestion = await db.select().from(knowledgeZapQuestions).where(eq(knowledgeZapQuestions.id, questions.id));

    if (existingQuestion.length > 0) {
      console.log(`Ordering question ${questions.id} already exists`);
      continue;
    }

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
    
    const orderingQuestionIds = []
    for (const question of questions.variants) {

      await db.insert(orderingQuestions).values({
        id: question.id,
        question: question.question,
        questionId: questions.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        deletedAt: null,
      })

      await Promise.all(question.options.map(option => 
        db.insert(orderingAnswerOptions).values({
          id: generateId(21),
          questionId: question.id,
          order: option.order,
          option: option.text,
          createdAt: new Date(),
          updatedAt: new Date(),  
          isDeleted: false, 
          deletedAt: null,
        })
      ));

      orderingQuestionIds.push(question.id);
    }

    await db.update(knowledgeZapQuestions).set({
      questionId: orderingQuestionIds,
    }).where(eq(knowledgeZapQuestions.id, questions.id));

    questionsIds.push(questions.id);

  }

  for (const questionId of questionsIds) {

    await db.insert(knowledgeZapQuestionToAssignment).values({
      id: generateId(21),
      questionId: questionId,
      assignmentId: knowledgeZapAssignment.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      deletedAt: null,
    })
  }

}
