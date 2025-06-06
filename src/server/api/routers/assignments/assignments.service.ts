import { and, eq } from "drizzle-orm";
import type { ProtectedTRPCContext } from "../../trpc";
import type { GetAssignmentsInput } from "./assignments.input";
import { ActivityType } from "@/lib/constants";

// Import all assignment schemas
import { knowledgeZapAssignments } from "@/server/db/schema/knowledgeZap/knowledgeZapAssignment";
import { stepSolveAssignmentTemplates } from "@/server/db/schema/stepSolve/stepSolveAssignment";
import { readAndRelayAssignments } from "@/server/db/schema/readAndRelay/readAndRelayAssignments";
import { conceptMappingAssignments } from "@/server/db/schema/conceptMapping/conceptMappingAssignments";
import { reasoningAssignments } from "@/server/db/schema/reasoning/reasoningAssignment";
import { explainAssignments } from "@/server/db/schema/learnByTeaching/explainAssignment";

export const getAssignments = async (ctx: ProtectedTRPCContext, input: GetAssignmentsInput) => {
  // Fetch all assignments from different types with their topic information
  const [
    knowledgeZapAssignmentsList,
    stepSolveAssignmentsList,
    readAndRelayAssignmentsList,
    conceptMappingAssignmentsList,
    reasoningAssignmentsList,
    explainAssignmentsList
  ] = await Promise.all([
    // Knowledge Zap Assignments
    ctx.db.query.knowledgeZapAssignments.findMany({
      where: and(
        eq(knowledgeZapAssignments.generated, false),
        eq(knowledgeZapAssignments.isLatest, true)
      ),
      columns: {
        id: true,
        name: true,
        description: true,
        topicId: true,
        order: true,
        createdAt: true,
      },
      with: {
        topic: {
          columns: {
            id: true,
            name: true,
            imageUrl: true,
            description: true,
            slug: true,
            order: true,
          }
        }
      }
    }),

    // Step Solve Assignments (using templates)
    ctx.db.query.stepSolveAssignmentTemplates.findMany({
      where: eq(stepSolveAssignmentTemplates.generated, false),
      columns: {
        id: true,
        name: true,
        description: true,
        topicId: true,
        order: true,
        createdAt: true,
      },
      with: {
        topic: {
          columns: {
            id: true,
            name: true,
            imageUrl: true,
            description: true,
            slug: true,
            order: true,
          }
        }
      }
    }),

    // Read And Relay Assignments
    ctx.db.query.readAndRelayAssignments.findMany({
      where: eq(readAndRelayAssignments.generated, false),
      columns: {
        id: true,
        name: true,
        description: true,
        topicId: true,
        order: true,
        createdAt: true,
      },
      with: {
        topic: {
          columns: {
            id: true,
            name: true,
            imageUrl: true,
            description: true,
            slug: true,
            order: true,
          }
        }
      }
    }),

    // Concept Mapping Assignments
    ctx.db.query.conceptMappingAssignments.findMany({
      where: eq(conceptMappingAssignments.generated, false),
      columns: {
        id: true,
        name: true,
        description: true,
        topicId: true,
        order: true,
        createdAt: true,
      },
      with: {
        topic: {
          columns: {
            id: true,
            name: true,
            imageUrl: true,
            description: true,
            slug: true,
            order: true,
          }
        }
      }
    }),

    // Reasoning Assignments
    ctx.db.query.reasoningAssignments.findMany({
      where: eq(reasoningAssignments.generated, false),
      columns: {
        id: true,
        name: true,
        description: true,
        topicId: true,
        order: true,
        createdAt: true,
      },
      with: {
        topic: {
          columns: {
            id: true,
            name: true,
            imageUrl: true,
            description: true,
            slug: true,
            order: true,
          }
        }
      }
    }),

    // Learn By Teaching (Explain) Assignments
    ctx.db.query.explainAssignments.findMany({
      where: eq(explainAssignments.generated, false),
      columns: {
        id: true,
        name: true,
        description: true,
        topicId: true,
        order: true,
        createdAt: true,
      },
      with: {
        topic: {
          columns: {
            id: true,
            name: true,
            imageUrl: true,
            description: true,
            slug: true,
            order: true,
          }
        }
      }
    }),
  ]);

  // Combine all assignments with their types
  const allAssignments = [
    ...knowledgeZapAssignmentsList.map(assignment => ({
      ...assignment,
      typeText: ActivityType.KnowledgeZap,
      dueDate: null, // assignments don't have due dates, activities do
    })),
    ...stepSolveAssignmentsList.map(assignment => ({
      ...assignment,
      typeText: ActivityType.StepSolve,
      dueDate: null,
    })),
    ...readAndRelayAssignmentsList.map(assignment => ({
      ...assignment,
      typeText: ActivityType.ReadAndRelay,
      dueDate: null,
    })),
    ...conceptMappingAssignmentsList.map(assignment => ({
      ...assignment,
      typeText: ActivityType.ConceptMapping,
      dueDate: null,
    })),
    ...reasoningAssignmentsList.map(assignment => ({
      ...assignment,
      typeText: ActivityType.ReasonTrace,
      dueDate: null,
    })),
    ...explainAssignmentsList.map(assignment => ({
      ...assignment,
      typeText: ActivityType.LearnByTeaching,
      dueDate: null,
    })),
  ];

  // Group assignments by topic
  const groupedAssignments: Record<string, {
    slug: string;
    name: string;
    description: string;
    imageUrl: string;
    order: string;
    assignments: {
      id: string;
      name: string;
      description: string;
      typeText: ActivityType;
      topicId: string;
      order: number;
      dueDate: string | null;
      createdAt: Date;
    }[];
  }> = {};

  for (const assignment of allAssignments) {
    if (!assignment.topic) continue;
    
    const topicKey = assignment.topic.slug;
    
    if (!groupedAssignments[topicKey]) {
      groupedAssignments[topicKey] = {
        slug: assignment.topic.slug,
        name: assignment.topic.name,
        description: assignment.topic.description ?? "",
        imageUrl: assignment.topic.imageUrl ?? "",
        order: assignment.topic.order ?? "0",
        assignments: []
      };
    }
    
    groupedAssignments[topicKey].assignments.push({
      id: assignment.id,
      name: assignment.name ?? "Untitled Assignment",
      description: assignment.description ?? "",
      typeText: assignment.typeText,
      topicId: assignment.topicId,
      order: assignment.order ?? 0,
      dueDate: assignment.dueDate,
      createdAt: assignment.createdAt,
    });
  }

  // Convert to array and sort by topic order
  const result = Object.values(groupedAssignments).sort((a, b) => 
    parseInt(a.order) - parseInt(b.order)
  );

  // Sort assignments within each topic by order
  for (const topic of result) {
    topic.assignments.sort((a, b) => a.order - b.order);
  }

  return result;
}; 