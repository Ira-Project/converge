import { db } from ".";
import { 
  conceptAnswers, 
  conceptGraphEdges, 
  conceptGraphRootConcepts, 
  conceptGraphs, 
  concepts, 
  conceptsToGraphs, 
  similarConcepts } from "./schema/concept";
import { eq, or, and } from "drizzle-orm";


import conceptsJson from './concepts.json'
import graphJson from './graphs.json'

import { generateId } from "lucia";
import { createEmbedding } from "@/lib/utils/aiUtils";


async function createConcepts() {

  for(const concept of conceptsJson.concepts) {
    
    await db.insert(concepts).values({
      id: concept.concept_uuid,
      text: concept.concept_question,
      formula: concept.concept_formula,
      calculationRequired: concept.calculation_required === "Yes" ? true : false,
    }) 

    for(const answer of concept.concept_rephrases) {
      const embeddingVector = createEmbedding(answer);
      await db.insert(conceptAnswers).values({
        id: generateId(21),
        text: answer,
        embedding: embeddingVector,
        conceptId: concept.concept_uuid
      })
    }
  }

  for(const concept of conceptsJson.concepts) {

    for(const similar_concepts of concept.similar_concepts) {
      const sc = await db.select().from(similarConcepts).where(
        or(
          and(eq(similarConcepts.conceptToId, concept.concept_uuid), eq(similarConcepts.conceptFromId, similar_concepts) ),
          and(eq(similarConcepts.conceptFromId, similar_concepts), eq(similarConcepts.conceptToId, concept.concept_uuid) )
        )
      );

      if(sc.length === 0) {
        await db.insert(similarConcepts).values({
          id: generateId(21),
          conceptFromId: concept.concept_uuid,
          conceptToId: similar_concepts
        })
      }
    }

  }
}

async function createGraph() {

  const conceptGraphId = generateId(21);

  await db.insert(conceptGraphs).values({
    id: conceptGraphId,
    name: graphJson.question,  
  })

  for(const node of graphJson.nodes) {
    await db.insert(conceptsToGraphs).values({
      conceptId: node,
      conceptGraphId: conceptGraphId
    })
  }

  type dictionaryKeys = keyof typeof graphJson.adjacency_dict;

  for(const parent in graphJson.adjacency_dict) {

    const parentString = parent as dictionaryKeys;
    const children = graphJson.adjacency_dict[parentString];

    for(const child of children) {

      await db.insert(conceptGraphEdges).values({
        id: generateId(21),
        parent: parent,
        child: child,
        conceptGraphId: conceptGraphId
      })
    }
  }

  for(const root of graphJson.root_ids) {

    await db.insert(conceptGraphRootConcepts).values({
      conceptGraphId: conceptGraphId,
      conceptId: root
    })
    
  }
}

async function conceptAnswerEmbeddings() {

  const conceptAnswerList = await db.select().from(conceptAnswers);

  for(const conceptAnswer of conceptAnswerList) {

    const embeddingVector = createEmbedding(conceptAnswer.text);

    await db.update(conceptAnswers).set({
      embedding: embeddingVector
    }).where(eq(conceptAnswers.id, conceptAnswer.id))
  }
}

// await conceptAnswerEmbeddings();
// await createGraph();
// await createConcepts();