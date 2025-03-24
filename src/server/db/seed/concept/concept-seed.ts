/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { db } from "../..";
import { eq, and, or } from "drizzle-orm";
import { generateId } from "lucia";

import { topics } from "../../schema/subject";

import { concepts } from "../../schema/concept";
import { conceptEdges } from "../../schema/concept";
import { conceptsToTopics } from "../../schema/concept";

export async function createConcepts(topicName: string) {
  // Parameters for assignment creation
  const { default: data } = await import( `./${topicName}.json`, { assert: { type: "json" } });

  
  const topicId = process.env.ENVIRONMENT === "prod" ? data.topicIdProd : data.topicIdDev;
  const topic = await db.select().from(topics).where(
    eq(topics.id, topicId as string),
  )

  if (topic?.[0] === undefined) {
    console.log("Topic not found")
    return
  }

  if(!topicName.includes(topic?.[0].name)) {
    console.log("Topic name does not match")
    return
  }

  console.log(`Creating concepts for topic: ${topicName}`)
  console.log(`Total concepts to create: ${data.chapter_concepts.length}`)
  
  for (const concept of data.chapter_concepts) {
    console.log(`Creating concept: ${concept.concept_question}`)
    await db.insert(concepts).values({
      id: concept.concept_id,
      text: concept.concept_question,
      answerText: concept.concept_answer,
      formulas: concept.concept_formula,
    })
    console.log(`Created concept to topic: ${concept.concept_question}`)
    await db.insert(conceptsToTopics).values({
      id: generateId(21),
      conceptId: concept.concept_id,
      topicId: topicId as string,
    })
  }  

  console.log('Creating concept prerequisite edges...')
  for (const concept of data.chapter_concepts) {
    console.log(`Processing prerequisites for concept: ${concept.concept_id} (${concept['pre-requisites'].length} prerequisites)`)
    for (const prerequisite of concept['pre-requisites']) {
      // Check if edge already exists in either direction
      const existingEdge = await db.select()
        .from(conceptEdges)
        .where(
          or(
            and(
              eq(conceptEdges.conceptId, concept.concept_id as string),
              eq(conceptEdges.relatedConceptId, prerequisite as string)
            ),
            and(
              eq(conceptEdges.conceptId, prerequisite as string),
              eq(conceptEdges.relatedConceptId, concept.concept_id as string)
            )
          )
        );

      // Only insert if edge doesn't exist in either direction
      if (existingEdge.length === 0) {
        await db.insert(conceptEdges).values({
          id: generateId(21),
          conceptId: concept.concept_id,
          relatedConceptId: prerequisite,
        });
        console.log(`Created edge: ${concept.concept_id} -> ${prerequisite}`)
      } else {
        console.log(`Edge already exists between ${concept.concept_id} and ${prerequisite}`)
      }
    }
  }
  console.log(`Completed seeding concepts for topic: ${topicName}`)
}