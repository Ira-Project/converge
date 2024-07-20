import {
  pgTableCreator,
  boolean,
  timestamp,
  varchar,
  text,
  primaryKey,
  index,
  json,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm";
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
export const conceptGraphRelations = relations(conceptGraphs, ({ many }) => ({
  assignmentTemplates: many(assignmentTemplates),
  conceptToGraphs: many(conceptsToGraphs),
  conceptGraphEdges: many(conceptGraphEdges),
  conceptGraphToRoots: many(conceptGraphToRootConcepts),
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
  similarConceptFrom: many(similarConcepts, { relationName: "conceptFrom"}),  
  similarConceptTo: many(similarConcepts, { relationName: "conceptTo"}),  
  conceptAnswers: many(conceptAnswers),
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


export const conceptAnswers = pgTable(
  "concept_answers",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    text: text("text").notNull(),
    embedding: json("embedding").notNull(),
    conceptId: varchar("concept_id", { length: 21 }).notNull().references(() => concepts.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const conceptAnswerRelations = relations(conceptAnswers, ({ one }) => ({
  concept: one(concepts, {
    fields: [conceptAnswers.conceptId],
    references: [concepts.id],
  }),
}));


export const conceptsToGraphs = pgTable(
  "concepts_to_graphs",
  {
    conceptId: varchar("concept_id", {length: 21}).notNull().references(() => concepts.id),
    conceptGraphId: varchar("concept_graph_id", {length: 21}).notNull().references(() => conceptGraphs.id),
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

export const conceptGraphToRootConcepts = pgTable(
  "concepts_graph_to_root_concepts",
  {
    conceptGraphId: varchar("concept_graph_id", {length: 21}).notNull().references(() => conceptGraphs.id),
    conceptId: varchar("concept_id", {length: 21}).notNull().references(() => concepts.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.conceptGraphId, t.conceptId] }),
    conceptGraphIdx: index("concept_graph_to_roots_concept_graph_idx").on(t.conceptGraphId),
    conceptIdx: index("concept_graph_to_roots_concept_idx").on(t.conceptId),
  }),
)
export const conceptGraphToRootsRelations = relations(conceptGraphToRootConcepts, ({ one }) => ({
  conceptGraph: one(conceptGraphs, {
    fields: [conceptGraphToRootConcepts.conceptGraphId],
    references: [conceptGraphs.id],
  }),
  conceptRoot: one(concepts, {
    fields: [conceptGraphToRootConcepts.conceptId],
    references: [concepts.id],
  }),
}));


export const similarConcepts = pgTable(
  "similar_concepts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    conceptFromId: varchar("concept_id", { length: 21 }).notNull().references(() => concepts.id),
    conceptToId: varchar("similar_concept_id", { length: 21 }).notNull().references(() => concepts.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const similarConceptRelations = relations(similarConcepts, ({ one }) => ({
  conceptFrom: one(concepts, {
    fields: [similarConcepts.conceptFromId],
    references: [concepts.id],
    relationName: "conceptFrom"
  }),
  conceptTo: one(concepts, {
    fields: [similarConcepts.conceptToId],
    references: [concepts.id],
    relationName: "conceptTo"
  }),
}));