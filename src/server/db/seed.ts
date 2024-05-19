import { db } from ".";
import { map, type Concept } from "./concept_map";
import { conceptAnswers, conceptGraphEdges, conceptGraphRoots, conceptGraphs, conceptQuestions, concepts, conceptsToGraphs } from "./schema/concept";

const mapFromJsonToDb: Record<number, number> = {}

async function createConceptGraphFromMap(conceptMap: Concept[]) {

  const conceptGraphList = await db.insert(conceptGraphs).values({}).returning()
  const conceptGraph = conceptGraphList[0]

  if(!conceptGraph?.id) {
    throw new Error("Failed to create concept graph")
  }

  for (const concept of conceptMap) {
    
    const conceptList = await db.insert(concepts).values({
      calculationRequired: concept.calculation_required,
      formula: concept.concept_formula,
    }).returning();

    const conceptDb = conceptList[0]

    if(!conceptDb?.id) {
      throw new Error("Failed to create concept")
    }

    await db.insert(conceptsToGraphs).values({
      conceptId: conceptDb.id,
      conceptGraphId: conceptGraph.id
    }) 

    mapFromJsonToDb[concept.concept_id] = conceptDb.id

    for (const text of concept.concept_text) {
      const conceptQuestionList = await db.insert(conceptQuestions).values({
        text: text.question,
        conceptId: conceptDb.id
      }).returning()
      const conceptQuestion = conceptQuestionList[0]

      if(!conceptQuestion?.id) {
        throw new Error("Failed to create concept question")
      }

      for (const answer of text.answers) {
        await db.insert(conceptAnswers).values({
          text: answer,
          conceptQuestionId: conceptQuestion.id
        })
      }
    }

    if(concept.parent_concepts.length === 0) {
      await db.insert(conceptGraphRoots).values({
        conceptId: conceptDb.id,
        conceptGraphId: conceptGraph.id
      })
    }

    for (const parent of concept.parent_concepts) {

      const parentId = mapFromJsonToDb[parent]
      if(!parentId) {
        console.log("Parent not found", parent)
        continue
      }
      await db.insert(conceptGraphEdges).values({
        parent: parentId,
        child: conceptDb.id,
        conceptGraphId: conceptGraph.id
      })
    }
  }
}

await createConceptGraphFromMap(map)