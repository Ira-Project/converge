import { boolean, pgTableCreator, timestamp, varchar, text } from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { users } from "./user";


export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const lessonPlanFiles = pgTable(
  "lesson_plan_files",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: text("name").notNull(),
    skills: text("skills").array().notNull().default([]),
    url: text("url"),
    createdBy: varchar("created_by", { length: 21 }).references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

