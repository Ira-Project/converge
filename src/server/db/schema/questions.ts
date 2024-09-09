import {
  pgTableCreator,
  boolean,
  timestamp,
  varchar,
  text
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm/relations";
import { assignments } from "./assignment";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const questions = pgTable(
  "questions",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    question: text("question").notNull(),
    lambdaUrl: text("lambda_url").notNull(),
    assignmentId: varchar("assignment_id", { length: 21 }).references(() => assignments.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const questionRelations = relations(questions, ({ one, many }) => ({
  assignments: one(assignments, {
    fields: [questions.assignmentId],
    references: [assignments.id],
  }),
  answers: many(answers),
}));


export const answers = pgTable(
  "answers",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    questionId: varchar("question_id", { length: 21 }).references(() => questions.id),
    answer: text("answer").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const answerRelations = relations(answers, ({ one }) => ({
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}));

