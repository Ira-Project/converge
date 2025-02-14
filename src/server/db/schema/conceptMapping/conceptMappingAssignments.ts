import { boolean, integer, pgTableCreator, timestamp, varchar, text, decimal } from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { users } from "../user";
import { relations } from "drizzle-orm";
import { topics } from "../subject";
import { conceptMappingNodes, conceptMappingEdges } from "./conceptMappingQuestions";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const conceptMappingAssignments = pgTable(
  "cm_assignments",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    name: text("name"),
    description: text("description"),
    topText: text("top_text"),
    conceptMapWidthToHeightRatio: decimal("concept_map_width_to_height_ratio", { precision: 10, scale: 2 }).notNull().default("2"),
    percentageEdgesToHide: decimal("percentage_edges_to_hide", { precision: 10, scale: 2 }).notNull().default("0.5"),
    percentageNodesToHide: decimal("percentage_nodes_to_hide", { precision: 10, scale: 2 }).notNull().default("0.5"),
    topicId: varchar("topic_id", { length: 21 }).notNull().references(() => topics.id),
    order: integer("order"),
    createdBy: varchar("created_by", { length: 21 }).references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { mode: "date" }),
  }
);

export const conceptMappingAssignmentRelations = relations(conceptMappingAssignments, ({ one, many }) => ({
  topic: one(topics, {
    fields: [conceptMappingAssignments.topicId],
    references: [topics.id],
  }),
  conceptNodes: many(conceptMappingNodes),
  conceptEdges: many(conceptMappingEdges),
}));


