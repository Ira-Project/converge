import { boolean, integer, pgTableCreator, timestamp, varchar, text, doublePrecision } from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { users } from "../user";
import { relations } from "drizzle-orm";

import { topics, courses, subjects } from "../subject";
import { knowledgeZapQuestionAttempts } from "./knowledgeZapQuestions";
import { knowledgeZapQuestionToAssignment } from "./knowledgeZapQuestions";
import { activity } from "../activity";


export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const knowledgeZapAssignments = pgTable(
  "knowledge_zap_assignments",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: text("name"),
    description: text("description"),
    topicId: varchar("topic_id", { length: 21 }).notNull().references(() => topics.id),
    order: integer("order"),
    generated: boolean("generated").default(false).notNull(),
    createdBy: varchar("created_by", { length: 21 }).references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
    isLatest: boolean("is_latest").default(true).notNull(),
  }
);

export const knowledgeZapAssignmentRelations = relations(knowledgeZapAssignments, ({ one, many }) => ({
  topic: one(topics, {
    fields: [knowledgeZapAssignments.topicId],
    references: [topics.id],
  }),
  questionToAssignment: many(knowledgeZapQuestionToAssignment),
  assignmentToCourses: many(knowledgeZapAssignmentToCourse),
  assignmentToGrades: many(knowledgeZapAssignmentToGrade),
  assignmentToSubjects: many(knowledgeZapAssignmentToSubject),
}));

/**
 * Tracks student attempts at completing reasoning assignments
 * Records submission details and scoring information
 */
export const knowledgeZapAssignmentAttempts = pgTable(
  "knowledge_zap_assignment_attempts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 21 }).references(() => knowledgeZapAssignments.id),
    activityId: varchar("activity_id", { length: 21 }).references(() => activity.id),
    isRevision: boolean("is_revision").default(false).notNull(),
    score: doublePrecision("score"),
    questionsCompleted: integer("questions_completed"),
    totalAttempts: integer("total_attempts"),
    submittedAt: timestamp("submitted_at", { mode: "date" }),
    userId: varchar("user_id", { length: 21 }).references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const knowledgeZapAssignmentAttemptRelations = relations(knowledgeZapAssignmentAttempts, ({ one, many }) => ({
  assignment: one(knowledgeZapAssignments, {
    fields: [knowledgeZapAssignmentAttempts.assignmentId],
    references: [knowledgeZapAssignments.id],
  }),
  activity: one(activity, {
    fields: [knowledgeZapAssignmentAttempts.activityId],
    references: [activity.id],
  }),
  user: one(users, {
    fields: [knowledgeZapAssignmentAttempts.userId],
    references: [users.id],
  }),
  questionAttempts: many(knowledgeZapQuestionAttempts),
}));

/**
 * Junction table for many-to-many relationship between Knowledge Zap assignments and courses
 * Allows one assignment to be mapped to multiple courses
 */
export const knowledgeZapAssignmentToCourse = pgTable(
  "knowledge_zap_assignment_to_course",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => knowledgeZapAssignments.id),
    courseId: varchar("course_id", { length: 21 }).notNull().references(() => courses.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const knowledgeZapAssignmentToCourseRelations = relations(knowledgeZapAssignmentToCourse, ({ one }) => ({
  assignment: one(knowledgeZapAssignments, {
    fields: [knowledgeZapAssignmentToCourse.assignmentId],
    references: [knowledgeZapAssignments.id],
  }),
  course: one(courses, {
    fields: [knowledgeZapAssignmentToCourse.courseId],
    references: [courses.id],
  }),
}));

/**
 * Junction table for many-to-many relationship between Knowledge Zap assignments and grades
 * Allows one assignment to be mapped to multiple grades
 */
export const knowledgeZapAssignmentToGrade = pgTable(
  "knowledge_zap_assignment_to_grade",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => knowledgeZapAssignments.id),
    grade: varchar("grade").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const knowledgeZapAssignmentToGradeRelations = relations(knowledgeZapAssignmentToGrade, ({ one }) => ({
  assignment: one(knowledgeZapAssignments, {
    fields: [knowledgeZapAssignmentToGrade.assignmentId],
    references: [knowledgeZapAssignments.id],
  }),
}));

/**
 * Junction table for many-to-many relationship between Knowledge Zap assignments and subjects
 * Allows one assignment to be mapped to multiple subjects (direct mapping, in addition to the indirect topic->course->subject)
 */
export const knowledgeZapAssignmentToSubject = pgTable(
  "knowledge_zap_assignment_to_subject",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => knowledgeZapAssignments.id),
    subjectId: varchar("subject_id", { length: 21 }).notNull().references(() => subjects.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const knowledgeZapAssignmentToSubjectRelations = relations(knowledgeZapAssignmentToSubject, ({ one }) => ({
  assignment: one(knowledgeZapAssignments, {
    fields: [knowledgeZapAssignmentToSubject.assignmentId],
    references: [knowledgeZapAssignments.id],
  }),
  subject: one(subjects, {
    fields: [knowledgeZapAssignmentToSubject.subjectId],
    references: [subjects.id],
  }),
}));




