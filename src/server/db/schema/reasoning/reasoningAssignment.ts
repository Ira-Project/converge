import { boolean, integer, pgTableCreator, timestamp, varchar, text, doublePrecision } from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { users } from "../user";
import { relations } from "drizzle-orm";
import { topics, courses, subjects } from "../subject";
import { reasoningQuestionToAssignment } from "./reasoningQuestions";
import { activity } from "../activity";
import { reasoningAttemptFinalAnswer, reasoningPathwayAttempts } from "./reasoningQuestionAttempts";


export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

/**
 * Represents a reasoning assignment in the system
 * Contains details about the assignment configuration, classroom context, and metadata
 */
export const reasoningAssignments = pgTable(
  "reasoning_assignments",
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
  }
);
export const reasoningAssignmentRelations = relations(reasoningAssignments, ({ one, many }) => ({
  topic: one(topics, {
    fields: [reasoningAssignments.topicId],
    references: [topics.id],
  }),
  reasoningQuestions: many(reasoningQuestionToAssignment),
  assignmentToCourses: many(reasoningAssignmentToCourse),
  assignmentToGrades: many(reasoningAssignmentToGrade),
  assignmentToSubjects: many(reasoningAssignmentToSubject),
}));

/**
 * Tracks student attempts at completing reasoning assignments
 * Records submission details and scoring information
 */
export const reasoningAssignmentAttempts = pgTable(
  "reasoning_assignment_attempts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 21 }).references(() => reasoningAssignments.id),
    activityId: varchar("activity_id", { length: 21 }).references(() => activity.id),
    score: doublePrecision("score"),
    accuracy: doublePrecision("accuracy"),
    submittedAt: timestamp("submitted_at", { mode: "date" }),
    userId: varchar("user_id", { length: 21 }).references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const reasoningAssignmentAttemptRelations = relations(reasoningAssignmentAttempts, ({ one, many }) => ({
  assignment: one(reasoningAssignments, {
    fields: [reasoningAssignmentAttempts.assignmentId],
    references: [reasoningAssignments.id],
  }),
  activity: one(activity, {
    fields: [reasoningAssignmentAttempts.activityId],
    references: [activity.id],
  }),
  reasoningPathwayAttempts: many(reasoningPathwayAttempts),
  reasoningAttemptFinalAnswer: many(reasoningAttemptFinalAnswer),
  user: one(users, {
    fields: [reasoningAssignmentAttempts.userId],
    references: [users.id],
  }),
}));

/**
 * Junction table for many-to-many relationship between Reasoning assignments and courses
 * Allows one assignment to be mapped to multiple courses
 */
export const reasoningAssignmentToCourse = pgTable(
  "reasoning_assignment_to_course",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => reasoningAssignments.id),
    courseId: varchar("course_id", { length: 21 }).notNull().references(() => courses.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const reasoningAssignmentToCourseRelations = relations(reasoningAssignmentToCourse, ({ one }) => ({
  assignment: one(reasoningAssignments, {
    fields: [reasoningAssignmentToCourse.assignmentId],
    references: [reasoningAssignments.id],
  }),
  course: one(courses, {
    fields: [reasoningAssignmentToCourse.courseId],
    references: [courses.id],
  }),
}));

/**
 * Junction table for many-to-many relationship between Reasoning assignments and grades
 * Allows one assignment to be mapped to multiple grades
 */
export const reasoningAssignmentToGrade = pgTable(
  "reasoning_assignment_to_grade",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => reasoningAssignments.id),
    grade: varchar("grade").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const reasoningAssignmentToGradeRelations = relations(reasoningAssignmentToGrade, ({ one }) => ({
  assignment: one(reasoningAssignments, {
    fields: [reasoningAssignmentToGrade.assignmentId],
    references: [reasoningAssignments.id],
  }),
}));

/**
 * Junction table for many-to-many relationship between Reasoning assignments and subjects
 * Allows one assignment to be mapped to multiple subjects (direct mapping, in addition to the indirect topic->course->subject)
 */
export const reasoningAssignmentToSubject = pgTable(
  "reasoning_assignment_to_subject",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => reasoningAssignments.id),
    subjectId: varchar("subject_id", { length: 21 }).notNull().references(() => subjects.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const reasoningAssignmentToSubjectRelations = relations(reasoningAssignmentToSubject, ({ one }) => ({
  assignment: one(reasoningAssignments, {
    fields: [reasoningAssignmentToSubject.assignmentId],
    references: [reasoningAssignments.id],
  }),
  subject: one(subjects, {
    fields: [reasoningAssignmentToSubject.subjectId],
    references: [subjects.id],
  }),
}));

