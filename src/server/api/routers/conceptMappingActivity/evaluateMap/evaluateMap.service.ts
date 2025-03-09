import { conceptMappingAttemptEdges, conceptMappingAttemptNodes, conceptMappingMapAttempt } from "@/server/db/schema/conceptMapping/conceptMappingAttempts";
import type { ProtectedTRPCContext } from "../../../trpc";
import { type EvaluateMapInput } from "./evaluateMap.input";
import { generateId } from "lucia/dist/crypto";
import { eq } from "drizzle-orm";
import { conceptMappingAssignments } from "@/server/db/schema/conceptMapping/conceptMappingAssignments";

export const evaluateMap = async (ctx: ProtectedTRPCContext, input: EvaluateMapInput) => {

  const { attemptId, assignmentId, conceptNodes, conceptEdges } = input;

  let assignmentIsCorrect = true;

  const assignment = await ctx.db.query.conceptMappingAssignments.findFirst({
    where: eq(conceptMappingAssignments.id, assignmentId),
    with: {
      conceptNodes: true,
      conceptEdges: true,
    }
  });


  const mapAttemptId = generateId(21);
  await ctx.db.insert(conceptMappingMapAttempt).values({
    id: mapAttemptId, 
    attemptId: attemptId,
  });

  const nodesToReturn = [];
  const edgesToReturn = [];

  for (const node of conceptNodes) {
    // Find the corresponding node in the assignment's concept map
    const correctNode = assignment?.conceptNodes.find(
      (correctNode) => correctNode.id === node.id
    );
    // Check if the node label matches the correct labe   l
    const nodeIsCorrect = correctNode?.label.toLowerCase() === node.label.toLowerCase();

    await ctx.db.insert(conceptMappingAttemptNodes).values({
      id: generateId(21),
      attemptId: attemptId,
      mapAttemptId: mapAttemptId,
      nodeId: node.id,
      label: node.label,
      isCorrect: nodeIsCorrect, // Add the correctness status
    });

    nodesToReturn.push({
      id: node.id,
      label: node.label,
      isCorrect: nodeIsCorrect,
    });

    if (!nodeIsCorrect) {
      assignmentIsCorrect = false;
    }
  }

  for (const edge of conceptEdges) {

    if(!edge.label || !edge.sourceNodeId  || !edge.targetNodeId ) {
      assignmentIsCorrect = false;
    }

    // Check for edge in both directions
    const correctEdge = assignment?.conceptEdges.find(
      (correctEdge) => 
        // Check A->B
        (correctEdge.sourceNodeId === edge.sourceNodeId && 
         correctEdge.targetNodeId === edge.targetNodeId) ||
        // Check B->A
        (correctEdge.sourceNodeId === edge.targetNodeId && 
         correctEdge.targetNodeId === edge.sourceNodeId)
    );

    let edgeIsCorrect = true;

    if (!correctEdge) {
      edgeIsCorrect = false;
      assignmentIsCorrect = false;
    } else if (correctEdge.label.toLowerCase() !== edge.label.toLowerCase()) {
      edgeIsCorrect = false;
      assignmentIsCorrect = false;
    }

    await ctx.db.insert(conceptMappingAttemptEdges).values({
      id: generateId(21),
      attemptId: attemptId,
      mapAttemptId: mapAttemptId,
      sourceNodeId: edge.sourceNodeId,
      targetNodeId: edge.targetNodeId,
      label: edge.label,
      isCorrect: edgeIsCorrect,
    });

    edgesToReturn.push({
      id: edge.id,
      sourceNodeId: edge.sourceNodeId,
      targetNodeId: edge.targetNodeId,
      label: edge.label,
      isCorrect: edgeIsCorrect,
    });
  }

  await ctx.db.update(conceptMappingMapAttempt).set({
    isCorrect: assignmentIsCorrect,
  }).where(eq(conceptMappingMapAttempt.id, mapAttemptId));

  return {
    assignmentIsCorrect: assignmentIsCorrect,
    nodes: nodesToReturn,
    edges: edgesToReturn,
  }

}