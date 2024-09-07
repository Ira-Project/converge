import {
  pgTableCreator,
  boolean,
  timestamp,
  varchar,
  text,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm";
import { courses } from './subject';
import { questions } from "./questions";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const conceptLists = pgTable(
  "concept_lists",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: text("name"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);
export const conceptListRelations = relations(conceptLists, ({ many }) => ({
  question: many(questions),
  courses: many(courses),
}));


export const concepts = pgTable(
  "concepts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    text: text("text").notNull(),
    calculationRequired: boolean("calculation_required").default(false).notNull(),
    formula: varchar("formula", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const conceptRelations = relations(concepts, ({ many }) => ({
  conceptLists: many(conceptLists),
}));