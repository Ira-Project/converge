import { db } from ".";
import {  
  conceptListConcepts,
  conceptLists, 
  concepts, 
} from "./schema/concept";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import { assignments } from "./schema/assignment";
import { answers, questions } from "./schema/questions";

// Parameters for assignment creation
const topicId = "2";
const classroomId = "k9arrnbmgan5ggfi7kubi";
const assignmentName = "Assignment 1";
const lambdaUrl = "https://tnb4hxjpso44rkfkn7lon2xgru0vmqmj.lambda-url.us-west-1.on.aws/"
import json from "./assignment.json";


async function createAssignment() {

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
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await db.insert(assignments).values(assignment)

  // Create the questions object
  for (const question of json.Questions) {
    const questionObject = {
      id: generateId(21),
      question: question.Question,
      lambdaUrl: lambdaUrl,
      assignmentId: assignment.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await db.insert(questions).values(questionObject)
    for (const answer of question.Answer) {
      const answerObject = {
        id: generateId(21),
        questionId: questionObject.id,
        answer: answer,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      await db.insert(answers).values(answerObject)
    }
  }
}

void createAssignment()