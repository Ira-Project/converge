import { boolean, integer, pgTableCreator, timestamp, varchar, text, doublePrecision } from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { users } from "../user";
import { relations } from "drizzle-orm";
import { topics, courses, subjects } from "../subject";
import { stepSolveQuestionToAssignment } from "./stepSolveQuestions";
import { activity } from "../activity";
import { stepSolveQuestionAttempts } from "./stepSolveQuestionAttempts";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

/**
 * Represents a step solve assignment in the system
 * Contains details about the assignment configuration, classroom context, and metadata
 */
export const stepSolveAssignmentTemplates = pgTable(
  "step_solve_assignment_templates",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: text("name"),
    description: text("description"),
    assignmentIds: varchar("assignment_ids", { length: 21 }).array().notNull(),
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
export const stepSolveAssignmentTemplateRelations = relations(stepSolveAssignmentTemplates, ({ one, many }) => ({
  topic: one(topics, {
    fields: [stepSolveAssignmentTemplates.topicId],
    references: [topics.id],
  }),
  assignments: many(stepSolveAssignments),
  templateToCourses: many(stepSolveAssignmentTemplateToCourse),
  templateToGrades: many(stepSolveAssignmentTemplateToGrade),
  templateToSubjects: many(stepSolveAssignmentTemplateToSubject),
}));

/**
 * Junction table for many-to-many relationship between Step Solve assignment templates and courses
 * Allows one assignment template to be mapped to multiple courses
 */
export const stepSolveAssignmentTemplateToCourse = pgTable(
  "step_solve_assignment_template_to_course",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    templateId: varchar("template_id", { length: 21 }).notNull().references(() => stepSolveAssignmentTemplates.id),
    courseId: varchar("course_id", { length: 21 }).notNull().references(() => courses.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const stepSolveAssignmentTemplateToCourseRelations = relations(stepSolveAssignmentTemplateToCourse, ({ one }) => ({
  template: one(stepSolveAssignmentTemplates, {
    fields: [stepSolveAssignmentTemplateToCourse.templateId],
    references: [stepSolveAssignmentTemplates.id],
  }),
  course: one(courses, {
    fields: [stepSolveAssignmentTemplateToCourse.courseId],
    references: [courses.id],
  }),
}));


/**
 * Junction table for many-to-many relationship between Step Solve assignment templates and grades
 * Allows one assignment template to be mapped to multiple grades
 */
export const stepSolveAssignmentTemplateToGrade = pgTable(
  "step_solve_assignment_template_to_grade",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    templateId: varchar("template_id", { length: 21 }).notNull().references(() => stepSolveAssignmentTemplates.id),
    grade: varchar("grade").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const stepSolveAssignmentTemplateToGradeRelations = relations(stepSolveAssignmentTemplateToGrade, ({ one }) => ({
  template: one(stepSolveAssignmentTemplates, {
    fields: [stepSolveAssignmentTemplateToGrade.templateId],
    references: [stepSolveAssignmentTemplates.id],
  }),
}));

/**
 * Junction table for many-to-many relationship between Step Solve assignment templates and subjects
 * Allows one assignment template to be mapped to multiple subjects
 */
export const stepSolveAssignmentTemplateToSubject = pgTable(
  "step_solve_assignment_template_to_subject",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    templateId: varchar("template_id", { length: 21 }).notNull().references(() => stepSolveAssignmentTemplates.id),
    subjectId: varchar("subject_id", { length: 21 }).notNull().references(() => subjects.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const stepSolveAssignmentTemplateToSubjectRelations = relations(stepSolveAssignmentTemplateToSubject, ({ one }) => ({
  template: one(stepSolveAssignmentTemplates, {
    fields: [stepSolveAssignmentTemplateToSubject.templateId],
    references: [stepSolveAssignmentTemplates.id],
  }),
  subject: one(subjects, {
    fields: [stepSolveAssignmentTemplateToSubject.subjectId],
    references: [subjects.id],
  }),
}));



/**
 * Represents a step solve assignment in the system
 * Contains details about the assignment configuration, classroom context, and metadata
 */
export const stepSolveAssignments = pgTable(
  "step_solve_assignments",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: text("name"),
    description: text("description"),
    templateId: varchar("template_id", { length: 21 }).references(() => stepSolveAssignmentTemplates.id),
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
export const stepSolveAssignmentRelations = relations(stepSolveAssignments, ({ one, many }) => ({
  topic: one(topics, {
    fields: [stepSolveAssignments.topicId],
    references: [topics.id],
  }),
  template: one(stepSolveAssignmentTemplates, {
    fields: [stepSolveAssignments.templateId],
    references: [stepSolveAssignmentTemplates.id],
  }),
  stepSolveQuestions: many(stepSolveQuestionToAssignment),
}));

/**
 * Tracks student attempts at completing step solve assignments
 * Records submission details and scoring information
 */
export const stepSolveAssignmentAttempts = pgTable(
  "step_solve_assignment_attempts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 21 }).references(() => stepSolveAssignments.id),
    activityId: varchar("activity_id", { length: 21 }).references(() => activity.id),
    score: doublePrecision("score"),
    isRevision: boolean("is_revision").default(false).notNull(),
    // The reasoning and evaluation scores here are rates of success and only a percentage
    reasoningScore: doublePrecision("reasoning_score"),
    evaluationScore: doublePrecision("evaluation_score"),
    stepsCompleted: integer("steps_completed"),
    stepsTotal: integer("steps_total"),
    completionRate: doublePrecision("completion_rate"),
    submittedAt: timestamp("submitted_at", { mode: "date" }),
    userId: varchar("user_id", { length: 21 }).references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const stepSolveAssignmentAttemptRelations = relations(stepSolveAssignmentAttempts, ({ one, many }) => ({
  assignment: one(stepSolveAssignments, {
    fields: [stepSolveAssignmentAttempts.assignmentId],
    references: [stepSolveAssignments.id],
  }),
  activity: one(activity, {
    fields: [stepSolveAssignmentAttempts.activityId],
    references: [activity.id],
  }),
  user: one(users, {
    fields: [stepSolveAssignmentAttempts.userId],
    references: [users.id],
  }),
  qas: many(stepSolveQuestionAttempts),
}));

