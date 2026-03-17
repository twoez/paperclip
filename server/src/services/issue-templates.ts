import { asc, eq } from "drizzle-orm";
import type { Db } from "@paperclipai/db";
import { issueTemplates } from "@paperclipai/db";
import type { IssueTemplate } from "@paperclipai/shared";
import type { CreateIssueTemplate, UpdateIssueTemplate } from "@paperclipai/shared";

export function issueTemplateService(db: Db) {
  return {
    list: async (): Promise<IssueTemplate[]> => {
      return db
        .select()
        .from(issueTemplates)
        .where(eq(issueTemplates.isActive, true))
        .orderBy(asc(issueTemplates.displayOrder));
    },

    listAll: async (): Promise<IssueTemplate[]> => {
      return db
        .select()
        .from(issueTemplates)
        .orderBy(asc(issueTemplates.displayOrder));
    },

    getById: async (id: string): Promise<IssueTemplate | null> => {
      const rows = await db
        .select()
        .from(issueTemplates)
        .where(eq(issueTemplates.id, id));
      return rows[0] ?? null;
    },

    create: async (data: CreateIssueTemplate): Promise<IssueTemplate> => {
      const [row] = await db.insert(issueTemplates).values({
        name: data.name,
        description: data.description ?? null,
        titleTemplate: data.titleTemplate,
        descriptionTemplate: data.descriptionTemplate ?? null,
        status: data.status,
        priority: data.priority,
        labelNames: data.labelNames,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      }).returning();
      return row;
    },

    update: async (id: string, data: Omit<UpdateIssueTemplate, "id">): Promise<IssueTemplate | null> => {
      const rows = await db
        .update(issueTemplates)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(issueTemplates.id, id))
        .returning();
      return rows[0] ?? null;
    },

    delete: async (id: string): Promise<IssueTemplate | null> => {
      const rows = await db
        .delete(issueTemplates)
        .where(eq(issueTemplates.id, id))
        .returning();
      return rows[0] ?? null;
    },
  };
}