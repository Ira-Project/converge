import {
  pgTableCreator,
  boolean,
  timestamp,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm";
import { assignments } from "./assignment";
import { explanations } from "./explanations";
import { users } from "./user";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const testAttempts = pgTable(
  "test_attempts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => assignments.id),
    score: integer("score"),
    submittedAt: timestamp("submitted_at", { mode: "date" }),
    userId: varchar("user_id", { length: 21 }).notNull().references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const testAttemptRelations = relations(testAttempts, ({ one, many }) => ({
  assignments: one(assignments, {
    fields: [testAttempts.assignmentId],
    references: [assignments.id],
  }),
  explanations: many(explanations),
}));