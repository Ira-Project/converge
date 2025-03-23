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

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const multipleChoiceQuestions = pgTable(
  "multiple_choice_questions",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    question: text("question").notNull(),
    imageUrl: text("image_url"),
    questionId: varchar("question_id", { length: 21 }).notNull().references(() => knowledgeZapQuestions.id),
    multipleCorrect: boolean("multiple_correct").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const multipleChoiceQuestionRelations = relations(multipleChoiceQuestions, ({ one, many }) => ({
  question: one(knowledgeZapQuestions, {
    fields: [multipleChoiceQuestions.questionId],
    references: [knowledgeZapQuestions.id],
  }),
  options: many(multipleChoiceAnswerOptions),
}));


export const multipleChoiceAnswerOptions = pgTable(
  "multiple_choice_answer_options",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    questionId: varchar("question_id", { length: 21 }).notNull().references(() => multipleChoiceQuestions.id),
    option: text("option").notNull(),
    imageUrl: text("image_url"),
    isCorrect: boolean("is_correct").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const multipleChoiceAnswerOptionRelations = relations(multipleChoiceAnswerOptions, ({ one, many }) => ({
  question: one(multipleChoiceQuestions, {
    fields: [multipleChoiceAnswerOptions.questionId],
    references: [multipleChoiceQuestions.id],
  }),
  attempts: many(multipleChoiceAttempt),
}));


export const multipleChoiceAttempt = pgTable(
  "multiple_choice_attempts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    questionAttemptId: varchar("question_attempt_id", { length: 21 }).notNull().references(() => knowledgeZapQuestionAttempts.id),
    questionId: varchar("question_id", { length: 21 }).notNull().references(() => multipleChoiceQuestions.id),
    optionId: varchar("option_id", { length: 21 }).notNull().references(() => multipleChoiceAnswerOptions.id),
    isCorrect: boolean("is_correct").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const multipleChoiceAttemptRelations = relations(multipleChoiceAttempt, ({ one }) => ({
  question: one(multipleChoiceQuestions, {
    fields: [multipleChoiceAttempt.questionId],
    references: [multipleChoiceQuestions.id],
  }),
  option: one(multipleChoiceAnswerOptions, {
    fields: [multipleChoiceAttempt.optionId],
    references: [multipleChoiceAnswerOptions.id],
  }),
  questionAttempt: one(knowledgeZapQuestionAttempts, {
    fields: [multipleChoiceAttempt.questionAttemptId],
    references: [knowledgeZapQuestionAttempts.id],
  }),
}));
