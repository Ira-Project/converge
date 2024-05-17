import {
  pgTableCreator,
  serial,
  boolean,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm";
import { classrooms } from "./classroom";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const subjects = pgTable(
  "subjects",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
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