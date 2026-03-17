import { pgTable, uuid, text, timestamp, integer, jsonb, index, boolean } from "drizzle-orm/pg-core";

export const issueTemplates = pgTable(
  "issue_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    titleTemplate: text("title_template").notNull(),
    descriptionTemplate: text("description_template"),
    status: text("status").notNull().default("backlog"),
    priority: text("priority").notNull().default("medium"),
    labelNames: jsonb("label_names").notNull().default([]).$type<string[]>(),
    displayOrder: integer("display_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    activeOrderIdx: index("issue_templates_active_order_idx").on(table.isActive, table.displayOrder),
  }),
);