import {
  pgTableCreator,
  boolean,
  timestamp,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm";
import { classrooms } from "./classroom";
import { conceptLists } from "./concept";
import { assignments } from "./assignment";
import { users } from "./user";
import { questions } from "./questions";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const subjects = pgTable(
  "subjects",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: text("name").notNull(),
    imageUrl: text("image_url"),
    demoClassroomId: varchar("demo_classroom_id", { length: 21 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export type Subjects = typeof subjects.$inferSelect;

export const subjectRelations = relations(subjects, ({ many }) => ({
  courses: many(courses),
  teachers: many(users),
}));

export const courses = pgTable(
  "courses",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: text("name").notNull(),
    subjectId: varchar("subject_id", { length: 21 }).references(() => subjects.id),
    conceptListId: varchar("concept_list_id").references(() => conceptLists.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export type Course = typeof subjects.$inferSelect;

export const courseRelations = relations(courses, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [courses.subjectId],
    references: [subjects.id],
  }),
  conceptLists: one(courses, {
    fields: [courses.conceptListId],
    references: [courses.id],
  }),
  topics: many(topics),
  classrooms: many(classrooms),
  teachers: many(users),
}));

export const topics = pgTable(
  "topics",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: text("name").notNull(),
    imageUrl: text("image_url"),
    courseId: varchar("course_id", { length: 21 }).references(() => courses.id),
    conceptListId: varchar("concept_list_id").references(() => conceptLists.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const topicRelations = relations(topics, ({ one, many }) => ({
  course: one(courses, {
    fields: [topics.courseId],
    references: [courses.id],
  }),
  conceptLists: one(topics, {
    fields: [topics.conceptListId],
    references: [topics.id],
  }),
  assignments: many(assignments),
  questions: many(questions),
}));
