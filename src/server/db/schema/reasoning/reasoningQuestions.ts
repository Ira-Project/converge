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
import { topics } from "../subject";
import { reasoningAssignments } from "./reasoningAssignment";
import { sql } from "drizzle-orm";
import { reasoningPathwayAttempts, reasoningPathwayAttemptSteps } from "./reasoningQuestionAttempts";
import { reasoningAttemptFinalAnswer } from "./reasoningQuestionAttempts";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

// Table for storing reasoning questions with their text, images, and associated topic
export const reasoningQuestions = pgTable(
  "reasoning_questions",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    topText: text("top_text"),
    topImage: text("top_image"),
    questionText: text("question"),
    questionImage: text("image"),
    answerText: text("answer"),
    answerImage: text("answer_image"),
    numberOfSteps: integer("number_of_steps").notNull(),
    correctAnswers: text("correct_answers").array().notNull().default(sql`'{}'::text[]`),
    topicId: varchar("topic_id", { length: 21 }).references(() => topics.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const reasoningQuestionRelations = relations(reasoningQuestions, ({ one, many }) => ({
  reasoningQuestionToAssignment: many(reasoningQuestionToAssignment),
  answerOptions: many(reasoningAnswerOptions),
  pathways: many(reasoningPathway),
  topic: one(topics, {
    fields: [reasoningQuestions.topicId],
    references: [topics.id],
  }),
  finalAnswer: one(reasoningAttemptFinalAnswer, {
    fields: [reasoningQuestions.id],
    references: [reasoningAttemptFinalAnswer.questionId],
  }),
  attempts: many(reasoningPathwayAttempts)
}));

// Junction table linking reasoning questions to assignments with ordering capability
export const reasoningQuestionToAssignment = pgTable(
  "reasoning_question_to_assignment",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    order: integer("order"),
    questionId: varchar("question_id", { length: 21 }).notNull().references(() => reasoningQuestions.id),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => reasoningAssignments.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const reasoningQuestionToAssignmentRelations = relations(reasoningQuestionToAssignment, ({ one }) => ({
  question: one(reasoningQuestions, {
    fields: [reasoningQuestionToAssignment.questionId],
    references: [reasoningQuestions.id],
  }),
  assignment: one(reasoningAssignments, {
    fields: [reasoningQuestionToAssignment.assignmentId],
    references: [reasoningAssignments.id],
  }),
}));

// Table for storing multiple choice options for reasoning questions
export const reasoningAnswerOptions = pgTable(
  "reasoning_answer_options",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    questionId: varchar("question_id", { length: 21 }).references(() => reasoningQuestions.id),
    optionText: text("option_text").notNull(),
    optionImage: text("option_image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const reasoningAnswerOptionRelations = relations(reasoningAnswerOptions, ({ one, many }) => ({
  question: one(reasoningQuestions, {
    fields: [reasoningAnswerOptions.questionId],
    references: [reasoningQuestions.id],
  }),
  steps: many(reasoningPathwayStep),
  reasoningPathwayAttemptSteps: many(reasoningPathwayAttemptSteps),
}));

// Table for defining different solution pathways for a reasoning question
export const reasoningPathway = pgTable(
  "reasoning_pathway",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    questionId: varchar("question_id", { length: 21 }).references(() => reasoningQuestions.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const reasoningPathwayRelations = relations(reasoningPathway, ({ one, many }) => ({
  question: one(reasoningQuestions, {
    fields: [reasoningPathway.questionId],
    references: [reasoningQuestions.id],
  }),
  steps: many(reasoningPathwayStep),
}));

// Table for storing ordered steps within a solution pathway, linking answer options
export const reasoningPathwayStep = pgTable(
  "reasoning_pathway_step",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    pathwayId: varchar("pathway_id", { length: 21 }).references(() => reasoningPathway.id),
    answerOptionId: varchar("answer_option_id", { length: 21 }).notNull().references(() => reasoningAnswerOptions.id),
    stepNumber: integer("step_number").notNull(),
    stepNumberList: integer("step_number_list").array(),
    isCorrect: boolean("is_correct").notNull(),
    replacementOptionId: varchar("replacement_option_id", { length: 21 }).references(() => reasoningAnswerOptions.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const reasoningPathwayStepRelations = relations(reasoningPathwayStep, ({ one }) => ({
  pathway: one(reasoningPathway, {
    fields: [reasoningPathwayStep.pathwayId],
    references: [reasoningPathway.id],
  }),
  answerOption: one(reasoningAnswerOptions, {
    fields: [reasoningPathwayStep.answerOptionId],
    references: [reasoningAnswerOptions.id],
  }),
  replacementOption: one(reasoningAnswerOptions, {
    fields: [reasoningPathwayStep.replacementOptionId],
    references: [reasoningAnswerOptions.id],
  }),
}));
