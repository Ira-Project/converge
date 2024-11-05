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
import { users } from "./user";
import { testAttempts } from "./testAttempt";
import { questions } from "./questions";
import { concepts } from "./concept";

export const conceptStatusEnum = pgEnum('status', [ConceptStatus.CORRECT, ConceptStatus.INCORRECT, ConceptStatus.NOT_PRESENT]);


export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const explanations = pgTable(
  "explanation",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    text: text("text").notNull(),
    formula: text("formula"),
    testAttemptId: varchar("test_attempt_id", { length: 21 }).references(() => testAttempts.id),
    createdBy: varchar("created_by", { length: 21 }).references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const explanationRelations = relations(explanations, ({ one, many }) => ({
  conceptStatus: many(conceptStatus),
  computedAnswers: many(computedAnswers),
  testAttempts: one(testAttempts, {
    fields: [explanations.testAttemptId],
    references: [testAttempts.id],
  }),
}));


export const conceptStatus = pgTable(
  "concept_status",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    status: conceptStatusEnum("status").notNull().default(ConceptStatus.NOT_PRESENT),
    explanationId: varchar("explanation_id", { length: 21 }).references(() => explanations.id).notNull(),
    conceptId: varchar("concept_id", { length: 21 }).references(() => concepts.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  }
);
export const conceptStatusRelations = relations(conceptStatus, ({ one }) => ({
  explanation: one(explanations, {
    fields: [conceptStatus.explanationId],
    references: [explanations.id],
  }),
  concept: one(concepts, {
    fields: [conceptStatus.conceptId],
    references: [concepts.id],
  }),
}));


export const computedAnswers = pgTable(
  "computed_answers",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    explanationId: varchar("explanation_id", { length: 21 }).notNull().references(() => explanations.id),
    questionId: varchar("question_id", { length: 21 }).notNull().references(() => questions.id),
    computedAnswer: text("computed_answer").notNull(),
    isCorrect: boolean("is_correct").notNull().default(false),
    workingText: text("explanation_text"),
  }
)
export const computedAnswerRelations = relations(computedAnswers, ({ one }) => ({
  explanation: one(explanations, {
    fields: [computedAnswers.explanationId],
    references: [explanations.id],
  }),
  question: one(questions, {
    fields: [computedAnswers.questionId],
    references: [questions.id],
  }),
}));