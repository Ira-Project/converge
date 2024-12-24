import {
  pgTableCreator,
  boolean,
  timestamp,
  varchar,
  integer,
  text
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm/relations";
import { reasoningAssignmentAttempts } from "./reasoningAssignment";
import { reasoningAnswerOptions, reasoningQuestions } from "./reasoningQuestions";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

// Part 1: Identify the Pathway for part 1 and part 2
export const reasoningPathwayAttempts = pgTable(
  "reasoning_assignment_question_attempts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    part: integer("part").notNull().default(1),
    attemptId: varchar("attempt_id", { length: 21 }).references(() => reasoningAssignmentAttempts.id),
    questionId: varchar("question_id", { length: 21 }).references(() => reasoningQuestions.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const reasoningPathwayAttemptRelations = relations(reasoningPathwayAttempts, ({ one, many }) => ({
  attempt: one(reasoningAssignmentAttempts, {
    fields: [reasoningPathwayAttempts.attemptId],
    references: [reasoningAssignmentAttempts.id],
  }),
  question: one(reasoningQuestions, {
    fields: [reasoningPathwayAttempts.questionId],
    references: [reasoningQuestions.id],
  }),
  answers: many(reasoningPathwayAttemptSteps),
  finalAnswer: one(reasoningAttemptFinalAnswer, {
    fields: [reasoningPathwayAttempts.id],
    references: [reasoningAttemptFinalAnswer.attemptId],
  }),
}));

export const reasoningPathwayAttemptSteps = pgTable(
  "reasoning_assignment_question_answers",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    questionAttemptId: varchar("attempt_id", { length: 21 }).references(() => reasoningPathwayAttempts.id),
    reasoningOptionId: varchar("reasoning_option_id", { length: 21 }).references(() => reasoningAnswerOptions.id),
    step: integer("step").notNull(),
    isCorrect: boolean("is_correct"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const reasoningPathwayAttemptStepsRelations = relations(reasoningPathwayAttemptSteps, ({ one }) => ({
  questionAttempt: one(reasoningPathwayAttempts, {
    fields: [reasoningPathwayAttemptSteps.questionAttemptId],
    references: [reasoningPathwayAttempts.id],
  }),
  option: one(reasoningAnswerOptions, {
    fields: [reasoningPathwayAttemptSteps.reasoningOptionId],
    references: [reasoningAnswerOptions.id],
  }),
}));

export const reasoningAttemptFinalAnswer = pgTable(
  "reasoning_assignment_question_final_answer",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    attemptId: varchar("attempt_id", { length: 21 }).references(() => reasoningAssignmentAttempts.id),
    questionId: varchar("question_id", { length: 21 }).references(() => reasoningQuestions.id),
    answer: text("answer").notNull(),
    isCorrect: boolean("is_correct").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const reasoningAttemptFinalAnswerRelations = relations(reasoningAttemptFinalAnswer, ({ one }) => ({
  attempt: one(reasoningAssignmentAttempts, {
    fields: [reasoningAttemptFinalAnswer.attemptId],
    references: [reasoningAssignmentAttempts.id],
  }),
  question: one(reasoningQuestions, {
    fields: [reasoningAttemptFinalAnswer.questionId],
    references: [reasoningQuestions.id],
  }),
}));