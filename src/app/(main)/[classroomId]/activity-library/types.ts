import type { ActivityType } from "@/lib/constants";

// Assignment interface - similar to Activity but for assignments
export interface Assignment {
  id: string;
  name: string;
  description: string;
  typeText: ActivityType;
  topicId: string;
  order: number;
  dueDate: string | null;
  createdAt: Date;
}

// Topic interface for assignments - similar to activities topic
export interface AssignmentTopic {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  order: string;
  assignments: Assignment[];
} 