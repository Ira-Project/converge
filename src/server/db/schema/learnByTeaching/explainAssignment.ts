import { boolean, integer, pgTableCreator, timestamp, varchar, text } from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { users } from "../user";
import { relations } from "drizzle-orm";
import { explainQuestionToAssignment } from "./explainQuestions";
import { topics, courses, subjects } from "../subject";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const explainAssignments = pgTable(
  "explain_assignments",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: text("name"),
    description: text("description"),
    topicId: varchar("topic_id", { length: 21 }).notNull().references(() => topics.id),
    order: integer("order"),
    showConcepts: boolean("show_concepts").default(false).notNull(),
    showAnswers: boolean("show_answers").default(true).notNull(),
    generated: boolean("generated").default(false).notNull(),
    createdBy: varchar("created_by", { length: 21 }).references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const explainAssignmentRelations = relations(explainAssignments, ({ one, many }) => ({
  topic: one(topics, {
    fields: [explainAssignments.topicId],
    references: [topics.id],
  }),
  questionToAssignment: many(explainQuestionToAssignment),
  assignmentToCourses: many(explainAssignmentToCourse),
  assignmentToGrades: many(explainAssignmentToGrade),
  assignmentToSubjects: many(explainAssignmentToSubject),
}));

/**
 * Junction table for many-to-many relationship between Learn-by-Teaching (Explain) assignments and courses
 * Allows one assignment to be mapped to multiple courses
 */
export const explainAssignmentToCourse = pgTable(
  "explain_assignment_to_course",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => explainAssignments.id),
    courseId: varchar("course_id", { length: 21 }).notNull().references(() => courses.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const explainAssignmentToCourseRelations = relations(explainAssignmentToCourse, ({ one }) => ({
  assignment: one(explainAssignments, {
    fields: [explainAssignmentToCourse.assignmentId],
    references: [explainAssignments.id],
  }),
  course: one(courses, {
    fields: [explainAssignmentToCourse.courseId],
    references: [courses.id],
  }),
}));

/**
 * Junction table for many-to-many relationship between Learn-by-Teaching (Explain) assignments and grades
 * Allows one assignment to be mapped to multiple grades
 */
export const explainAssignmentToGrade = pgTable(
  "explain_assignment_to_grade",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => explainAssignments.id),
    grade: varchar("grade").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const explainAssignmentToGradeRelations = relations(explainAssignmentToGrade, ({ one }) => ({
  assignment: one(explainAssignments, {
    fields: [explainAssignmentToGrade.assignmentId],
    references: [explainAssignments.id],
  }),
}));

/**
 * Junction table for many-to-many relationship between Learn-by-Teaching (Explain) assignments and subjects
 * Allows one assignment to be mapped to multiple subjects (direct mapping, in addition to the indirect topic->course->subject)
 */
export const explainAssignmentToSubject = pgTable(
  "explain_assignment_to_subject",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => explainAssignments.id),
    subjectId: varchar("subject_id", { length: 21 }).notNull().references(() => subjects.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const explainAssignmentToSubjectRelations = relations(explainAssignmentToSubject, ({ one }) => ({
  assignment: one(explainAssignments, {
    fields: [explainAssignmentToSubject.assignmentId],
    references: [explainAssignments.id],
  }),
  subject: one(subjects, {
    fields: [explainAssignmentToSubject.subjectId],
    references: [subjects.id],
  }),
}));


