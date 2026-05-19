export type StorageProvider =
  | "local"
  | "s3"
  | "cloudflare_r2"
  | "aws_s3"
  | "backblaze_b2"
  | "minio"
  | "google_drive"
  | "onedrive";

export interface UploadFileInput {
  storageKey: string;
  content: Buffer | Uint8Array | string;
  mimeType?: string;
  metadata?: Record<string, string>;
}

export interface StorageFileMetadata {
  provider: StorageProvider;
  storageKey: string;
  mimeType?: string;
  fileSizeBytes?: number;
  checksum?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface ListFilesInput {
  prefix?: string;
  limit?: number;
}

export interface ProviderStatus {
  provider: StorageProvider;
  configured: boolean;
  available: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export interface StorageAdapter {
  provider: StorageProvider;
  uploadFile(input: UploadFileInput): Promise<StorageFileMetadata>;
  downloadFile(storageKey: string): Promise<Buffer>;
  getFileMetadata(storageKey: string): Promise<StorageFileMetadata>;
  listFiles(input?: ListFilesInput): Promise<StorageFileMetadata[]>;
  deleteFile(storageKey: string): Promise<void>;
  createSignedOrShareableReference(storageKey: string): Promise<string | null>;
  providerStatus(): ProviderStatus;
}
