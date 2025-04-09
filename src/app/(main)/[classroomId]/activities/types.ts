// types.ts
export interface Activity {
  id: string;
  name: string;
  typeText: string | null;
  isLive: boolean;
  isLocked: boolean;
  order: number;
  dueDate: string | null;
}

export interface Topic {
  name: string;
  slug: string;
  description: string;
  activities: Activity[];
}