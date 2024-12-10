import { boolean, integer, pgTableCreator, timestamp, varchar, text, decimal } from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { classrooms } from "./classroom";
import { users } from "./user";
import { relations } from "drizzle-orm";
import { topics } from "./subject";
import { reasoningQuestionToAssignment } from "./reasoningQuestions";


export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

/**
 * Represents a reasoning assignment in the system
 * Contains details about the assignment configuration, classroom context, and metadata
 */
export const reasoningAssignments = pgTable(
  "reasoning_assignments",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: text("name"),
    description: text("description"),
    imageUrl: text("image_url"),
    topicId: varchar("topic_id", { length: 21 }).notNull().references(() => topics.id),
    dueDate: timestamp("due_date"),
    maxPoints: integer("max_points"),
    timeLimit: integer("time_limit"),
    order: integer("order"),
    classroomId: varchar("classroom_id").references(() => classrooms.id),
    isLocked: boolean("is_locked").default(false).notNull(),
    isLive: boolean("is_live").default(false).notNull(),
    createdBy: varchar("created_by", { length: 21 }).references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const reasoningAssignmentRelations = relations(reasoningAssignments, ({ one, many }) => ({
  classroom: one(classrooms, {
    fields: [reasoningAssignments.classroomId],
    references: [classrooms.id],
  }),
  topic: one(topics, {
    fields: [reasoningAssignments.topicId],
    references: [topics.id],
  }),
  reasoningQuestions: many(reasoningQuestionToAssignment),
}));

/**
 * Tracks student attempts at completing reasoning assignments
 * Records submission details and scoring information
 */
export const reasoningAssignmentAttempts = pgTable(
  "reasoning_assignment_attempts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 21 }).references(() => reasoningAssignments.id),
    score: decimal("score"),
    submittedAt: timestamp("submitted_at", { mode: "date" }),
    userId: varchar("user_id", { length: 21 }).references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const reasoningAssignmentAttemptRelations = relations(reasoningAssignmentAttempts, ({ one }) => ({
  assignment: one(reasoningAssignments, {
    fields: [reasoningAssignmentAttempts.assignmentId],
    references: [reasoningAssignments.id],
  }),
}));

