import {
  pgTableCreator,
  boolean,
  timestamp,
  varchar,
  integer
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm/relations";
import { reasoningAssignmentAttempts } from "./reasoningAssignment";
import { reasoningAnswerOptions, reasoningQuestions } from "./reasoningQuestions";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

// Part 1: Identify AI's Pathway
export const part1ReasoningPathwayAttempts = pgTable(
  "reasoning_assignment_question_attempts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    attemptId: varchar("attempt_id", { length: 21 }).references(() => reasoningAssignmentAttempts.id),
    questionId: varchar("question_id", { length: 21 }).references(() => reasoningQuestions.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const part1ReasoningPathwayAttemptRelations = relations(part1ReasoningPathwayAttempts, ({ one, many }) => ({
  attempt: one(reasoningAssignmentAttempts, {
    fields: [part1ReasoningPathwayAttempts.attemptId],
    references: [reasoningAssignmentAttempts.id],
  }),
  question: one(reasoningQuestions, {
    fields: [part1ReasoningPathwayAttempts.questionId],
    references: [reasoningQuestions.id],
  }),
  answers: many(part1ReasoningPathwaySteps),
}));

export const part1ReasoningPathwaySteps = pgTable(
  "reasoning_assignment_question_answers",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    questionAttemptId: varchar("attempt_id", { length: 21 }).references(() => part1ReasoningPathwayAttempts.id),
    reasoningOptionId: varchar("reasoning_option_id", { length: 21 }).references(() => reasoningAnswerOptions.id),
    step: integer("step").notNull(),
    isCorrect: boolean("is_correct"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const part1ReasoningPathwayStepsRelations = relations(part1ReasoningPathwaySteps, ({ one }) => ({
  questionAttempt: one(part1ReasoningPathwayAttempts, {
    fields: [part1ReasoningPathwaySteps.questionAttemptId],
    references: [part1ReasoningPathwayAttempts.id],
  }),
  option: one(reasoningAnswerOptions, {
    fields: [part1ReasoningPathwaySteps.reasoningOptionId],
    references: [reasoningAnswerOptions.id],
  }),
}));

// Part 2: Identify Incorrect Options
export const part2IncorrectOptionsAttempts = pgTable(
  "reasoning_assignment_incorrect_options_attempts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    attemptId: varchar("attempt_id", { length: 21 }).references(() => reasoningAssignmentAttempts.id),
    questionId: varchar("question_id", { length: 21 }).references(() => reasoningQuestions.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const part2IncorrectOptionsAttemptRelations = relations(part2IncorrectOptionsAttempts, ({ one, many }) => ({
  attempt: one(reasoningAssignmentAttempts, {
    fields: [part2IncorrectOptionsAttempts.attemptId],
    references: [reasoningAssignmentAttempts.id],
  }),
  question: one(reasoningQuestions, {
    fields: [part2IncorrectOptionsAttempts.questionId],
    references: [reasoningQuestions.id],
  }),
  answers: many(part2IncorrectOptionsSelections),
}));

export const part2IncorrectOptionsSelections = pgTable(
  "reasoning_assignment_incorrect_options",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    questionAttemptId: varchar("attempt_id", { length: 21 }).references(() => part2IncorrectOptionsAttempts.id),
    optionId: varchar("option_id", { length: 21 }).references(() => reasoningAnswerOptions.id),
    isCorrect: boolean("is_correct"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const part2IncorrectOptionsSelectionsRelations = relations(part2IncorrectOptionsSelections, ({ one }) => ({
  attempt: one(part2IncorrectOptionsAttempts, {
    fields: [part2IncorrectOptionsSelections.questionAttemptId],
    references: [part2IncorrectOptionsAttempts.id],
  }),
  option: one(reasoningAnswerOptions, {
    fields: [part2IncorrectOptionsSelections.optionId],
    references: [reasoningAnswerOptions.id],
  }),
}));

// Part 3: Identify Correct Pathway
export const part3CorrectPathwayAttempts = pgTable(
  "reasoning_assignment_correct_pathway_attempts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    attemptId: varchar("attempt_id", { length: 21 }).references(() => reasoningAssignmentAttempts.id),
    questionId: varchar("question_id", { length: 21 }).references(() => reasoningQuestions.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const part3CorrectPathwayAttemptRelations = relations(part3CorrectPathwayAttempts, ({ one }) => ({
  attempt: one(reasoningAssignmentAttempts, {
    fields: [part3CorrectPathwayAttempts.attemptId],
    references: [reasoningAssignmentAttempts.id],
  }),
  question: one(reasoningQuestions, {
    fields: [part3CorrectPathwayAttempts.questionId],
    references: [reasoningQuestions.id],
  }),
}));

export const part3CorrectPathwaySteps = pgTable(
  "reasoning_assignment_correct_pathway_steps",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    questionAttemptId: varchar("attempt_id", { length: 21 }).references(() => part3CorrectPathwayAttempts.id),
    stepNumber: integer("step_number").notNull(),
    isCorrect: boolean("is_correct"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const part3CorrectPathwayStepsRelations = relations(part3CorrectPathwaySteps, ({ one }) => ({
  attempt: one(part3CorrectPathwayAttempts, {
    fields: [part3CorrectPathwaySteps.questionAttemptId],
    references: [part3CorrectPathwayAttempts.id],
  }),
}));





