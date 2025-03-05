import {
  json,
  pgTableCreator,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const actions = pgTable(
  "actions",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    channelId: varchar("channel_id", { length: 21 }).notNull(),
    actionType: varchar("actionType").notNull(),
    payload: json("payload"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    explanationId: text("explanation_id"),
    explanation: text("explanation"),
    working: text("working"),
  }
);