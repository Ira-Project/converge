import {
  pgTableCreator,
  boolean,
  timestamp,
  varchar,
  text,
  doublePrecision,
  integer
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm/relations";
import { stepSolveAssignmentAttempts } from "./stepSolveAssignment";
import { stepSolveQuestions, stepSolveStep, stepSolveStepOptions } from "./stepSolveQuestions";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const stepSolveQuestionAttempts = pgTable(
  "step_solve_question_attempts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    attemptId: varchar("attempt_id", { length: 21 }).references(() => stepSolveAssignmentAttempts.id),
    correct: boolean("correct").notNull().default(false),
    score: doublePrecision("score"),
    stepsCompleted: integer("steps_completed"),
    reasoningScore: doublePrecision("reasoning_score"),
    evaluationScore: doublePrecision("evaluation_score"),
    questionId: varchar("question_id", { length: 21 }).references(() => stepSolveQuestions.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const stepSolveQuestionAttemptRelations = relations(stepSolveQuestionAttempts, ({ one, many }) => ({
  attempt: one(stepSolveAssignmentAttempts, {
    fields: [stepSolveQuestionAttempts.attemptId],
    references: [stepSolveAssignmentAttempts.id],
  }),
  question: one(stepSolveQuestions, {
    fields: [stepSolveQuestionAttempts.questionId],
    references: [stepSolveQuestions.id],
  }),
  stepAttempts: many(stepSolveQuestionAttemptSteps),
}));

export const stepSolveQuestionAttemptSteps = pgTable(
  "step_solve_question_attempt_steps",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    questionAttemptId: varchar("question_attempt_id", { length: 21 }).references(() => stepSolveQuestionAttempts.id).notNull(),
    stepSolveStepId: varchar("step_solve_step_id", { length: 21 }).references(() => stepSolveStep.id).notNull(),
    answer: text("answer"),
    stepSolveStepOptionId: varchar("step_solve_step_option_id", { length: 21 }).references(() => stepSolveStepOptions.id),
    isCorrect: boolean("is_correct"),
    reasoningCorrect: boolean("reasoning_correct"),
    evaluationCorrect: boolean("evaluation_correct"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const stepSolveQuestionAttemptStepsRelations = relations(stepSolveQuestionAttemptSteps, ({ one }) => ({
  questionAttempt: one(stepSolveQuestionAttempts, {
    fields: [stepSolveQuestionAttemptSteps.questionAttemptId],
    references: [stepSolveQuestionAttempts.id],
  }),
  step: one(stepSolveStep, {
    fields: [stepSolveQuestionAttemptSteps.stepSolveStepId],
    references: [stepSolveStep.id],
  }),
  option: one(stepSolveStepOptions, {
    fields: [stepSolveQuestionAttemptSteps.stepSolveStepOptionId],
    references: [stepSolveStepOptions.id],
  }),
}));