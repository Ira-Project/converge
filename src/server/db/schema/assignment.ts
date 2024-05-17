import { boolean, integer, pgTableCreator, timestamp, varchar } from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { classrooms } from "./classroom";
import { users } from "./user";
import { relations } from "drizzle-orm";
import { assignmentTemplates } from "./assignmentTemplate";


export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const assignments = pgTable(
  "assignments",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    dueDate: timestamp("due_date").notNull(),
    maxPoints: integer("max_points"),
    timeLimit: integer("time_limit"),
    classroomId: varchar("classroom_id").references(() => classrooms.id),
    assignmentTemplateId: varchar("assignment_template_id", { length: 21 }).references(() => assignmentTemplates.id).notNull(),
    isLive: boolean("is_live").default(false).notNull(),
    isSample: boolean("is_sample").default(false).notNull(),
    showConcepts: boolean("show_concepts").default(false).notNull(),
    createdBy: varchar("created_by", { length: 21 }).references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const assignmentRelations = relations(assignments, ({ one }) => ({
  classroom: one(classrooms, {
    fields: [assignments.classroomId],
    references: [classrooms.id],
  }),
  assignmentTemplate: one(assignmentTemplates, {
    fields: [assignments.assignmentTemplateId],
    references: [assignmentTemplates.id],
  }),
}));

