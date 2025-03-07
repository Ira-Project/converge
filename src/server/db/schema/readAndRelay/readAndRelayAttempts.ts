import {
  pgTableCreator,
  boolean,
  timestamp,
  varchar,
  doublePrecision,
  text,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm";
import { readAndRelayAssignments } from "./readAndRelayAssignments";
import { users } from "../user";
import { activity } from "../activity";
import { readAndRelayQuestions } from "./readAndRelayQuestions";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const readAndRelayAttempts = pgTable(
  "rr_attempts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    activityId: varchar("activity_id", { length: 21 }).references(() => activity.id),
    assignmentId: varchar("assignment_id", { length: 21 }).references(() => readAndRelayAssignments.id),
    score: doublePrecision("score"),
    accuracy: doublePrecision("accuracy"),
    submittedAt: timestamp("submitted_at", { mode: "date" }),
    userId: varchar("user_id", { length: 21 }).notNull().references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const readAndRelayAttemptRelations = relations(readAndRelayAttempts, ({ one, many }) => ({
  activity: one(activity, {
    fields: [readAndRelayAttempts.activityId],
    references: [activity.id],
  }),
  assignment: one(readAndRelayAssignments, {
    fields: [readAndRelayAttempts.assignmentId],
    references: [readAndRelayAssignments.id],
  }),
  cheatsheets: many(readAndRelayCheatSheets),
  user: one(users, {
    fields: [readAndRelayAttempts.userId],
    references: [users.id],
  }),
}));


export const readAndRelayCheatSheets = pgTable(
  "rr_cheat_sheets",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    attemptId: varchar("attempt_id", { length: 21 }).references(() => readAndRelayAttempts.id),
    highlights: text("highlights").array(),
    formulas: text("formulas").array(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    createdBy: varchar("created_by", { length: 21 }).references(() => users.id),
  }
)
export const readAndRelayCheatSheetRelations = relations(readAndRelayCheatSheets, ({ one, many }) => ({
  attempt: one(readAndRelayAttempts, {
    fields: [readAndRelayCheatSheets.attemptId],
    references: [readAndRelayAttempts.id],
  }),
  computedAnswers: many(readAndRelayComputedAnswers),
}));


export const readAndRelayComputedAnswers = pgTable(
  "rr_computed_answers",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    cheatsheetId: varchar("cheatsheet_id", { length: 21 }).references(() => readAndRelayCheatSheets.id),
    questionId: varchar("question_id", { length: 21 }).references(() => readAndRelayQuestions.id),
    answer: text("answer"),
    isCorrect: boolean("is_correct").notNull().default(false),
    workingText: text("working_text"),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  }
)
export const readAndRelayComputedAnswerRelations = relations(readAndRelayComputedAnswers, ({ one }) => ({
  cheatsheet: one(readAndRelayCheatSheets, {
    fields: [readAndRelayComputedAnswers.cheatsheetId],
    references: [readAndRelayCheatSheets.id],
  }),
  question: one(readAndRelayQuestions, {
    fields: [readAndRelayComputedAnswers.questionId],
    references: [readAndRelayQuestions.id],
  }),
}));