import {
  pgTableCreator,
  serial,
  boolean,
  timestamp,
  varchar,
  json,
  text,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { conceptGraphs } from "./concept";
import { assignmentTemplates } from "./assignmentTemplate";
import { assignments } from "./assignment";
import { relations } from "drizzle-orm/relations";
import { users } from "./user";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const explanation = pgTable(
  "explanation",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    text: text("text").notNull(),
    assignmentId: varchar("assignmentId", { length: 21 }).references(() => assignments.id || assignmentTemplates.id),
    embedding: json("embedding"),
    createdBy: varchar("created_by", { length: 21 }).references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const explanationRelations = relations(explanation, ({ many }) => ({
  correctConcepts: many(correctConcepts),
}));


export const correctConcepts = pgTable(
  "correct_concepts",
  {
    id: serial("id").primaryKey(),
    explanationId: varchar("explanation_id", { length: 21 }).references(() => explanation.id).notNull(),
    conceptId: varchar("concept_id", { length: 21 }).references(() => conceptGraphs.id).notNull(),
  }
);
export const correctConceptRelations = relations(correctConcepts, ({ one }) => ({
  explanation: one(explanation, {
    fields: [correctConcepts.explanationId],
    references: [explanation.id],
  }),
  concept: one(conceptGraphs, {
    fields: [correctConcepts.conceptId],
    references: [conceptGraphs.id],
  }),
}));


