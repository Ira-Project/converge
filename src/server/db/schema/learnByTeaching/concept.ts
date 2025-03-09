import {
  pgTableCreator,
  boolean,
  timestamp,
  varchar,
  text,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm";
import { explainQuestionConcepts } from "./explainQuestions";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const concepts = pgTable(
  "concepts",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    text: text("text").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
)
export const conceptRelations = relations(concepts, ({ many }) => ({
  explainQuestionConcepts: many(explainQuestionConcepts),
}));