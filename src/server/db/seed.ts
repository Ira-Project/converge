import { db } from ".";
import { 
  conceptAnswers, 
  conceptGraphEdges, 
  conceptGraphToRootConcepts, 
  conceptGraphs, 
  concepts, 
  conceptsToGraphs, 
  similarConcepts } from "./schema/concept";
import { eq, or, and } from "drizzle-orm";


import conceptsJson from './concepts.json'
import graphJson from './graphs.json'

import { generateId } from "lucia";


async function createConcepts() {

  for(const concept of conceptsJson.concepts) {
    
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

  for(const concept of conceptsJson.concepts) {

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

async function createGraph() {

  const conceptGraphId = "u1o8fhfhuhtgescgcp2s5"; //generateId(21);

  // await db.insert(conceptGraphs).values({
  //   id: conceptGraphId,
  //   name: "Probability assignment template",  
  // })

  // for(const node of graphJson.nodes) {
  //   await db.insert(conceptsToGraphs).values({
  //     conceptId: node,
  //     conceptGraphId: conceptGraphId
  //   })
  // }

  type dictionaryKeys = keyof typeof graphJson.adjacency_dict;
// 
  // for(const parent in graphJson.adjacency_dict) {

  //   const parentString = parent as dictionaryKeys;
  //   const children = graphJson.adjacency_dict[parentString];

  //   for(const child of children) {

  //     await db.insert(conceptGraphEdges).values({
  //       id: generateId(21),
  //       parent: parent,
  //       child: child,
  //       conceptGraphId: conceptGraphId
  //     })
  //   }
  // }

  for(const root of graphJson.root_ids) {

    console.log(root);
    await db.insert(conceptGraphToRootConcepts).values({
      conceptGraphId: conceptGraphId,
      conceptId: root
    })
    
  }
}

await createGraph();
// await createConcepts();