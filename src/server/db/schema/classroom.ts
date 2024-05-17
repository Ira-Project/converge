import {
  pgTableCreator,
  boolean,
  index,
  timestamp,
  varchar,
  integer,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { Roles, DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm";
import { subjects } from "./subject";
import { users } from "./user";
import { assignments } from "./assignment";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const roleEnum = pgEnum('role', [Roles.Student, Roles.Teacher]);

export const classrooms = pgTable(
  "classrooms",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }),
    subjectId: integer("subject_id").references(() => subjects.id),
    code: varchar("code", { length: 8 }).unique().notNull(),
    createdBy: varchar("created_by", { length: 21 }).references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const classroomRelations = relations(classrooms, ({ many, one }) => ({
  classroomMembers: many(usersToClassrooms),
  subject: one(subjects, {
    fields: [classrooms.subjectId],
    references: [subjects.id],
  }),
  assignments: many(assignments),
}));

export const usersToClassrooms = pgTable(
  "user_class_relations",
  {
    userId: varchar("user_id", { length: 21 })
      .notNull()
      .references(() => users.id),
    classroomId: varchar("group_id", { length: 21 })
      .notNull()
      .references(() => classrooms.id),
    role: roleEnum("role").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.classroomId] }),
    classIdx: index("class_member_class_idx").on(t.classroomId),
    userIdx: index("class_member_user_idx").on(t.userId),
  }),
)

export const usersToClassesRelations = relations(usersToClassrooms, ({ one }) => ({
  user: one(users, {
    fields: [usersToClassrooms.userId],
    references: [users.id],
  }),
  classroom: one(classrooms, {
    fields: [usersToClassrooms.classroomId],
    references: [classrooms.id],
  }),
}));

