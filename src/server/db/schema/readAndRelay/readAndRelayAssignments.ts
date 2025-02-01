import { boolean, integer, pgTableCreator, timestamp, varchar, text } from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { users } from "../user";
import { relations } from "drizzle-orm";
import { topics } from "../subject";
import { readAndRelayQuestionToAssignment } from "./readAndRelayQuestions";


export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const readAndRelayAssignments = pgTable(
  "rr_assignments",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: text("name"),
    description: text("description"),
    readingPassage: text("reading_passage"), // latex for the text to be rendered
    topicId: varchar("topic_id", { length: 21 }).notNull().references(() => topics.id),
    order: integer("order"),
    showAnswers: boolean("show_answers").default(true).notNull(),
    createdBy: varchar("created_by", { length: 21 }).references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const readAndRelayAssignmentRelations = relations(readAndRelayAssignments, ({ one, many }) => ({
  topic: one(topics, {
    fields: [readAndRelayAssignments.topicId],
    references: [topics.id],
  }),
  questionsToAssignment: many(readAndRelayQuestionToAssignment),
}));


