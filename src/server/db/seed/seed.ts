/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "..";
import {  
  conceptListConcepts,
  conceptLists, 
  concepts, 
} from "../schema/concept";
import { and, eq } from "drizzle-orm";
import { generateId } from "lucia";
import { answers, questions, questionToAssignment } from "../schema/questions";

import { courses, subjects, topics } from "../schema/subject";
import { emailsToPreload } from './emailsToPreload'
import { preloadedUsers } from "../schema/user";
import { Roles } from "@/lib/constants";

type QuestionType = {
  id: string,
  question: string,
  lambdaUrl: string,
  topicId: string,
  image: string,
} 

import json from "./work_energy_power.json";
import reasoningJson from "./reasoning/work_energy_power.json";
import { reasoningAnswerOptions, reasoningPathway, reasoningPathwayStep, reasoningQuestions, reasoningQuestionToAssignment } from "../schema/reasoningQuestions";
import { reasoningAssignments } from "../schema/reasoningAssignment";

async function createQuestionsAndConceptListFromJson() {

  const topicId = "yyyah4hvk5r7188h7mgkk";

  const topic = await db.select().from(topics).where(
    eq(topics.id, topicId),
  )

  if(topic?.[0] === undefined || topic[0].conceptListId !== null) {
    console.log("Topic not found or already has a concept list")
    return
  }

  // Create a Concept List Object
  const conceptList = {
    id: generateId(21),
    name: json.name,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  await db.insert(conceptLists).values(conceptList)  

  for (const concept of json.concepts) {
    // Check if concept already exists
    const existingConcept = await db.select().from(concepts).where(
      eq(concepts.text, concept),
    )
    if (existingConcept?.[0]?.id === undefined) {
      const conceptId = generateId(21)
      await db.insert(concepts).values({
        id: conceptId,
        text: concept,
      })
      await db.insert(conceptListConcepts).values({
        id: generateId(21),
        conceptListId: conceptList.id,
        conceptId: conceptId,
      })
    } else {
      await db.insert(conceptListConcepts).values({
        id: generateId(21),
        conceptListId: conceptList.id,
        conceptId: existingConcept[0].id,
      })
    }
  }
  
  // Add conceptList ID to topic
  await db.update(topics).set({
    conceptListId: conceptList.id,
  }).where(
    eq(topics.id, topicId),
  )

  // Create the questions object
  for (const question of json.questions) {
    const questionId = generateId(21)
    const questionObject:QuestionType = {
      id: questionId,
      question: question.question,
      lambdaUrl: question.lambda_url,
      topicId: topicId,
      image: question.image,
    }
    await db.insert(questions).values(questionObject)
    const answerObject = {
      id: generateId(21),
      questionId: questionId,
      answer: question.answer,
    }
    await db.insert(answers).values(answerObject)
  }
}

async function addQuestionsToAssignmentFromTopic() {

  // Parameters for assignment creation
  const topicId = "yyyah4hvk5r7188h7mgkk";
  const assignmentId = "9pcpaym65ccyj9rtlz6xd";

  const existingQuestions = await db.select().from(questionToAssignment).where(
    eq(questionToAssignment.assignmentId, assignmentId),
  )
  if(existingQuestions.length > 0) {
    console.log("Assignment already has questions")
    return
  }

  const questionList = await db.select().from(questions).where(
    eq(questions.topicId, topicId),
  )

  for (const question of questionList) {
    await db.insert(questionToAssignment).values({
      id: generateId(21),
      questionId: question.id,
      assignmentId: assignmentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

}

async function createCoursesSubjectsAndTopics() {
  const list = [
    {
      name: "Mathematics",
      imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Math.svg",
      courses: [
        {
          name: "AP Statistics",
          topics: []
        },
        {
          name: "Algebra 1",
          topics: []
        },
        {
          name: "Algebra 2",
          topics: []
        },
        {
          name: "Geomery",
          topics: []
        },
        {
          name: "Precalculus",
          topics: []
        },
        {
          name: "Statistics",
          topics: []
        },
        {
          name: "Calculus A/B",
          topics: []
        },
        {
          name: "Calculus B/C",
          topics: []
        },
        {
          name: "IB DP Mathematics: Analysis and Approaches (SL)",
          topics: []
        },
        {
          name: "IB DP Mathematics: Analysis and Approaches (HL)",
          topics: []
        },
        {
          name: "IB DP Mathematics: Applications and Interpretation (SL)",
          topics: []
        },
        {
          name: "IB DP Mathematics: Applications and Interpretation (HL)",
          topics: []
        },
        {
          name: "IB MYP Standard Mathematics",
          topics: []
        },
        {
          name: "IB MYP Extended Mathematics",
          topics: []
        },
        {
          name: "Mathematics",
          topics: [
            {
              name: "Algebraic Expressions",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Algebraic+Expressions.png"
            },
            {
              name: "Quadratic Equations",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Quadratic+Equations.png"
            },
            {
              name: "Functions",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Functions.png"
            },
            {
              name: "Complex Numbers",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Complex+Numbers.png"
            },
            {
              name: "Trigonometry",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Trigonometry.png"
            },
            {
              name: "Limits and Continuity",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Limits+and+Continuity.png"
            },
            {
              name: "Differentiation",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Differentiation.png"
            },
            {
              name: "Integration",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Integration.png"
            },
            {
              name: "Probability",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Probability.png"
            },
            {
              name: "Distributions",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Distributions.png"
            }
          ]
        }
      ]
    },
    {
      name: "Physics",
      imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Physics.svg",
      courses: [
        {
          name: "AP Physics C: Electricity and Magnetism",
          topics: [
            {
              name: "Electric Charge",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Electric+Charge.png"
            },
          ]
        },
        {
          name: "AP Physics C: Mechanics",
          topics: []
        },
        {
          name: "AP Physics 1 - Algebra Based",
          topics: []
        },
        {
          name: "AP Physics 2: Algebra Based",
          topics: []
        },
        {
          name: "AP Physics C: Mechanics",
          topics: []
        },
        {
          name: "Physics",
          topics: [
            {
              name: "Kinematics",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Kinematics.png"
            },
            {
              name: "Forces and Momentum",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Forces+and+Momentum.png"
            },
            {
              name: "Work, Energy and Power",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Work%2C+Energy+and+Power.png"
            },
            {
              name: "Gravitational Fields",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Gravitational+Fields.png"
            },
            {
              name: "Electric Charge",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Electric+Charge.png"
            },
            {
              name: "Magnetic Fields",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Magnetic+Fields.png"
            },
            {
              name: "Thermal Energy Transfer",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Thermal+Energy+Transfer.png"
            },
            {
              name: "Gas Laws",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Gas+Laws.png"
            },
            {
              name: "Wave Model",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Wave+Model.png"
            },
            {
              name: "Wave Phenomena",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Wave+Phenomena.png"
            },
            {
              name: "Structure of the Atom",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Structure+of+the+Atom.png"
            },
          ]
        },
        {
          name: "Physics Standard",
          topics: []
        },
        {
          name: "Physics Honors",
          topics: []
        },
        {
          name: "IB Physics SL",
          topics: [
            {
              name: "Kinematics",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Kinematics.png"
            },
            {
              name: "Forces and Momentum",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Forces+and+Momentum.png"
            },
            {
              name: "Work, Energy and Power",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Work%2C+Energy+and+Power.png"
            },
            {
              name: "Gravitational Fields",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Gravitational+Fields.png"
            },
            {
              name: "Electric Charge",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Electric+Charge.png"
            },
            {
              name: "Magnetic Fields",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Magnetic+Fields.png"
            },
            {
              name: "Thermal Energy Transfer",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Thermal+Energy+Transfer.png"
            },
            {
              name: "Gas Laws",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Gas+Laws.png"
            },
            {
              name: "Wave Model",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Wave+Model.png"
            },
            {
              name: "Wave Phenomena",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Wave+Phenomena.png"
            },
            {
              name: "Structure of the Atom",
              imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Structure+of+the+Atom.png"
            },
          ]
        },
        {
          name: "IB Physics HL",
          topics: []
        },
        {
          name: "Conceptual Physics (Regular C)",
          topics: []
        },
      ]
    },
    {
      name: "Chemistry",
      imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Chemistry.svg",
      courses: [
        {
          name: "Chemistry Standard",
          topics: []
        },
        {
          name: "Chemistry Honors",
          topics: []
        },
        {
          name: "IB Chemistry SL",
          topics: []
        },
        {
          name: "IB Chemistry HL",
          topics: []
        },
      ]
    },
    {
      name: "Biology",
      imageUrl: "https://converge-ira-project.s3.ap-south-1.amazonaws.com/Biology.svg",
      courses: [
        {
          name: "Biology Standard",
          topics: []
        },
        {
          name: "Biology Honors",
          topics: []
        },
        {
          name: "IB Biology SL",
          topics: []
        },
        {
          name: "IB Biology HL",
          topics: []
        },
      ]
    }
  ]

  for (const subject of list) {

    const existingSubject = await db.selectDistinct().from(subjects).where(
      eq(subjects.name, subject.name),
    )

    let subjectId = generateId(21);

    if (existingSubject?.[0]?.id === undefined) {
      await db.insert(subjects).values({
        id: subjectId,
        name: subject.name,
      })
    } else {
      // Update fields if needed
      subjectId = existingSubject[0].id
    }
  

    for (const course of subject.courses) {
      
      const existingCourse = await db.selectDistinct().from(courses).where(
        and(
          eq(courses.name, course.name),
          eq(courses.subjectId, subjectId),
        )
      )

      let courseId = generateId(21);
      if (existingCourse?.[0]?.id === undefined) {
        await db.insert(courses).values({
          id: courseId,
          name: course.name,
          subjectId: subjectId,
        })
      } else {
        // Update fields if needed
        courseId = existingCourse[0].id
      }

      for (const topic of course.topics) {
        
        const existingTopic = await db.selectDistinct().from(topics).where(
          and(
            eq(topics.name, topic.name),
            eq(topics.courseId, courseId),
          )
        )

        if (existingTopic?.[0]?.id === undefined) {
          await db.insert(topics).values({
            id: generateId(21),
            name: topic.name,
            courseId: courseId,
            imageUrl: topic.imageUrl,
          });
        } else {
          // Update fields if needed
        }
      }
    }
    
  }
}

async function uploadPreloadedUsers() {
  for(const email of emailsToPreload) {
    await db.insert(preloadedUsers).values({
      id: generateId(21),
      email: email,
      role: Roles.Student,
    }).onConflictDoNothing({ target: preloadedUsers.email })
  }
}

async function createReasoningQuestionsFromJson() {
  const topicId = "ll3dh4ahr5eseomk70lun";
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
  const topicId = "ll3dh4ahr5eseomk70lun";
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

void createReasoningQuestionsFromJson();
// void createReasoningAssignmentFromTopic();

// void createCoursesSubjectsAndTopics();
// void createQuestionsAndConceptListFromJson();

// void addQuestionsToAssignmentFromTopic();
// void uploadPreloadedUsers();