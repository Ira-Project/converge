import { boolean, integer, pgTableCreator, timestamp, varchar, text } from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { users } from "../user";
import { relations } from "drizzle-orm";
import { explainQuestionToAssignment } from "./explainQuestions";
import { conceptLists } from "./concept";
import { topics } from "../subject";


export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const explainAssignments = pgTable(
  "explain_assignments",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: text("name"),
    description: text("description"),
    topicId: varchar("topic_id", { length: 21 }).notNull().references(() => topics.id),
    order: integer("order"),
    showConcepts: boolean("show_concepts").default(false).notNull(),
    showAnswers: boolean("show_answers").default(true).notNull(),
    createdBy: varchar("created_by", { length: 21 }).references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
    conceptListId: varchar("concept_list_id").references(() => conceptLists.id),
  }
);

export const explainAssignmentRelations = relations(explainAssignments, ({ one, many }) => ({
  conceptLists: one(conceptLists, {
    fields: [explainAssignments.conceptListId],
    references: [conceptLists.id],
  }),
  topic: one(topics, {
    fields: [explainAssignments.topicId],
    references: [topics.id],
  }),
  questionToAssignment: many(explainQuestionToAssignment),
}));


