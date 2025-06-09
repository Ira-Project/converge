import { db } from "..";
import { eq, and } from "drizzle-orm";
import { generateId } from "lucia";

// Import all assignment types and their mapping tables
import { 
  knowledgeZapAssignments,
  knowledgeZapAssignmentToCourse,
  knowledgeZapAssignmentToGrade,
  knowledgeZapAssignmentToSubject 
} from "../schema/knowledgeZap/knowledgeZapAssignment";

import { 
  stepSolveAssignmentTemplates,
  stepSolveAssignmentTemplateToCourse,
  stepSolveAssignmentTemplateToGrade,
  stepSolveAssignmentTemplateToSubject 
} from "../schema/stepSolve/stepSolveAssignment";

import { 
  readAndRelayAssignments,
  readAndRelayAssignmentToCourse,
  readAndRelayAssignmentToGrade,
  readAndRelayAssignmentToSubject 
} from "../schema/readAndRelay/readAndRelayAssignments";

import { 
  conceptMappingAssignments,
  conceptMappingAssignmentToCourse,
  conceptMappingAssignmentToGrade,
  conceptMappingAssignmentToSubject 
} from "../schema/conceptMapping/conceptMappingAssignments";

import { 
  reasoningAssignments,
  reasoningAssignmentToCourse,
  reasoningAssignmentToGrade,
  reasoningAssignmentToSubject 
} from "../schema/reasoning/reasoningAssignment";

import { 
  explainAssignments,
  explainAssignmentToCourse,
  explainAssignmentToGrade,
  explainAssignmentToSubject 
} from "../schema/learnByTeaching/explainAssignment";

import { courses, subjects } from "../schema/subject";

/**
 * Maps a Knowledge Zap assignment to a specific course
 */
export async function mapKnowledgeZapAssignmentToCourse(assignmentId: string, courseId: string) {
  try {
    // Check if assignment exists
    const assignment = await db.select().from(knowledgeZapAssignments)
      .where(eq(knowledgeZapAssignments.id, assignmentId))
      .limit(1);
    
    if (assignment.length === 0) {
      console.log(`Knowledge Zap assignment with ID ${assignmentId} not found`);
      return;
    }

    // Check if course exists
    const course = await db.select().from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);
    
    if (course.length === 0) {
      console.log(`Course with ID ${courseId} not found`);
      return;
    }

    // Check if mapping already exists
    const existingMapping = await db.select().from(knowledgeZapAssignmentToCourse)
      .where(and(
        eq(knowledgeZapAssignmentToCourse.assignmentId, assignmentId),
        eq(knowledgeZapAssignmentToCourse.courseId, courseId)
      ))
      .limit(1);

    if (existingMapping.length > 0) {
      console.log(`Knowledge Zap assignment ${assignmentId} is already mapped to course ${courseId}`);
      return;
    }

    // Create mapping
    await db.insert(knowledgeZapAssignmentToCourse).values({
      id: generateId(21),
      assignmentId,
      courseId,
    });

    console.log(`Successfully mapped Knowledge Zap assignment ${assignmentId} to course ${courseId}`);
  } catch (error) {
    console.error(`Error mapping Knowledge Zap assignment to course:`, error);
  }
}

/**
 * Maps a Knowledge Zap assignment to a specific grade
 */
export async function mapKnowledgeZapAssignmentToGrade(assignmentId: string, grade: string) {
  try {
    // Check if assignment exists
    const assignment = await db.select().from(knowledgeZapAssignments)
      .where(eq(knowledgeZapAssignments.id, assignmentId))
      .limit(1);
    
    if (assignment.length === 0) {
      console.log(`Knowledge Zap assignment with ID ${assignmentId} not found`);
      return;
    }

    // Check if mapping already exists
    const existingMapping = await db.select().from(knowledgeZapAssignmentToGrade)
      .where(and(
        eq(knowledgeZapAssignmentToGrade.assignmentId, assignmentId),
        eq(knowledgeZapAssignmentToGrade.grade, grade)
      ))
      .limit(1);

    if (existingMapping.length > 0) {
      console.log(`Knowledge Zap assignment ${assignmentId} is already mapped to grade ${grade}`);
      return;
    }

    // Create mapping
    await db.insert(knowledgeZapAssignmentToGrade).values({
      id: generateId(21),
      assignmentId,
      grade,
    });

    console.log(`Successfully mapped Knowledge Zap assignment ${assignmentId} to grade ${grade}`);
  } catch (error) {
    console.error(`Error mapping Knowledge Zap assignment to grade:`, error);
  }
}

/**
 * Maps a Knowledge Zap assignment to a specific subject
 */
export async function mapKnowledgeZapAssignmentToSubject(assignmentId: string, subjectId: string) {
  try {
    // Check if assignment exists
    const assignment = await db.select().from(knowledgeZapAssignments)
      .where(eq(knowledgeZapAssignments.id, assignmentId))
      .limit(1);
    
    if (assignment.length === 0) {
      console.log(`Knowledge Zap assignment with ID ${assignmentId} not found`);
      return;
    }

    // Check if subject exists
    const subject = await db.select().from(subjects)
      .where(eq(subjects.id, subjectId))
      .limit(1);
    
    if (subject.length === 0) {
      console.log(`Subject with ID ${subjectId} not found`);
      return;
    }

    // Check if mapping already exists
    const existingMapping = await db.select().from(knowledgeZapAssignmentToSubject)
      .where(and(
        eq(knowledgeZapAssignmentToSubject.assignmentId, assignmentId),
        eq(knowledgeZapAssignmentToSubject.subjectId, subjectId)
      ))
      .limit(1);

    if (existingMapping.length > 0) {
      console.log(`Knowledge Zap assignment ${assignmentId} is already mapped to subject ${subjectId}`);
      return;
    }

    // Create mapping
    await db.insert(knowledgeZapAssignmentToSubject).values({
      id: generateId(21),
      assignmentId,
      subjectId,
    });

    console.log(`Successfully mapped Knowledge Zap assignment ${assignmentId} to subject ${subjectId}`);
  } catch (error) {
    console.error(`Error mapping Knowledge Zap assignment to subject:`, error);
  }
}

/**
 * Maps a Step Solve assignment template to a specific course
 */
export async function mapStepSolveTemplateToCourse(templateId: string, courseId: string) {
  try {
    // Check if template exists
    const template = await db.select().from(stepSolveAssignmentTemplates)
      .where(eq(stepSolveAssignmentTemplates.id, templateId))
      .limit(1);
    
    if (template.length === 0) {
      console.log(`Step Solve template with ID ${templateId} not found`);
      return;
    }

    // Check if course exists
    const course = await db.select().from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);
    
    if (course.length === 0) {
      console.log(`Course with ID ${courseId} not found`);
      return;
    }

    // Check if mapping already exists
    const existingMapping = await db.select().from(stepSolveAssignmentTemplateToCourse)
      .where(and(
        eq(stepSolveAssignmentTemplateToCourse.templateId, templateId),
        eq(stepSolveAssignmentTemplateToCourse.courseId, courseId)
      ))
      .limit(1);

    if (existingMapping.length > 0) {
      console.log(`Step Solve template ${templateId} is already mapped to course ${courseId}`);
      return;
    }

    // Create mapping
    await db.insert(stepSolveAssignmentTemplateToCourse).values({
      id: generateId(21),
      templateId,
      courseId,
    });

    console.log(`Successfully mapped Step Solve template ${templateId} to course ${courseId}`);
  } catch (error) {
    console.error(`Error mapping Step Solve template to course:`, error);
  }
}

/**
 * Maps a Step Solve assignment template to a specific grade
 */
export async function mapStepSolveTemplateToGrade(templateId: string, grade: string) {
  try {
    // Check if template exists
    const template = await db.select().from(stepSolveAssignmentTemplates)
      .where(eq(stepSolveAssignmentTemplates.id, templateId))
      .limit(1);
    
    if (template.length === 0) {
      console.log(`Step Solve template with ID ${templateId} not found`);
      return;
    }

    // Check if mapping already exists
    const existingMapping = await db.select().from(stepSolveAssignmentTemplateToGrade)
      .where(and(
        eq(stepSolveAssignmentTemplateToGrade.templateId, templateId),
        eq(stepSolveAssignmentTemplateToGrade.grade, grade)
      ))
      .limit(1);

    if (existingMapping.length > 0) {
      console.log(`Step Solve template ${templateId} is already mapped to grade ${grade}`);
      return;
    }

    // Create mapping
    await db.insert(stepSolveAssignmentTemplateToGrade).values({
      id: generateId(21),
      templateId,
      grade,
    });

    console.log(`Successfully mapped Step Solve template ${templateId} to grade ${grade}`);
  } catch (error) {
    console.error(`Error mapping Step Solve template to grade:`, error);
  }
}

/**
 * Maps a Step Solve assignment template to a specific subject
 */
export async function mapStepSolveTemplateToSubject(templateId: string, subjectId: string) {
  try {
    // Check if template exists
    const template = await db.select().from(stepSolveAssignmentTemplates)
      .where(eq(stepSolveAssignmentTemplates.id, templateId))
      .limit(1);
    
    if (template.length === 0) {
      console.log(`Step Solve template with ID ${templateId} not found`);
      return;
    }

    // Check if subject exists
    const subject = await db.select().from(subjects)
      .where(eq(subjects.id, subjectId))
      .limit(1);
    
    if (subject.length === 0) {
      console.log(`Subject with ID ${subjectId} not found`);
      return;
    }

    // Check if mapping already exists
    const existingMapping = await db.select().from(stepSolveAssignmentTemplateToSubject)
      .where(and(
        eq(stepSolveAssignmentTemplateToSubject.templateId, templateId),
        eq(stepSolveAssignmentTemplateToSubject.subjectId, subjectId)
      ))
      .limit(1);

    if (existingMapping.length > 0) {
      console.log(`Step Solve template ${templateId} is already mapped to subject ${subjectId}`);
      return;
    }

    // Create mapping
    await db.insert(stepSolveAssignmentTemplateToSubject).values({
      id: generateId(21),
      templateId,
      subjectId,
    });

    console.log(`Successfully mapped Step Solve template ${templateId} to subject ${subjectId}`);
  } catch (error) {
    console.error(`Error mapping Step Solve template to subject:`, error);
  }
}

/**
 * Maps a Read and Relay assignment to a specific course
 */
export async function mapReadAndRelayAssignmentToCourse(assignmentId: string, courseId: string) {
  try {
    // Check if assignment exists
    const assignment = await db.select().from(readAndRelayAssignments)
      .where(eq(readAndRelayAssignments.id, assignmentId))
      .limit(1);
    
    if (assignment.length === 0) {
      console.log(`Read and Relay assignment with ID ${assignmentId} not found`);
      return;
    }

    // Check if course exists
    const course = await db.select().from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);
    
    if (course.length === 0) {
      console.log(`Course with ID ${courseId} not found`);
      return;
    }

    // Check if mapping already exists
    const existingMapping = await db.select().from(readAndRelayAssignmentToCourse)
      .where(and(
        eq(readAndRelayAssignmentToCourse.assignmentId, assignmentId),
        eq(readAndRelayAssignmentToCourse.courseId, courseId)
      ))
      .limit(1);

    if (existingMapping.length > 0) {
      console.log(`Read and Relay assignment ${assignmentId} is already mapped to course ${courseId}`);
      return;
    }

    // Create mapping
    await db.insert(readAndRelayAssignmentToCourse).values({
      id: generateId(21),
      assignmentId,
      courseId,
    });

    console.log(`Successfully mapped Read and Relay assignment ${assignmentId} to course ${courseId}`);
  } catch (error) {
    console.error(`Error mapping Read and Relay assignment to course:`, error);
  }
}

/**
 * Maps a Read and Relay assignment to a specific grade
 */
export async function mapReadAndRelayAssignmentToGrade(assignmentId: string, grade: string) {
  try {
    // Check if assignment exists
    const assignment = await db.select().from(readAndRelayAssignments)
      .where(eq(readAndRelayAssignments.id, assignmentId))
      .limit(1);
    
    if (assignment.length === 0) {
      console.log(`Read and Relay assignment with ID ${assignmentId} not found`);
      return;
    }

    // Check if mapping already exists
    const existingMapping = await db.select().from(readAndRelayAssignmentToGrade)
      .where(and(
        eq(readAndRelayAssignmentToGrade.assignmentId, assignmentId),
        eq(readAndRelayAssignmentToGrade.grade, grade)
      ))
      .limit(1);

    if (existingMapping.length > 0) {
      console.log(`Read and Relay assignment ${assignmentId} is already mapped to grade ${grade}`);
      return;
    }

    // Create mapping
    await db.insert(readAndRelayAssignmentToGrade).values({
      id: generateId(21),
      assignmentId,
      grade,
    });

    console.log(`Successfully mapped Read and Relay assignment ${assignmentId} to grade ${grade}`);
  } catch (error) {
    console.error(`Error mapping Read and Relay assignment to grade:`, error);
  }
}

/**
 * Maps a Read and Relay assignment to a specific subject
 */
export async function mapReadAndRelayAssignmentToSubject(assignmentId: string, subjectId: string) {
  try {
    // Check if assignment exists
    const assignment = await db.select().from(readAndRelayAssignments)
      .where(eq(readAndRelayAssignments.id, assignmentId))
      .limit(1);
    
    if (assignment.length === 0) {
      console.log(`Read and Relay assignment with ID ${assignmentId} not found`);
      return;
    }

    // Check if subject exists
    const subject = await db.select().from(subjects)
      .where(eq(subjects.id, subjectId))
      .limit(1);
    
    if (subject.length === 0) {
      console.log(`Subject with ID ${subjectId} not found`);
      return;
    }

    // Check if mapping already exists
    const existingMapping = await db.select().from(readAndRelayAssignmentToSubject)
      .where(and(
        eq(readAndRelayAssignmentToSubject.assignmentId, assignmentId),
        eq(readAndRelayAssignmentToSubject.subjectId, subjectId)
      ))
      .limit(1);

    if (existingMapping.length > 0) {
      console.log(`Read and Relay assignment ${assignmentId} is already mapped to subject ${subjectId}`);
      return;
    }

    // Create mapping
    await db.insert(readAndRelayAssignmentToSubject).values({
      id: generateId(21),
      assignmentId,
      subjectId,
    });

    console.log(`Successfully mapped Read and Relay assignment ${assignmentId} to subject ${subjectId}`);
  } catch (error) {
    console.error(`Error mapping Read and Relay assignment to subject:`, error);
  }
}

/**
 * Maps a Concept Mapping assignment to a specific course
 */
export async function mapConceptMappingAssignmentToCourse(assignmentId: string, courseId: string) {
  try {
    // Check if assignment exists
    const assignment = await db.select().from(conceptMappingAssignments)
      .where(eq(conceptMappingAssignments.id, assignmentId))
      .limit(1);
    
    if (assignment.length === 0) {
      console.log(`Concept Mapping assignment with ID ${assignmentId} not found`);
      return;
    }

    // Check if course exists
    const course = await db.select().from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);
    
    if (course.length === 0) {
      console.log(`Course with ID ${courseId} not found`);
      return;
    }

    // Check if mapping already exists
    const existingMapping = await db.select().from(conceptMappingAssignmentToCourse)
      .where(and(
        eq(conceptMappingAssignmentToCourse.assignmentId, assignmentId),
        eq(conceptMappingAssignmentToCourse.courseId, courseId)
      ))
      .limit(1);

    if (existingMapping.length > 0) {
      console.log(`Concept Mapping assignment ${assignmentId} is already mapped to course ${courseId}`);
      return;
    }

    // Create mapping
    await db.insert(conceptMappingAssignmentToCourse).values({
      id: generateId(21),
      assignmentId,
      courseId,
    });

    console.log(`Successfully mapped Concept Mapping assignment ${assignmentId} to course ${courseId}`);
  } catch (error) {
    console.error(`Error mapping Concept Mapping assignment to course:`, error);
  }
}

/**
 * Maps a Concept Mapping assignment to a specific grade
 */
export async function mapConceptMappingAssignmentToGrade(assignmentId: string, grade: string) {
  try {
    // Check if assignment exists
    const assignment = await db.select().from(conceptMappingAssignments)
      .where(eq(conceptMappingAssignments.id, assignmentId))
      .limit(1);
    
    if (assignment.length === 0) {
      console.log(`Concept Mapping assignment with ID ${assignmentId} not found`);
      return;
    }

    // Check if mapping already exists
    const existingMapping = await db.select().from(conceptMappingAssignmentToGrade)
      .where(and(
        eq(conceptMappingAssignmentToGrade.assignmentId, assignmentId),
        eq(conceptMappingAssignmentToGrade.grade, grade)
      ))
      .limit(1);

    if (existingMapping.length > 0) {
      console.log(`Concept Mapping assignment ${assignmentId} is already mapped to grade ${grade}`);
      return;
    }

    // Create mapping
    await db.insert(conceptMappingAssignmentToGrade).values({
      id: generateId(21),
      assignmentId,
      grade,
    });

    console.log(`Successfully mapped Concept Mapping assignment ${assignmentId} to grade ${grade}`);
  } catch (error) {
    console.error(`Error mapping Concept Mapping assignment to grade:`, error);
  }
}

/**
 * Maps a Concept Mapping assignment to a specific subject
 */
export async function mapConceptMappingAssignmentToSubject(assignmentId: string, subjectId: string) {
  try {
    // Check if assignment exists
    const assignment = await db.select().from(conceptMappingAssignments)
      .where(eq(conceptMappingAssignments.id, assignmentId))
      .limit(1);
    
    if (assignment.length === 0) {
      console.log(`Concept Mapping assignment with ID ${assignmentId} not found`);
      return;
    }

    // Check if subject exists
    const subject = await db.select().from(subjects)
      .where(eq(subjects.id, subjectId))
      .limit(1);
    
    if (subject.length === 0) {
      console.log(`Subject with ID ${subjectId} not found`);
      return;
    }

    // Check if mapping already exists
    const existingMapping = await db.select().from(conceptMappingAssignmentToSubject)
      .where(and(
        eq(conceptMappingAssignmentToSubject.assignmentId, assignmentId),
        eq(conceptMappingAssignmentToSubject.subjectId, subjectId)
      ))
      .limit(1);

    if (existingMapping.length > 0) {
      console.log(`Concept Mapping assignment ${assignmentId} is already mapped to subject ${subjectId}`);
      return;
    }

    // Create mapping
    await db.insert(conceptMappingAssignmentToSubject).values({
      id: generateId(21),
      assignmentId,
      subjectId,
    });

    console.log(`Successfully mapped Concept Mapping assignment ${assignmentId} to subject ${subjectId}`);
  } catch (error) {
    console.error(`Error mapping Concept Mapping assignment to subject:`, error);
  }
}

/**
 * Maps a Reasoning assignment to a specific course
 */
export async function mapReasoningAssignmentToCourse(assignmentId: string, courseId: string) {
  try {
    // Check if assignment exists
    const assignment = await db.select().from(reasoningAssignments)
      .where(eq(reasoningAssignments.id, assignmentId))
      .limit(1);
    
    if (assignment.length === 0) {
      console.log(`Reasoning assignment with ID ${assignmentId} not found`);
      return;
    }

    // Check if course exists
    const course = await db.select().from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);
    
    if (course.length === 0) {
      console.log(`Course with ID ${courseId} not found`);
      return;
    }

    // Check if mapping already exists
    const existingMapping = await db.select().from(reasoningAssignmentToCourse)
      .where(and(
        eq(reasoningAssignmentToCourse.assignmentId, assignmentId),
        eq(reasoningAssignmentToCourse.courseId, courseId)
      ))
      .limit(1);

    if (existingMapping.length > 0) {
      console.log(`Reasoning assignment ${assignmentId} is already mapped to course ${courseId}`);
      return;
    }

    // Create mapping
    await db.insert(reasoningAssignmentToCourse).values({
      id: generateId(21),
      assignmentId,
      courseId,
    });

    console.log(`Successfully mapped Reasoning assignment ${assignmentId} to course ${courseId}`);
  } catch (error) {
    console.error(`Error mapping Reasoning assignment to course:`, error);
  }
}

/**
 * Maps a Reasoning assignment to a specific grade
 */
export async function mapReasoningAssignmentToGrade(assignmentId: string, grade: string) {
  try {
    // Check if assignment exists
    const assignment = await db.select().from(reasoningAssignments)
      .where(eq(reasoningAssignments.id, assignmentId))
      .limit(1);
    
    if (assignment.length === 0) {
      console.log(`Reasoning assignment with ID ${assignmentId} not found`);
      return;
    }

    // Check if mapping already exists
    const existingMapping = await db.select().from(reasoningAssignmentToGrade)
      .where(and(
        eq(reasoningAssignmentToGrade.assignmentId, assignmentId),
        eq(reasoningAssignmentToGrade.grade, grade)
      ))
      .limit(1);

    if (existingMapping.length > 0) {
      console.log(`Reasoning assignment ${assignmentId} is already mapped to grade ${grade}`);
      return;
    }

    // Create mapping
    await db.insert(reasoningAssignmentToGrade).values({
      id: generateId(21),
      assignmentId,
      grade,
    });

    console.log(`Successfully mapped Reasoning assignment ${assignmentId} to grade ${grade}`);
  } catch (error) {
    console.error(`Error mapping Reasoning assignment to grade:`, error);
  }
}

/**
 * Maps a Reasoning assignment to a specific subject
 */
export async function mapReasoningAssignmentToSubject(assignmentId: string, subjectId: string) {
  try {
    // Check if assignment exists
    const assignment = await db.select().from(reasoningAssignments)
      .where(eq(reasoningAssignments.id, assignmentId))
      .limit(1);
    
    if (assignment.length === 0) {
      console.log(`Reasoning assignment with ID ${assignmentId} not found`);
      return;
    }

    // Check if subject exists
    const subject = await db.select().from(subjects)
      .where(eq(subjects.id, subjectId))
      .limit(1);
    
    if (subject.length === 0) {
      console.log(`Subject with ID ${subjectId} not found`);
      return;
    }

    // Check if mapping already exists
    const existingMapping = await db.select().from(reasoningAssignmentToSubject)
      .where(and(
        eq(reasoningAssignmentToSubject.assignmentId, assignmentId),
        eq(reasoningAssignmentToSubject.subjectId, subjectId)
      ))
      .limit(1);

    if (existingMapping.length > 0) {
      console.log(`Reasoning assignment ${assignmentId} is already mapped to subject ${subjectId}`);
      return;
    }

    // Create mapping
    await db.insert(reasoningAssignmentToSubject).values({
      id: generateId(21),
      assignmentId,
      subjectId,
    });

    console.log(`Successfully mapped Reasoning assignment ${assignmentId} to subject ${subjectId}`);
  } catch (error) {
    console.error(`Error mapping Reasoning assignment to subject:`, error);
  }
}

/**
 * Maps an Explain (Learn by Teaching) assignment to a specific course
 */
export async function mapExplainAssignmentToCourse(assignmentId: string, courseId: string) {
  try {
    // Check if assignment exists
    const assignment = await db.select().from(explainAssignments)
      .where(eq(explainAssignments.id, assignmentId))
      .limit(1);
    
    if (assignment.length === 0) {
      console.log(`Explain assignment with ID ${assignmentId} not found`);
      return;
    }

    // Check if course exists
    const course = await db.select().from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);
    
    if (course.length === 0) {
      console.log(`Course with ID ${courseId} not found`);
      return;
    }

    // Check if mapping already exists
    const existingMapping = await db.select().from(explainAssignmentToCourse)
      .where(and(
        eq(explainAssignmentToCourse.assignmentId, assignmentId),
        eq(explainAssignmentToCourse.courseId, courseId)
      ))
      .limit(1);

    if (existingMapping.length > 0) {
      console.log(`Explain assignment ${assignmentId} is already mapped to course ${courseId}`);
      return;
    }

    // Create mapping
    await db.insert(explainAssignmentToCourse).values({
      id: generateId(21),
      assignmentId,
      courseId,
    });

    console.log(`Successfully mapped Explain assignment ${assignmentId} to course ${courseId}`);
  } catch (error) {
    console.error(`Error mapping Explain assignment to course:`, error);
  }
}

/**
 * Maps an Explain (Learn by Teaching) assignment to a specific grade
 */
export async function mapExplainAssignmentToGrade(assignmentId: string, grade: string) {
  try {
    // Check if assignment exists
    const assignment = await db.select().from(explainAssignments)
      .where(eq(explainAssignments.id, assignmentId))
      .limit(1);
    
    if (assignment.length === 0) {
      console.log(`Explain assignment with ID ${assignmentId} not found`);
      return;
    }

    // Check if mapping already exists
    const existingMapping = await db.select().from(explainAssignmentToGrade)
      .where(and(
        eq(explainAssignmentToGrade.assignmentId, assignmentId),
        eq(explainAssignmentToGrade.grade, grade)
      ))
      .limit(1);

    if (existingMapping.length > 0) {
      console.log(`Explain assignment ${assignmentId} is already mapped to grade ${grade}`);
      return;
    }

    // Create mapping
    await db.insert(explainAssignmentToGrade).values({
      id: generateId(21),
      assignmentId,
      grade,
    });

    console.log(`Successfully mapped Explain assignment ${assignmentId} to grade ${grade}`);
  } catch (error) {
    console.error(`Error mapping Explain assignment to grade:`, error);
  }
}

/**
 * Maps an Explain (Learn by Teaching) assignment to a specific subject
 */
export async function mapExplainAssignmentToSubject(assignmentId: string, subjectId: string) {
  try {
    // Check if assignment exists
    const assignment = await db.select().from(explainAssignments)
      .where(eq(explainAssignments.id, assignmentId))
      .limit(1);
    
    if (assignment.length === 0) {
      console.log(`Explain assignment with ID ${assignmentId} not found`);
      return;
    }

    // Check if subject exists
    const subject = await db.select().from(subjects)
      .where(eq(subjects.id, subjectId))
      .limit(1);
    
    if (subject.length === 0) {
      console.log(`Subject with ID ${subjectId} not found`);
      return;
    }

    // Check if mapping already exists
    const existingMapping = await db.select().from(explainAssignmentToSubject)
      .where(and(
        eq(explainAssignmentToSubject.assignmentId, assignmentId),
        eq(explainAssignmentToSubject.subjectId, subjectId)
      ))
      .limit(1);

    if (existingMapping.length > 0) {
      console.log(`Explain assignment ${assignmentId} is already mapped to subject ${subjectId}`);
      return;
    }

    // Create mapping
    await db.insert(explainAssignmentToSubject).values({
      id: generateId(21),
      assignmentId,
      subjectId,
    });

    console.log(`Successfully mapped Explain assignment ${assignmentId} to subject ${subjectId}`);
  } catch (error) {
    console.error(`Error mapping Explain assignment to subject:`, error);
  }
}

// ========================================
// GET ALL ASSIGNMENTS FUNCTIONS
// ========================================

/**
 * Gets all Knowledge Zap assignments
 */
export async function getAllKnowledgeZapAssignments() {
  try {
    const assignments = await db.select().from(knowledgeZapAssignments);
    console.log(`Found ${assignments.length} Knowledge Zap assignments`);
    return assignments;
  } catch (error) {
    console.error(`Error getting all Knowledge Zap assignments:`, error);
    return [];
  }
}

/**
 * Gets all Step Solve assignment templates
 */
export async function getAllStepSolveTemplates() {
  try {
    const templates = await db.select().from(stepSolveAssignmentTemplates);
    console.log(`Found ${templates.length} Step Solve templates`);
    return templates;
  } catch (error) {
    console.error(`Error getting all Step Solve templates:`, error);
    return [];
  }
}

/**
 * Gets all Read and Relay assignments
 */
export async function getAllReadAndRelayAssignments() {
  try {
    const assignments = await db.select().from(readAndRelayAssignments);
    console.log(`Found ${assignments.length} Read and Relay assignments`);
    return assignments;
  } catch (error) {
    console.error(`Error getting all Read and Relay assignments:`, error);
    return [];
  }
}

/**
 * Gets all Concept Mapping assignments
 */
export async function getAllConceptMappingAssignments() {
  try {
    const assignments = await db.select().from(conceptMappingAssignments);
    console.log(`Found ${assignments.length} Concept Mapping assignments`);
    return assignments;
  } catch (error) {
    console.error(`Error getting all Concept Mapping assignments:`, error);
    return [];
  }
}

/**
 * Gets all Reasoning assignments
 */
export async function getAllReasoningAssignments() {
  try {
    const assignments = await db.select().from(reasoningAssignments);
    console.log(`Found ${assignments.length} Reasoning assignments`);
    return assignments;
  } catch (error) {
    console.error(`Error getting all Reasoning assignments:`, error);
    return [];
  }
}

/**
 * Gets all Explain (Learn by Teaching) assignments
 */
export async function getAllExplainAssignments() {
  try {
    const assignments = await db.select().from(explainAssignments);
    console.log(`Found ${assignments.length} Explain assignments`);
    return assignments;
  } catch (error) {
    console.error(`Error getting all Explain assignments:`, error);
    return [];
  }
}

/**
 * Gets all assignments from all types
 */
export async function getAllAssignments() {
  try {
    const [
      knowledgeZap,
      stepSolve,
      readAndRelay,
      conceptMapping,
      reasoning,
      explain
    ] = await Promise.all([
      getAllKnowledgeZapAssignments(),
      getAllStepSolveTemplates(),
      getAllReadAndRelayAssignments(),
      getAllConceptMappingAssignments(),
      getAllReasoningAssignments(),
      getAllExplainAssignments()
    ]);

    return {
      knowledgeZap,
      stepSolve,
      readAndRelay,
      conceptMapping,
      reasoning,
      explain,
      total: knowledgeZap.length + stepSolve.length + readAndRelay.length + 
             conceptMapping.length + reasoning.length + explain.length
    };
  } catch (error) {
    console.error(`Error getting all assignments:`, error);
    return {
      knowledgeZap: [],
      stepSolve: [],
      readAndRelay: [],
      conceptMapping: [],
      reasoning: [],
      explain: [],
      total: 0
    };
  }
}

// ========================================
// BULK MAPPING FUNCTIONS - TO COURSE
// ========================================

/**
 * Maps all Knowledge Zap assignments to a specific course
 */
export async function mapAllKnowledgeZapAssignmentsToCourse(courseId: string) {
  try {
    const assignments = await getAllKnowledgeZapAssignments();
    const results = await Promise.allSettled(
      assignments.map(assignment => 
        mapKnowledgeZapAssignmentToCourse(assignment.id, courseId)
      )
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Mapped ${successful} Knowledge Zap assignments to course ${courseId}. Failed: ${failed}`);
    return { successful, failed, total: assignments.length };
  } catch (error) {
    console.error(`Error mapping all Knowledge Zap assignments to course:`, error);
    return { successful: 0, failed: 0, total: 0 };
  }
}

/**
 * Maps all Step Solve templates to a specific course
 */
export async function mapAllStepSolveTemplatesToCourse(courseId: string) {
  try {
    const templates = await getAllStepSolveTemplates();
    const results = await Promise.allSettled(
      templates.map(template => 
        mapStepSolveTemplateToCourse(template.id, courseId)
      )
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Mapped ${successful} Step Solve templates to course ${courseId}. Failed: ${failed}`);
    return { successful, failed, total: templates.length };
  } catch (error) {
    console.error(`Error mapping all Step Solve templates to course:`, error);
    return { successful: 0, failed: 0, total: 0 };
  }
}

/**
 * Maps all Read and Relay assignments to a specific course
 */
export async function mapAllReadAndRelayAssignmentsToCourse(courseId: string) {
  try {
    const assignments = await getAllReadAndRelayAssignments();
    const results = await Promise.allSettled(
      assignments.map(assignment => 
        mapReadAndRelayAssignmentToCourse(assignment.id, courseId)
      )
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Mapped ${successful} Read and Relay assignments to course ${courseId}. Failed: ${failed}`);
    return { successful, failed, total: assignments.length };
  } catch (error) {
    console.error(`Error mapping all Read and Relay assignments to course:`, error);
    return { successful: 0, failed: 0, total: 0 };
  }
}

/**
 * Maps all Concept Mapping assignments to a specific course
 */
export async function mapAllConceptMappingAssignmentsToCourse(courseId: string) {
  try {
    const assignments = await getAllConceptMappingAssignments();
    const results = await Promise.allSettled(
      assignments.map(assignment => 
        mapConceptMappingAssignmentToCourse(assignment.id, courseId)
      )
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Mapped ${successful} Concept Mapping assignments to course ${courseId}. Failed: ${failed}`);
    return { successful, failed, total: assignments.length };
  } catch (error) {
    console.error(`Error mapping all Concept Mapping assignments to course:`, error);
    return { successful: 0, failed: 0, total: 0 };
  }
}

/**
 * Maps all Reasoning assignments to a specific course
 */
export async function mapAllReasoningAssignmentsToCourse(courseId: string) {
  try {
    const assignments = await getAllReasoningAssignments();
    const results = await Promise.allSettled(
      assignments.map(assignment => 
        mapReasoningAssignmentToCourse(assignment.id, courseId)
      )
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Mapped ${successful} Reasoning assignments to course ${courseId}. Failed: ${failed}`);
    return { successful, failed, total: assignments.length };
  } catch (error) {
    console.error(`Error mapping all Reasoning assignments to course:`, error);
    return { successful: 0, failed: 0, total: 0 };
  }
}

/**
 * Maps all Explain assignments to a specific course
 */
export async function mapAllExplainAssignmentsToCourse(courseId: string) {
  try {
    const assignments = await getAllExplainAssignments();
    const results = await Promise.allSettled(
      assignments.map(assignment => 
        mapExplainAssignmentToCourse(assignment.id, courseId)
      )
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Mapped ${successful} Explain assignments to course ${courseId}. Failed: ${failed}`);
    return { successful, failed, total: assignments.length };
  } catch (error) {
    console.error(`Error mapping all Explain assignments to course:`, error);
    return { successful: 0, failed: 0, total: 0 };
  }
}

/**
 * Maps all assignments of all types to a specific course
 */
export async function mapAllAssignmentsToCourse(courseId: string) {
  try {
    console.log(`Starting bulk mapping of all assignments to course ${courseId}`);
    
    const results = await Promise.allSettled([
      mapAllKnowledgeZapAssignmentsToCourse(courseId),
      mapAllStepSolveTemplatesToCourse(courseId),
      mapAllReadAndRelayAssignmentsToCourse(courseId),
      mapAllConceptMappingAssignmentsToCourse(courseId),
      mapAllReasoningAssignmentsToCourse(courseId),
      mapAllExplainAssignmentsToCourse(courseId)
    ]);

    const summary = results.reduce((acc, result) => {
      if (result.status === 'fulfilled') {
        acc.successful += result.value.successful;
        acc.failed += result.value.failed;
        acc.total += result.value.total;
      }
      return acc;
    }, { successful: 0, failed: 0, total: 0 });

    console.log(`Bulk mapping to course ${courseId} completed. Success: ${summary.successful}, Failed: ${summary.failed}, Total: ${summary.total}`);
    return summary;
  } catch (error) {
    console.error(`Error mapping all assignments to course:`, error);
    return { successful: 0, failed: 0, total: 0 };
  }
}

// ========================================
// BULK MAPPING FUNCTIONS - TO GRADE
// ========================================

/**
 * Maps all Knowledge Zap assignments to a specific grade
 */
export async function mapAllKnowledgeZapAssignmentsToGrade(grade: string) {
  try {
    const assignments = await getAllKnowledgeZapAssignments();
    const results = await Promise.allSettled(
      assignments.map(assignment => 
        mapKnowledgeZapAssignmentToGrade(assignment.id, grade)
      )
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Mapped ${successful} Knowledge Zap assignments to grade ${grade}. Failed: ${failed}`);
    return { successful, failed, total: assignments.length };
  } catch (error) {
    console.error(`Error mapping all Knowledge Zap assignments to grade:`, error);
    return { successful: 0, failed: 0, total: 0 };
  }
}

/**
 * Maps all Step Solve templates to a specific grade
 */
export async function mapAllStepSolveTemplatesToGrade(grade: string) {
  try {
    const templates = await getAllStepSolveTemplates();
    const results = await Promise.allSettled(
      templates.map(template => 
        mapStepSolveTemplateToGrade(template.id, grade)
      )
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Mapped ${successful} Step Solve templates to grade ${grade}. Failed: ${failed}`);
    return { successful, failed, total: templates.length };
  } catch (error) {
    console.error(`Error mapping all Step Solve templates to grade:`, error);
    return { successful: 0, failed: 0, total: 0 };
  }
}

/**
 * Maps all Read and Relay assignments to a specific grade
 */
export async function mapAllReadAndRelayAssignmentsToGrade(grade: string) {
  try {
    const assignments = await getAllReadAndRelayAssignments();
    const results = await Promise.allSettled(
      assignments.map(assignment => 
        mapReadAndRelayAssignmentToGrade(assignment.id, grade)
      )
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Mapped ${successful} Read and Relay assignments to grade ${grade}. Failed: ${failed}`);
    return { successful, failed, total: assignments.length };
  } catch (error) {
    console.error(`Error mapping all Read and Relay assignments to grade:`, error);
    return { successful: 0, failed: 0, total: 0 };
  }
}

/**
 * Maps all Concept Mapping assignments to a specific grade
 */
export async function mapAllConceptMappingAssignmentsToGrade(grade: string) {
  try {
    const assignments = await getAllConceptMappingAssignments();
    const results = await Promise.allSettled(
      assignments.map(assignment => 
        mapConceptMappingAssignmentToGrade(assignment.id, grade)
      )
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Mapped ${successful} Concept Mapping assignments to grade ${grade}. Failed: ${failed}`);
    return { successful, failed, total: assignments.length };
  } catch (error) {
    console.error(`Error mapping all Concept Mapping assignments to grade:`, error);
    return { successful: 0, failed: 0, total: 0 };
  }
}

/**
 * Maps all Reasoning assignments to a specific grade
 */
export async function mapAllReasoningAssignmentsToGrade(grade: string) {
  try {
    const assignments = await getAllReasoningAssignments();
    const results = await Promise.allSettled(
      assignments.map(assignment => 
        mapReasoningAssignmentToGrade(assignment.id, grade)
      )
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Mapped ${successful} Reasoning assignments to grade ${grade}. Failed: ${failed}`);
    return { successful, failed, total: assignments.length };
  } catch (error) {
    console.error(`Error mapping all Reasoning assignments to grade:`, error);
    return { successful: 0, failed: 0, total: 0 };
  }
}

/**
 * Maps all Explain assignments to a specific grade
 */
export async function mapAllExplainAssignmentsToGrade(grade: string) {
  try {
    const assignments = await getAllExplainAssignments();
    const results = await Promise.allSettled(
      assignments.map(assignment => 
        mapExplainAssignmentToGrade(assignment.id, grade)
      )
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Mapped ${successful} Explain assignments to grade ${grade}. Failed: ${failed}`);
    return { successful, failed, total: assignments.length };
  } catch (error) {
    console.error(`Error mapping all Explain assignments to grade:`, error);
    return { successful: 0, failed: 0, total: 0 };
  }
}

/**
 * Maps all assignments of all types to a specific grade
 */
export async function mapAllAssignmentsToGrade(grade: string) {
  try {
    console.log(`Starting bulk mapping of all assignments to grade ${grade}`);
    
    const results = await Promise.allSettled([
      mapAllKnowledgeZapAssignmentsToGrade(grade),
      mapAllStepSolveTemplatesToGrade(grade),
      mapAllReadAndRelayAssignmentsToGrade(grade),
      mapAllConceptMappingAssignmentsToGrade(grade),
      mapAllReasoningAssignmentsToGrade(grade),
      mapAllExplainAssignmentsToGrade(grade)
    ]);

    const summary = results.reduce((acc, result) => {
      if (result.status === 'fulfilled') {
        acc.successful += result.value.successful;
        acc.failed += result.value.failed;
        acc.total += result.value.total;
      }
      return acc;
    }, { successful: 0, failed: 0, total: 0 });

    console.log(`Bulk mapping to grade ${grade} completed. Success: ${summary.successful}, Failed: ${summary.failed}, Total: ${summary.total}`);
    return summary;
  } catch (error) {
    console.error(`Error mapping all assignments to grade:`, error);
    return { successful: 0, failed: 0, total: 0 };
  }
}

// ========================================
// BULK MAPPING FUNCTIONS - TO SUBJECT
// ========================================

/**
 * Maps all Knowledge Zap assignments to a specific subject
 */
export async function mapAllKnowledgeZapAssignmentsToSubject(subjectId: string) {
  try {
    const assignments = await getAllKnowledgeZapAssignments();
    const results = await Promise.allSettled(
      assignments.map(assignment => 
        mapKnowledgeZapAssignmentToSubject(assignment.id, subjectId)
      )
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Mapped ${successful} Knowledge Zap assignments to subject ${subjectId}. Failed: ${failed}`);
    return { successful, failed, total: assignments.length };
  } catch (error) {
    console.error(`Error mapping all Knowledge Zap assignments to subject:`, error);
    return { successful: 0, failed: 0, total: 0 };
  }
}

/**
 * Maps all Step Solve templates to a specific subject
 */
export async function mapAllStepSolveTemplatesToSubject(subjectId: string) {
  try {
    const templates = await getAllStepSolveTemplates();
    const results = await Promise.allSettled(
      templates.map(template => 
        mapStepSolveTemplateToSubject(template.id, subjectId)
      )
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Mapped ${successful} Step Solve templates to subject ${subjectId}. Failed: ${failed}`);
    return { successful, failed, total: templates.length };
  } catch (error) {
    console.error(`Error mapping all Step Solve templates to subject:`, error);
    return { successful: 0, failed: 0, total: 0 };
  }
}

/**
 * Maps all Read and Relay assignments to a specific subject
 */
export async function mapAllReadAndRelayAssignmentsToSubject(subjectId: string) {
  try {
    const assignments = await getAllReadAndRelayAssignments();
    const results = await Promise.allSettled(
      assignments.map(assignment => 
        mapReadAndRelayAssignmentToSubject(assignment.id, subjectId)
      )
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Mapped ${successful} Read and Relay assignments to subject ${subjectId}. Failed: ${failed}`);
    return { successful, failed, total: assignments.length };
  } catch (error) {
    console.error(`Error mapping all Read and Relay assignments to subject:`, error);
    return { successful: 0, failed: 0, total: 0 };
  }
}

/**
 * Maps all Concept Mapping assignments to a specific subject
 */
export async function mapAllConceptMappingAssignmentsToSubject(subjectId: string) {
  try {
    const assignments = await getAllConceptMappingAssignments();
    const results = await Promise.allSettled(
      assignments.map(assignment => 
        mapConceptMappingAssignmentToSubject(assignment.id, subjectId)
      )
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Mapped ${successful} Concept Mapping assignments to subject ${subjectId}. Failed: ${failed}`);
    return { successful, failed, total: assignments.length };
  } catch (error) {
    console.error(`Error mapping all Concept Mapping assignments to subject:`, error);
    return { successful: 0, failed: 0, total: 0 };
  }
}

/**
 * Maps all Reasoning assignments to a specific subject
 */
export async function mapAllReasoningAssignmentsToSubject(subjectId: string) {
  try {
    const assignments = await getAllReasoningAssignments();
    const results = await Promise.allSettled(
      assignments.map(assignment => 
        mapReasoningAssignmentToSubject(assignment.id, subjectId)
      )
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Mapped ${successful} Reasoning assignments to subject ${subjectId}. Failed: ${failed}`);
    return { successful, failed, total: assignments.length };
  } catch (error) {
    console.error(`Error mapping all Reasoning assignments to subject:`, error);
    return { successful: 0, failed: 0, total: 0 };
  }
}

/**
 * Maps all Explain assignments to a specific subject
 */
export async function mapAllExplainAssignmentsToSubject(subjectId: string) {
  try {
    const assignments = await getAllExplainAssignments();
    const results = await Promise.allSettled(
      assignments.map(assignment => 
        mapExplainAssignmentToSubject(assignment.id, subjectId)
      )
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Mapped ${successful} Explain assignments to subject ${subjectId}. Failed: ${failed}`);
    return { successful, failed, total: assignments.length };
  } catch (error) {
    console.error(`Error mapping all Explain assignments to subject:`, error);
    return { successful: 0, failed: 0, total: 0 };
  }
}

/**
 * Maps all assignments of all types to a specific subject
 */
export async function mapAllAssignmentsToSubject(subjectId: string) {
  try {
    console.log(`Starting bulk mapping of all assignments to subject ${subjectId}`);
    
    const results = await Promise.allSettled([
      mapAllKnowledgeZapAssignmentsToSubject(subjectId),
      mapAllStepSolveTemplatesToSubject(subjectId),
      mapAllReadAndRelayAssignmentsToSubject(subjectId),
      mapAllConceptMappingAssignmentsToSubject(subjectId),
      mapAllReasoningAssignmentsToSubject(subjectId),
      mapAllExplainAssignmentsToSubject(subjectId)
    ]);

    const summary = results.reduce((acc, result) => {
      if (result.status === 'fulfilled') {
        acc.successful += result.value.successful;
        acc.failed += result.value.failed;
        acc.total += result.value.total;
      }
      return acc;
    }, { successful: 0, failed: 0, total: 0 });

    console.log(`Bulk mapping to subject ${subjectId} completed. Success: ${summary.successful}, Failed: ${summary.failed}, Total: ${summary.total}`);
    return summary;
  } catch (error) {
    console.error(`Error mapping all assignments to subject:`, error);
    return { successful: 0, failed: 0, total: 0 };
  }
}
