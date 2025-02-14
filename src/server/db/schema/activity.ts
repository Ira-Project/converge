import {
  pgTableCreator,
  boolean,
  timestamp,
  varchar,
  pgEnum,
  text,
  integer,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";


import { users } from "./user";

import { classrooms } from "./classroom";
import { relations } from "drizzle-orm";
import { topics } from "./subject";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const activityTypeEnum = pgEnum('activity_type', [
  "Learn By Teaching",
  "Reason Trace",
  "Read and Relay",
  "Knowledge Zap",
  "Step Solve",
  "Human vs AI",
]);

export const activity = pgTable("activity", {
  id: varchar("id", { length: 21 }).primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: activityTypeEnum("type").notNull(),
  typeText: text("type_text"),
  assignmentId: varchar("assignment_id", { length: 21 }),
  classroomId: varchar("classroom_id", { length: 21 }).references(() => classrooms.id),
  isLive: boolean("is_live").default(false).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  dueDate: timestamp("due_date", { mode: "date" }),
  order: integer("order").notNull(),
  points: integer("points").notNull(),
  topicId: varchar("topic_id", { length: 21 }).references(() => topics.id),
  createdBy: varchar("created_by", { length: 21 }).references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});

export const activityRelations = relations(activity, ({ one }) => ({
  classroom: one(classrooms, {
    fields: [activity.classroomId],
    references: [classrooms.id],
  }),
  topic: one(topics, {
    fields: [activity.topicId],
    references: [topics.id],
  }),
}));
