import {
  pgTableCreator,
  boolean,
  timestamp,
  varchar,
  text,
  integer,
  pgEnum
} from "drizzle-orm/pg-core";
import { KnowledgeZapQuestionType, DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm/relations";
import { knowledgeZapAssignmentAttempts, knowledgeZapAssignments } from "./knowledgeZapAssignment";
import { topics } from "../subject";
import { concepts } from "../concept";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const knowledgeZapQuestionTypeEnum = pgEnum('knowledge_zap_question_type', [KnowledgeZapQuestionType.MULTIPLE_CHOICE, KnowledgeZapQuestionType.MATCHING, KnowledgeZapQuestionType.ORDERING]);

export const knowledgeZapQuestions = pgTable(
  "knowledge_zap_questions",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    question: text("question").notNull(),
    questionId: varchar("question_id", { length: 21 }).notNull().array(),
    type: knowledgeZapQuestionTypeEnum("type").notNull(),
    topicId: varchar("topic_id", { length: 21 }).references(() => topics.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const knowledgeZapQuestionRelations = relations(knowledgeZapQuestions, ({ one, many }) => ({
  knowledgeZapQuestionToAssignment: many(knowledgeZapQuestionToAssignment),
  topic: one(topics, {
    fields: [knowledgeZapQuestions.topicId],
    references: [topics.id],
  }),
  questionsToConcepts: many(knowledgeZapQuestionsToConcepts),
}));


export const knowledgeZapQuestionToAssignment = pgTable(
  "knowledge_zap_question_to_assignment",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    order: integer("order"),
    questionId: varchar("question_id", { length: 21 }).notNull().references(() => knowledgeZapQuestions.id),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => knowledgeZapAssignments.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const knowledgeZapQuestionToAssignmentRelations = relations(knowledgeZapQuestionToAssignment, ({ one }) => ({
  question: one(knowledgeZapQuestions, {
    fields: [knowledgeZapQuestionToAssignment.questionId],
    references: [knowledgeZapQuestions.id],
  }),
  assignment: one(knowledgeZapAssignments, {
    fields: [knowledgeZapQuestionToAssignment.assignmentId],
    references: [knowledgeZapAssignments.id],
  }),
}));


/**
 * Tracks student attempts at completing knowledge zap questions
 * Records submission details and scoring information
 */
export const knowledgeZapQuestionAttempts = pgTable(
  "knowledge_zap_question_attempts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    questionId: varchar("question_id", { length: 21 }).notNull().references(() => knowledgeZapQuestions.id),
    attemptId: varchar("attempt_id", { length: 21 }).notNull().references(() => knowledgeZapAssignmentAttempts.id),
    isCorrect: boolean("is_correct").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const knowledgeZapQuestionAttemptRelations = relations(knowledgeZapQuestionAttempts, ({ one }) => ({
  question: one(knowledgeZapQuestions, {
    fields: [knowledgeZapQuestionAttempts.questionId],
    references: [knowledgeZapQuestions.id],
  }),
  attempt: one(knowledgeZapAssignmentAttempts, {
    fields: [knowledgeZapQuestionAttempts.attemptId],
    references: [knowledgeZapAssignmentAttempts.id],
  }),
}));


/**
 * Tracks the concepts associated with a knowledge zap question
 */
export const knowledgeZapQuestionsToConcepts = pgTable(
  "knowledge_zap_questions_to_concepts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    questionId: varchar("question_id", { length: 21 }).notNull().references(() => knowledgeZapQuestions.id),
    conceptId: varchar("concept_id", { length: 36 }).notNull().references(() => concepts.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const knowledgeZapQuestionsToConceptsRelations = relations(knowledgeZapQuestionsToConcepts, ({ one }) => ({
  question: one(knowledgeZapQuestions, {
    fields: [knowledgeZapQuestionsToConcepts.questionId],
    references: [knowledgeZapQuestions.id],
  }),
  concept: one(concepts, {
    fields: [knowledgeZapQuestionsToConcepts.conceptId],
    references: [concepts.id],
  }),
}));


