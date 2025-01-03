/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "../..";
import { and, eq } from "drizzle-orm";
import { generateId } from "lucia";

import { topics } from "../../schema/subject";


import reasoningJson from "./work_energy_power.json";
import { reasoningAnswerOptions, reasoningPathway, reasoningPathwayStep, reasoningQuestions, reasoningQuestionToAssignment } from "../../schema/reasoning/reasoningQuestions";
import { reasoningAssignments } from "../../schema/reasoning/reasoningAssignment";


async function createReasoningQuestionsFromJson() {
  const topicId = "yyyah4hvk5r7188h7mgkk";
  const topic = await db.select().from(topics).where(
    eq(topics.id, topicId),
  )

  if(topic?.[0] === undefined) {
    console.log("Topic not found")
    return
  }

  for (const reasoningQuestion of reasoningJson.reasoningQuestions) {
    // Check if question already exists
    const existingQuestion = await db.select().from(reasoningQuestions).where(
      and(
        eq(reasoningQuestions.questionText, reasoningQuestion.questionText),
        eq(reasoningQuestions.topicId, topicId)
      )
    )

    let questionId: string;
    if (existingQuestion?.[0]?.id !== undefined) {
      console.log(`Question "${reasoningQuestion.questionText.substring(0, 30)}..." already exists`)
      questionId = existingQuestion[0].id;
    } else {
      // Create the reasoning question
      questionId = generateId(21)
      await db.insert(reasoningQuestions).values({
        id: questionId,
        questionText: reasoningQuestion.questionText,
        questionImage: reasoningQuestion.questionImage,
        answerText: reasoningQuestion.answerText, 
        correctAnswers: reasoningQuestion.correctAnswers,
        answerImage: reasoningQuestion.answerImage,
        numberOfSteps: reasoningQuestion.numberOfSteps,
        topicId: topicId,
      })
    }

    // Check and create answer options
    for (const option of reasoningQuestion.answerOptions) {
      const existingOption = await db.select().from(reasoningAnswerOptions).where(
        and(
          eq(reasoningAnswerOptions.questionId, questionId),
          eq(reasoningAnswerOptions.id, option.id)
        )
      )

      if (existingOption?.[0]?.id === undefined) {
        await db.insert(reasoningAnswerOptions).values({
          id: option.id,
          questionId: questionId,
          optionText: option.optionText,
          optionImage: option.optionImage,
        })
      }
    }

    // Check and create pathways and steps
    for (const pathway of reasoningQuestion.pathways) {
      // Check if a similar pathway exists by comparing its steps
      const existingPathways = await db.select().from(reasoningPathway).where(
        eq(reasoningPathway.questionId, questionId)
      )

      let pathwayExists = false;
      for (const existingPathway of existingPathways) {
        const existingSteps = await db.select().from(reasoningPathwayStep).where(
          eq(reasoningPathwayStep.pathwayId, existingPathway.id)
        )

        if (existingSteps.length > 0) {
          pathwayExists = true;
          break;
        }
      }

      if (!pathwayExists) {
        const pathwayId = generateId(21)
        await db.insert(reasoningPathway).values({
          id: pathwayId,
          questionId: questionId,
        })

        // Create the steps for this pathway
        for (const step of pathway.steps) {
          // Check if the step already exists
          const existingStep = await db.select().from(reasoningPathwayStep).where(
            and(
              eq(reasoningPathwayStep.pathwayId, pathwayId),
              eq(reasoningPathwayStep.answerOptionId, step.answerOptionId)
            )
          ) 

          if (existingStep?.[0]?.id === undefined) {
            await db.insert(reasoningPathwayStep).values({
              id: generateId(21),
              pathwayId: pathwayId,
              answerOptionId: step.answerOptionId,
              stepNumber: step.stepNumber,
              isCorrect: step.isCorrect,
              replacementOptionId: step.replacementOptionId,
            })
          }
        }
      }
    }
  }
}

async function createReasoningAssignmentFromTopic() {
  // Parameters for assignment creation
  const topicId = "yyyah4hvk5r7188h7mgkk";
  const assignmentName = "Work, Energy and Power Assignment";

  // Check if assignment already exists
  const existingAssignment = await db.select().from(reasoningAssignments).where(
    and(
      eq(reasoningAssignments.topicId, topicId),
      eq(reasoningAssignments.name, assignmentName)
    )
  );

  if (existingAssignment?.[0]?.id !== undefined) {
    console.log(`Assignment "${assignmentName}" already exists`)
    return
  }

  const assignmentId = generateId(21);

  // Get all reasoning questions for this topic
  const questionList = await db.select().from(reasoningQuestions).where(
    and(
      eq(reasoningQuestions.topicId, topicId),
      eq(reasoningQuestions.isDeleted, false)
    )
  );

  // Create the assignment
  await db.insert(reasoningAssignments).values({
    id: assignmentId,
    topicId: topicId,
    name: "Work, Energy and Power Assignment", 
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Add questions to the assignment
  for (let i = 0; i < questionList.length; i++) {
    const questionId = questionList[i]?.id;
    if (questionId) {
      await db.insert(reasoningQuestionToAssignment).values({
        id: generateId(21),
        questionId: questionId,
        assignmentId: assignmentId,
        order: i + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }
}