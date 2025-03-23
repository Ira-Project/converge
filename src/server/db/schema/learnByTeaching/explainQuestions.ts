import {
  pgTableCreator,
  boolean,
  timestamp,
  varchar,
  text,
  integer
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm/relations";
import { explainAssignments } from "./explainAssignment";
import { topics } from "../subject";
import { concepts } from "../concept";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const explainQuestions = pgTable(
  "explain_questions",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    question: text("question").notNull(),
    lambdaUrl: text("lambda_url").notNull(),
    image: text("image"),
    topicId: varchar("topic_id", { length: 21 }).references(() => topics.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const questionRelations = relations(explainQuestions, ({ one, many }) => ({
  explainQuestionToAssignment: many(explainQuestionToAssignment),
  explainAnswers: many(explainAnswers),
  topic: one(topics, {
    fields: [explainQuestions.topicId],
    references: [topics.id],
  }),
  explainQuestionConcepts: many(explainQuestionConcepts),
}));


export const explainQuestionToAssignment = pgTable(
  "explain_question_to_assignment",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    order: integer("order"),
    questionId: varchar("question_id", { length: 21 }).notNull().references(() => explainQuestions.id),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => explainAssignments.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const explainQuestionToAssignmentRelations = relations(explainQuestionToAssignment, ({ one }) => ({
  question: one(explainQuestions, {
    fields: [explainQuestionToAssignment.questionId],
    references: [explainQuestions.id],
  }),
  assignment: one(explainAssignments, {
    fields: [explainQuestionToAssignment.assignmentId],
    references: [explainAssignments.id],
  }),
}));


export const explainAnswers = pgTable(
  "explain_answers",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    questionId: varchar("question_id", { length: 21 }).references(() => explainQuestions.id),
    answer: text("answer").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const explainAnswerRelations = relations(explainAnswers, ({ one }) => ({
  question: one(explainQuestions, {
    fields: [explainAnswers.questionId],
    references: [explainQuestions.id],
  }),
}));


export const explainQuestionConcepts = pgTable(
  "explain_question_concepts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    questionId: varchar("question_id", { length: 21 }).references(() => explainQuestions.id), 
    conceptId: varchar("concept_id", { length: 36 }).references(() => concepts.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const explainQuestionConceptRelations = relations(explainQuestionConcepts, ({ one }) => ({
  question: one(explainQuestions, {
    fields: [explainQuestionConcepts.questionId],
    references: [explainQuestions.id],
  }),
  concept: one(concepts, {
    fields: [explainQuestionConcepts.conceptId],
    references: [concepts.id],
  }),
}));