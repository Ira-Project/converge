import { and, desc, eq, isNotNull } from "drizzle-orm";
import { activity } from "@/server/db/schema/activity";
import type { ProtectedTRPCContext } from "../../trpc";
import type { GetActivitiesInput, GetActivityInput, GetLiveActivitiesInput, GetRandomActivitiesInput, MakeActivityLiveInput } from "./activities.input";
import { Roles, ActivityType } from "@/lib/constants";
import { knowledgeZapAssignmentAttempts } from "@/server/db/schema/knowledgeZap/knowledgeZapAssignment";
import { stepSolveAssignmentAttempts } from "@/server/db/schema/stepSolve/stepSolveAssignment";
import { reasoningAssignmentAttempts } from "@/server/db/schema/reasoning/reasoningAssignment";
import { readAndRelayAttempts } from "@/server/db/schema/readAndRelay/readAndRelayAttempts";
import { conceptMappingAttempts } from "@/server/db/schema/conceptMapping/conceptMappingAttempts";
import { explainTestAttempts } from "@/server/db/schema/learnByTeaching/explainTestAttempt";

export const getActivities = async (ctx: ProtectedTRPCContext, input: GetActivitiesInput) => {

  const activities = await ctx.db.query.activity.findMany({
    where: eq(activity.classroomId, input.classroomId),
    columns: {
      id: true,
      name: true,
      description: true,
      typeText: true,
      assignmentId: true,
      classroomId: true,
      isLive: true,
      isLocked: true,
      order: true,
      topicId: true,
      dueDate: true,
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
    },
  })

  // Group activities by topic
  const groupedActivities: Record<string, {
    slug: string;
    name: string;
    description: string;
    imageUrl: string;
    order: string;
    activities: {
      id: string;
      name: string;
      description: string;
      typeText: ActivityType;
      assignmentId: string;
      classroomId: string | null;
      isLive: boolean;
      isLocked: boolean;
      order: number;
      dueDate: string;
    }[];
  }> = {};

  for (const activity of activities) {
    if (activity.topic) {
      if (!groupedActivities[activity.topic.id]) {
        groupedActivities[activity.topic.id] = {
          slug: activity.topic.slug,
          name: activity.topic.name,
          description: activity.topic.description ?? "",
          imageUrl: activity.topic.imageUrl ?? "",  
          order: activity.topic.order ?? "",
          activities: [],
        };
      }
      groupedActivities[activity.topic.id]!.activities.push({
        id: activity.id,
        name: activity.name,
        description: activity.description ?? "",
        typeText: activity.typeText as ActivityType,
        assignmentId: activity.assignmentId ?? "",
        classroomId: activity.classroomId ?? "",
        isLive: activity.isLive,
        isLocked: activity.isLocked,
        order: activity.order,
        dueDate: activity.dueDate?.toString() ?? "",
      });
    }
  }

  
  const groupedActivitiesList = Object.values(groupedActivities);
  groupedActivitiesList.sort((a, b) => a.order.localeCompare(b.order));
  return groupedActivitiesList;
}

export const getActivity = async (ctx: ProtectedTRPCContext, input: GetActivityInput) => {
  const act = await ctx.db.query.activity.findFirst({
    where: eq(activity.id, input.activityId),
    with: {
      topic: {
        columns: {
          id: true,
          name: true,
          imageUrl: true,
          description: true,          
          slug: true,
        },
      },
      classroom: {
        columns: {
          id: true,
          name: true,
          description: true,
        }
      }
    },
  })
  return act;
}

export const makeActivityLive = async (ctx: ProtectedTRPCContext, input: MakeActivityLiveInput) => {

  return await ctx.db.update(activity).set({
    isLive: true,
    dueDate: input.dueDate,
  }).where(eq(activity.id, input.activityId));
  
} 

export const getLiveActivities = async (ctx: ProtectedTRPCContext, input: GetLiveActivitiesInput) => {
  const activities = await ctx.db.query.activity.findMany({
    where: and(eq(activity.classroomId, input.classroomId), eq(activity.isLive, true)),
    with: {
      topic: {
        columns: {
          id: true,
          name: true,
        }
      }
    },
    orderBy: [desc(activity.dueDate)],
  });

  
  if(ctx.user.role === Roles.Teacher) return activities;

  const submittedActivityIds: string[] = [];
  for(const activity of activities) {
    switch(activity.typeText) {
      case ActivityType.KnowledgeZap:
        const knowledgeZapAttempts = await ctx.db.query.knowledgeZapAssignmentAttempts.findMany({
          where: and(
            eq(knowledgeZapAssignmentAttempts.activityId, activity.id),
            eq(knowledgeZapAssignmentAttempts.userId, ctx.user.id),
            isNotNull(knowledgeZapAssignmentAttempts.submittedAt),
          ),
        });
        if(knowledgeZapAttempts.length > 0) {
          submittedActivityIds.push(activity.id);
        }
        break;
      case ActivityType.StepSolve:
        const stepSolveAttempts = await ctx.db.query.stepSolveAssignmentAttempts.findMany({
          where: and(
            eq(stepSolveAssignmentAttempts.activityId, activity.id),
            eq(stepSolveAssignmentAttempts.userId, ctx.user.id),
            isNotNull(stepSolveAssignmentAttempts.submittedAt),
          ),
        });
        if(stepSolveAttempts.length > 0) {
          submittedActivityIds.push(activity.id);
        }
        break;
      case ActivityType.ReasonTrace:
        const reasonTraceAttempts = await ctx.db.query.reasoningAssignmentAttempts.findMany({
          where: and(
            eq(reasoningAssignmentAttempts.activityId, activity.id),
            eq(reasoningAssignmentAttempts.userId, ctx.user.id),
            isNotNull(reasoningAssignmentAttempts.submittedAt),
          ),
        });
        if(reasonTraceAttempts.length > 0) {
          submittedActivityIds.push(activity.id);
        }
        break;
      case ActivityType.ReadAndRelay:
        const rrAttempts = await ctx.db.query.readAndRelayAttempts.findMany({
          where: and(
            eq(readAndRelayAttempts.activityId, activity.id),
            eq(readAndRelayAttempts.userId, ctx.user.id),
            isNotNull(readAndRelayAttempts.submittedAt),
          ),
        });
        if(rrAttempts.length > 0) {
          submittedActivityIds.push(activity.id);
        }
        break;
      case ActivityType.ConceptMapping:
        const cmAttempts = await ctx.db.query.conceptMappingAttempts.findMany({
          where: and(
            eq(conceptMappingAttempts.activityId, activity.id),
            eq(conceptMappingAttempts.userId, ctx.user.id),
            isNotNull(conceptMappingAttempts.submittedAt),
          ),
        });
        if(cmAttempts.length > 0) {
          submittedActivityIds.push(activity.id);
        }
        break;
      case ActivityType.LearnByTeaching:
        const ltAttempts = await ctx.db.query.explainTestAttempts.findMany({
          where: and(
            eq(explainTestAttempts.activityId, activity.id),
            eq(explainTestAttempts.userId, ctx.user.id),
            isNotNull(explainTestAttempts.submittedAt),
          ),
        });
        if(ltAttempts.length > 0) {
          submittedActivityIds.push(activity.id);
        }
        break;
    }
  }

  return activities.filter(activity => !submittedActivityIds.includes(activity.id));
}

export const getRandomActivities = async (ctx: ProtectedTRPCContext, input: GetRandomActivitiesInput) => {
  // Get a random activity of each type
  const activityTypes = [
    ActivityType.KnowledgeZap,
    ActivityType.StepSolve,
    ActivityType.ReasonTrace,
    ActivityType.ReadAndRelay,
    ActivityType.ConceptMapping,
    ActivityType.LearnByTeaching,
  ];

  const randomActivities = [];

  for (const type of activityTypes) {
    const activitiesOfType = await ctx.db.query.activity.findMany({
      where: and(eq(activity.typeText, type), eq(activity.classroomId, input.classroomId)),
      columns: {
        id: true,
        name: true,
        typeText: true,
        isLive: true,
        isLocked: true,
        order: true,
        dueDate: true,
      },
      with: {
        topic: {
          columns: {
            id: true,
            name: true,
          }
        }
      },
    });

    if (activitiesOfType.length > 0) {
      // Get a random activity of this type
      const randomIndex = Math.floor(Math.random() * activitiesOfType.length);
      const randomActivity = activitiesOfType[randomIndex];
      if (randomActivity) {
        randomActivities.push(randomActivity);
      }
    }
  }

  // Filter out any undefined values and ensure they match the Activity type
  return randomActivities.filter(Boolean).map(activity => ({
    id: activity.id,
    name: activity.name,
    topic: activity.topic,
    typeText: activity.typeText,
    isLive: activity.isLive,
    isLocked: activity.isLocked,
    order: activity.order,
    dueDate: activity.dueDate,
  }));
}




