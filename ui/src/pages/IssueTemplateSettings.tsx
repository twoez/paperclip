import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { IssueTemplate } from "@paperclipai/shared";
import { ISSUE_PRIORITIES, ISSUE_STATUSES } from "@paperclipai/shared";
import { useCompany } from "@/context/CompanyContext";
import { useBreadcrumbs } from "@/context/BreadcrumbContext";
import { issueTemplatesApi } from "@/api/issue-templates";
import { queryKeys } from "@/lib/queryKeys";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Plus, Pencil, Trash, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateFormData {
  name: string;
  description: string;
  titleTemplate: string;
  descriptionTemplate: string;
  status: string;
  priority: string;
  labelNames: string[];
  displayOrder: number;
  isActive: boolean;
}

const defaultFormData: TemplateFormData = {
  name: "",
  description: "",
  titleTemplate: "",
  descriptionTemplate: "",
  status: "backlog",
  priority: "medium",
  labelNames: [],
  displayOrder: 0,
  isActive: true,
};

export function IssueTemplateSettings() {
  const { selectedCompany } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const queryClient = useQueryClient();
  const { pushToast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<IssueTemplate | null>(null);
  const [deleteTemplate, setDeleteTemplate] = useState<IssueTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>(defaultFormData);
  const [labelInput, setLabelInput] = useState("");

  useEffect(() => {
    setBreadcrumbs([
      { label: selectedCompany?.name ?? "Company", href: "/dashboard" },
      { label: "Settings", href: "/instance/settings/heartbeats" },
      { label: "Issue Templates" },
    ]);
  }, [selectedCompany?.name, setBreadcrumbs]);

  const { data: templates, isLoading, error } = useQuery({
    queryKey: queryKeys.issueTemplates.allAdmin,
    queryFn: () => issueTemplatesApi.listAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => issueTemplatesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issueTemplates.allAdmin });
      setIsCreateOpen(false);
      setFormData(defaultFormData);
      pushToast({ title: "Template created successfully", tone: "success" });
    },
    onError: (err: Error) => {
      pushToast({ title: "Failed to create template", body: err.message, tone: "error" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (params: { id: string; data: Record<string, unknown> }) =>
      issueTemplatesApi.update(params.id, params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issueTemplates.allAdmin });
      setEditingTemplate(null);
      setFormData(defaultFormData);
      pushToast({ title: "Template updated successfully", tone: "success" });
    },
    onError: (err: Error) => {
      pushToast({ title: "Failed to update template", body: err.message, tone: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => issueTemplatesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.issueTemplates.allAdmin });
      setDeleteTemplate(null);
      pushToast({ title: "Template deleted successfully", tone: "success" });
    },
    onError: (err: Error) => {
      pushToast({ title: "Failed to delete template", body: err.message, tone: "error" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: formData as unknown as Record<string, unknown> });
    } else {
      createMutation.mutate(formData as unknown as Record<string, unknown>);
    }
  };

  const handleToggleActive = (template: IssueTemplate) => {
    updateMutation.mutate({
      id: template.id,
      data: { isActive: !template.isActive },
    });
  };

  const handleAddLabel = () => {
    const trimmed = labelInput.trim();
    if (trimmed && !formData.labelNames.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        labelNames: [...prev.labelNames, trimmed],
      }));
    }
    setLabelInput("");
  };

  const handleRemoveLabel = (label: string) => {
    setFormData((prev) => ({
      ...prev,
      labelNames: prev.labelNames.filter((l) => l !== label),
    }));
  };

  const openEditDialog = (template: IssueTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description ?? "",
      titleTemplate: template.titleTemplate,
      descriptionTemplate: template.descriptionTemplate ?? "",
      status: template.status,
      priority: template.priority,
      labelNames: template.labelNames ?? [],
      displayOrder: template.displayOrder,
      isActive: template.isActive,
    });
  };

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading templates...</div>;
  }

  if (error) {
    return <div className="p-4 text-sm text-destructive">Failed to load templates.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Issue Templates</h1>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Create predefined templates for issues. Templates are available to all companies and can pre-fill title, description, status, priority, and labels.
      </p>

      {templates && templates.length === 0 ? (
        <Card className="bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FileText className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm font-medium">No templates yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create a template to standardize issue creation across your organization.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {templates?.map((template) => (
            <Card
              key={template.id}
              className={cn(
                "transition-opacity",
                !template.isActive && "opacity-60"
              )}
            >
              <CardContent className="flex items-center gap-4 px-4 py-3">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{template.name}</span>
                    {template.isActive ? (
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">Order: {template.displayOrder}</span>
                  </div>
                  {template.description && (
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {template.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {template.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.priority}
                    </Badge>
                    {template.labelNames.map((label: string) => (
                      <Badge key={label} variant="outline" className="text-xs">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(template)}
                    disabled={updateMutation.isPending}
                  >
                    {template.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(template)}
                    disabled={updateMutation.isPending}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTemplate(template)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateOpen || editingTemplate !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingTemplate(null);
            setFormData(defaultFormData);
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate
                ? "Update this issue template."
                : "Create a new issue template for pre-filling issue fields."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Bug Report"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Template for reporting bugs"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="titleTemplate">Title Template</Label>
                <Input
                  id="titleTemplate"
                  value={formData.titleTemplate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, titleTemplate: e.target.value }))}
                  placeholder="[Bug] "
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descriptionTemplate">Description Template (optional)</Label>
                <Textarea
                  id="descriptionTemplate"
                  value={formData.descriptionTemplate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, descriptionTemplate: e.target.value }))}
                  placeholder="## Description&#10;&#10;## Steps to Reproduce&#10;&#10;## Expected Behavior"
                  rows={5}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ISSUE_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ISSUE_PRIORITIES.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="labels">Labels (by name)</Label>
                <div className="flex gap-2">
                  <Input
                    id="labels"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    placeholder="bug"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddLabel();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={handleAddLabel}>
                    Add
                  </Button>
                </div>
                {formData.labelNames.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.labelNames.map((label) => (
                      <Badge
                        key={label}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveLabel(label)}
                      >
                        {label}
                        <span className="ml-1 text-xs">&times;</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        displayOrder: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    min={0}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isActive: checked === true }))
                    }
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingTemplate(null);
                  setFormData(defaultFormData);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingTemplate
                    ? "Update"
                    : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteTemplate !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTemplate(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTemplate?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTemplate(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deleteTemplate) {
                  deleteMutation.mutate(deleteTemplate.id);
                }
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}