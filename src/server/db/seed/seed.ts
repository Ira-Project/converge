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

async function createQuestionsAndConceptListFromJson() {

  const topicId = "hr1g0lm4lalm2zrft7f26";

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
  const topicId = "2";
  const assignmentId = "iVE91v6Zl5PuBwOXni8P4";

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


// void createCoursesSubjectsAndTopics();

void createQuestionsAndConceptListFromJson();

// void addQuestionsToAssignmentFromTopic();
// void uploadPreloadedUsers();
