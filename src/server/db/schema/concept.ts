import {
  pgTableCreator,
  boolean,
  timestamp,
  varchar,
  text,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm";
import { explainQuestionConcepts } from "./learnByTeaching/explainQuestions";
import { topics } from "./subject";
import { users } from "./user";
import { classrooms } from "./classroom";
import { knowledgeZapQuestionsToConcepts } from "./knowledgeZap/knowledgeZapQuestions";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const concepts = pgTable(
  "concepts",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    text: text("text").notNull(),
    answerText: text("answer_text"),
    formulas: text("formulas").array(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const conceptRelations = relations(concepts, ({ many }) => ({
  explainQuestionConcepts: many(explainQuestionConcepts),
  conceptsToTopics: many(conceptsToTopics),
  conceptTracking: many(conceptTracking),
  conceptEdges: many(conceptEdges),
}));


export const conceptsToTopics = pgTable("concepts_to_topics", {
  id: varchar("id", { length: 21 }).primaryKey(),
  conceptId: varchar("concept_id", { length: 36 }).references(() => concepts.id),
  topicId: varchar("topic_id", { length: 21 }).references(() => topics.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});
export const conceptRelationsToTopics = relations(conceptsToTopics, ({ one }) => ({
  concept: one(concepts, {
    fields: [conceptsToTopics.conceptId],
    references: [concepts.id],
  }),
  topic: one(topics, {
    fields: [conceptsToTopics.topicId],
    references: [topics.id],
  }),
}));


export const conceptTracking = pgTable("concept_tracking", {
  id: varchar("id", { length: 21 }).primaryKey(),
  isCorrect: boolean("is_correct").notNull(),
  conceptId: varchar("concept_id", { length: 36 }).references(() => concepts.id),
  userId: varchar("user_id", { length: 21 }).references(() => users.id),
  classroomId: varchar("classroom_id", { length: 21 }).references(() => classrooms.id),
  activityType: text("activity_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});
export const conceptTrackingRelations = relations(conceptTracking, ({ one, many }) => ({
  concept: one(concepts, {
    fields: [conceptTracking.conceptId],
    references: [concepts.id],
  }),
  user: one(users, {
    fields: [conceptTracking.userId],
    references: [users.id],
  }),
  classroom: one(classrooms, {
    fields: [conceptTracking.classroomId],
    references: [classrooms.id],
  }),
  knowledgeZapQuestionsToConcepts: many(knowledgeZapQuestionsToConcepts),
}));


export const conceptEdges = pgTable("concept_edges", {
  id: varchar("id", { length: 21 }).primaryKey(),
  conceptId: varchar("concept_id", { length: 36 }).references(() => concepts.id),
  relatedConceptId: varchar("related_concept_id", { length: 36 }).references(() => concepts.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),  
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});
export const conceptEdgesRelations = relations(conceptEdges, ({ one }) => ({
  concept: one(concepts, {
    fields: [conceptEdges.conceptId],
    references: [concepts.id],
  }),
  relatedConcept: one(concepts, {
    fields: [conceptEdges.relatedConceptId],
    references: [concepts.id],
  }),
}));
