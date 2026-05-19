export declare const memoryScopes: readonly ["global", "project", "account"];
export declare const memoryTypes: readonly ["preference", "project_context", "instruction", "fact", "workflow", "file_path", "decision"];
export declare const artifactTypes: readonly ["document", "pdf", "spreadsheet", "image", "dataset", "code_file", "log_file", "chat_export", "audio", "video", "archive", "other"];
export declare const artifactProviders: readonly ["local", "s3", "cloudflare_r2", "aws_s3", "backblaze_b2", "minio", "google_drive", "onedrive"];
export declare const artifactIndexStatuses: readonly ["pending", "indexed", "failed", "skipped"];
export type MemoryScope = (typeof memoryScopes)[number];
export type MemoryType = (typeof memoryTypes)[number];
export type ArtifactType = (typeof artifactTypes)[number];
export type ArtifactProvider = (typeof artifactProviders)[number];
export type ArtifactIndexStatus = (typeof artifactIndexStatuses)[number];
export interface MemoryRecord {
    id: string;
    scope: MemoryScope;
    project_name: string | null;
    source_account: string | null;
    source_client: string | null;
    source_model: string | null;
    source_workspace: string | null;
    visibility: "private" | "shared" | "public";
    memory_type: MemoryType;
    content: string;
    tags: string[];
    importance: number;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    archived_at: string | null;
    last_accessed_at: string | null;
}
export interface MemoryInsert {
    scope: MemoryScope;
    project_name?: string | null;
    source_account?: string | null;
    source_client?: string | null;
    source_model?: string | null;
    source_workspace?: string | null;
    visibility?: "private" | "shared" | "public";
    memory_type: MemoryType;
    content: string;
    tags?: string[];
    importance?: number;
    metadata?: Record<string, unknown>;
}
export interface MemoryUpdate {
    content?: string;
    tags?: string[];
    importance?: number;
    memory_type?: MemoryType;
    scope?: MemoryScope;
    project_name?: string | null;
    visibility?: "private" | "shared" | "public";
    metadata?: Record<string, unknown>;
}
export interface MemorySearchFilters {
    query: string;
    scope?: MemoryScope;
    project_name?: string;
    memory_type?: MemoryType;
    limit: number;
}
export interface ArtifactRecord {
    id: string;
    project_name: string | null;
    scope: MemoryScope;
    artifact_type: ArtifactType;
    title: string;
    description: string | null;
    provider: ArtifactProvider;
    storage_key: string;
    external_url: string | null;
    mime_type: string | null;
    file_size_bytes: number | null;
    checksum: string | null;
    source_client: string | null;
    source_model: string | null;
    source_workspace: string | null;
    visibility: "private" | "shared" | "public";
    tags: string[];
    summary: string | null;
    indexed_status: ArtifactIndexStatus;
    indexed_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    archived_at: string | null;
    last_accessed_at: string | null;
    metadata: Record<string, unknown>;
}
export interface ArtifactChunkRecord {
    id: string;
    artifact_id: string;
    chunk_index: number;
    content: string;
    token_estimate: number | null;
    page_number: number | null;
    section_title: string | null;
    created_at: string;
    metadata: Record<string, unknown>;
}
export interface ArtifactInsert {
    project_name?: string | null;
    scope?: MemoryScope;
    artifact_type: ArtifactType;
    title: string;
    description?: string | null;
    provider: ArtifactProvider;
    storage_key: string;
    external_url?: string | null;
    mime_type?: string | null;
    file_size_bytes?: number | null;
    checksum?: string | null;
    source_client?: string | null;
    source_model?: string | null;
    source_workspace?: string | null;
    visibility?: "private" | "shared" | "public";
    tags?: string[];
    summary?: string | null;
    indexed_status?: ArtifactIndexStatus;
    metadata?: Record<string, unknown>;
}
export interface ArtifactListFilters {
    project_name?: string;
    artifact_type?: ArtifactType;
    provider?: ArtifactProvider;
    tag?: string;
    limit: number;
}
export interface ArtifactSearchFilters {
    query: string;
    project_name?: string;
    artifact_type?: ArtifactType;
    provider?: ArtifactProvider;
    limit: number;
}
export interface ToolSuccess<T> {
    ok: true;
    data: T;
}
export interface ToolFailure {
    ok: false;
    error: string;
}
export type ToolPayload<T> = ToolSuccess<T> | ToolFailure;
