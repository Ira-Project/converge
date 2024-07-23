import {
  pgTableCreator,
  serial,
  boolean,
  timestamp,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm";
import { classrooms } from "./classroom";
import { conceptGraphs } from "./concept";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const subjects = pgTable(
  "subjects",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export type Subjects = typeof subjects.$inferSelect;

export const subjectRelations = relations(subjects, ({ many }) => ({
  classrooms: many(classrooms),
}));

export const courses = pgTable(
  "courses",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    conceptGraphId: varchar("concept_graph_id").references(() => conceptGraphs.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export type Course = typeof subjects.$inferSelect;

export const courseRelations = relations(courses, ({ one, many }) => ({
  conceptGraphs: one(conceptGraphs, {
    fields: [courses.conceptGraphId],
    references: [conceptGraphs.id],
  }),
  classrooms: many(classrooms),
}));