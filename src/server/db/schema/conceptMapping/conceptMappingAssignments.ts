import { boolean, integer, pgTableCreator, timestamp, varchar, text, doublePrecision } from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { users } from "../user";
import { relations } from "drizzle-orm";
import { topics, courses, subjects } from "../subject";
import { conceptMappingNodes, conceptMappingEdges } from "./conceptMappingQuestions";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const conceptMappingAssignments = pgTable(
  "cm_assignments",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: text("name"),
    description: text("description"),
    topText: text("top_text"),
    conceptMapWidthToHeightRatio: doublePrecision("concept_map_width_to_height_ratio").notNull().default(2),
    percentageEdgesToHide: doublePrecision("percentage_edges_to_hide").notNull().default(0.5),
    percentageNodesToHide: doublePrecision("percentage_nodes_to_hide").notNull().default(0.5),
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

export const conceptMappingAssignmentRelations = relations(conceptMappingAssignments, ({ one, many }) => ({
  topic: one(topics, {
    fields: [conceptMappingAssignments.topicId],
    references: [topics.id],
  }),
  conceptNodes: many(conceptMappingNodes),
  conceptEdges: many(conceptMappingEdges),
  assignmentToCourses: many(conceptMappingAssignmentToCourse),
  assignmentToGrades: many(conceptMappingAssignmentToGrade),
  assignmentToSubjects: many(conceptMappingAssignmentToSubject),
}));

/**
 * Junction table for many-to-many relationship between Concept Mapping assignments and courses
 * Allows one assignment to be mapped to multiple courses
 */
export const conceptMappingAssignmentToCourse = pgTable(
  "concept_mapping_assignment_to_course",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => conceptMappingAssignments.id),
    courseId: varchar("course_id", { length: 21 }).notNull().references(() => courses.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const conceptMappingAssignmentToCourseRelations = relations(conceptMappingAssignmentToCourse, ({ one }) => ({
  assignment: one(conceptMappingAssignments, {
    fields: [conceptMappingAssignmentToCourse.assignmentId],
    references: [conceptMappingAssignments.id],
  }),
  course: one(courses, {
    fields: [conceptMappingAssignmentToCourse.courseId],
    references: [courses.id],
  }),
}));

/**
 * Junction table for many-to-many relationship between Concept Mapping assignments and grades
 * Allows one assignment to be mapped to multiple grades
 */
export const conceptMappingAssignmentToGrade = pgTable(
  "concept_mapping_assignment_to_grade",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => conceptMappingAssignments.id),
    grade: varchar("grade").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const conceptMappingAssignmentToGradeRelations = relations(conceptMappingAssignmentToGrade, ({ one }) => ({
  assignment: one(conceptMappingAssignments, {
    fields: [conceptMappingAssignmentToGrade.assignmentId],
    references: [conceptMappingAssignments.id],
  }),
}));

/**
 * Junction table for many-to-many relationship between Concept Mapping assignments and subjects
 * Allows one assignment to be mapped to multiple subjects (direct mapping, in addition to the indirect topic->course->subject)
 */
export const conceptMappingAssignmentToSubject = pgTable(
  "concept_mapping_assignment_to_subject",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 21 }).notNull().references(() => conceptMappingAssignments.id),
    subjectId: varchar("subject_id", { length: 21 }).notNull().references(() => subjects.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const conceptMappingAssignmentToSubjectRelations = relations(conceptMappingAssignmentToSubject, ({ one }) => ({
  assignment: one(conceptMappingAssignments, {
    fields: [conceptMappingAssignmentToSubject.assignmentId],
    references: [conceptMappingAssignments.id],
  }),
  subject: one(subjects, {
    fields: [conceptMappingAssignmentToSubject.subjectId],
    references: [subjects.id],
  }),
}));


