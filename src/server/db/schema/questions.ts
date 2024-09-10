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
import { assignments } from "./assignment";
import { topics } from "./subject";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const questions = pgTable(
  "questions",
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
export const questionRelations = relations(questions, ({ one, many }) => ({
  questionToAssignment: many(questionToAssignment),
  answers: many(answers),
  topic: one(topics, {
    fields: [questions.topicId],
    references: [topics.id],
  }),
}));

export const questionToAssignment = pgTable(
  "question_to_assignment",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    order: integer("order"),
    questionId: varchar("question_id", { length: 21 }).notNull().references(() => questions.id),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => assignments.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const questionToAssignmentRelations = relations(questionToAssignment, ({ one }) => ({
  question: one(questions, {
    fields: [questionToAssignment.questionId],
    references: [questions.id],
  }),
  assignment: one(assignments, {
    fields: [questionToAssignment.assignmentId],
    references: [assignments.id],
  }),
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

