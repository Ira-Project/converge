import { boolean, integer, pgTableCreator, timestamp, varchar, text } from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { classrooms } from "../classroom";
import { users } from "../user";
import { relations } from "drizzle-orm";
import { explainQuestions, questionToAssignment } from "./questions";
import { conceptLists } from "./concept";
import { topics } from "../subject";


export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const explainAssignments = pgTable(
  "explain_assignments",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: text("name"),
    description: text("description"),
    imageUrl: text("image_url"), // TODO: remove this
    topicId: varchar("topic_id", { length: 21 }).notNull().references(() => topics.id),
    dueDate: timestamp("due_date"),
    maxPoints: integer("max_points"), // TODO: remove this
    timeLimit: integer("time_limit"),
    order: integer("order"),
    classroomId: varchar("classroom_id").references(() => classrooms.id), // TODO: remove this dependency
    isLocked: boolean("is_locked").default(false).notNull(), // TODO: remove this
    isLive: boolean("is_live").default(false).notNull(), // TODO: remove this
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
  classroom: one(classrooms, {
    fields: [explainAssignments.classroomId],
    references: [classrooms.id],
  }),
  conceptLists: one(conceptLists, {
    fields: [explainAssignments.conceptListId],
    references: [conceptLists.id],
  }),
  topic: one(topics, {
    fields: [explainAssignments.topicId],
    references: [topics.id],
  }),
  questions: many(explainQuestions),
  questionToAssignment: many(questionToAssignment),
}));


