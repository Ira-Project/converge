import {
  pgTableCreator,
  serial,
  boolean,
  timestamp,
  varchar,
  json,
  text,
  integer,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { conceptGraphs } from "./concept";
import { assignmentTemplates } from "./assignmentTemplate";
import { relations } from "drizzle-orm/relations";
import { users } from "./user";
import { testAttempts } from "./testAttempt";
import { questions } from "./assignmentDetails";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const explanations = pgTable(
  "explanation",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    text: text("text").notNull(),
    assignmentTemplateId: varchar("assignment_template_id", { length: 21 }).references(() => assignmentTemplates.id).notNull(),
    testAttemptId: varchar("test_attempt_id", { length: 21 }).references(() => testAttempts.id),
    embedding: json("embedding"),
    createdBy: varchar("created_by", { length: 21 }).references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const explanationRelations = relations(explanations, ({ many }) => ({
  correctConcepts: many(correctConcepts),
  computedAnswers: many(computedAnswers),
}));


export const correctConcepts = pgTable(
  "correct_concepts",
  {
    id: serial("id").primaryKey(),
    explanationId: varchar("explanation_id", { length: 21 }).references(() => explanations.id).notNull(),
    conceptId: varchar("concept_id", { length: 21 }).references(() => conceptGraphs.id).notNull(),
  }
);
export const correctConceptRelations = relations(correctConcepts, ({ one }) => ({
  explanation: one(explanations, {
    fields: [correctConcepts.explanationId],
    references: [explanations.id],
  }),
  concept: one(conceptGraphs, {
    fields: [correctConcepts.conceptId],
    references: [conceptGraphs.id],
  }),
}));



export const computedAnswers = pgTable(
  "computed_answers",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    explanationId: varchar("test_attempt_id", { length: 21 }).notNull().references(() => testAttempts.id),
    questionId: integer("question_id").notNull().references(() => questions.id),
    computedAnswer: text("computed_answer").notNull(),
    isCorrect: boolean("is_correct").notNull().default(false),
    explanationText: text("explanation_text"),
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