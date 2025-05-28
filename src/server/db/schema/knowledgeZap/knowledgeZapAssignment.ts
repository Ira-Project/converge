import { boolean, integer, pgTableCreator, timestamp, varchar, text, doublePrecision } from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { users } from "../user";
import { relations } from "drizzle-orm";

import { topics } from "../subject";
import { knowledgeZapQuestionAttempts } from "./knowledgeZapQuestions";
import { knowledgeZapQuestionToAssignment } from "./knowledgeZapQuestions";
import { activity } from "../activity";


export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const knowledgeZapAssignments = pgTable(
  "knowledge_zap_assignments",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: text("name"),
    description: text("description"),
    topicId: varchar("topic_id", { length: 21 }).notNull().references(() => topics.id),
    order: integer("order"),
    generated: boolean("generated").default(false).notNull(),
    createdBy: varchar("created_by", { length: 21 }).references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
    isLatest: boolean("is_latest").default(true).notNull(),
  }
);

export const knowledgeZapAssignmentRelations = relations(knowledgeZapAssignments, ({ one, many }) => ({
  topic: one(topics, {
    fields: [knowledgeZapAssignments.topicId],
    references: [topics.id],
  }),
  questionToAssignment: many(knowledgeZapQuestionToAssignment),
}));

/**
 * Tracks student attempts at completing reasoning assignments
 * Records submission details and scoring information
 */
export const knowledgeZapAssignmentAttempts = pgTable(
  "knowledge_zap_assignment_attempts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 21 }).references(() => knowledgeZapAssignments.id),
    activityId: varchar("activity_id", { length: 21 }).references(() => activity.id),
    isRevision: boolean("is_revision").default(false).notNull(),
    score: doublePrecision("score"),
    questionsCompleted: integer("questions_completed"),
    totalAttempts: integer("total_attempts"),
    submittedAt: timestamp("submitted_at", { mode: "date" }),
    userId: varchar("user_id", { length: 21 }).references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const knowledgeZapAssignmentAttemptRelations = relations(knowledgeZapAssignmentAttempts, ({ one, many }) => ({
  assignment: one(knowledgeZapAssignments, {
    fields: [knowledgeZapAssignmentAttempts.assignmentId],
    references: [knowledgeZapAssignments.id],
  }),
  activity: one(activity, {
    fields: [knowledgeZapAssignmentAttempts.activityId],
    references: [activity.id],
  }),
  user: one(users, {
    fields: [knowledgeZapAssignmentAttempts.userId],
    references: [users.id],
  }),
  questionAttempts: many(knowledgeZapQuestionAttempts),
}));




