import { eq } from "drizzle-orm";
import { activity } from "@/server/db/schema/activity";
import type { ProtectedTRPCContext } from "../../trpc";
import type { GetActivitiesInput, GetActivityInput, MakeActivityLiveInput } from "./activities.input";
import type { ActivityType } from "@/lib/constants";

export const getActivities = async (ctx: ProtectedTRPCContext, input: GetActivitiesInput) => {

  const activities = await ctx.db.query.activity.findMany({
    where: eq(activity.classroomId, input.classroomId),
    columns: {
      id: true,
      name: true,
      description: true,
      type: true,
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
    activities: {
      id: string;
      name: string;
      description: string;
      type: ActivityType;
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
          activities: [],
        };
      }
      groupedActivities[activity.topic.id]!.activities.push({
        id: activity.id,
        name: activity.name,
        description: activity.description ?? "",
        type: activity.type as ActivityType,
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
  
  return Object.values(groupedActivities);
  
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




