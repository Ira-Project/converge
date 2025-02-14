import type { ProtectedTRPCContext } from "../../../trpc";
import { generateId } from "lucia";
import type { CreateAttemptInput, GetSubmissionsInput, GetMostCommonMistakesInput, GetAnalyticsCardsInput, GetConceptMappingActivityInput, SubmitAttemptSchema } from "./conceptMapping.input";
import { eq } from "drizzle-orm";
import { ActivityType, Roles } from "@/lib/constants";
import { conceptMappingAttempts } from "@/server/db/schema/conceptMapping/conceptMappingAttempts";
import { NodeType } from "@/app/(main)/activity/[activityId]/concept-mapping/live/_components/types";

export const createAttempt = async (ctx: ProtectedTRPCContext, input: CreateAttemptInput) => { 
  const id = generateId(21);
  const activity = await ctx.db.query.activity.findFirst({
    where: (activity, { eq }) => eq(activity.id, input.activityId),
  });

  if(!activity) {
    throw new Error("Activity not found");
  }

  await ctx.db.insert(conceptMappingAttempts).values({
    id, 
    activityId: input.activityId,
    assignmentId: activity.assignmentId,
    userId: ctx.user.id,
  })
  return id;
};

export const submitAttempt = async (ctx: ProtectedTRPCContext, input: SubmitAttemptSchema) => {

  const submissionTime = new Date();

  // TODO: Evaluate the Score


  await ctx.db.update(conceptMappingAttempts).set({
    submittedAt: submissionTime,
  }).where(eq(conceptMappingAttempts.id, input.attemptId));
  
};

export const getSubmissions = async (ctx: ProtectedTRPCContext, input: GetSubmissionsInput) => {
  const user = ctx.user.role;

  if (user === Roles.Student) {
    
    return await ctx.db.query.conceptMappingAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.userId, ctx.user.id),
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        user: {
          columns: {
            name: true,
          }
        }
      }
    });
  } else {
    return await ctx.db.query.conceptMappingAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        user: {
          columns: {
            name: true,
          }
        }
      }
    });
  }
}

export const getMostCommonMistakes = async (ctx: ProtectedTRPCContext, input: GetMostCommonMistakesInput) => {
  const user = ctx.user.role;
  let submissions = [];

  // Get submissions
  if (user === Roles.Student) {
    submissions = await ctx.db.query.conceptMappingAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.userId, ctx.user.id),
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
    });
  } else {
    submissions = await ctx.db.query.conceptMappingAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
    });
  }

  return [];
}

export const getAnalyticsCards = async (ctx: ProtectedTRPCContext, input: GetAnalyticsCardsInput) => {

  const user = ctx.user.role;
  let submissions = [];

  if (user === Roles.Student) {
    submissions = await ctx.db.query.conceptMappingAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.userId, ctx.user.id),
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        mapAttempts: true,
      }
    });
  } else {
    submissions = await ctx.db.query.conceptMappingAttempts.findMany({
      where: (attempts, { eq, and, isNotNull }) => and(
        eq(attempts.activityId, input.activityId),
        isNotNull(attempts.submittedAt)
      ),
      with: {
        mapAttempts: true,
      }
    });
  }

  const averageScore = submissions.reduce((a, b) => a + (b.score ?? 0), 0) / submissions.length;
  const submissionCount = submissions.length;
  
  // Calculate average attempts per submission
  const averageAttemptsPerSubmission = submissions.reduce((sum, submission) => {
    return sum + submission.mapAttempts.length;
  }, 0) / submissionCount;
    
  return {
    averageScore,
    submissionCount,
    averageAttemptsPerSubmission
  };
}

export const getConceptMappingActivity = async (ctx: ProtectedTRPCContext, input: GetConceptMappingActivityInput) => {
  const activity = await ctx.db.query.activity.findFirst({
    where: (activity, { eq }) => eq(activity.id, input.activityId),
  });

  const assignmentId = activity?.assignmentId;

  if(!assignmentId || activity?.typeText !== ActivityType.ConceptMapping) {
    throw new Error("Assignment not found");  
  }

  const assignment = await ctx.db.query.conceptMappingAssignments.findFirst({
    where: (assignment, { eq }) => eq(assignment.id, assignmentId),
    with: {
      conceptNodes: {
        with: {
          handles: true,
        }
      },
      conceptEdges: true,
    }
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  const percentageNodesToHide = assignment.percentageNodesToHide as unknown as number;
  const percentageEdgesToHide = assignment.percentageEdgesToHide as unknown as number;
  const nodesToHide = Math.floor(assignment.conceptNodes.length * percentageNodesToHide);
  const edgesToHide = Math.floor(assignment.conceptEdges.length * percentageEdgesToHide);

  // Filter out always visible nodes and shuffle the rest
  const hidableNodes = assignment.conceptNodes
    .filter(node => !node.alwaysVisible)
    .sort(() => Math.random() - 0.5);
  
  // Get the nodes to hide (up to nodesToHide count)
  const nodesWithHiddenLabels = new Set(
    hidableNodes.slice(0, nodesToHide).map(node => node.id)
  );

  // Similarly for edges
  const hidableEdges = assignment.conceptEdges
    .filter(edge => !edge.alwaysVisible)
    .sort(() => Math.random() - 0.5);
  
  const edgesWithHiddenLabels = new Set(
    hidableEdges.slice(0, edgesToHide).map(edge => edge.id)
  );

  // Transform nodes to match the expected format
  const nodes = assignment.conceptNodes.map(node => ({
    id: node.id,
    position: { x: Number(node.x), y: Number(node.y) },
    data: {
      label: node.alwaysVisible || !nodesWithHiddenLabels.has(node.id) ? node.label : '',
      handles: node.handles.map(handle => ({
        type: handle.type,
        id: handle.id,
        position: handle.position,
      }))
    },
    type: node.alwaysVisible || !nodesWithHiddenLabels.has(node.id) ? NodeType.Static : NodeType.DropZone
  }));

  // Transform edges to match the expected format
  const edges = assignment.conceptEdges
    .filter(edge => edge.alwaysVisible || !edgesWithHiddenLabels.has(edge.id))
    .map(edge => ({
      id: edge.id,
      type: 'custom-edge',
      source: edge.sourceNodeId!,
      target: edge.targetNodeId!,
      sourceHandle: edge.sourceHandleId,
      targetHandle: edge.targetHandleId,
      data: {
        label: edge.label
      }
    }));

  // Create arrays for hidden labels - only include actually hidden items
  const nodeLabels = assignment.conceptNodes
    .filter(node => nodesWithHiddenLabels.has(node.id))
    .map(node => ({
      id: node.id,
      label: node.label
    }));

  const edgeLabels = assignment.conceptEdges
    .filter(edge => edgesWithHiddenLabels.has(edge.id))
    .map(edge => ({
      id: edge.id,
      label: edge.label
    }));

  return {
    id: assignment.id,
    name: assignment.name,
    description: assignment.description,
    topText: assignment.topText,
    conceptMapWidthToHeightRatio: assignment.conceptMapWidthToHeightRatio,
    nodes,
    edges,
    nodeLabels,
    edgeLabels
  };
}