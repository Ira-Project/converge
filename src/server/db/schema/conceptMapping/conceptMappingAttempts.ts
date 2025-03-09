import {
  pgTableCreator,
  boolean,
  timestamp,
  varchar,
  doublePrecision,
  text,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm";
import { conceptMappingAssignments } from "./conceptMappingAssignments";
import { users } from "../user";
import { activity } from "../activity";
import { conceptMappingNodes } from "./conceptMappingQuestions";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const conceptMappingAttempts = pgTable(
  "cm_attempts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    activityId: varchar("activity_id", { length: 21 }).references(() => activity.id),
    assignmentId: varchar("assignment_id", { length: 21 }).references(() => conceptMappingAssignments.id),
    score: doublePrecision("score"),
    accuracy: doublePrecision("accuracy"),
    submittedAt: timestamp("submitted_at", { mode: "date" }),
    userId: varchar("user_id", { length: 21 }).notNull().references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const conceptMappingAttemptRelations = relations(conceptMappingAttempts, ({ one, many }) => ({
  activity: one(activity, {
    fields: [conceptMappingAttempts.activityId],
    references: [activity.id],
  }),
  assignment: one(conceptMappingAssignments, {
    fields: [conceptMappingAttempts.assignmentId],
    references: [conceptMappingAssignments.id],
  }),
  mapAttempts: many(conceptMappingMapAttempt),
  user: one(users, {
    fields: [conceptMappingAttempts.userId],
    references: [users.id],
  }),
}));


export const conceptMappingMapAttempt = pgTable(
  "cm_map_attempts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    attemptId: varchar("attempt_id", { length: 21 }).references(() => conceptMappingAttempts.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
    isCorrect: boolean("is_correct").notNull().default(false),
  }
)
export const conceptMappingMapAttemptRelations = relations(conceptMappingMapAttempt, ({ one, many }) => ({
  attempt: one(conceptMappingAttempts, {
    fields: [conceptMappingMapAttempt.attemptId],
    references: [conceptMappingAttempts.id],
  }),
  nodes: many(conceptMappingAttemptNodes),
  edges: many(conceptMappingAttemptEdges),
}));
  
export const conceptMappingAttemptNodes = pgTable(
  "cm_attempt_nodes",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    attemptId: varchar("attempt_id", { length: 21 }).references(() => conceptMappingAttempts.id),
    mapAttemptId: varchar("map_attempt_id", { length: 21 }).references(() => conceptMappingMapAttempt.id),
    nodeId: varchar("node_id", { length: 21 }).references(() => conceptMappingNodes.id),
    label: text("label"),
    isCorrect: boolean("is_correct").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    createdBy: varchar("created_by", { length: 21 }).references(() => users.id),
  }
)
export const conceptMappingAttemptNodeRelations = relations(conceptMappingAttemptNodes, ({ one }) => ({
  attempt: one(conceptMappingAttempts, {
    fields: [conceptMappingAttemptNodes.attemptId],
    references: [conceptMappingAttempts.id],
  }),
  node: one(conceptMappingNodes, {
    fields: [conceptMappingAttemptNodes.nodeId],
    references: [conceptMappingNodes.id],
  }),
  mapAttempt: one(conceptMappingMapAttempt, {
    fields: [conceptMappingAttemptNodes.mapAttemptId],
    references: [conceptMappingMapAttempt.id],
  }),
}));


export const conceptMappingAttemptEdges = pgTable(
  "cm_attempt_edges",
  { 
    id: varchar("id", { length: 21 }).primaryKey(),
    attemptId: varchar("attempt_id", { length: 21 }).references(() => conceptMappingAttempts.id),
    mapAttemptId: varchar("map_attempt_id", { length: 21 }).references(() => conceptMappingMapAttempt.id),
    sourceNodeId: varchar("source_node_id", { length: 21 }).references(() => conceptMappingNodes.id),
    targetNodeId: varchar("target_node_id", { length: 21 }).references(() => conceptMappingNodes.id),
    label: text("label"),
    isCorrect: boolean("is_correct").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  }
)
export const conceptMappingAttemptEdgeRelations = relations(conceptMappingAttemptEdges, ({ one }) => ({
  attempt: one(conceptMappingAttempts, {
    fields: [conceptMappingAttemptEdges.attemptId],
    references: [conceptMappingAttempts.id],
  }),
  sourceNode: one(conceptMappingNodes, {
    fields: [conceptMappingAttemptEdges.sourceNodeId],
    references: [conceptMappingNodes.id],
  }),
  targetNode: one(conceptMappingNodes, {
    fields: [conceptMappingAttemptEdges.targetNodeId],
    references: [conceptMappingNodes.id],
  }),
  mapAttempt: one(conceptMappingMapAttempt, {
    fields: [conceptMappingAttemptEdges.mapAttemptId],
    references: [conceptMappingMapAttempt.id],
  }),
}));