import { db } from ".";
import {  
  conceptListConcepts,
  conceptLists, 
  concepts, 
} from "./schema/concept";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import { assignments } from "./schema/assignment";
import { answers, questions, questionToAssignment } from "./schema/questions";

import json from "./assignment.json";
import { courses, subjects, topics } from "./schema/subject";

type QuestionType = {
  id: string,
  question: string,
  lambdaUrl: string,
  topicId: string,
  image?: string
}


async function createAssignmentFromJson() {

  // Parameters for assignment creation
  const topicId = "2";
  const classroomId = "a301vzft4213hgdir4z0b";
  const assignmentName = "Assignment 1";

  // Create a Concept List Object
  const conceptList = {
    id: generateId(21),
    name: assignmentName,
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
      // TO DO CHECK IF ITS IN LIST AND ADD IF NOT
    }
  }
  
  // Create the assignment object
  const assignment = {
    id: generateId(21),
    name: assignmentName,
    topicId: topicId,
    classroomId: classroomId,
    conceptListId: conceptList.id,
  }

  await db.insert(assignments).values(assignment)

  // Create the questions object
  for (const [index, question] of json.Questions.entries()) {
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
    await db.insert(questionToAssignment).values({
      id: generateId(21),
      order: index,
      questionId: questionId,
      assignmentId: assignment.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

  }
}

async function addQuestionsFromTopic() {

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
      id: 1,
      name: "Mathematics",
      courses: [
        {
          id: 1,
          name: "AP Statistics",
          topics: [
            {
              id: 1,
              name: "Basic Probability"
            }
          ]
        },
        {
          id: 3,
          name: "Algebra 1",
          topics: []
        },
        {
          id: 4,
          name: "Algebra 2",
          topics: []
        },
        {
          id: 5,
          name: "Geomery",
          topics: []
        },
        {
          id: 6,
          name: "Precalculus",
          topics: []
        },
        {
          id: 7,
          name: "Statistics",
          topics: []
        },
        {
          id: 8,
          name: "Calculus A/B",
          topics: []
        },
        {
          id: 9,
          name: "Calculus B/C",
          topics: []
        },
        {
          id: 10,
          name: "IB DP Mathematics: Analysis and Approaches (SL)",
          topics: []
        },
        {
          id: 11,
          name: "IB DP Mathematics: Analysis and Approaches (HL)",
          topics: []
        },
        {
          id: 12,
          name: "IB DP Mathematics: Applications and Interpretation (SL)",
          topics: []
        },
        {
          id: 13,
          name: "IB DP Mathematics: Applications and Interpretation (HL)",
          topics: []
        },
        {
          id: 14,
          name: "IB MYP Standard Mathematics",
          topics: []
        },
        {
          id: 15,
          name: "IB MYP Extended Mathematics",
          topics: []
        },
      ]
    },
    {
      id: 2,
      name: "Physics",
      courses: [
        {
          id: 2,
          name: "AP Physics C: Electricity and Magnetism",
          topics: [
            {
              id: 2,
              name: "Electric Charge"
            }
          ]
        },
        {
          id: 16,
          name: "AP Physics C: Mechanics",
          topics: []
        },
        {
          id: 17,
          name: "AP Physics 1 - Algebra Based",
          topics: []
        },
        {
          id: 18,
          name: "AP Physics 2: Algebra Based",
          topics: []
        },
        {
          id: 19,
          name: "AP Physics C: Mechanics",
          topics: []
        },
        {
          id: 20,
          name: "Physics Standard",
          topics: []
        },
        {
          id: 21,
          name: "Physics Honors",
          topics: []
        },
        {
          id: 22,
          name: "IB Physics SL",
          topics: []
        },
        {
          id: 23,
          name: "IB Physics HL",
          topics: []
        },
        {
          id: 23,
          name: "Conceptual Physics (Regular C)",
          topics: []
        },
      ]
    },
    {
      id: 3,
      name: "Chemistry",
      courses: [
        {
          id: 24,
          name: "Chemistry Standard",
          topics: []
        },
        {
          id: 25,
          name: "Chemistry Honors",
          topics: []
        },
        {
          id: 26,
          name: "IB Chemistry SL",
          topics: []
        },
        {
          id: 27,
          name: "IB Chemistry HL",
          topics: []
        },
      ]
    },
    {
      id: 4,
      name: "Biology",
      courses: [
        {
          id: 24,
          name: "Biology Standard",
          topics: []
        },
        {
          id: 25,
          name: "Biology Honors",
          topics: []
        },
        {
          id: 26,
          name: "IB Biology SL",
          topics: []
        },
        {
          id: 27,
          name: "IB Biology HL",
          topics: []
        },
      ]
    }
  ]

  for (const subject of list) {
    
    await db.insert(subjects).values({
      id: subject.id.toLocaleString(),
      name: subject.name,
    }).onConflictDoNothing({ target: subjects.id })

    for (const course of subject.courses) {
      await db.insert(courses).values({
        id: course.id.toLocaleString(),
        name: course.name,
        subjectId: subject.id.toLocaleString(),
      }).onConflictDoNothing({ target: courses.id })

      for (const topic of course.topics) {
        await db.insert(topics).values({
          id: topic.id.toLocaleString(),
          name: topic.name,
          courseId: course.id.toLocaleString(),
        }).onConflictDoNothing({ target: topics.id })
      }
    }
    
  }
}