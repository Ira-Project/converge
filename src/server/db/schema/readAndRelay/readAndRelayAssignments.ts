import { boolean, integer, pgTableCreator, timestamp, varchar, text, doublePrecision } from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { users } from "../user";
import { relations } from "drizzle-orm";
import { topics, courses, subjects } from "../subject";
import { readAndRelayQuestionToAssignment } from "./readAndRelayQuestions";


export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const readAndRelayAssignments = pgTable(
  "rr_assignments",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: text("name"),
    description: text("description"),
    readingPassage: text("reading_passage"), // latex for the text to be rendered
    maxNumberOfHighlights: integer("max_number_of_highlights").notNull().default(5),
    maxNumberOfFormulas: integer("max_number_of_formulas").notNull().default(3),
    maxHighlightLength: integer("max_highlight_length").notNull().default(200),
    maxFormulaLength: integer("max_formula_length").notNull().default(200),
    topicId: varchar("topic_id", { length: 21 }).notNull().references(() => topics.id),
    order: integer("order"),
    showAnswers: boolean("show_answers").default(true).notNull(),
    generated: boolean("generated").default(false).notNull(),
    createdBy: varchar("created_by", { length: 21 }).references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const readAndRelayAssignmentRelations = relations(readAndRelayAssignments, ({ one, many }) => ({
  topic: one(topics, {
    fields: [readAndRelayAssignments.topicId],
    references: [topics.id],
  }),
  questionsToAssignment: many(readAndRelayQuestionToAssignment),
  assignmentToCourses: many(readAndRelayAssignmentToCourse),
  assignmentToGrades: many(readAndRelayAssignmentToGrade),
  assignmentToSubjects: many(readAndRelayAssignmentToSubject),
}));

/**
 * Junction table for many-to-many relationship between Read and Relay assignments and courses
 * Allows one assignment to be mapped to multiple courses
 */
export const readAndRelayAssignmentToCourse = pgTable(
  "read_and_relay_assignment_to_course",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => readAndRelayAssignments.id),
    courseId: varchar("course_id", { length: 21 }).notNull().references(() => courses.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const readAndRelayAssignmentToCourseRelations = relations(readAndRelayAssignmentToCourse, ({ one }) => ({
  assignment: one(readAndRelayAssignments, {
    fields: [readAndRelayAssignmentToCourse.assignmentId],
    references: [readAndRelayAssignments.id],
  }),
  course: one(courses, {
    fields: [readAndRelayAssignmentToCourse.courseId],
    references: [courses.id],
  }),
}));

/**
 * Junction table for many-to-many relationship between Read and Relay assignments and grades
 * Allows one assignment to be mapped to multiple grades
 */
export const readAndRelayAssignmentToGrade = pgTable(
  "read_and_relay_assignment_to_grade",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => readAndRelayAssignments.id),
    grade: varchar("grade").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const readAndRelayAssignmentToGradeRelations = relations(readAndRelayAssignmentToGrade, ({ one }) => ({
  assignment: one(readAndRelayAssignments, {
    fields: [readAndRelayAssignmentToGrade.assignmentId],
    references: [readAndRelayAssignments.id],
  }),
}));

/**
 * Junction table for many-to-many relationship between Read and Relay assignments and subjects
 * Allows one assignment to be mapped to multiple subjects (direct mapping, in addition to the indirect topic->course->subject)
 */
export const readAndRelayAssignmentToSubject = pgTable(
  "read_and_relay_assignment_to_subject",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => readAndRelayAssignments.id),
    subjectId: varchar("subject_id", { length: 21 }).notNull().references(() => subjects.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const readAndRelayAssignmentToSubjectRelations = relations(readAndRelayAssignmentToSubject, ({ one }) => ({
  assignment: one(readAndRelayAssignments, {
    fields: [readAndRelayAssignmentToSubject.assignmentId],
    references: [readAndRelayAssignments.id],
  }),
  subject: one(subjects, {
    fields: [readAndRelayAssignmentToSubject.subjectId],
    references: [subjects.id],
  }),
}));


