import { Router, type Response } from "express";
import type { Db } from "@paperclipai/db";
import {
  createIssueTemplateSchema,
  updateIssueTemplateSchema,
} from "@paperclipai/shared";
import { issueTemplateService } from "../services/issue-templates.js";
import { validate } from "../middleware/validate.js";
import { forbidden } from "../errors.js";
import { assertBoard } from "./authz.js";

function assertInstanceAdmin(req: Express.Request) {
  if (req.actor.type !== "board" || !req.actor.isInstanceAdmin) {
    throw forbidden("Instance admin access required");
  }
}

export function issueTemplateRoutes(db: Db) {
  const router = Router();
  const svc = issueTemplateService(db);

  // List active templates (all users)
  router.get("/", async (req, res: Response) => {
    assertBoard(req);
    const templates = await svc.list();
    res.json(templates);
  });

  // List all templates (admin only)
  router.get("/all", async (req, res: Response) => {
    assertBoard(req);
    assertInstanceAdmin(req);
    const templates = await svc.listAll();
    res.json(templates);
  });

  // Get single template
  router.get("/:id", async (req, res: Response) => {
    assertBoard(req);
    const template = await svc.getById(req.params.id as string);
    if (!template) {
      res.status(404).json({ error: "Template not found" });
      return;
    }
    res.json(template);
  });

  // Create template (admin only)
  router.post(
    "/",
    validate(createIssueTemplateSchema),
    async (req, res: Response) => {
      assertBoard(req);
      assertInstanceAdmin(req);
      const template = await svc.create(req.body);
      res.status(201).json(template);
    },
  );

  // Update template (admin only)
  router.patch(
    "/:id",
    validate(updateIssueTemplateSchema),
    async (req, res: Response) => {
      assertBoard(req);
      assertInstanceAdmin(req);
      const template = await svc.update(req.params.id as string, req.body);
      if (!template) {
        res.status(404).json({ error: "Template not found" });
        return;
      }
      res.json(template);
    },
  );

  // Delete template (admin only)
  router.delete("/:id", async (req, res: Response) => {
    assertBoard(req);
    assertInstanceAdmin(req);
    const template = await svc.delete(req.params.id as string);
    if (!template) {
      res.status(404).json({ error: "Template not found" });
      return;
    }
    res.json(template);
  });

  return router;
}