import { Router, type Request, type Response } from "express";
import { z } from "zod";

import { indexArtifactById, recallFromArtifactById } from "../artifacts.js";
import { config, isProduction } from "../config.js";
import {
  getArtifact,
  hardDeleteArtifact,
  insertArtifact,
  listArtifacts,
  searchArtifacts,
  softDeleteArtifact
} from "../db.js";
import { storageManager } from "../storage/index.js";
import {
  deleteArtifactSchema,
  indexArtifactSchema,
  listArtifactsSchema,
  recallFromArtifactSchema,
  registerArtifactSchema,
  searchArtifactsSchema
} from "../tools/artifactTools.js";

export const artifactRouter = Router();

function sendError(res: Response, error: unknown): void {
  const message = error instanceof Error ? error.message : "Request failed.";
  res.status(400).json({ ok: false, error: isProduction ? "Request failed." : message });
}

artifactRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const parsed = z.object(registerArtifactSchema).parse(req.body);
    const artifact = await insertArtifact({
      ...parsed,
      scope: parsed.project_name ? "project" : "global",
      external_url: parsed.external_url ?? null,
      mime_type: parsed.mime_type ?? null,
      file_size_bytes: parsed.file_size_bytes ?? null,
      description: parsed.description ?? null,
      source_client: parsed.source_client ?? null,
      source_workspace: parsed.source_workspace ?? null
    });
    res.status(201).json({ ok: true, data: { artifact } });
  } catch (error) {
    sendError(res, error);
  }
});

artifactRouter.get("/", async (req: Request, res: Response) => {
  try {
    const parsed = z.object(listArtifactsSchema).parse(req.query);
    const artifacts = await listArtifacts({
      ...parsed,
      limit: parsed.limit ?? config.maxSearchResults
    });
    res.json({ ok: true, data: { artifacts, count: artifacts.length } });
  } catch (error) {
    sendError(res, error);
  }
});

artifactRouter.get("/search", async (req: Request, res: Response) => {
  try {
    const parsed = z.object(searchArtifactsSchema).parse(req.query);
    const data = await searchArtifacts({ ...parsed, limit: parsed.limit ?? config.maxSearchResults });
    res.json({ ok: true, data });
  } catch (error) {
    sendError(res, error);
  }
});

artifactRouter.post("/:id/recall", async (req: Request, res: Response) => {
  try {
    const parsed = z.object(recallFromArtifactSchema).parse({
      ...req.body,
      artifact_id: req.params.id
    });
    const data = await recallFromArtifactById({
      artifactId: parsed.artifact_id,
      query: parsed.query,
      maxChunks: parsed.max_chunks,
      includeSummary: parsed.include_summary
    });
    res.json({ ok: true, data });
  } catch (error) {
    sendError(res, error);
  }
});

artifactRouter.post("/:id/index", async (req: Request, res: Response) => {
  try {
    const parsed = z.object(indexArtifactSchema).parse({
      ...req.body,
      artifact_id: req.params.id
    });
    const data = await indexArtifactById(parsed.artifact_id, parsed.force_reindex);
    res.json({ ok: true, data });
  } catch (error) {
    sendError(res, error);
  }
});

artifactRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const parsed = z.object(deleteArtifactSchema).parse({
      artifact_id: req.params.id,
      hard_delete: req.query.hard_delete === "true",
      delete_from_storage: req.query.delete_from_storage === "true"
    });
    const artifact = await getArtifact(parsed.artifact_id);

    if (!artifact) {
      res.status(404).json({ ok: false, error: "Artifact not found." });
      return;
    }

    if (parsed.delete_from_storage) {
      await storageManager.getAdapter(artifact.provider).deleteFile(artifact.storage_key);
    }

    const deleted = parsed.hard_delete
      ? await hardDeleteArtifact(parsed.artifact_id)
      : await softDeleteArtifact(parsed.artifact_id);

    res.json({ ok: true, data: { artifact_id: parsed.artifact_id, deleted } });
  } catch (error) {
    sendError(res, error);
  }
});
