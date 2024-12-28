import { type ActivityType } from "@/lib/constants";

// types.ts
export interface Activity {
  id: string;
  name: string;
  description: string;
  type: ActivityType;
  assignmentId: string;
  classroomId: string | null;
  isLive: boolean;
  isLocked: boolean;
  order: number;
  dueDate: string;
}

export interface Topic {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  activities: Activity[];
}