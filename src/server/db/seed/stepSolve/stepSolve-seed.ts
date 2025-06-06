/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "../..";
import { and, eq, not, isNull, inArray } from "drizzle-orm";
import { generateId } from "lucia";

import { topics } from "../../schema/subject";
import { classrooms, usersToClassrooms } from "../../schema/classroom";

import { stepSolveQuestions, stepSolveQuestionToAssignment, stepSolveStep, stepSolveStepConcepts, stepSolveStepOptions } from "../../schema/stepSolve/stepSolveQuestions";
import { stepSolveAssignmentAttempts, stepSolveAssignments, stepSolveAssignmentTemplates } from "../../schema/stepSolve/stepSolveAssignment";
import { stepSolveQuestionAttempts, stepSolveQuestionAttemptSteps } from "../../schema/stepSolve/stepSolveQuestionAttempts";
import { activity, activityToAssignment } from "../../schema/activity";
import { ActivityType, Roles } from "@/lib/constants";
import { conceptTracking } from "../../schema/concept";
import { concepts } from "../../schema/concept";
import { knowledgeZapQuestionAttempts, knowledgeZapQuestionsToConcepts } from "../../schema/knowledgeZap/knowledgeZapQuestions";
import { knowledgeZapQuestions } from "../../schema/knowledgeZap/knowledgeZapQuestions";

export async function createStepSolveAssignment(topicName: string) {
  const { default: json } = await import( `./${topicName}.json`, { assert: { type: "json" } });

  const id = process.env.ENVIRONMENT === "prod" ? json.id : json.id;

  console.log("Creating step solve assignment", json.name);

  const topic = await db.select().from(topics).where(
    eq(topics.name, json.name as string),
  )

  if(topic?.[0] === undefined) {
    console.log("Topic not found")
    return
  }

  console.log("Topic found", topic[0].id);

  const existingAssignment = await db.select().from(stepSolveAssignments).where(eq(stepSolveAssignments.id, id as string));

  let stepSolveAssignment;

  if (existingAssignment.length > 0) {
    console.log("Step Solve assignment already exists");
    stepSolveAssignment = existingAssignment[0];
  } else {
    console.log("Creating step solve assignment");
    const ssa = await db.insert(stepSolveAssignments).values({
      id: id as string,
      name: json.name as string,
      description: "Step Solve",
      topicId: topic[0].id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning({
      id: stepSolveAssignments.id,
    });
    stepSolveAssignment = ssa[0];
  } 

  if(!stepSolveAssignment?.id) {
    throw new Error("Failed to create step solve assignment");
  }


  for (const stepSolveQuestion of json.questions) {
    // Check if question already exists
    const existingQuestion = await db.select().from(stepSolveQuestions).where(
      and(
        eq(stepSolveQuestions.questionText, stepSolveQuestion.questionText as string),
        eq(stepSolveQuestions.topicId, topic[0].id)
      )
    )

    let questionId: string;
    if (existingQuestion?.[0]?.id !== undefined) {
      console.log(`Question "${(stepSolveQuestion.questionText as string).substring(0, 30)}..." already exists`)
      questionId = existingQuestion[0].id;
    } else {
      // Create the step solve question
      console.log("Creating step solve question", (stepSolveQuestion.questionText as string).substring(0, 30));
      questionId = generateId(21)
      await db.insert(stepSolveQuestions).values({
        id: questionId,
        questionText: stepSolveQuestion.questionText,
        questionImage: stepSolveQuestion.questionImage,
        topicId: topic[0].id,
      })
    }

    // Check and create steps
    console.log("Creating step solve steps", questionId);
    for (const [index, step] of stepSolveQuestion.steps.entries()) {
      const existingStep = await db.select().from(stepSolveStep).where(
        and(
          eq(stepSolveStep.questionId, questionId),
          eq(stepSolveStep.id, step.id as string)
        )
      )
      
      if (existingStep?.[0]?.id === undefined) {
        console.log("Creating step solve step", step.stepText.substring(0, 30));
        await db.insert(stepSolveStep).values({
          id: step.id,
          questionId: questionId,
          stepText: step.stepText,
          stepTextPart2: step?.stepText2 ?? undefined,
          stepImage: step.stepImage,
          stepNumber: index + 1,
          stepSolveAnswer: step.stepSolveAnswer ?? undefined,
          stepSolveAnswerUnits: step.stepSolveAnswerUnits ?? undefined,
        })
      } else {
        console.log("Step solve step already exists", step.stepText.substring(0, 30));
      }

      // Check and create options
      console.log("Creating step solve step options", step.stepText.substring(0, 30));
      for (const option of step.options) {
        const existingOption = await db.select().from(stepSolveStepOptions).where(
          and(
            eq(stepSolveStepOptions.stepId, step.id as string),
            eq(stepSolveStepOptions.optionText, option.optionText as string)
          )
        )
        if (existingOption?.[0]?.id === undefined) {
          console.log("Creating step solve step option", option.optionText.substring(0, 30));
          await db.insert(stepSolveStepOptions).values({
            id: generateId(21),
            stepId: step.id,
            optionText: option.optionText,
            optionImage: option.optionImage,
            isCorrect: option.isCorrect,
          })
        } else {
          console.log("Step solve step option already exists", option.optionText.substring(0, 30));
        }
      }

      // Check and create concepts
      console.log("Creating step solve step concepts", step.stepText.substring(0, 30));
      for (const concept of step.stepConcepts) {
        const existingStepSolveStepConcept = await db.select().from(stepSolveStepConcepts).where(
          and(
            eq(stepSolveStepConcepts.stepId, step.id as string),
            eq(stepSolveStepConcepts.conceptId, concept as string)
          )
        )
        if (existingStepSolveStepConcept?.[0]?.id === undefined) {
          console.log("Creating step solve step concept", concept.substring(0, 30));
          await db.insert(stepSolveStepConcepts).values({
            id: generateId(21),
            stepId: step.id as string,
            conceptId: concept,
          })
        } else {
          console.log("Step solve step concept already exists", concept.substring(0, 30));
        }
      }
    }

    console.log("Creating step solve question to assignment", questionId, stepSolveAssignment.id);
    const existingStepSolveQuestionToAssignment = await db.select().from(stepSolveQuestionToAssignment).where(
      and(
        eq(stepSolveQuestionToAssignment.assignmentId, stepSolveAssignment.id),
        eq(stepSolveQuestionToAssignment.questionId, questionId)
      )
    )
    if (existingStepSolveQuestionToAssignment?.[0]?.id === undefined) {
      await db.insert(stepSolveQuestionToAssignment).values({
        id: generateId(21),
        assignmentId: stepSolveAssignment.id,
        questionId: questionId,
      })
    } else {
      console.log("Step solve question to assignment already exists", questionId, stepSolveAssignment.id);
    }

  }

  const classes= await db.select().from(classrooms);
  for(const classroom of classes) {
    // Check if activity already exists in the classroom

    console.log("Checking if activity exists in classroom", topic[0].id, classroom.id);

    const existingActivity = await db.select().from(activity).where(
      and(
        eq(activity.topicId, topic[0].id),
        eq(activity.classroomId, classroom.id),
        eq(activity.typeText, ActivityType.StepSolve)
      )
    )

    console.log("Existing activity", existingActivity);

    // If activity does not exist, create it
    if(existingActivity.length === 0) {
      console.log("Adding assignment to classroom. Creating activity", stepSolveAssignment.id, classroom.id);
      const activityId = generateId(21);
      await db.insert(activity).values({
        id: activityId,
        classroomId: classroom.id,
        name: json.name as string,
        topicId: topic[0].id,
        typeText: ActivityType.StepSolve,
        order: 0,
        points: 100,
      })
      console.log("Adding assignment to activity", stepSolveAssignment.id, activityId);
      await db.insert(activityToAssignment).values({
        id: generateId(21),
        activityId: activityId,
        stepSolveAssignmentId: stepSolveAssignment.id,
      })
    } else {
      const assignmentToActivities = await db.select().from(activityToAssignment).where(
        and(
          eq(activityToAssignment.activityId, existingActivity[0]?.id ?? ""),
          eq(activityToAssignment.stepSolveAssignmentId, stepSolveAssignment.id)
        )
      );
      if(assignmentToActivities.length === 0) {
        console.log("Adding assignment to classroom. Activity already exists, but no assignment to activities", stepSolveAssignment.id, classroom.id);
        await db.insert(activityToAssignment).values({
          id: generateId(21),
          activityId: existingActivity[0]?.id ?? "",
          stepSolveAssignmentId: stepSolveAssignment.id,
        })
      } else {
        console.log("Assignment to activity already exists", stepSolveAssignment.id, existingActivity[0]?.id ?? "");
      }
    }
  }

  console.log("Step solve creation complete");
  console.log("--------------------------------");
}

export async function createStepSolveToAssignment() {
  const activities = await db.select().from(activity).where(eq(activity.typeText, ActivityType.StepSolve));
  for(const activity of activities) {
    const assignmentToActivities = await db.select().from(activityToAssignment).where(eq(activityToAssignment.activityId, activity.id));
    if(assignmentToActivities.length === 0) {
      console.log("Activity has no assignment", activity.id, activity.classroomId);
      console.log("Adding assignment to activity", activity.id);
      await db.insert(activityToAssignment).values({
        id: generateId(21),
        activityId: activity.id,
        stepSolveAssignmentId: activity.assignmentId,
      })
    }
  }
}

export async function deleteStepSolveAssignment(stepSolveAssignmentId: string) {
  //First get the step solve assignment
  const stepSolveAssignment = await db.select().from(stepSolveAssignments).where(eq(stepSolveAssignments.id, stepSolveAssignmentId));
  if (stepSolveAssignment.length === 0) {
    console.log("Step solve assignment not found");
    return;
  }

  const stepSolveQuestionsToAssignment = await db.select().from(stepSolveQuestionToAssignment).where(eq(stepSolveQuestionToAssignment.assignmentId, stepSolveAssignmentId));

  for (const questionToAssignment of stepSolveQuestionsToAssignment) {
    const question = await db.select().from(stepSolveQuestions).where(eq(stepSolveQuestions.id, questionToAssignment.questionId));

    
    console.log("Deleting question to assignment", questionToAssignment.id);
    await db.delete(stepSolveQuestionToAssignment).where(eq(stepSolveQuestionToAssignment.id, questionToAssignment.id));

    if (question[0]?.id) {
      const steps = await db.select().from(stepSolveStep).where(eq(stepSolveStep.questionId, question[0].id));

      //Delete the steps and options
      for (const step of steps) {
        
        const stepAttempts = await db.select().from(stepSolveQuestionAttemptSteps).where(eq(stepSolveQuestionAttemptSteps.stepSolveStepId, step.id));

        for (const attempt of stepAttempts) {
          console.log("Deleting step attempt", attempt.id);
          await db.delete(stepSolveQuestionAttemptSteps).where(eq(stepSolveQuestionAttemptSteps.id, attempt.id));
        }

        console.log("Deleting step options", step.id);
        await db.delete(stepSolveStepOptions).where(eq(stepSolveStepOptions.stepId, step.id));

        console.log("Deleting step concepts", step.id);
        await db.delete(stepSolveStepConcepts).where(eq(stepSolveStepConcepts.stepId, step.id));

        console.log("Deleting step", step.id, step.stepText);
        await db.delete(stepSolveStep).where(eq(stepSolveStep.id, step.id));
      }

      //Delete the question attempts
      console.log("Deleting question attempts", question[0].id);
      await db.delete(stepSolveQuestionAttempts).where(eq(stepSolveQuestionAttempts.questionId, question[0].id));
      console.log("Deleting question", question[0].id, question[0].questionText);
      await db.delete(stepSolveQuestions).where(eq(stepSolveQuestions.id, question[0].id));
    }
  }

  console.log("Deleting attempts", stepSolveAssignmentId);
  await db.delete(stepSolveAssignmentAttempts).where(eq(stepSolveAssignmentAttempts.assignmentId, stepSolveAssignmentId));

  console.log("Deleting activity to assignment", stepSolveAssignmentId);
  await db.delete(activityToAssignment).where(eq(activityToAssignment.stepSolveAssignmentId, stepSolveAssignmentId));

  // Delete the assignment
  console.log("Deleting assignment", stepSolveAssignmentId);
  await db.delete(stepSolveAssignments).where(eq(stepSolveAssignments.id, stepSolveAssignmentId));

  const activities = await db.select().from(activity).where(
    and(
      eq(activity.topicId, stepSolveAssignment[0]?.topicId ?? ""), 
      eq(activity.typeText, ActivityType.StepSolve)
    )
  );
  for (const act of activities) {
    if(!act.id) {
      console.log("Activity id not found");
      continue;
    }

    // Get assignment to activities. If there are none, delete the activity
    const assignmentToActivities = await db.select().from(activityToAssignment).where(eq(activityToAssignment.activityId, act.id));
    if(assignmentToActivities.length === 0) {
      console.log("Deleting activity", act.id);
      await db.delete(activity).where(eq(activity.id, act.id));
    }
  } 

  console.log("Step solve deletion complete");
  console.log("--------------------------------");

}

export async function updateStepSolveAssignmentAttempts() {
  const ssa = await db.select().from(stepSolveAssignmentAttempts).where(not(isNull(stepSolveAssignmentAttempts.submittedAt)));

  for (const attempt of ssa) {
    if(!attempt.activityId) {
      console.log("Activity id not found for step solve assignment attempt", attempt.id);
      continue;
    }

    const act = await db.select().from(activity).where(eq(activity.id, attempt.activityId));
    if(!act[0]?.assignmentId) {
      console.log("Activity not found for step solve assignment attempt", attempt.id);
      continue;
    }

    const assignmentQuestions = await db.select().from(stepSolveQuestionToAssignment).where(eq(stepSolveQuestionToAssignment.assignmentId, act[0].assignmentId));

    const questions = await db.select().from(stepSolveQuestions).where(inArray(stepSolveQuestions.id, assignmentQuestions.map(q => q.questionId)));
    const steps = await db.select().from(stepSolveStep).where(inArray(stepSolveStep.questionId, questions.map(q => q.id)));
    const stepsTotal = steps.length;

    console.log("Updating step solve assignment attempt", attempt.id);
    const qa = await db.select().from(stepSolveQuestionAttempts).where(eq(stepSolveQuestionAttempts.attemptId, attempt.id));
    if(!qa[0]) {
      console.log("No question attempts found for step solve assignment attempt", attempt.id);
      continue;
    }
    let totalStepsCompleted = 0;
    const completion = [];
  
    for (const q of qa) {
      const question = await db.select().from(stepSolveQuestions).where(eq(stepSolveQuestions.id, q.questionId)); 
      if(!question[0]) {
        console.log("No question found for step solve assignment attempt", attempt.id);
        continue;
      }
      const steps = await db.select().from(stepSolveStep).where(eq(stepSolveStep.questionId, question[0].id));
      totalStepsCompleted += q.stepsCompleted ?? 0;
      const completionRate = (q.stepsCompleted ?? 0) / steps.length;
      completion.push(completionRate);
    }
    const completionRate = completion.reduce((acc, curr) => acc + curr, 0) / questions.length;
    await db.update(stepSolveAssignmentAttempts).set({
      stepsCompleted: totalStepsCompleted,
      stepsTotal: stepsTotal,
      completionRate: completionRate,
    }).where(eq(stepSolveAssignmentAttempts.id, attempt.id));
  }
}

export async function addAssignmentIdToAttempts() {
  const attempts = await db.select().from(stepSolveAssignmentAttempts);
  for (const attempt of attempts) {
    if(!attempt.activityId) {
      console.log("Activity id not found for step solve assignment attempt", attempt.id);
      continue;
    }
    const assignment = await db.select().from(activityToAssignment).where(eq(activityToAssignment.activityId, attempt.activityId));
    if(!assignment[0]) {
      console.log("Assignment not found for step solve assignment attempt", attempt.id);
      continue;
    }
    if(assignment.length > 1) {
      console.log("Multiple assignments found for step solve assignment attempt", attempt.id);
      continue;
    }
    await db.update(stepSolveAssignmentAttempts).set({
      assignmentId: assignment[0].stepSolveAssignmentId
    }).where(eq(stepSolveAssignmentAttempts.id, attempt.id));
  }
}

export async function addConceptsToStepSolveSteps(topicName: string) {
  const { default: json } = await import( `./${topicName}.json`, { assert: { type: "json" } });

  const topic = await db.select().from(topics).where(eq(topics.name, json.name as string))

  if(!topic[0]?.id) {
    console.log("Topic not found", json.name)
    return
  }

  for (const question of json.questions) {
    for (const step of question.steps) {
      for (const concept of step.stepConcepts) {
        // Check if step concept already exists
        const existingStepConcept = await db.select().from(stepSolveStepConcepts).where(
          and(
            eq(stepSolveStepConcepts.stepId, step.id as string), 
            eq(stepSolveStepConcepts.conceptId, concept as string)
          )
        );
        if(existingStepConcept[0]) {
          console.log("Step concept already exists", step.id, concept)
          continue;
        }
        await db.insert(stepSolveStepConcepts).values({
          id: generateId(21),
          stepId: step.id,
          conceptId: concept,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
    }
  }
  }
}

export async function findConceptsWithoutStepSolveSteps() {
  // Get all concepts that don't have any associated step solve steps
  const conceptsWithoutSteps = await db
    .select({
      id: concepts.id,
      text: concepts.text,
    })
    .from(concepts)
    .leftJoin(
      stepSolveStepConcepts,
      eq(stepSolveStepConcepts.conceptId, concepts.id)
    )
    .where(isNull(stepSolveStepConcepts.id));

  if (conceptsWithoutSteps.length === 0) {
    console.log("All concepts have step solve steps.");
    return [];
  }

  console.log(`Found ${conceptsWithoutSteps.length} concepts without step solve steps:`);
  conceptsWithoutSteps.forEach(concept => {
    console.log(`- Concept ID: ${concept.id}, Text: ${concept.text}`);
  });
} 

export async function findStepSolveStepsWithoutConcepts () {
  // Get all step solve steps that don't have any associated concepts
  const stepsWithoutConcepts = await db
    .select({
      id: stepSolveStep.id,
      stepText: stepSolveStep.stepText,
    })
    .from(stepSolveStep)
    .leftJoin(
      stepSolveStepConcepts,
      eq(stepSolveStepConcepts.stepId, stepSolveStep.id)
    )
    .where(isNull(stepSolveStepConcepts.id));

  if (stepsWithoutConcepts.length === 0) {
    console.log("All step solve steps have concepts associated.");
    return [];
  }

  console.log(`Found ${stepsWithoutConcepts.length} step solve steps without concepts:`);
  stepsWithoutConcepts.forEach(step => {
    console.log(`- Step ID: ${step.id}, Step Text: ${step.stepText}`);
  });
}

export async function createConceptTrackerForAllStepAttempts() {
  const attempts = await db
    .select({
      userId: stepSolveAssignmentAttempts.userId,
      activityId: stepSolveAssignmentAttempts.activityId,
      classroomId: activity.classroomId,
      conceptId: stepSolveStepConcepts.conceptId,
      stepId: stepSolveQuestionAttemptSteps.stepSolveStepId,
      isCorrect: stepSolveQuestionAttemptSteps.isCorrect,
      createdAt: stepSolveQuestionAttemptSteps.createdAt
    })
    .from(stepSolveQuestionAttemptSteps)
    .innerJoin(
      stepSolveQuestionAttempts,
      eq(stepSolveQuestionAttemptSteps.questionAttemptId, stepSolveQuestionAttempts.id)
    )
    .innerJoin(
      stepSolveAssignmentAttempts,
      eq(stepSolveQuestionAttempts.attemptId, stepSolveAssignmentAttempts.id)
    )
    .innerJoin(
      stepSolveStepConcepts,
      eq(stepSolveQuestionAttemptSteps.stepSolveStepId, stepSolveStepConcepts.stepId)
    )
    .innerJoin(
      activity,
      eq(stepSolveAssignmentAttempts.activityId, activity.id)
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
    Step: attempt.stepId?.substring(0, 8) + "...",
    Concept: attempt.conceptId?.substring(0, 8) + "...",
    Correct: attempt.isCorrect ? "✓" : "✗"
  })));

  // Create concept tracking records for each attempt
  for (const attempt of attempts) {
    await db.insert(conceptTracking).values({
      id: generateId(21),
      isCorrect: attempt.isCorrect ?? false,
      conceptId: attempt.conceptId,
      userId: attempt.userId,
      classroomId: attempt.classroomId,
      activityType: ActivityType.StepSolve,
      createdAt: attempt.createdAt,
      updatedAt: attempt.createdAt,
    });
  }
}

export async function createGeneratedStepSolveAssignment(topicName: string, userId: string) {
  const { default: json } = await import( `./${topicName}.json`, { assert: { type: "json" } });

  const id = process.env.ENVIRONMENT === "prod" ? json.id : json.id;

  console.log("Creating generated step solve assignment", json.name);

  const topic = await db.select().from(topics).where(
    eq(topics.name, json.name as string),
  )

  if(topic?.[0] === undefined) {
    console.log("Topic not found")
    return
  }

  console.log("Topic found", topic[0].id);

  const existingAssignment = await db.select().from(stepSolveAssignments).where(eq(stepSolveAssignments.id, id as string));

  let stepSolveAssignment;

  if (existingAssignment.length > 0) {
    console.log("Generated Step Solve assignment already exists");
    stepSolveAssignment = existingAssignment[0];
  } else {
    console.log("Creating generated step solve assignment");
    const ssa = await db.insert(stepSolveAssignments).values({
      id: id as string,
      name: json.name as string,
      description: "Step Solve",
      topicId: topic[0].id,
      generated: true,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning({
      id: stepSolveAssignments.id,
    });
    stepSolveAssignment = ssa[0];
  } 

  if(!stepSolveAssignment?.id) {
    throw new Error("Failed to create generated step solve assignment");
  }

  for (const stepSolveQuestion of json.questions) {
    // Check if question already exists
    const existingQuestion = await db.select().from(stepSolveQuestions).where(
      and(
        eq(stepSolveQuestions.questionText, stepSolveQuestion.questionText as string),
        eq(stepSolveQuestions.topicId, topic[0].id)
      )
    )

    let questionId: string;
    if (existingQuestion?.[0]?.id !== undefined) {
      console.log(`Question "${(stepSolveQuestion.questionText as string).substring(0, 30)}..." already exists`)
      questionId = existingQuestion[0].id;
    } else {
      // Create the step solve question
      console.log("Creating step solve question", (stepSolveQuestion.questionText as string).substring(0, 30));
      questionId = generateId(21)
      await db.insert(stepSolveQuestions).values({
        id: questionId,
        questionText: stepSolveQuestion.questionText,
        questionImage: stepSolveQuestion.questionImage,
        topicId: topic[0].id,
      })
    }

    // Check and create steps
    console.log("Creating step solve steps", questionId);
    for (const [index, step] of stepSolveQuestion.steps.entries()) {
      const existingStep = await db.select().from(stepSolveStep).where(
        and(
          eq(stepSolveStep.questionId, questionId),
          eq(stepSolveStep.id, step.id as string)
        )
      )
      
      if (existingStep?.[0]?.id === undefined) {
        console.log("Creating step solve step", step.stepText.substring(0, 30));
        await db.insert(stepSolveStep).values({
          id: step.id,
          questionId: questionId,
          stepText: step.stepText,
          stepTextPart2: step?.stepText2 ?? undefined,
          stepImage: step.stepImage,
          stepNumber: index + 1,
          stepSolveAnswer: step.stepSolveAnswer ?? undefined,
          stepSolveAnswerUnits: step.stepSolveAnswerUnits ?? undefined,
        })
      } else {
        console.log("Step solve step already exists", step.stepText.substring(0, 30));
      }

      // Check and create options
      console.log("Creating step solve step options", step.stepText.substring(0, 30));
      for (const option of step.options) {
        const existingOption = await db.select().from(stepSolveStepOptions).where(
          and(
            eq(stepSolveStepOptions.stepId, step.id as string),
            eq(stepSolveStepOptions.optionText, option.optionText as string)
          )
        )
        if (existingOption?.[0]?.id === undefined) {
          console.log("Creating step solve step option", option.optionText.substring(0, 30));
          await db.insert(stepSolveStepOptions).values({
            id: generateId(21),
            stepId: step.id,
            optionText: option.optionText,
            optionImage: option.optionImage,
            isCorrect: option.isCorrect,
          })
        } else {
          console.log("Step solve step option already exists", option.optionText.substring(0, 30));
        }
      }

      // Check and create concepts
      console.log("Creating step solve step concepts", step.stepText.substring(0, 30));
      for (const concept of step.stepConcepts) {
        const existingStepSolveStepConcept = await db.select().from(stepSolveStepConcepts).where(
          and(
            eq(stepSolveStepConcepts.stepId, step.id as string),
            eq(stepSolveStepConcepts.conceptId, concept as string)
          )
        )
        if (existingStepSolveStepConcept?.[0]?.id === undefined) {
          console.log("Creating step solve step concept", concept.substring(0, 30));
          await db.insert(stepSolveStepConcepts).values({
            id: generateId(21),
            stepId: step.id as string,
            conceptId: concept,
          })
        } else {
          console.log("Step solve step concept already exists", concept.substring(0, 30));
        }
      }
    }

    console.log("Creating step solve question to assignment", questionId, stepSolveAssignment.id);
    const existingStepSolveQuestionToAssignment = await db.select().from(stepSolveQuestionToAssignment).where(
      and(
        eq(stepSolveQuestionToAssignment.assignmentId, stepSolveAssignment.id),
        eq(stepSolveQuestionToAssignment.questionId, questionId)
      )
    )
    if (existingStepSolveQuestionToAssignment?.[0]?.id === undefined) {
      await db.insert(stepSolveQuestionToAssignment).values({
        id: generateId(21),
        assignmentId: stepSolveAssignment.id,
        questionId: questionId,
      })
    } else {
      console.log("Step solve question to assignment already exists", questionId, stepSolveAssignment.id);
    }
  }

  // Get classrooms where the user is a teacher
  const teacherClassrooms = await db.select({
    id: classrooms.id,
    name: classrooms.name
  }).from(classrooms)
    .innerJoin(usersToClassrooms, eq(usersToClassrooms.classroomId, classrooms.id))
    .where(
      and(
        eq(usersToClassrooms.userId, userId),
        eq(usersToClassrooms.role, Roles.Teacher),
        eq(usersToClassrooms.isDeleted, false),
        eq(classrooms.isDeleted, false)
      )
    );

  for(const classroom of teacherClassrooms) {
    // Check if activity already exists in the classroom
    console.log("Checking if generated activity exists in classroom", topic[0].id, classroom.id);

    const existingActivity = await db.select().from(activity).where(
      and(
        eq(activity.topicId, topic[0].id),
        eq(activity.classroomId, classroom.id),
        eq(activity.typeText, ActivityType.StepSolve),
        eq(activity.generated, true),
        eq(activity.createdBy, userId)
      )
    )

    console.log("Existing generated activity", existingActivity);

    // If activity does not exist, create it
    if(existingActivity.length === 0) {
      console.log("Adding generated assignment to classroom. Creating activity", stepSolveAssignment.id, classroom.id);
      const activityId = generateId(21);
      await db.insert(activity).values({
        id: activityId,
        classroomId: classroom.id,
        name: json.name as string,
        topicId: topic[0].id,
        typeText: ActivityType.StepSolve,
        order: 0,
        points: 100,
        generated: true,
        createdBy: userId,
      })
      console.log("Adding assignment to activity", stepSolveAssignment.id, activityId);
      await db.insert(activityToAssignment).values({
        id: generateId(21),
        activityId: activityId,
        stepSolveAssignmentId: stepSolveAssignment.id,
      })
    } else {
      const assignmentToActivities = await db.select().from(activityToAssignment).where(
        and(
          eq(activityToAssignment.activityId, existingActivity[0]?.id ?? ""),
          eq(activityToAssignment.stepSolveAssignmentId, stepSolveAssignment.id)
        )
      );
      if(assignmentToActivities.length === 0) {
        console.log("Adding assignment to classroom. Generated activity already exists, but no assignment to activities", stepSolveAssignment.id, classroom.id);
        await db.insert(activityToAssignment).values({
          id: generateId(21),
          activityId: existingActivity[0]?.id ?? "",
          stepSolveAssignmentId: stepSolveAssignment.id,
        })
      } else {
        console.log("Assignment to generated activity already exists", stepSolveAssignment.id, existingActivity[0]?.id ?? "");
      }
    }
  }

  console.log("Generated step solve creation complete");
  console.log("--------------------------------");
}

export async function createStepSolveAssignmentTemplate() {
  console.log("Creating step solve assignment templates...");

  // Get all step solve assignments that are linked to activities
  const assignmentsWithActivities = await db
    .select({
      assignmentId: activityToAssignment.stepSolveAssignmentId,
      assignment: stepSolveAssignments,
      topic: topics,
    })
    .from(activityToAssignment)
    .innerJoin(
      stepSolveAssignments,
      eq(activityToAssignment.stepSolveAssignmentId, stepSolveAssignments.id)
    )
    .innerJoin(
      activity,
      eq(activityToAssignment.activityId, activity.id)
    )
    .innerJoin(
      topics,
      eq(stepSolveAssignments.topicId, topics.id)
    )
    .where(
      and(
        eq(activity.typeText, ActivityType.StepSolve),
        eq(stepSolveAssignments.generated, false) // Only use non-generated assignments as templates
      )
    );

  // Group by topic to collect all assignment IDs
  const topicToAssignmentMap = new Map();
  
  for (const item of assignmentsWithActivities) {
    const topicId = item.topic.id;
    if (!topicToAssignmentMap.has(topicId)) {
      topicToAssignmentMap.set(topicId, {
        assignmentIds: [],
        assignmentIdSet: new Set(), // Track unique IDs
        topic: item.topic,
        sampleAssignment: item.assignment, // Keep one for template naming
      });
    }
    
    // Only add assignment ID if not already present
    const topicData = topicToAssignmentMap.get(topicId);
    if (!topicData.assignmentIdSet.has(item.assignment.id)) {
      topicData.assignmentIdSet.add(item.assignment.id);
      topicData.assignmentIds.push(item.assignment.id);
    }
  }

  console.log(`Found ${topicToAssignmentMap.size} unique topics for template creation`);
  console.log(topicToAssignmentMap);
  

  // Create template assignments for each unique topic
  for (const [topicId, data] of topicToAssignmentMap) {
    const { assignmentIds, topic, sampleAssignment } = data;
    const topicIdString = topicId as string;
    
    // Check if template already exists for this topic (look for assignments with "Template" in name)
    const existingTemplate = await db
      .select()
      .from(stepSolveAssignmentTemplates)
      .where(
        and(
          eq(stepSolveAssignmentTemplates.topicId, topicIdString),
          // Look for template assignments by name pattern
        )
      );

    const hasTemplate = existingTemplate.some(template => 
      template.name?.toLowerCase().includes('template')
    );

    if (hasTemplate) {
      console.log(`Template already exists for topic: ${topic.name}`);
      continue;
    }

    // Create template assignment in the regular assignments table
    const templateId = generateId(21);
    console.log(`Creating template for topic: ${topic.name} with ${assignmentIds.length} source assignments`);
    
    await db.insert(stepSolveAssignmentTemplates).values({
      id: templateId,
      assignmentIds: assignmentIds,
      name: `${sampleAssignment.name} Template`,
      description: `Template for ${topic.name}`,
      topicId: topicIdString,
      generated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Update all source assignments to reference the new template
    for (const assignmentId of assignmentIds) {
      await db.update(stepSolveAssignments)
        .set({ 
          templateId: templateId,
          updatedAt: new Date()
        })
        .where(eq(stepSolveAssignments.id, assignmentId as string));
    }

    console.log(`Template created successfully for topic: ${topic.name} and linked to ${assignmentIds.length} assignments`);
  }

  console.log("Step solve assignment template creation complete");
  console.log("--------------------------------");
}

export async function clearStepSolveAssignmentTemplates() {
  console.log("Clearing step solve assignment templates...");

  try {
    // First, clear all templateId references from stepSolveAssignments
    console.log("Clearing templateId from all step solve assignments...");
    await db.update(stepSolveAssignments)
      .set({ 
        templateId: null,
        updatedAt: new Date()
      });

    // Then, delete all template objects
    console.log("Deleting all step solve assignment templates...");
    await db.delete(stepSolveAssignmentTemplates);

    console.log("All step solve assignment templates cleared successfully");
  } catch (error) {
    console.error("Error clearing step solve assignment templates:", error);
    throw error;
  }

  console.log("Step solve assignment template clearing complete");
  console.log("--------------------------------");
}

export async function updateStepSolveActivityAssignmentIds() {
  console.log("Updating StepSolve activity assignmentId fields with template IDs...");

  try {
    // Get all StepSolve activities
    const stepSolveActivities = await db
      .select()
      .from(activity)
      .where(eq(activity.typeText, ActivityType.StepSolve));

    console.log(`Found ${stepSolveActivities.length} StepSolve activities to update`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const act of stepSolveActivities) {
      // Get the assignment linked to this activity
      const activityToAssignmentRecord = await db
        .select()
        .from(activityToAssignment)
        .where(eq(activityToAssignment.activityId, act.id));

      if (activityToAssignmentRecord.length === 0) {
        console.log(`No assignment found for activity ${act.id} - ${act.name}`);
        skippedCount++;
        continue;
      }

      if (activityToAssignmentRecord.length > 1) {
        console.log(`Multiple assignments found for activity ${act.id} - ${act.name}, using first one`);
      }

      const assignmentId = activityToAssignmentRecord[0]?.stepSolveAssignmentId;
      
      if (!assignmentId) {
        console.log(`No stepSolveAssignmentId found for activity ${act.id} - ${act.name}`);
        skippedCount++;
        continue;
      }

      // Get the assignment to find its templateId
      const assignment = await db
        .select()
        .from(stepSolveAssignments)
        .where(eq(stepSolveAssignments.id, assignmentId));

      if (assignment.length === 0) {
        console.log(`Assignment ${assignmentId} not found for activity ${act.id} - ${act.name}`);
        skippedCount++;
        continue;
      }

      const templateId = assignment[0]?.templateId;

      if (!templateId) {
        console.log(`No templateId found for assignment ${assignmentId} (activity ${act.id} - ${act.name})`);
        skippedCount++;
        continue;
      }

      // Update the activity's assignmentId to the templateId
      await db
        .update(activity)
        .set({ 
          assignmentId: templateId,
          updatedAt: new Date()
        })
        .where(eq(activity.id, act.id));

      console.log(`Updated activity ${act.id} - ${act.name}: assignmentId set to template ${templateId}`);
      updatedCount++;
    }

    console.log(`Update complete: ${updatedCount} activities updated, ${skippedCount} activities skipped`);

  } catch (error) {
    console.error("Error updating StepSolve activity assignmentId fields:", error);
    throw error;
  }

  console.log("StepSolve activity assignmentId update complete");
  console.log("--------------------------------");
}