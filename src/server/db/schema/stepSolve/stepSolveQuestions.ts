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
import { stepSolveAssignments } from "./stepSolveAssignment";
import { concepts } from "../concept";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

// Table for storing step solve questions with their text, images, and associated topic
export const stepSolveQuestions = pgTable(
  "step_solve_questions",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    questionText: text("question").notNull(),
    questionImage: text("image"),
    topicId: varchar("topic_id", { length: 21 }).references(() => topics.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const stepSolveQuestionRelations = relations(stepSolveQuestions, ({ one, many }) => ({
  stepSolveQuestionToAssignment: many(stepSolveQuestionToAssignment),
  topic: one(topics, {
    fields: [stepSolveQuestions.topicId],
    references: [topics.id],
  }),
  steps: many(stepSolveStep),
}));

// Junction table linking reasoning questions to assignments with ordering capability
export const stepSolveQuestionToAssignment = pgTable(
  "step_solve_question_to_assignment",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    order: integer("order"),
    questionId: varchar("question_id", { length: 21 }).notNull().references(() => stepSolveQuestions.id),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => stepSolveAssignments.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const stepSolveQuestionToAssignmentRelations = relations(stepSolveQuestionToAssignment, ({ one }) => ({
  q: one(stepSolveQuestions, {
    fields: [stepSolveQuestionToAssignment.questionId],
    references: [stepSolveQuestions.id],
  }),
  assignment: one(stepSolveAssignments, {
    fields: [stepSolveQuestionToAssignment.assignmentId],
    references: [stepSolveAssignments.id],
  }),
}));

// Table for storing each step of a step solve question with its text, image, and answer if applicable
export const stepSolveStep = pgTable(
  "step_solve_step",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    questionId: varchar("question_id", { length: 21 }).references(() => stepSolveQuestions.id),
    stepText: text("step_text").notNull(),
    stepTextPart2: text("step_text_part2"),
    stepImage: text("step_image"),
    stepNumber: integer("step_number").notNull(),
    stepSolveAnswer: text("step_solve_answer").array(),
    stepSolveAnswerUnits: text("step_solve_answer_units"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const stepSolveStepRelations = relations(stepSolveStep, ({ one, many }) => ({
  question: one(stepSolveQuestions, {
    fields: [stepSolveStep.questionId],
    references: [stepSolveQuestions.id],
  }),
  opt: many(stepSolveStepOptions),
  concepts: many(stepSolveStepConcepts),
}));

// Table for storing each step option for a step that has multiple choice question with its text, image, and if it's correct
export const stepSolveStepOptions = pgTable(
  "step_solve_step_options",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    stepId: varchar("step_id", { length: 21 }).references(() => stepSolveStep.id),
    optionText: text("option_text").notNull(),
    optionImage: text("option_image"),
    isCorrect: boolean("is_correct").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const stepSolveStepOptionsRelations = relations(stepSolveStepOptions, ({ one }) => ({
  step: one(stepSolveStep, {
    fields: [stepSolveStepOptions.stepId],
    references: [stepSolveStep.id],
  }),
}));


export const stepSolveStepConcepts = pgTable(
  "step_solve_step_concepts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    stepId: varchar("step_id", { length: 21 }).references(() => stepSolveStep.id),
    conceptId: varchar("concept_id", { length: 36 }).references(() => concepts.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const stepSolveStepConceptsRelations = relations(stepSolveStepConcepts, ({ one }) => ({
  step: one(stepSolveStep, {
    fields: [stepSolveStepConcepts.stepId],
    references: [stepSolveStep.id],
  }),
  concept: one(concepts, {
    fields: [stepSolveStepConcepts.conceptId],
    references: [concepts.id],
  }),
}));
