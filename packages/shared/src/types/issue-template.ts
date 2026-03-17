export interface IssueTemplate {
  id: string;
  name: string;
  description: string | null;
  titleTemplate: string;
  descriptionTemplate: string | null;
  status: string;
  priority: string;
  labelNames: string[];
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}