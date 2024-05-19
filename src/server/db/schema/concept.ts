import {
  pgTableCreator,
  serial,
  boolean,
  timestamp,
  varchar,
  integer,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm";
import { assignments } from "./assignment";
import { assignmentTemplates } from "./assignmentTemplate";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);


export const conceptGraphs = pgTable(
  "conceptGraphs",
  {
    id: serial("id").primaryKey(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const conceptGraphRelations = relations(conceptGraphs, ({ many, one }) => ({
  assignments: many(assignments),
  assignmentTemplates: many(assignmentTemplates),
  concepts: many(concepts),
  conceptGraphEdges: many(conceptGraphEdges),
  conceptGraphRoot: one(conceptGraphRoots),
}));


export const concepts = pgTable(
  "concepts",
  {
    id: serial("id").primaryKey(),
    calculationRequired: boolean("calculation_required").default(false).notNull(),
    formula: varchar("formula", { length: 255 }),
    conceptGraphId: integer("concept_graph_id").references(() => conceptGraphs.id),
  }
)
export const conceptRelations = relations(concepts, ({ one, many }) => ({
  conceptGraph: one(conceptGraphs, {
    fields: [concepts.conceptGraphId],
    references: [conceptGraphs.id],
  }),
  conceptQuestions: many(conceptQuestions),
}));


export const conceptGraphEdges = pgTable(
  "conceptGraphEdges",
  {
    id: serial("id").primaryKey(),
    parent: integer("parent").references(() => concepts.id).notNull(),
    child: integer("child").references(() => concepts.id).notNull(),
    conceptGraphId: integer("concept_graph_id").references(() => conceptGraphs.id),
  }
)
export const conceptGraphEdgeRelations = relations(conceptGraphEdges, ({ one }) => ({
  fromConcept: one(concepts, {
    fields: [conceptGraphEdges.parent],
    references: [concepts.id],
  }),
  toConcept: one(concepts, {
    fields: [conceptGraphEdges.child],
    references: [concepts.id],
  }),
  conceptGraph: one(conceptGraphs, {
    fields: [conceptGraphEdges.conceptGraphId],
    references: [conceptGraphs.id],
  }),
}));


export const conceptGraphRoots = pgTable(
  "conceptGraphRoots",
  {
    id: serial("id").primaryKey(),
    conceptId: integer("concept_id").references(() => concepts.id).notNull(),
    conceptGraphId: integer("concept_graph_id").references(() => conceptGraphs.id),
  }
)
export const conceptGraphRootRelations = relations(conceptGraphRoots, ({ one }) => ({
  concept: one(concepts, {
    fields: [conceptGraphRoots.conceptId],
    references: [concepts.id],
  }),
  conceptGraph: one(conceptGraphs, {
    fields: [conceptGraphRoots.conceptGraphId],
    references: [conceptGraphs.id],
  }),
}));


export const conceptQuestions = pgTable(
  "conceptQuestions",
  {
    id: serial("id").primaryKey(),
    text: varchar("question", { length: 255 }).notNull(),
    conceptId: integer("concept_id").references(() => concepts.id),
  }
)
export const conceptQuestionRelations = relations(conceptQuestions, ({ one, many }) => ({
  concept: one(concepts, {
    fields: [conceptQuestions.conceptId],
    references: [concepts.id],
  }),
  conceptAnswers: many(conceptAnswers),
}));

export const conceptAnswers = pgTable(
  "conceptAnswers",
  {
    id: serial("id").primaryKey(),
    text: varchar("text", { length: 255 }).notNull(),
    conceptQuestionId: integer("concept_question_id").references(() => conceptQuestions.id),
  }
)
export const conceptAnswerRelations = relations(conceptAnswers, ({ one }) => ({
  conceptQuestion: one(conceptQuestions, {
    fields: [conceptAnswers.conceptQuestionId],
    references: [conceptQuestions.id],
  }),
}));