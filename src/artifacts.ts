import {
  getArtifact,
  recallArtifactChunks,
  replaceArtifactChunks,
  updateArtifactIndexState
} from "./db.js";
import { storageManager } from "./storage/index.js";
import type { ArtifactChunkRecord, ArtifactRecord } from "./types/index.js";

const maxIndexBytes = 512_000;
const chunkSize = 4_000;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function normalizeText(buffer: Buffer, mimeType?: string | null): string {
  const textLike =
    !mimeType ||
    mimeType.startsWith("text/") ||
    mimeType.includes("json") ||
    mimeType.includes("xml") ||
    mimeType.includes("csv") ||
    mimeType.includes("javascript") ||
    mimeType.includes("typescript");

  if (!textLike) {
    return "";
  }

  return buffer.toString("utf8").replace(/\u0000/g, "").trim();
}

function buildSummary(text: string, fallback: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return fallback;
  }

  return cleaned.slice(0, 1_200);
}

function selectLogLines(text: string): string {
  const lines = text.split(/\r?\n/);
  const important = lines.filter((line) => /error|warn|fail|exception|timeout|critical/i.test(line));
  const selected = important.length > 0 ? important.slice(0, 300) : lines.slice(0, 300);
  return selected.join("\n");
}

export function makeChunks(
  artifactId: string,
  text: string,
  maxChunks = 50
): Array<Omit<ArtifactChunkRecord, "id" | "created_at">> {
  const chunks: Array<Omit<ArtifactChunkRecord, "id" | "created_at">> = [];
  let cursor = 0;

  while (cursor < text.length && chunks.length < maxChunks) {
    const content = text.slice(cursor, cursor + chunkSize).trim();
    if (content) {
      chunks.push({
        artifact_id: artifactId,
        chunk_index: chunks.length,
        content,
        token_estimate: estimateTokens(content),
        page_number: null,
        section_title: null,
        metadata: {}
      });
    }
    cursor += chunkSize;
  }

  return chunks;
}

export async function indexArtifactById(
  artifactId: string,
  forceReindex = false
): Promise<{ artifact: ArtifactRecord; chunksCreated: number; message: string }> {
  const artifact = await getArtifact(artifactId);
  if (!artifact) {
    throw new Error("Artifact not found.");
  }

  if (artifact.indexed_status === "indexed" && !forceReindex) {
    return { artifact, chunksCreated: 0, message: "Artifact is already indexed." };
  }

  const adapter = storageManager.getAdapter(artifact.provider);
  const file = await adapter.downloadFile(artifact.storage_key);
  const limited = file.byteLength > maxIndexBytes ? file.subarray(0, maxIndexBytes) : file;
  let text = normalizeText(limited, artifact.mime_type);

  if (artifact.artifact_type === "log_file") {
    text = selectLogLines(text);
  }

  if (!text) {
    const updated = await updateArtifactIndexState(artifact.id, {
      indexed_status: "skipped",
      indexed_at: new Date().toISOString(),
      summary: artifact.summary ?? "No text could be extracted by the v1 indexer."
    });
    return { artifact: updated, chunksCreated: 0, message: "No text extracted; indexing skipped." };
  }

  const chunks = makeChunks(artifact.id, text);
  await replaceArtifactChunks(artifact.id, chunks);
  const updated = await updateArtifactIndexState(artifact.id, {
    indexed_status: "indexed",
    indexed_at: new Date().toISOString(),
    summary: artifact.summary ?? buildSummary(text, "Artifact indexed."),
    metadata: {
      ...artifact.metadata,
      indexed_bytes: limited.byteLength,
      truncated_for_indexing: file.byteLength > maxIndexBytes
    }
  });

  return { artifact: updated, chunksCreated: chunks.length, message: "Artifact indexed." };
}

export async function recallFromArtifactById(input: {
  artifactId: string;
  query: string;
  maxChunks: number;
  includeSummary: boolean;
}): Promise<{ artifact: ArtifactRecord; chunks: ArtifactChunkRecord[]; summary?: string | null }> {
  const artifact = await getArtifact(input.artifactId);
  if (!artifact) {
    throw new Error("Artifact not found.");
  }

  const chunks = await recallArtifactChunks(input.artifactId, input.query, input.maxChunks);
  return {
    artifact,
    chunks,
    summary: input.includeSummary ? artifact.summary : undefined
  };
}
