import { z } from "zod";
import { ISSUE_PRIORITIES, ISSUE_STATUSES } from "../constants.js";

export const createIssueTemplateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).nullable().optional(),
  titleTemplate: z.string().trim().min(1).max(500),
  descriptionTemplate: z.string().trim().max(50000).nullable().optional(),
  status: z.enum(ISSUE_STATUSES).optional().default("backlog"),
  priority: z.enum(ISSUE_PRIORITIES).optional().default("medium"),
  labelNames: z.array(z.string().trim().max(100)).optional().default([]),
  displayOrder: z.number().int().nonnegative().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export type CreateIssueTemplate = z.infer<typeof createIssueTemplateSchema>;

export const updateIssueTemplateSchema = createIssueTemplateSchema.partial().extend({
  id: z.string().uuid(),
});

export type UpdateIssueTemplate = z.infer<typeof updateIssueTemplateSchema>;