import {
  pgTableCreator,
  serial,
  boolean,
  timestamp,
  varchar,
  integer,
  text,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm";
import { assignments } from "./assignment";
import { assignmentTemplates } from "./assignmentTemplate";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);


export const conceptGraphs = pgTable(
  "concept_graphs",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: text("name"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const conceptGraphRelations = relations(conceptGraphs, ({ many, one }) => ({
  assignments: many(assignments),
  assignmentTemplates: many(assignmentTemplates),
  conceptToGraphs: many(conceptsToGraphs),
  conceptGraphEdges: many(conceptGraphEdges),
  conceptGraphRoot: one(conceptGraphRoots),
}));


export const concepts = pgTable(
  "concepts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    text: text("text").notNull(),
    calculationRequired: boolean("calculation_required").default(false).notNull(),
    formula: varchar("formula", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const conceptRelations = relations(concepts, ({ many }) => ({
  conceptsToGraphs: many(conceptsToGraphs),
}));


export const conceptGraphEdges = pgTable(
  "concept_graph_edges",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    parent: varchar("parent", { length: 21 }).references(() => concepts.id).notNull(),
    child: varchar("child", { length: 21 }).references(() => concepts.id).notNull(),
    conceptGraphId: varchar("concept_graph_id", { length: 21 }).references(() => conceptGraphs.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
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
  "concept_graph_roots",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    conceptId: varchar("concept_id", { length: 21 }).notNull().references(() => concepts.id),
    conceptGraphId: varchar("concept_graph_id", { length: 21 }).notNull().references(() => conceptGraphs.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
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


export const conceptAnswers = pgTable(
  "concept_answers",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    text: text("text").notNull(),
    conceptId: varchar("concept_id", { length: 21 }).notNull().references(() => concepts.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const conceptAnswerRelations = relations(conceptAnswers, ({ one }) => ({
  conceptQuestion: one(concepts, {
    fields: [conceptAnswers.conceptId],
    references: [concepts.id],
  }),
}));


export const conceptsToGraphs = pgTable(
  "concepts_to_graphs",
  {
    conceptId: varchar("concept_id", {length: 21}).notNull().references(() => concepts.id),
    conceptGraphId: varchar("concept_graph_id", {length: 21}).notNull().references(() => conceptGraphs.id),
    showVisualization: boolean("show_visualization").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.conceptId, t.conceptGraphId] }),
    conceptIdx: index("concepts_to_graph_concept_idx").on(t.conceptId),
    conceptGraphidx: index("concepts_to_graph_concept_graph_idx").on(t.conceptGraphId),
  }),
)
export const conceptsToGraphsRelations = relations(conceptsToGraphs, ({ one }) => ({
  concept: one(concepts, {
    fields: [conceptsToGraphs.conceptId],
    references: [concepts.id],
  }),
  conceptGraph: one(conceptGraphs, {
    fields: [conceptsToGraphs.conceptGraphId],
    references: [conceptGraphs.id],
  }),
}));