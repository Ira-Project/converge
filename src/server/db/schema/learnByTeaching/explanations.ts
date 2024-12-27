import {
  pgTableCreator,
  boolean,
  timestamp,
  varchar,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";
import { ConceptStatus, DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm/relations";
import { users } from "../user";
import { explainTestAttempts } from "./explainTestAttempt";
import { explainQuestions } from "./explainQuestions";
import { concepts } from "./concept";

export const conceptStatusEnum = pgEnum('status', [ConceptStatus.CORRECT, ConceptStatus.INCORRECT, ConceptStatus.NOT_PRESENT]);


export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const explanations = pgTable(
  "explanation",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    text: text("text").notNull(),
    formula: text("formula"),
    testAttemptId: varchar("test_attempt_id", { length: 21 }).references(() => explainTestAttempts.id),
    createdBy: varchar("created_by", { length: 21 }).references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const explanationRelations = relations(explanations, ({ one, many }) => ({
  explainConceptStatus: many(explainConceptStatus),
  explainComputedAnswers: many(explainComputedAnswers),
  testAttempts: one(explainTestAttempts, {
    fields: [explanations.testAttemptId],
    references: [explainTestAttempts.id],
  }),
}));


export const explainConceptStatus = pgTable(
  "explain_concept_status",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    status: conceptStatusEnum("status").notNull().default(ConceptStatus.NOT_PRESENT),
    explanationId: varchar("explanation_id", { length: 21 }).references(() => explanations.id).notNull(),
    conceptId: varchar("concept_id", { length: 21 }).references(() => concepts.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  }
);
export const explainConceptStatusRelations = relations(explainConceptStatus, ({ one }) => ({
  explanation: one(explanations, {
    fields: [explainConceptStatus.explanationId],
    references: [explanations.id],
  }),
  concept: one(concepts, {
    fields: [explainConceptStatus.conceptId],
    references: [concepts.id],
  }),
}));


export const explainComputedAnswers = pgTable(
  "explain_computed_answers",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    explanationId: varchar("explanation_id", { length: 21 }).notNull().references(() => explanations.id),
    questionId: varchar("question_id", { length: 21 }).notNull().references(() => explainQuestions.id),
    computedAnswer: text("computed_answer").notNull(),
    isCorrect: boolean("is_correct").notNull().default(false),
    workingText: text("explanation_text"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  }
)
export const explainComputedAnswerRelations = relations(explainComputedAnswers, ({ one }) => ({
  explanation: one(explanations, {
    fields: [explainComputedAnswers.explanationId],
    references: [explanations.id],
  }),
  question: one(explainQuestions, {
    fields: [explainComputedAnswers.questionId],
    references: [explainQuestions.id],
  }),
}));