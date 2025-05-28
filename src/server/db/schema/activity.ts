import {
  pgTableCreator,
  boolean,
  timestamp,
  varchar,
  pgEnum,
  text,
  integer,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";


import { users } from "./user";

import { classrooms } from "./classroom";
import { relations } from "drizzle-orm";
import { topics } from "./subject";
import { stepSolveAssignments } from "./stepSolve/stepSolveAssignment";
import { knowledgeZapAssignments } from "./knowledgeZap/knowledgeZapAssignment";
import { readAndRelayAssignments } from "./readAndRelay/readAndRelayAssignments";
import { conceptMappingAssignments } from "./conceptMapping/conceptMappingAssignments";
import { reasoningAssignments } from "./reasoning/reasoningAssignment";
import { explainAssignments } from "./learnByTeaching/explainAssignment";


export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const activityTypeEnum = pgEnum('activity_type', [
  "Learn By Teaching",
  "Reason Trace",
  "Read and Relay",
  "Knowledge Zap",
  "Step Solve",
  "Human vs AI",
]);

export const activity = pgTable("activity", {
  id: varchar("id", { length: 21 }).primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  typeText: text("type_text"),
  assignmentId: varchar("assignment_id", { length: 21 }),
  classroomId: varchar("classroom_id", { length: 21 }).references(() => classrooms.id),
  isLive: boolean("is_live").default(false).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  dueDate: timestamp("due_date", { mode: "date" }),
  order: integer("order").notNull(),
  points: integer("points").notNull(),
  topicId: varchar("topic_id", { length: 21 }).references(() => topics.id),
  generated: boolean("generated").default(false).notNull(),
  createdBy: varchar("created_by", { length: 21 }).references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});
export const activityRelations = relations(activity, ({ one, many }) => ({
  classroom: one(classrooms, {
    fields: [activity.classroomId],
    references: [classrooms.id],
  }),
  topic: one(topics, {
    fields: [activity.topicId],
    references: [topics.id],
  }),
  activityToAssignments: many(activityToAssignment, {
    relationName: "activity_to_assignment",
  }),
}));


export const activityToAssignment = pgTable("activity_to_assignment", {
  id: varchar("id", { length: 21 }).primaryKey(),
  activityId: varchar("activity_id", { length: 21 }).references(() => activity.id).notNull(),
  knowledgeZapAssignmentId: varchar("knowledge_zap_assignment_id", { length: 21 }).references(() => knowledgeZapAssignments.id),
  stepSolveAssignmentId: varchar("step_solve_assignment_id", { length: 21 }).references(() => stepSolveAssignments.id),
  readAndRelayAssignmentId: varchar("read_and_relay_assignment_id", { length: 21 }).references(() => readAndRelayAssignments.id),
  conceptMappingAssignmentId: varchar("concept_mapping_assignment_id", { length: 21 }).references(() => conceptMappingAssignments.id),
  reasonTraceAssignmentId: varchar("reason_trace_assignment_id", { length: 21 }).references(() => reasoningAssignments.id),
  learnByTeachingAssignmentId: varchar("learn_by_teaching_assignment_id", { length: 21 }).references(() => explainAssignments.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});
export const activityToAssignmentRelations = relations(activityToAssignment, ({ one }) => ({
  activity: one(activity, {
    fields: [activityToAssignment.activityId],
    references: [activity.id],
  }),
  knowledgeZapAssignment: one(knowledgeZapAssignments, {
    fields: [activityToAssignment.knowledgeZapAssignmentId],
    references: [knowledgeZapAssignments.id],
  }),
  stepSolveAssignment: one(stepSolveAssignments, {
    fields: [activityToAssignment.stepSolveAssignmentId],
    references: [stepSolveAssignments.id],
  }),
  readAndRelayAssignment: one(readAndRelayAssignments, {
    fields: [activityToAssignment.readAndRelayAssignmentId],
    references: [readAndRelayAssignments.id],
  }),
  conceptMappingAssignment: one(conceptMappingAssignments, {
    fields: [activityToAssignment.conceptMappingAssignmentId],
    references: [conceptMappingAssignments.id],
  }),
  reasonTraceAssignment: one(reasoningAssignments, {
    fields: [activityToAssignment.reasonTraceAssignmentId],
    references: [reasoningAssignments.id],
  }),
  learnByTeachingAssignment: one(explainAssignments, {
    fields: [activityToAssignment.learnByTeachingAssignmentId],
    references: [explainAssignments.id],
  }),
}));

