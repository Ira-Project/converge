import { db } from ".";
import { 
  conceptAnswers, 
  conceptGraphEdges, 
  conceptGraphs, 
  concepts, 
  conceptsToGraphs, 
  similarConcepts } from "./schema/concept";
import { eq, or, and } from "drizzle-orm";


import json from './concepts.json'
import { generateId } from "lucia";


async function createConcepts() {

  for(const concept of json.concepts) {
    
    await db.insert(concepts).values({
      id: concept.concept_uuid,
      text: concept.concept_question,
      formula: concept.concept_formula,
      calculationRequired: concept.calculation_required === "Yes" ? true : false,
    })

    for(const answer of concept.concept_rephrases) {
      await db.insert(conceptAnswers).values({
        id: generateId(21),
        text: answer,
        conceptId: concept.concept_uuid
      })
    }
  }

  for(const concept of json.concepts) {

    for(const similar_concepts of concept.similar_concepts) {
      const sc = await db.select().from(similarConcepts).where(
        or(
          and(eq(similarConcepts.conceptId, concept.concept_uuid), eq(similarConcepts.similarConceptId, similar_concepts) ),
          and(eq(similarConcepts.conceptId, similar_concepts), eq(similarConcepts.similarConceptId, concept.concept_uuid) )
        )
      );

      if(sc.length === 0) {
        await db.insert(similarConcepts).values({
          id: generateId(21),
          conceptId: concept.concept_uuid,
          similarConceptId: similar_concepts
        })
      }
    }

  }
}

// await createConcepts();