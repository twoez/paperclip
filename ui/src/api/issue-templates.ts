import type { IssueTemplate } from "@paperclipai/shared";
import { api } from "./client";

export const issueTemplatesApi = {
  list: () => api.get<IssueTemplate[]>("/issue-templates"),
  listAll: () => api.get<IssueTemplate[]>("/issue-templates/all"),
  get: (id: string) => api.get<IssueTemplate>(`/issue-templates/${id}`),
  create: (data: Record<string, unknown>) => api.post<IssueTemplate>("/issue-templates", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch<IssueTemplate>(`/issue-templates/${id}`, data),
  delete: (id: string) => api.delete<IssueTemplate>(`/issue-templates/${id}`),
};