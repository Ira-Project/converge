/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { db } from "../..";
import { eq, and, or } from "drizzle-orm";
import { generateId } from "lucia";

import { topics } from "../../schema/subject";

import { concepts } from "../../schema/concept";
import { conceptEdges } from "../../schema/concept";
import { conceptsToTopics, conceptsToSubjects, conceptsToCourses, conceptsToGrades } from "../../schema/concept";

export async function createConcepts(
  topicName: string, 
  options?: {
    courseIds?: string[];
    subjectIds?: string[];
    grades?: string[];
  }
) {
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

  if(!(topicName.toLowerCase()).includes(topic?.[0].name.toLowerCase())) {
    console.log("Topic name does not match")
    return
  }

  console.log(`Creating concepts for topic: ${topicName}`)
  console.log(`Total concepts to create: ${data.chapter_concepts.length}`)
  
  for (const concept of data.chapter_concepts) {
    // Check if concept already exists
    const existingConcept = await db.select()
      .from(concepts)
      .where(eq(concepts.id, concept.concept_id as string));

    if (existingConcept.length > 0) {
      console.log(`Concept already exists: ${concept.concept_question}`);
      continue;
    }

    console.log(`Creating concept: ${concept.concept_question}`);
    await db.insert(concepts).values({
      id: concept.concept_id,
      text: concept.concept_question,
      answerText: concept.concept_answer,
      formulas: concept.concept_formula,
    });

    console.log(`Created concept to topic: ${concept.concept_question}`);
    // Check if concept-topic relationship already exists
    const existingConceptTopic = await db.select()
      .from(conceptsToTopics)
      .where(and(
        eq(conceptsToTopics.conceptId, concept.concept_id as string),
        eq(conceptsToTopics.topicId, topicId as string)
      ));

    if (existingConceptTopic.length === 0) {
      await db.insert(conceptsToTopics).values({
        id: generateId(21),
        conceptId: concept.concept_id,
        topicId: topicId as string,
      });
    }

    // Map to courses if provided
    if (options?.courseIds && options.courseIds.length > 0) {
      for (const courseId of options.courseIds) {
        // Check if concept-course mapping already exists
        const existingMapping = await db.select()
          .from(conceptsToCourses)
          .where(and(
            eq(conceptsToCourses.conceptId, concept.concept_id as string),
            eq(conceptsToCourses.courseId, courseId),
            eq(conceptsToCourses.isDeleted, false)
          ));

        if (existingMapping.length === 0) {
          await db.insert(conceptsToCourses).values({
            id: generateId(21),
            conceptId: concept.concept_id,
            courseId: courseId,
          });
          console.log(`Mapped concept ${concept.concept_id} to course ${courseId}`);
        }
      }
    }

    // Map to subjects if provided
    if (options?.subjectIds && options.subjectIds.length > 0) {
      for (const subjectId of options.subjectIds) {
        // Check if concept-subject mapping already exists
        const existingMapping = await db.select()
          .from(conceptsToSubjects)
          .where(and(
            eq(conceptsToSubjects.conceptId, concept.concept_id as string),
            eq(conceptsToSubjects.subjectId, subjectId),
            eq(conceptsToSubjects.isDeleted, false)
          ));

        if (existingMapping.length === 0) {
          await db.insert(conceptsToSubjects).values({
            id: generateId(21),
            conceptId: concept.concept_id,
            subjectId: subjectId,
          });
          console.log(`Mapped concept ${concept.concept_id} to subject ${subjectId}`);
        }
      }
    }

    // Map to grades if provided
    if (options?.grades && options.grades.length > 0) {
      for (const grade of options.grades) {
        // Check if concept-grade mapping already exists
        const existingMapping = await db.select()
          .from(conceptsToGrades)
          .where(and(
            eq(conceptsToGrades.conceptId, concept.concept_id as string),
            eq(conceptsToGrades.grade, grade),
            eq(conceptsToGrades.isDeleted, false)
          ));

        if (existingMapping.length === 0) {
          await db.insert(conceptsToGrades).values({
            id: generateId(21),
            conceptId: concept.concept_id,
            grade: grade,
          });
          console.log(`Mapped concept ${concept.concept_id} to grade ${grade}`);
        }
      }
    }
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

export async function createGeneratedConcepts(topicName: string, userId: string) {
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

  console.log(`Creating generated concepts for topic: ${topicName} by user: ${userId}`)
  console.log(`Total concepts to create: ${data.chapter_concepts.length}`)
  
  for (const concept of data.chapter_concepts) {
    // Check if concept already exists
    const existingConcept = await db.select()
      .from(concepts)
      .where(eq(concepts.id, concept.concept_id as string));

    if (existingConcept.length > 0) {
      console.log(`Concept already exists: ${concept.concept_question}`);
      continue;
    }

    console.log(`Creating generated concept: ${concept.concept_question}`);
    await db.insert(concepts).values({
      id: concept.concept_id,
      text: concept.concept_question,
      answerText: concept.concept_answer,
      formulas: concept.concept_formula,
      generated: true,
      createdBy: userId,
    });

    console.log(`Created generated concept to topic: ${concept.concept_question}`);
    // Check if concept-topic relationship already exists
    const existingConceptTopic = await db.select()
      .from(conceptsToTopics)
      .where(and(
        eq(conceptsToTopics.conceptId, concept.concept_id as string),
        eq(conceptsToTopics.topicId, topicId as string)
      ));

    if (existingConceptTopic.length === 0) {
      await db.insert(conceptsToTopics).values({
        id: generateId(21),
        conceptId: concept.concept_id,
        topicId: topicId as string,
      });
    }
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
  console.log(`Completed seeding generated concepts for topic: ${topicName} by user: ${userId}`)
}

export async function mapAllConceptsToCourses(courseIds: string[]) {
  console.log(`Mapping all concepts to ${courseIds.length} courses...`);
  
  // Get all concepts
  const allConcepts = await db.select({ id: concepts.id }).from(concepts);
  console.log(`Found ${allConcepts.length} concepts to map`);

  for (const concept of allConcepts) {
    for (const courseId of courseIds) {
      // Check if concept-course mapping already exists
      const existingMapping = await db.select()
        .from(conceptsToCourses)
        .where(and(
          eq(conceptsToCourses.conceptId, concept.id),
          eq(conceptsToCourses.courseId, courseId),
          eq(conceptsToCourses.isDeleted, false)
        ));

      if (existingMapping.length === 0) {
        await db.insert(conceptsToCourses).values({
          id: generateId(21),
          conceptId: concept.id,
          courseId: courseId,
        });
        console.log(`Mapped concept ${concept.id} to course ${courseId}`);
      }
    }
  }
  
  console.log(`Completed mapping all concepts to courses`);
}

export async function mapAllConceptsToSubjects(subjectIds: string[]) {
  console.log(`Mapping all concepts to ${subjectIds.length} subjects...`);
  
  // Get all concepts
  const allConcepts = await db.select({ id: concepts.id }).from(concepts);
  console.log(`Found ${allConcepts.length} concepts to map`);

  for (const concept of allConcepts) {
    for (const subjectId of subjectIds) {
      // Check if concept-subject mapping already exists
      const existingMapping = await db.select()
        .from(conceptsToSubjects)
        .where(and(
          eq(conceptsToSubjects.conceptId, concept.id),
          eq(conceptsToSubjects.subjectId, subjectId),
          eq(conceptsToSubjects.isDeleted, false)
        ));

      if (existingMapping.length === 0) {
        await db.insert(conceptsToSubjects).values({
          id: generateId(21),
          conceptId: concept.id,
          subjectId: subjectId,
        });
        console.log(`Mapped concept ${concept.id} to subject ${subjectId}`);
      }
    }
  }
  
  console.log(`Completed mapping all concepts to subjects`);
}

export async function mapAllConceptsToGrades(grades: string[]) {
  console.log(`Mapping all concepts to ${grades.length} grades...`);
  
  // Get all concepts
  const allConcepts = await db.select({ id: concepts.id }).from(concepts);
  console.log(`Found ${allConcepts.length} concepts to map`);

  for (const concept of allConcepts) {
    for (const grade of grades) {
      // Check if concept-grade mapping already exists
      const existingMapping = await db.select()
        .from(conceptsToGrades)
        .where(and(
          eq(conceptsToGrades.conceptId, concept.id),
          eq(conceptsToGrades.grade, grade),
          eq(conceptsToGrades.isDeleted, false)
        ));

      if (existingMapping.length === 0) {
        await db.insert(conceptsToGrades).values({
          id: generateId(21),
          conceptId: concept.id,
          grade: grade,
        });
        console.log(`Mapped concept ${concept.id} to grade ${grade}`);
      }
    }
  }
  
  console.log(`Completed mapping all concepts to grades`);
}

export async function mapAllConceptsToCoursesSubjectsAndGrades(options: {
  courseIds?: string[];
  subjectIds?: string[];
  grades?: string[];
}) {
  console.log(`Mapping all concepts to courses, subjects, and grades...`);
  
  // Get all concepts
  const allConcepts = await db.select({ id: concepts.id }).from(concepts);
  console.log(`Found ${allConcepts.length} concepts to map`);

  for (const concept of allConcepts) {
    // Map to courses if provided
    if (options.courseIds && options.courseIds.length > 0) {
      for (const courseId of options.courseIds) {
        // Check if concept-course mapping already exists
        const existingMapping = await db.select()
          .from(conceptsToCourses)
          .where(and(
            eq(conceptsToCourses.conceptId, concept.id),
            eq(conceptsToCourses.courseId, courseId),
            eq(conceptsToCourses.isDeleted, false)
          ));

        if (existingMapping.length === 0) {
          await db.insert(conceptsToCourses).values({
            id: generateId(21),
            conceptId: concept.id,
            courseId: courseId,
          });
        }
      }
    }

    // Map to subjects if provided
    if (options.subjectIds && options.subjectIds.length > 0) {
      for (const subjectId of options.subjectIds) {
        // Check if concept-subject mapping already exists
        const existingMapping = await db.select()
          .from(conceptsToSubjects)
          .where(and(
            eq(conceptsToSubjects.conceptId, concept.id),
            eq(conceptsToSubjects.subjectId, subjectId),
            eq(conceptsToSubjects.isDeleted, false)
          ));

        if (existingMapping.length === 0) {
          await db.insert(conceptsToSubjects).values({
            id: generateId(21),
            conceptId: concept.id,
            subjectId: subjectId,
          });
        }
      }
    }

    // Map to grades if provided
    if (options.grades && options.grades.length > 0) {
      for (const grade of options.grades) {
        // Check if concept-grade mapping already exists
        const existingMapping = await db.select()
          .from(conceptsToGrades)
          .where(and(
            eq(conceptsToGrades.conceptId, concept.id),
            eq(conceptsToGrades.grade, grade),
            eq(conceptsToGrades.isDeleted, false)
          ));

        if (existingMapping.length === 0) {
          await db.insert(conceptsToGrades).values({
            id: generateId(21),
            conceptId: concept.id,
            grade: grade,
          });
        }
      }
    }
  }
  
  console.log(`Completed mapping all concepts to courses, subjects, and grades`);
}