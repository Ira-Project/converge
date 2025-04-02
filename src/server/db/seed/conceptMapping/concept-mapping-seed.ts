import { db } from "../..";
import { and, eq } from "drizzle-orm";
import { generateId } from "lucia";

import { topics } from "../../schema/subject";

import conceptMappingJson from "./work_energy_power.json";

import { activity, activityToAssignment } from "../../schema/activity";
import { classrooms } from "../../schema/classroom";
import { ActivityType } from "@/lib/constants";

import { conceptMappingAssignments } from "../../schema/conceptMapping/conceptMappingAssignments";
import { conceptMappingEdges, conceptMappingNodeHandles, conceptMappingNodes } from "../../schema/conceptMapping/conceptMappingQuestions";
import { conceptMappingAttempts, conceptMappingAttemptNodes, conceptMappingAttemptEdges, conceptMappingMapAttempt } from "../../schema/conceptMapping/conceptMappingAttempts";

export async function createConceptMappingAssignment() {
  // Parameters for assignment creation
  const topicId = process.env.ENVIRONMENT === "prod" ? conceptMappingJson.topicIdProd : conceptMappingJson.topicIdDev;
  const topic = await db.select().from(topics).where(
    eq(topics.id, topicId),
  )

  if (topic?.[0] === undefined) {
    console.log("Topic not found")
    return
  }
  const assignmentName = conceptMappingJson.name;

  // Check if assignment already exists
  const existingAssignment = await db.select().from(conceptMappingAssignments).where(
    and(
      eq(conceptMappingAssignments.topicId, topicId),
      eq(conceptMappingAssignments.name, assignmentName)
    )
  );

  if (existingAssignment?.[0]?.id !== undefined) {
    console.log(`Assignment "${assignmentName}" already exists`)
    return
  }

  const assignmentId = generateId(21);

  // Create the assignment
  console.log("Creating concept mapping assignment", assignmentName);
  await db.insert(conceptMappingAssignments).values({
    id: assignmentId,
    topicId: topicId,
    topText: conceptMappingJson.topText,
    conceptMapWidthToHeightRatio: conceptMappingJson.conceptMapWidthToHeightRatio,
    percentageEdgesToHide: conceptMappingJson.percentageEdgesToHide,
    percentageNodesToHide: conceptMappingJson.percentageNodesToHide,
    name: assignmentName,
    createdAt: new Date(),
    updatedAt: new Date(),
  });


  for (const node of conceptMappingJson.nodes) {
    // Check if node already exists
    const existingNode = await db.select().from(conceptMappingNodes).where(
      eq(conceptMappingNodes.id, node.id)
    )

    if (existingNode?.[0]?.id !== undefined) {
      console.log(`Node "${node.label}" already exists`)
      continue;
    }

    console.log("Creating concept mapping node", node.label);
    await db.insert(conceptMappingNodes).values({
      id: node.id,
      assignmentId: assignmentId,
      label: node.label,
      x: node.position.x,
      y: node.position.y,
      alwaysVisible: node.alwaysVisible,
    });

    // Create handles in all four directions for source and target nodes
    console.log("Creating concept mapping node handles", node.id);
    await db.insert(conceptMappingNodeHandles).values({
      id: generateId(21),
      nodeId: node.id,
      position: "top",
      type: "source",
    });

    await db.insert(conceptMappingNodeHandles).values({
      id: generateId(21),
      nodeId: node.id,
      position: "bottom",
      type: "source",
    });

    await db.insert(conceptMappingNodeHandles).values({
      id: generateId(21),
      nodeId: node.id,
      position: "left",
      type: "source",
    });

    await db.insert(conceptMappingNodeHandles).values({
      id: generateId(21),
      nodeId: node.id,
      position: "right",
      type: "source",
    });

    await db.insert(conceptMappingNodeHandles).values({
      id: generateId(21),
      nodeId: node.id,
      position: "top",
      type: "target",
    });

    await db.insert(conceptMappingNodeHandles).values({
      id: generateId(21),
      nodeId: node.id,
      position: "bottom",
      type: "target",
    });

    await db.insert(conceptMappingNodeHandles).values({
      id: generateId(21),
      nodeId: node.id,
      position: "left",
      type: "target",
    });

    await db.insert(conceptMappingNodeHandles).values({
      id: generateId(21),
      nodeId: node.id,
      position: "right",
      type: "target",
    }); 
  }

  for (const edge of conceptMappingJson.edges) {
    console.log("Creating concept mapping edge", edge.label);
    const existingEdge = await db.select().from(conceptMappingEdges).where(
      eq(conceptMappingEdges.id, edge.id)
    )

    if (existingEdge?.[0]?.id !== undefined) {
      console.log(`Edge "${edge.label}" already exists`)
      continue;
    }

    const sourceHandle = await db.select().from(conceptMappingNodeHandles).where(
      and(
        eq(conceptMappingNodeHandles.nodeId, edge.source),
        eq(conceptMappingNodeHandles.position, edge.sourceHandlePosition as "top" | "bottom" | "left" | "right"),
        eq(conceptMappingNodeHandles.type, "source")
      )
    )
    const targetHandle = await db.select().from(conceptMappingNodeHandles).where(
      and(
        eq(conceptMappingNodeHandles.nodeId, edge.target),
        eq(conceptMappingNodeHandles.position, edge.targetHandlePosition as "top" | "bottom" | "left" | "right"),
        eq(conceptMappingNodeHandles.type, "target")
      )
    )


    await db.insert(conceptMappingEdges).values({
      id: edge.id,
      assignmentId: assignmentId,
      label: edge.label,
      sourceNodeId: edge.source,
      sourceHandleId: sourceHandle?.[0]?.id ?? null,
      targetNodeId: edge.target,
      targetHandleId: targetHandle?.[0]?.id ?? null,
      alwaysVisible: edge.alwaysVisible,
    });
  }

  // Add the assignment to all classrooms
  console.log("Adding assignment to all classrooms");
  const classes= await db.select().from(classrooms);
  for(const classroom of classes) {
    // Check if activity already exists in the classroom
    const existingActivity = await db.select().from(activity).where(
      and(
        eq(activity.assignmentId, assignmentId),
        eq(activity.classroomId, classroom.id)
      )
    )

    // If activity does not exist, create it
    if(existingActivity.length === 0) {
      console.log("Adding assignment to classroom. Creating activity", assignmentId, classroom.id);
      const activityId = generateId(21);
      await db.insert(activity).values({
        id: activityId,
        assignmentId: assignmentId,
        classroomId: classroom.id,
        name: assignmentName,
        topicId: topicId,
        typeText: ActivityType.ConceptMapping,
        order: 0,
        points: 100,
      })
      await db.insert(activityToAssignment).values({
        id: generateId(21),
        activityId: activityId,
        conceptMappingAssignmentId: assignmentId,
      })
      console.log("Activity created", assignmentId, classroom.id);

    }
  }

  console.log("Concept mapping creation complete");
  console.log("--------------------------------");

}

export async function deleteConceptMappingAssignment(assignmentId: string) {

  // First get the reasoning assignment
  const conceptMappingAssignment = await db.select().from(conceptMappingAssignments).where(eq(conceptMappingAssignments.id, assignmentId));
  if (conceptMappingAssignment.length === 0) {
    console.log("Concept mapping assignment not found");
    return;
  }

  const attempts = await db.select().from(conceptMappingAttempts).where(eq(conceptMappingAttempts.assignmentId, assignmentId));
  for (const attempt of attempts) {

    console.log("Deleting concept mapping attempt nodes", attempt.id);
    await db.delete(conceptMappingAttemptNodes).where(eq(conceptMappingAttemptNodes.attemptId, attempt.id));

    console.log("Deleting concept mapping attempt edges", attempt.id);
    await db.delete(conceptMappingAttemptEdges).where(eq(conceptMappingAttemptEdges.attemptId, attempt.id));

    console.log("Deleting concept mapping attempt map", attempt.id);
    await db.delete(conceptMappingMapAttempt).where(eq(conceptMappingMapAttempt.attemptId, attempt.id));

    console.log("Deleting concept mapping attempt", attempt.id);
    await db.delete(conceptMappingAttempts).where(eq(conceptMappingAttempts.id, attempt.id));
    
  }

  console.log("Deleting concept mapping edges", assignmentId);
  await db.delete(conceptMappingEdges).where(eq(conceptMappingEdges.assignmentId, assignmentId));

  const nodes = await db.select().from(conceptMappingNodes).where(eq(conceptMappingNodes.assignmentId, assignmentId));

  for (const node of nodes) {
    console.log("Deleting concept mapping node handles", node.id);
    await db.delete(conceptMappingNodeHandles).where(eq(conceptMappingNodeHandles.nodeId, node.id));

    console.log("Deleting concept mapping node", node.id);
    await db.delete(conceptMappingNodes).where(eq(conceptMappingNodes.id, node.id));
  }

  console.log("Deleting activity to assignment", assignmentId);
  await db.delete(activityToAssignment).where(eq(activityToAssignment.conceptMappingAssignmentId, assignmentId));

  console.log("Deleting concept mapping activities", assignmentId);
  const activities = await db.select().from(activity).where(eq(activity.assignmentId, assignmentId));
  for (const act of activities) {
    // Delete the activity
    console.log("Deleting activity", act.id);
    await db.delete(activity).where(eq(activity.id, act.id));
  }

  // Delete the concept mapping assignment
  console.log("Deleting concept mapping assignment", assignmentId);
  await db.delete(conceptMappingAssignments).where(eq(conceptMappingAssignments.id, assignmentId));

  console.log("Concept mapping assignment deletion complete");
  console.log("--------------------------------");
}