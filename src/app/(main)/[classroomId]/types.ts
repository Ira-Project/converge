// types.ts
export interface Activity {
  id: string;
  name: string;
  topic: {
    id: string;
    name: string;
  } | null;
  typeText: string | null;
  isLive: boolean;
  isLocked: boolean;
  order: number;
  dueDate: Date | null;
}