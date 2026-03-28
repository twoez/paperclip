import { z } from "zod";

export const instanceGeneralSettingsSchema = z.object({
  censorUsernameInLogs: z.boolean().default(false),
}).strict();

export const patchInstanceGeneralSettingsSchema = z.object({
  censorUsernameInLogs: z.boolean().optional(),
}).strict();

export const instanceExperimentalSettingsSchema = z.object({
  enableIsolatedWorkspaces: z.boolean().default(false),
  autoRestartDevServerWhenIdle: z.boolean().default(false),
}).strict();

export const patchInstanceExperimentalSettingsSchema = z.object({
  enableIsolatedWorkspaces: z.boolean().optional(),
  autoRestartDevServerWhenIdle: z.boolean().optional(),
}).strict();

export type InstanceGeneralSettings = z.infer<typeof instanceGeneralSettingsSchema>;
export type PatchInstanceGeneralSettings = z.infer<typeof patchInstanceGeneralSettingsSchema>;
export type InstanceExperimentalSettings = z.infer<typeof instanceExperimentalSettingsSchema>;
export type PatchInstanceExperimentalSettings = z.infer<typeof patchInstanceExperimentalSettingsSchema>;
