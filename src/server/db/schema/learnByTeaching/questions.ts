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
  questionToAssignment: many(questionToAssignment),
  answers: many(answers),
  topic: one(topics, {
    fields: [explainQuestions.topicId],
    references: [topics.id],
  }),
}));

export const questionToAssignment = pgTable(
  "question_to_assignment",
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
export const questionToAssignmentRelations = relations(questionToAssignment, ({ one }) => ({
  question: one(explainQuestions, {
    fields: [questionToAssignment.questionId],
    references: [explainQuestions.id],
  }),
  assignment: one(explainAssignments, {
    fields: [questionToAssignment.assignmentId],
    references: [explainAssignments.id],
  }),
}));


export const answers = pgTable(
  "answers",
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
export const answerRelations = relations(answers, ({ one }) => ({
  question: one(explainQuestions, {
    fields: [answers.questionId],
    references: [explainQuestions.id],
  }),
}));

