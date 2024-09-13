import {
  pgTableCreator,
  serial,
  boolean,
  index,
  timestamp,
  varchar,
  pgEnum,
} from "drizzle-orm/pg-core";
import { Roles, DATABASE_PREFIX as prefix } from "@/lib/constants";
import { relations } from "drizzle-orm";
import { usersToClassrooms } from "./classroom";
import { courses, subjects } from "./subject";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const roleEnum = pgEnum('role', [Roles.Student, Roles.Teacher]);

export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    role: roleEnum('role').default(Roles.Student).notNull(),
    name: varchar("name", { length: 255 }),
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
  teacherCourses: many(teacherCourses),
  teacherSubjects: many(teacherSubjects),
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

export const preloadedUsers = pgTable(
  "preloaded_users",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    notOnboarded: boolean("not_onboarded").default(true).notNull(),
  },
  (t) => ({
    emailIdx: index("preloaded_user_email_idx").on(t.email),
  }),
);

export const teacherCourses = pgTable(
  "teacher_courses",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    userId: varchar("user_id", { length: 21 }).notNull().references(() => users.id),
    courseId: varchar("course_id", { length: 21 }).notNull().references(() => courses.id),
  },
);
export const teacherCoursesRelations = relations(teacherCourses, ({ one }) => ({
  user: one(users, {
    fields: [teacherCourses.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [teacherCourses.courseId],
    references: [courses.id],
  }),
}));

export const teacherSubjects = pgTable(
  "teacher_subjects",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    userId: varchar("user_id", { length: 21 }).notNull().references(() => users.id),
    subjectId: varchar("subject_id", { length: 21 }).notNull().references(() => subjects.id),
  },
);
export const teacherSubjectsRelations = relations(teacherSubjects, ({ one }) => ({
  user: one(users, {
    fields: [teacherSubjects.userId],
    references: [users.id],
  }),
  subject: one(subjects, {
    fields: [teacherSubjects.subjectId],
    references: [subjects.id],
  }),
}));

