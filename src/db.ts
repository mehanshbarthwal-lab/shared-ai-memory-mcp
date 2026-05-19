import { createClient } from "@supabase/supabase-js";

import { config } from "./config.js";
import type {
  ArtifactChunkRecord,
  ArtifactInsert,
  ArtifactListFilters,
  ArtifactRecord,
  ArtifactSearchFilters,
  MemoryInsert,
  MemoryRecord,
  MemorySearchFilters,
  MemoryUpdate
} from "./types/index.js";

export class DatabaseError extends Error {
  constructor(message = "Database operation failed") {
    super(message);
    this.name = "DatabaseError";
  }
}

export const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

function ensureData<T>(data: T | null, error: unknown): T {
  if (error) {
    throw new DatabaseError();
  }

  if (data === null) {
    throw new DatabaseError();
  }

  return data;
}

export async function insertMemory(memory: MemoryInsert): Promise<MemoryRecord> {
  const { data, error } = await supabase
    .from("memories")
    .insert(memory)
    .select("*")
    .single();

  return ensureData<MemoryRecord>(data, error);
}

export async function searchMemories(filters: MemorySearchFilters): Promise<MemoryRecord[]> {
  let request = supabase
    .from("memories").select("*").is("deleted_at", null).ilike("content", `%${filters.query}%`)
    .order("importance", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(filters.limit);

  if (filters.scope) {
    request = request.eq("scope", filters.scope);
  }

  if (filters.project_name) {
    request = request.eq("project_name", filters.project_name);
  }

  if (filters.memory_type) {
    request = request.eq("memory_type", filters.memory_type);
  }

  const { data, error } = await request;
  return ensureData<MemoryRecord[]>(data, error);
}

export async function listProjectMemories(
  projectName: string,
  limit: number
): Promise<MemoryRecord[]> {
  const { data, error } = await supabase
    .from("memories").select("*").eq("project_name", projectName).is("deleted_at", null).is("deleted_at", null).is("deleted_at", null)
    .order("importance", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(limit);

  return ensureData<MemoryRecord[]>(data, error);
}

export async function updateMemory(id: string, update: MemoryUpdate): Promise<MemoryRecord | null> {
  const { data, error } = await supabase
    .from("memories")
    .update(update)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new DatabaseError();
  }

  return data as MemoryRecord | null;
}

export async function deleteMemory(id: string, hardDelete = false): Promise<boolean> {
  const query = hardDelete
    ? supabase.from("memories").delete().eq("id", id).select("id")
    : supabase
        .from("memories")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id)
        .is("deleted_at", null)
        .select("id");

  const { data, error } = await query;

  if (error) {
    throw new DatabaseError();
  }

  return Array.isArray(data) && data.length > 0;
}

export async function exportMemories(filters: {
  project_name?: string;
  scope?: MemoryRecord["scope"];
  memory_type?: MemoryRecord["memory_type"];
}): Promise<MemoryRecord[]> {
  let request = supabase
    .from("memories").select("*").is("deleted_at", null).order("scope", { ascending: true })
    .order("project_name", { ascending: true, nullsFirst: true })
    .order("importance", { ascending: false })
    .order("updated_at", { ascending: false });

  if (filters.project_name) {
    request = request.eq("project_name", filters.project_name);
  }

  if (filters.scope) {
    request = request.eq("scope", filters.scope);
  }

  if (filters.memory_type) {
    request = request.eq("memory_type", filters.memory_type);
  }

  const { data, error } = await request;
  return ensureData<MemoryRecord[]>(data, error);
}

export async function insertArtifact(artifact: ArtifactInsert): Promise<ArtifactRecord> {
  const { data, error } = await supabase
    .from("artifacts")
    .insert(artifact)
    .select("*")
    .single();

  return ensureData<ArtifactRecord>(data, error);
}

export async function getArtifact(id: string): Promise<ArtifactRecord | null> {
  const { data, error } = await supabase
    .from("artifacts")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new DatabaseError();
  }

  return data as ArtifactRecord | null;
}

export async function listArtifacts(filters: ArtifactListFilters): Promise<ArtifactRecord[]> {
  let request = supabase
    .from("artifacts")
    .select("*")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(filters.limit);

  if (filters.project_name) {
    request = request.eq("project_name", filters.project_name);
  }

  if (filters.artifact_type) {
    request = request.eq("artifact_type", filters.artifact_type);
  }

  if (filters.provider) {
    request = request.eq("provider", filters.provider);
  }

  if (filters.tag) {
    request = request.contains("tags", [filters.tag]);
  }

  const { data, error } = await request;
  return ensureData<ArtifactRecord[]>(data, error);
}

export async function searchArtifacts(filters: ArtifactSearchFilters): Promise<{
  artifacts: ArtifactRecord[];
  chunks: ArtifactChunkRecord[];
}> {
  let artifactsRequest = supabase
    .from("artifacts")
    .select("*")
    .is("deleted_at", null)
    .or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%,summary.ilike.%${filters.query}%`)
    .order("updated_at", { ascending: false })
    .limit(filters.limit);

  if (filters.project_name) {
    artifactsRequest = artifactsRequest.eq("project_name", filters.project_name);
  }

  if (filters.artifact_type) {
    artifactsRequest = artifactsRequest.eq("artifact_type", filters.artifact_type);
  }

  if (filters.provider) {
    artifactsRequest = artifactsRequest.eq("provider", filters.provider);
  }

  const artifactsResult = await artifactsRequest;
  const artifacts = ensureData<ArtifactRecord[]>(artifactsResult.data, artifactsResult.error);

  let chunksRequest = supabase
    .from("artifact_chunks")
    .select("*, artifacts!inner(project_name, artifact_type, provider, deleted_at)")
    .ilike("content", `%${filters.query}%`)
    .is("artifacts.deleted_at", null)
    .order("chunk_index", { ascending: true })
    .limit(filters.limit);

  if (filters.project_name) {
    chunksRequest = chunksRequest.eq("artifacts.project_name", filters.project_name);
  }

  if (filters.artifact_type) {
    chunksRequest = chunksRequest.eq("artifacts.artifact_type", filters.artifact_type);
  }

  if (filters.provider) {
    chunksRequest = chunksRequest.eq("artifacts.provider", filters.provider);
  }

  const chunksResult = await chunksRequest;
  const rawChunks = ensureData<Array<ArtifactChunkRecord & { artifacts?: unknown }>>(
    chunksResult.data,
    chunksResult.error
  );
  const chunks = rawChunks.map(({ artifacts: _artifacts, ...chunk }) => chunk);

  return { artifacts, chunks };
}

export async function recallArtifactChunks(
  artifactId: string,
  queryText: string,
  maxChunks: number
): Promise<ArtifactChunkRecord[]> {
  const { data, error } = await supabase
    .from("artifact_chunks")
    .select("*")
    .eq("artifact_id", artifactId)
    .ilike("content", `%${queryText}%`)
    .order("chunk_index", { ascending: true })
    .limit(maxChunks);

  return ensureData<ArtifactChunkRecord[]>(data, error);
}

export async function replaceArtifactChunks(
  artifactId: string,
  chunks: Array<Omit<ArtifactChunkRecord, "id" | "created_at">>
): Promise<void> {
  const deleteResult = await supabase.from("artifact_chunks").delete().eq("artifact_id", artifactId);
  if (deleteResult.error) {
    throw new DatabaseError();
  }

  if (chunks.length === 0) {
    return;
  }

  const insertResult = await supabase.from("artifact_chunks").insert(chunks);
  if (insertResult.error) {
    throw new DatabaseError();
  }
}

export async function updateArtifactIndexState(
  artifactId: string,
  update: Partial<Pick<ArtifactRecord, "summary" | "indexed_status" | "indexed_at" | "metadata">>
): Promise<ArtifactRecord> {
  const { data, error } = await supabase
    .from("artifacts")
    .update(update)
    .eq("id", artifactId)
    .select("*")
    .single();

  return ensureData<ArtifactRecord>(data, error);
}

export async function softDeleteArtifact(artifactId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("artifacts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", artifactId)
    .is("deleted_at", null)
    .select("id");

  if (error) {
    throw new DatabaseError();
  }

  return Array.isArray(data) && data.length > 0;
}

export async function hardDeleteArtifact(artifactId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("artifacts")
    .delete()
    .eq("id", artifactId)
    .select("id");

  if (error) {
    throw new DatabaseError();
  }

  return Array.isArray(data) && data.length > 0;
}




