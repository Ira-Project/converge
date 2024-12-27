import {
  pgTableCreator,
  boolean,
  index,
  timestamp,
  varchar,
  pgEnum,
  primaryKey,
  text,
  integer,
} from "drizzle-orm/pg-core";
import { Roles, DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm";
import { courses } from "./subject";
import { users } from "./user";
import { explainAssignments } from "./learnByTeaching/explainAssignment";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const roleEnum = pgEnum('role', [Roles.Student, Roles.Teacher]);

export const classrooms = pgTable(
  "classrooms",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    courseId: varchar("course_id", { length: 21 }).references(() => courses.id),
    grade: integer("grade"),
    code: varchar("code", { length: 8 }).unique().notNull(),
    createdBy: varchar("created_by", { length: 21 }).references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
    isDemo: boolean("is_demo").default(true).notNull(),
  }
);
export const classroomRelations = relations(classrooms, ({ many, one }) => ({
  classroomMembers: many(usersToClassrooms),
  course: one(courses, {
    fields: [classrooms.courseId],
    references: [courses.id],
  }),
  explainAssignments: many(explainAssignments),
}));

export const usersToClassrooms = pgTable(
  "user_class_relations",
  {
    userId: varchar("user_id", { length: 21 })
      .notNull()
      .references(() => users.id),
    classroomId: varchar("classroom_id", { length: 21 })
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

