/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from ".";
import {  
  conceptListConcepts,
  conceptLists, 
  concepts, 
} from "./schema/concept";
import { and, eq } from "drizzle-orm";
import { generateId } from "lucia";
import { answers, questions, questionToAssignment } from "./schema/questions";

import json from "./electric_charge.json";
import { courses, subjects, topics } from "./schema/subject";
import { classrooms } from "./schema/classroom";

type QuestionType = {
  id: string,
  question: string,
  lambdaUrl: string,
  topicId: string,
  image?: string
}


async function createQuestionsAndConceptListFromJson() {

  // Parameters for assignment creation
  const topicId = "01nfgjnqcqsbc9am0nr59";

  // Create a Concept List Object
  const conceptList = {
    id: generateId(21),
    name: json.name,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  await db.insert(conceptLists).values(conceptList)

  const conceptSet = new Set<string>()
  // Iterate through concept list and make master list of concepts
  for (const question of json.Questions) {
    for (const concept_arr of question.required_concepts) { 
      for (const concept of concept_arr) {
        conceptSet.add(concept)
      }
    }
    for(const concept of question.not_required_concepts) {
      conceptSet.add(concept)
    }
  }

  for (const concept of conceptSet) {
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
  for (const question of json.Questions) {
    const questionId = generateId(21)
    const questionObject:QuestionType = {
      id: questionId,
      question: question.Question,
      lambdaUrl: question.lambda_url,
      topicId: topicId,
    }
    if(question.image) {
      questionObject.image = question.image
    }
    await db.insert(questions).values(questionObject)
    for (const answer of question.Answer) {
      const answerObject = {
        id: generateId(21),
        questionId: questionId,
        answer: answer,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      await db.insert(answers).values(answerObject)
    }
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
      courses: [
        {
          name: "AP Statistics",
          topics: [
            {
              name: "Basic Probability"
            }
          ]
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
      courses: [
        {
          name: "AP Physics C: Electricity and Magnetism",
          topics: [
            {
              name: "Electric Charge"
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
              name: "Kinematics"
            },
            {
              name: "Forces and Momentum"
            },
            {
              name: "Work Energy and Power"
            },
            {
              name: "Gravitational Fields"
            },
            {
              name: "Electric Charge"
            },
            {
              name: "Electric and Magnetic Fields"
            },
            {
              name: "Thermal Energy Transfer"
            },
            {
              name: "Gas Laws"
            },
            {
              name: "Wave Model"
            },
            {
              name: "Wave Phenomena"
            },
            {
              name: "Structure of the Atom"
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
        courseId = existingCourse[0].id
      }

      for (const topic of course.topics) {
        
        const existingTopic = await db.selectDistinct().from(topics).where(
          and(
            eq(topics.name, topic.name),
            eq(topics.courseId, courseId),
          )
        )

        if (existingTopic?.[0]?.id !== undefined) {
          continue
        }

        await db.insert(topics).values({
          id: generateId(21),
          name: topic.name,
          courseId: courseId,
        });

      }
    }
    
  }
}

async function deleteClassroom() {
  const classroomId = "6d0wtmkugo5k0imgmo6k6";
  
  await db.delete(classrooms).where(
    eq(classrooms.id, classroomId),
  )
}

void createQuestionsAndConceptListFromJson();