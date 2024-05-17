import { boolean, pgTableCreator, timestamp, varchar } from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { users } from "./user";
import { relations } from "drizzle-orm";
import { assignments } from "./assignment";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const assignmentTemplates = pgTable(
  "assignmentTemplates",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    imageUrl: varchar("image_url", { length: 255 }).notNull(),
    createdBy: varchar("created_by", { length: 21 }).references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const assignmentTemplateRelations = relations(assignmentTemplates, ({ many }) => ({
  assignments: many(assignments),
}));