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
import { explainAssignments } from "./learnByTeaching/explainAssignment";
import { users } from "./user";
import { reasoningQuestions } from "./reasoning/reasoningQuestions";
import { explainQuestions } from "./learnByTeaching/explainQuestions";
import { activity } from "./activity";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const subjects = pgTable(
  "subjects",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: text("name").notNull(),
    imageUrl: text("image_url"),
    locked: boolean("locked").default(false).notNull(),
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
    locked: boolean("locked").default(false).notNull(),
    subjectId: varchar("subject_id", { length: 21 }).references(() => subjects.id),
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
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
    slug: text("slug").default("").notNull(),
  }
);
export const topicRelations = relations(topics, ({ one, many }) => ({
  course: one(courses, {
    fields: [topics.courseId],
    references: [courses.id],
  }),
  activities: many(activity),
  explainAssignments: many(explainAssignments),
  questions: many(explainQuestions),
  reasoningQuestions: many(reasoningQuestions),
}));
