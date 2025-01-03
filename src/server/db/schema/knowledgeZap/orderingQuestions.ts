import {
  pgTableCreator,
  boolean,
  timestamp,
  varchar,
  text,
  integer,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm/relations";
import { knowledgeZapQuestionAttempts, knowledgeZapQuestions } from "./knowledgeZapQuestions";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

// Defines the timeline question
export const orderingQuestions = pgTable(
  "ordering_questions",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    question: text("question").notNull(),
    questionId: varchar("question_id", { length: 21 }).notNull().references(() => knowledgeZapQuestions.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const orderingQuestionRelations = relations(orderingQuestions, ({ one, many }) => ({
  question: one(knowledgeZapQuestions, {
    fields: [orderingQuestions.questionId],
    references: [knowledgeZapQuestions.id],
  }),
  options: many(orderingAnswerOptions),
}));


// Defines the ordering answer options
// Each question has a list of options that need to be ordered correctly
export const orderingAnswerOptions = pgTable(
  "ordering_answer_options",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    questionId: varchar("question_id", { length: 21 }).notNull().references(() => orderingQuestions.id),
    option: text("option").notNull(),
    order: integer("order").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const orderingAnswerOptionRelations = relations(orderingAnswerOptions, ({ one, many }) => ({
  question: one(orderingQuestions, {
    fields: [orderingAnswerOptions.questionId],
    references: [orderingQuestions.id],
  }),
  attempts: many(orderingAttempt),
}));


// Defines the ordering attempt
// Each attempt has an ordered list of options called selections
export const orderingAttempt = pgTable(
  "ordering_attempts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    questionAttemptId: varchar("question_attempt_id", { length: 21 }).notNull().references(() => knowledgeZapQuestionAttempts.id),
    questionId: varchar("question_id", { length: 21 }).notNull().references(() => orderingQuestions.id),
    isCorrect: boolean("is_correct").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const orderingAttemptRelations = relations(orderingAttempt, ({ one, many }) => ({
  question: one(orderingQuestions, {
    fields: [orderingAttempt.questionId],
    references: [orderingQuestions.id],   
  }),
  selections: many(orderingAttemptSelection),
}));


// Defines the ordering attempt selection
// Each attempt has a list of selections, one for each option
// The attempt is correct if the order of the selections is correct
export const orderingAttemptSelection = pgTable(
  "ordering_attempt_selection",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    attemptId: varchar("attempt_id", { length: 21 }).notNull().references(() => orderingAttempt.id),
    optionId: varchar("option_id", { length: 21 }).notNull().references(() => orderingAnswerOptions.id),
    order: integer("order").notNull(),
    isCorrect: boolean("is_correct").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const orderingAttemptSelectionRelations = relations(orderingAttemptSelection, ({ one }) => ({
  attempt: one(orderingAttempt, {
    fields: [orderingAttemptSelection.attemptId],
    references: [orderingAttempt.id],
  }),
    option: one(orderingAnswerOptions, {
    fields: [orderingAttemptSelection.optionId],
    references: [orderingAnswerOptions.id],
  }),
}));

