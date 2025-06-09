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
import { topics, subjects, courses } from "./subject";
import { users } from "./user";
import { classrooms } from "./classroom";
import { knowledgeZapQuestionsToConcepts } from "./knowledgeZap/knowledgeZapQuestions";
import { stepSolveStepConcepts } from "./stepSolve/stepSolveQuestions";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const concepts = pgTable(
  "concepts",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    text: text("text").notNull(),
    answerText: text("answer_text"),
    formulas: text("formulas").array(),
    generated: boolean("generated").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    createdBy: varchar("created_by", { length: 21 }).references(() => users.id),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const conceptRelations = relations(concepts, ({ many }) => ({
  explainQuestionConcepts: many(explainQuestionConcepts),
  conceptsToTopics: many(conceptsToTopics),
  conceptsToSubjects: many(conceptsToSubjects),
  conceptsToCourses: many(conceptsToCourses),
  conceptsToGrades: many(conceptsToGrades),
  conceptTracking: many(conceptTracking),
  conceptEdges: many(conceptEdges),
  stepSolveStepConcepts: many(stepSolveStepConcepts),
  knowledgeZapQuestionsToConcepts: many(knowledgeZapQuestionsToConcepts),
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


export const conceptsToSubjects = pgTable("concepts_to_subjects", {
  id: varchar("id", { length: 21 }).primaryKey(),
  conceptId: varchar("concept_id", { length: 36 }).references(() => concepts.id),
  subjectId: varchar("subject_id", { length: 21 }).references(() => subjects.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});
export const conceptRelationsToSubjects = relations(conceptsToSubjects, ({ one }) => ({
  concept: one(concepts, {
    fields: [conceptsToSubjects.conceptId],
    references: [concepts.id],
  }),
  subject: one(subjects, {
    fields: [conceptsToSubjects.subjectId],
    references: [subjects.id],
  }),
}));


export const conceptsToCourses = pgTable("concepts_to_courses", {
  id: varchar("id", { length: 21 }).primaryKey(),
  conceptId: varchar("concept_id", { length: 36 }).references(() => concepts.id),
  courseId: varchar("course_id", { length: 21 }).references(() => courses.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});
export const conceptRelationsToCourses = relations(conceptsToCourses, ({ one }) => ({
  concept: one(concepts, {
    fields: [conceptsToCourses.conceptId],
    references: [concepts.id],
  }),
  course: one(courses, {
    fields: [conceptsToCourses.courseId],
    references: [courses.id],
  }),
}));


export const conceptsToGrades = pgTable("concepts_to_grades", {
  id: varchar("id", { length: 21 }).primaryKey(),
  conceptId: varchar("concept_id", { length: 36 }).references(() => concepts.id),
  grade: varchar("grade").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});
export const conceptRelationsToGrades = relations(conceptsToGrades, ({ one }) => ({
  concept: one(concepts, {
    fields: [conceptsToGrades.conceptId],
    references: [concepts.id],
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
