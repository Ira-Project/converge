import {
  pgTableCreator,
  boolean,
  timestamp,
  varchar,
  doublePrecision,
  integer,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm";
import { explainAssignments } from "./explainAssignment";
import { explanations } from "./explanations";
import { users } from "../user";
import { activity } from "../activity";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const explainTestAttempts = pgTable(
  "explain_test_attempts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    activityId: varchar("activity_id", { length: 21 }).references(() => activity.id),
    assignmentId: varchar("assignment_id", { length: 21 }).references(() => explainAssignments.id),
    score: integer("score"),
    score2: doublePrecision("score2"),
    submittedAt: timestamp("submitted_at", { mode: "date" }),
    userId: varchar("user_id", { length: 21 }).notNull().references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const explainTestAttemptRelations = relations(explainTestAttempts, ({ one, many }) => ({
  assignments: one(explainAssignments, {
    fields: [explainTestAttempts.assignmentId],
    references: [explainAssignments.id],
  }),
  activity: one(activity, {
    fields: [explainTestAttempts.activityId],
    references: [activity.id],
  }),
  explanations: many(explanations),
  user: one(users, {
    fields: [explainTestAttempts.userId],
    references: [users.id],
  }),
}));
