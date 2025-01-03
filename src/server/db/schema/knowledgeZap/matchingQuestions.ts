import {
  pgTableCreator,
  boolean,
  timestamp,
  varchar,
  text,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm/relations";
import { knowledgeZapQuestionAttempts, knowledgeZapQuestions } from "./knowledgeZapQuestions";
import { multipleChoiceAnswerOptions, multipleChoiceAttempt, multipleChoiceQuestions } from "./multipleChoiceQuestions";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

// Defines the matching question
export const matchingQuestions = pgTable(
  "matching_questions",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    question: text("question").notNull(),
    imageUrl: text("image_url"),
    questionId: varchar("question_id", { length: 21 }).notNull().references(() => knowledgeZapQuestions.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const matchingQuestionRelations = relations(matchingQuestions, ({ one, many }) => ({
  question: one(knowledgeZapQuestions, {
    fields: [matchingQuestions.questionId],
    references: [knowledgeZapQuestions.id],
  }),
  options: many(matchingAnswerOptions),
}));


// Defines the matching answer options
// Each question has two columns of options that need to be matched
export const matchingAnswerOptions = pgTable(
  "matching_answer_options",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    questionId: varchar("question_id", { length: 21 }).notNull().references(() => matchingQuestions.id),
    optionA: text("option_a").notNull(),
    optionB: text("option_b").notNull(),
    imageUrlA: text("image_url_a"),
    imageUrlB: text("image_url_b"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const matchingAnswerOptionRelations = relations(matchingAnswerOptions, ({ one, many}) => ({
  question: one(matchingQuestions, {
    fields: [matchingAnswerOptions.questionId],
    references: [matchingQuestions.id],
  }),
  attempts: many(matchingAttempt),
}));


// Defines the matching attempt
// Each attempt has relations to the selections the user made
export const matchingAttempt = pgTable(
  "matching_attempts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    questionAttemptId: varchar("question_attempt_id", { length: 21 }).notNull().references(() => knowledgeZapQuestionAttempts.id),
    questionId: varchar("question_id", { length: 21 }).notNull().references(() => matchingQuestions.id),
    isCorrect: boolean("is_correct").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const multipleChoiceAttemptRelations = relations(multipleChoiceAttempt, ({ one, many }) => ({
  question: one(multipleChoiceQuestions, {
    fields: [multipleChoiceAttempt.questionId],
    references: [multipleChoiceQuestions.id],
  }),
  option: one(multipleChoiceAnswerOptions, {
    fields: [multipleChoiceAttempt.optionId],
    references: [multipleChoiceAnswerOptions.id],
  }),
  selections: many(matchingAttemptSelection),
}));


// Defines the matching attempt selection
// Each attempt has two selections, one for each column of options
// The attempt is correct if the Ids of option1 and option2 are the same
export const matchingAttemptSelection = pgTable(
  "matching_attempt_selection",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    attemptId: varchar("attempt_id", { length: 21 }).notNull().references(() => matchingAttempt.id),
    option1Id: varchar("option_1_id", { length: 21 }).notNull().references(() => matchingAnswerOptions.id),
    option2Id: varchar("option_2_id", { length: 21 }).notNull().references(() => matchingAnswerOptions.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const matchingAttemptSelectionRelations = relations(matchingAttemptSelection, ({ one }) => ({
  attempt: one(matchingAttempt, {
    fields: [matchingAttemptSelection.attemptId],
    references: [matchingAttempt.id],
  }),
}));

