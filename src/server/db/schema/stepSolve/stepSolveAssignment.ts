import { boolean, integer, pgTableCreator, timestamp, varchar, text, doublePrecision } from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { users } from "../user";
import { relations } from "drizzle-orm";
import { topics } from "../subject";
import { stepSolveQuestionToAssignment } from "./stepSolveQuestions";
import { activity } from "../activity";
import { stepSolveQuestionAttempts } from "./stepSolveQuestionAttempts";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

/**
 * Represents a step solve assignment in the system
 * Contains details about the assignment configuration, classroom context, and metadata
 */
export const stepSolveAssignments = pgTable(
  "step_solve_assignments",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: text("name"),
    description: text("description"),
    topicId: varchar("topic_id", { length: 21 }).notNull().references(() => topics.id),
    order: integer("order"),
    createdBy: varchar("created_by", { length: 21 }).references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const stepSolveAssignmentRelations = relations(stepSolveAssignments, ({ one, many }) => ({
  topic: one(topics, {
    fields: [stepSolveAssignments.topicId],
    references: [topics.id],
  }),
  stepSolveQuestions: many(stepSolveQuestionToAssignment),
}));

/**
 * Tracks student attempts at completing step solve assignments
 * Records submission details and scoring information
 */
export const stepSolveAssignmentAttempts = pgTable(
  "step_solve_assignment_attempts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 21 }).references(() => stepSolveAssignments.id),
    activityId: varchar("activity_id", { length: 21 }).references(() => activity.id),
    score: doublePrecision("score"),
    // The reasoning and evaluation scores here are rates of success and only a percentage
    reasoningScore: doublePrecision("reasoning_score"),
    evaluationScore: doublePrecision("evaluation_score"),
    submittedAt: timestamp("submitted_at", { mode: "date" }),
    userId: varchar("user_id", { length: 21 }).references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const stepSolveAssignmentAttemptRelations = relations(stepSolveAssignmentAttempts, ({ one, many }) => ({
  assignment: one(stepSolveAssignments, {
    fields: [stepSolveAssignmentAttempts.assignmentId],
    references: [stepSolveAssignments.id],
  }),
  activity: one(activity, {
    fields: [stepSolveAssignmentAttempts.activityId],
    references: [activity.id],
  }),
  user: one(users, {
    fields: [stepSolveAssignmentAttempts.userId],
    references: [users.id],
  }),
  qas: many(stepSolveQuestionAttempts),
}));

