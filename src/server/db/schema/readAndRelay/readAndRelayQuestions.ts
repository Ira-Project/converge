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
import { readAndRelayAssignments } from "./readAndRelayAssignments";
import { topics } from "../subject";
export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const readAndRelayQuestions = pgTable(
  "rr_questions",
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
export const questionRelations = relations(readAndRelayQuestions, ({ one, many }) => ({
  readAndRelayQuestionToAssignment: many(readAndRelayQuestionToAssignment),
  readAndRelayAnswers: many(readAndRelayAnswers),
  topic: one(topics, {
    fields: [readAndRelayQuestions.topicId],
    references: [topics.id],
  }),
}));

export const readAndRelayQuestionToAssignment = pgTable(
  "rr_question_to_assignment",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    order: integer("order"),
    questionId: varchar("question_id", { length: 21 }).notNull().references(() => readAndRelayQuestions.id),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => readAndRelayAssignments.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const readAndRelayQuestionToAssignmentRelations = relations(readAndRelayQuestionToAssignment, ({ one }) => ({
  question: one(readAndRelayQuestions, {
    fields: [readAndRelayQuestionToAssignment.questionId],
    references: [readAndRelayQuestions.id],
  }),
  assignment: one(readAndRelayAssignments, {
    fields: [readAndRelayQuestionToAssignment.assignmentId],
    references: [readAndRelayAssignments.id],
  }),
}));


export const readAndRelayAnswers = pgTable(
  "rr_answers",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    questionId: varchar("question_id", { length: 21 }).references(() => readAndRelayQuestions.id),
    answer: text("answer").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const readAndRelayAnswerRelations = relations(readAndRelayAnswers, ({ one }) => ({
  question: one(readAndRelayQuestions, {
    fields: [readAndRelayAnswers.questionId],
    references: [readAndRelayQuestions.id],
  }),
}));

