import { db } from "../..";
import { eq, and } from "drizzle-orm";
import { generateId } from "lucia";

import { 
  concepts, 
  conceptsToTopics, 
  conceptsToSubjects, 
  conceptsToCourses, 
  conceptsToGrades 
} from "../../schema/concept";
import { topics, subjects, courses } from "../../schema/subject";

/**
 * Maps all existing concepts to their parent courses based on their topic relationships
 * This creates conceptsToCourses mappings for concepts that are already mapped to topics
 */
export async function mapConceptsToCourses() {
  console.log("Starting to map concepts to courses...");
  
  // Get all concept-topic relationships that aren't deleted
  const conceptTopicMappings = await db.select({
    conceptId: conceptsToTopics.conceptId,
    topicId: conceptsToTopics.topicId,
  }).from(conceptsToTopics)
  .where(eq(conceptsToTopics.isDeleted, false));

  console.log(`Found ${conceptTopicMappings.length} concept-topic mappings`);

  let mappedCount = 0;
  let skippedCount = 0;

  for (const mapping of conceptTopicMappings) {
    if (!mapping.conceptId || !mapping.topicId) continue;

    // Get the course for this topic
    const topic = await db.select({
      courseId: topics.courseId,
    }).from(topics)
    .where(eq(topics.id, mapping.topicId))
    .limit(1);

    if (!topic[0]?.courseId) {
      console.log(`No course found for topic ${mapping.topicId}`);
      skippedCount++;
      continue;
    }

    // Check if concept-course mapping already exists
    const existingMapping = await db.select()
      .from(conceptsToCourses)
      .where(and(
        eq(conceptsToCourses.conceptId, mapping.conceptId),
        eq(conceptsToCourses.courseId, topic[0].courseId),
        eq(conceptsToCourses.isDeleted, false)
      ))
      .limit(1);

    if (existingMapping.length > 0) {
      skippedCount++;
      continue;
    }

    // Create the concept-course mapping
    await db.insert(conceptsToCourses).values({
      id: generateId(21),
      conceptId: mapping.conceptId,
      courseId: topic[0].courseId,
    });

    mappedCount++;
    console.log(`Mapped concept ${mapping.conceptId} to course ${topic[0].courseId}`);
  }

  console.log(`Concept-course mapping completed. Mapped: ${mappedCount}, Skipped: ${skippedCount}`);
}

/**
 * Maps all existing concepts to their parent subjects based on their course relationships
 * This creates conceptsToSubjects mappings for concepts that are already mapped to courses
 */
export async function mapConceptsToSubjects() {
  console.log("Starting to map concepts to subjects...");
  
  // Get all concept-course relationships that aren't deleted
  const conceptCourseMappings = await db.select({
    conceptId: conceptsToCourses.conceptId,
    courseId: conceptsToCourses.courseId,
  }).from(conceptsToCourses)
  .where(eq(conceptsToCourses.isDeleted, false));

  console.log(`Found ${conceptCourseMappings.length} concept-course mappings`);

  let mappedCount = 0;
  let skippedCount = 0;

  for (const mapping of conceptCourseMappings) {
    if (!mapping.conceptId || !mapping.courseId) continue;

    // Get the subject for this course
    const course = await db.select({
      subjectId: courses.subjectId,
    }).from(courses)
    .where(eq(courses.id, mapping.courseId))
    .limit(1);

    if (!course[0]?.subjectId) {
      console.log(`No subject found for course ${mapping.courseId}`);
      skippedCount++;
      continue;
    }

    // Check if concept-subject mapping already exists
    const existingMapping = await db.select()
      .from(conceptsToSubjects)
      .where(and(
        eq(conceptsToSubjects.conceptId, mapping.conceptId),
        eq(conceptsToSubjects.subjectId, course[0].subjectId),
        eq(conceptsToSubjects.isDeleted, false)
      ))
      .limit(1);

    if (existingMapping.length > 0) {
      skippedCount++;
      continue;
    }

    // Create the concept-subject mapping
    await db.insert(conceptsToSubjects).values({
      id: generateId(21),
      conceptId: mapping.conceptId,
      subjectId: course[0].subjectId,
    });

    mappedCount++;
    console.log(`Mapped concept ${mapping.conceptId} to subject ${course[0].subjectId}`);
  }

  console.log(`Concept-subject mapping completed. Mapped: ${mappedCount}, Skipped: ${skippedCount}`);
}

/**
 * Maps all existing concepts to default grades based on their course relationships
 * This creates conceptsToGrades mappings for concepts using a set of default grades
 */
export async function mapConceptsToGrades(grades: string[] = ["9", "10", "11", "12"]) {
  console.log("Starting to map concepts to grades...");
  console.log(`Using grades: ${grades.join(", ")}`);
  
  // Get all concepts that aren't deleted
  const allConcepts = await db.select({
    id: concepts.id,
  }).from(concepts)
  .where(eq(concepts.isDeleted, false));

  console.log(`Found ${allConcepts.length} concepts`);

  let mappedCount = 0;
  let skippedCount = 0;

  for (const concept of allConcepts) {
    for (const grade of grades) {
      // Check if concept-grade mapping already exists
      const existingMapping = await db.select()
        .from(conceptsToGrades)
        .where(and(
          eq(conceptsToGrades.conceptId, concept.id),
          eq(conceptsToGrades.grade, grade),
          eq(conceptsToGrades.isDeleted, false)
        ))
        .limit(1);

      if (existingMapping.length > 0) {
        skippedCount++;
        continue;
      }

      // Create the concept-grade mapping
      await db.insert(conceptsToGrades).values({
        id: generateId(21),
        conceptId: concept.id,
        grade: grade,
      });

      mappedCount++;
      console.log(`Mapped concept ${concept.id} to grade ${grade}`);
    }
  }

  console.log(`Concept-grade mapping completed. Mapped: ${mappedCount}, Skipped: ${skippedCount}`);
}

/**
 * Maps concepts to specific grades based on course names
 * Uses course name patterns to determine appropriate grade levels
 */
export async function mapConceptsToGradesByCourse() {
  console.log("Starting to map concepts to grades by course...");
  
  // Define grade mappings based on course name patterns
  const courseGradeMappings: Record<string, string[]> = {
    "Algebra 1": ["9", "10"],
    "Algebra 2": ["10", "11"],
    "Geometry": ["9", "10", "11"],
    "Precalculus": ["11", "12"],
    "Calculus": ["12"],
    "AP": ["11", "12"],
    "IB DP": ["11", "12"],
    "IB MYP": ["6", "7", "8", "9", "10"],
    "Statistics": ["11", "12"],
  };

  // Get all concept-course relationships that aren't deleted
  const conceptCourseMappings = await db.select({
    conceptId: conceptsToCourses.conceptId,
    courseId: conceptsToCourses.courseId,
  }).from(conceptsToCourses)
  .innerJoin(courses, eq(courses.id, conceptsToCourses.courseId))
  .where(eq(conceptsToCourses.isDeleted, false));

  console.log(`Found ${conceptCourseMappings.length} concept-course mappings`);

  let mappedCount = 0;
  let skippedCount = 0;

  for (const mapping of conceptCourseMappings) {
    if (!mapping.conceptId || !mapping.courseId) continue;

    // Get the course details
    const course = await db.select({
      name: courses.name,
    }).from(courses)
    .where(eq(courses.id, mapping.courseId))
    .limit(1);

    if (!course[0]?.name) {
      skippedCount++;
      continue;
    }

    // Determine grades based on course name
    let assignedGrades: string[] = ["9", "10", "11", "12"]; // default grades
    
    for (const [pattern, grades] of Object.entries(courseGradeMappings)) {
      if (course[0].name.includes(pattern)) {
        assignedGrades = grades;
        break;
      }
    }

    // Create mappings for each grade
    for (const grade of assignedGrades) {
      // Check if concept-grade mapping already exists
      const existingMapping = await db.select()
        .from(conceptsToGrades)
        .where(and(
          eq(conceptsToGrades.conceptId, mapping.conceptId),
          eq(conceptsToGrades.grade, grade),
          eq(conceptsToGrades.isDeleted, false)
        ))
        .limit(1);

      if (existingMapping.length > 0) {
        skippedCount++;
        continue;
      }

      // Create the concept-grade mapping
      await db.insert(conceptsToGrades).values({
        id: generateId(21),
        conceptId: mapping.conceptId,
        grade: grade,
      });

      mappedCount++;
      console.log(`Mapped concept ${mapping.conceptId} to grade ${grade} (course: ${course[0].name})`);
    }
  }

  console.log(`Course-based concept-grade mapping completed. Mapped: ${mappedCount}, Skipped: ${skippedCount}`);
}

/**
 * Runs all concept mapping functions in sequence
 * Maps concepts to courses, then subjects, then grades
 */
export async function mapAllConceptRelationships(grades?: string[]) {
  console.log("Starting comprehensive concept mapping process...");
  
  try {
    await mapConceptsToCourses();
    await mapConceptsToSubjects();
    
    if (grades) {
      await mapConceptsToGrades(grades);
    } else {
      await mapConceptsToGradesByCourse();
    }
    
    console.log("Comprehensive concept mapping completed successfully!");
  } catch (error) {
    console.error("Error during concept mapping:", error);
    throw error;
  }
}

/**
 * Gets statistics about concept mappings
 */
export async function getConceptMappingStats() {
  const totalConcepts = await db.select({ count: concepts.id })
    .from(concepts)
    .where(eq(concepts.isDeleted, false));

  const topicMappings = await db.select({ count: conceptsToTopics.id })
    .from(conceptsToTopics)
    .where(eq(conceptsToTopics.isDeleted, false));

  const courseMappings = await db.select({ count: conceptsToCourses.id })
    .from(conceptsToCourses)
    .where(eq(conceptsToCourses.isDeleted, false));

  const subjectMappings = await db.select({ count: conceptsToSubjects.id })
    .from(conceptsToSubjects)
    .where(eq(conceptsToSubjects.isDeleted, false));

  const gradeMappings = await db.select({ count: conceptsToGrades.id })
    .from(conceptsToGrades)
    .where(eq(conceptsToGrades.isDeleted, false));

  const stats = {
    totalConcepts: totalConcepts.length,
    topicMappings: topicMappings.length,
    courseMappings: courseMappings.length,
    subjectMappings: subjectMappings.length,
    gradeMappings: gradeMappings.length,
  };

  console.log("Concept Mapping Statistics:");
  console.log(`Total Concepts: ${stats.totalConcepts}`);
  console.log(`Topic Mappings: ${stats.topicMappings}`);
  console.log(`Course Mappings: ${stats.courseMappings}`);
  console.log(`Subject Mappings: ${stats.subjectMappings}`);
  console.log(`Grade Mappings: ${stats.gradeMappings}`);

  return stats;
} 