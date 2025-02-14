import {
  pgTableCreator,
  boolean,
  timestamp,
  varchar,
  text,
  pgEnum,
  doublePrecision
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm/relations";
import { conceptMappingAssignments } from "./conceptMappingAssignments";
export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const positionEnum = pgEnum("position", ["top", "right", "bottom", "left"]);
export const handleTypeEnum = pgEnum("handle_type", ["source", "target"]);


export const conceptMappingNodes = pgTable(
  "cm_nodes",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    x: doublePrecision("x").notNull(),
    y: doublePrecision("y").notNull(),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => conceptMappingAssignments.id),
    alwaysVisible: boolean("always_visible").default(false).notNull(),
    label: text("label").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const conceptMappingNodeRelations = relations(conceptMappingNodes, ({ one, many }) => ({
  assignment: one(conceptMappingAssignments, {
    fields: [conceptMappingNodes.assignmentId],
    references: [conceptMappingAssignments.id],
  }),
  handles: many(conceptMappingNodeHandles),
  edges: many(conceptMappingEdges),
}));


export const conceptMappingEdges = pgTable(
  "cm_edges",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    label: text("label").notNull(),
    alwaysVisible: boolean("always_visible").default(false).notNull(),
    sourceNodeId: varchar("source_node_id", { length: 21 }).references(() => conceptMappingNodes.id),
    targetNodeId: varchar("target_node_id", { length: 21 }).references(() => conceptMappingNodes.id),
    sourceHandleId: varchar("source_handle_id", { length: 21 }).references(() => conceptMappingNodeHandles.id),
    targetHandleId: varchar("target_handle_id", { length: 21 }).references(() => conceptMappingNodeHandles.id),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => conceptMappingAssignments.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const conceptMappingEdgeRelations = relations(conceptMappingEdges, ({ one }) => ({
  assignment: one(conceptMappingAssignments, {
    fields: [conceptMappingEdges.assignmentId],
    references: [conceptMappingAssignments.id],
  }),
  sourceNode: one(conceptMappingNodes, {
    fields: [conceptMappingEdges.sourceNodeId],
    references: [conceptMappingNodes.id],
  }),
  targetNode: one(conceptMappingNodes, {
    fields: [conceptMappingEdges.targetNodeId],
    references: [conceptMappingNodes.id],
  }),
  sourceHandle: one(conceptMappingNodeHandles, {
    fields: [conceptMappingEdges.sourceHandleId],
    references: [conceptMappingNodeHandles.id],
  }),
  targetHandle: one(conceptMappingNodeHandles, {
    fields: [conceptMappingEdges.targetHandleId],
    references: [conceptMappingNodeHandles.id],
  }),
}));

export const conceptMappingNodeHandles = pgTable(
  "cm_node_handles",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    position: positionEnum("position").notNull(),
    nodeId: varchar("node_id", { length: 21 }).references(() => conceptMappingNodes.id),
    type: handleTypeEnum("type").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const conceptMappingNodeHandleRelations = relations(conceptMappingNodeHandles, ({ one }) => ({
  node: one(conceptMappingNodes, {
    fields: [conceptMappingNodeHandles.nodeId],
    references: [conceptMappingNodes.id],
  }),
}));

