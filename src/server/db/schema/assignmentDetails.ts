import {
  pgTableCreator,
  serial,
  boolean,
  timestamp,
  varchar,
  integer,
  text
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { conceptGraphs } from "./concept";
import { assignmentTemplates } from "./assignmentTemplate";
import { relations } from "drizzle-orm/relations";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const questions = pgTable(
  "questions",
  {
    id: serial("id").primaryKey(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    conceptGraphId: varchar("concept_graph_id", { length: 21 }).references(() => conceptGraphs.id), 
    //TODO: Make it not null later
    assignmentTemplateId: varchar("assignment_template_id", { length: 21 }).references(() => assignmentTemplates.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const questionRelations = relations(questions, ({ one }) => ({
  conceptGraph: one(conceptGraphs, {
    fields: [questions.conceptGraphId],
    references: [conceptGraphs.id],
  }),
  assignmentTemplate: one(assignmentTemplates, {
    fields: [questions.assignmentTemplateId],
    references: [assignmentTemplates.id],
  }),
}));


