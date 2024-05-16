import {
  pgTableCreator,
  serial,
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

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const roleEnum = pgEnum('role', [Roles.Student, Roles.Teacher]);

export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    role: varchar("role", { length: 255 }).default(Roles.Student).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    hashedPassword: varchar("hashed_password", { length: 255 }),
    avatar: varchar("avatar", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
  },
  (t) => ({
    emailIdx: index("user_email_idx").on(t.email),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  classMembers: many(usersToClassrooms),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const sessions = pgTable(
  "sessions",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 21 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => ({
    userIdx: index("session_user_idx").on(t.userId),
  }),
);

export const emailVerificationCodes = pgTable(
  "email_verification_codes",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 21 }).unique().notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    code: varchar("code", { length: 8 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => ({
    userIdx: index("verification_code_user_idx").on(t.userId),
    emailIdx: index("verification_code_email_idx").on(t.email),
  }),
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    userId: varchar("user_id", { length: 21 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => ({
    userIdx: index("password_token_user_idx").on(t.userId),
  }),
);

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
  })
}));

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

