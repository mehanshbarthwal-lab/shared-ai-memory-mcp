import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { config } from "../config.js";
import type {
  ListFilesInput,
  ProviderStatus,
  StorageAdapter,
  StorageFileMetadata,
  UploadFileInput
} from "./types.js";

function resolveSafePath(rootDir: string, storageKey: string): string {
  const root = path.resolve(rootDir);
  const target = path.resolve(root, storageKey);

  if (!target.startsWith(root)) {
    throw new Error("Invalid storage key");
  }

  return target;
}

async function walkFiles(dir: string, root: string, limit: number, files: StorageFileMetadata[]): Promise<void> {
  if (files.length >= limit) {
    return;
  }

  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkFiles(fullPath, root, limit, files);
    } else {
      const info = await stat(fullPath);
      files.push({
        provider: "local",
        storageKey: path.relative(root, fullPath).replace(/\\/g, "/"),
        fileSizeBytes: info.size,
        updatedAt: info.mtime.toISOString()
      });
    }
    if (files.length >= limit) {
      return;
    }
  }
}

export class LocalStorageAdapter implements StorageAdapter {
  provider = "local" as const;

  constructor(private readonly rootDir = config.localArtifactDir) {}

  async uploadFile(input: UploadFileInput): Promise<StorageFileMetadata> {
    const filePath = resolveSafePath(this.rootDir, input.storageKey);
    const buffer = Buffer.isBuffer(input.content) ? input.content : Buffer.from(input.content);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, buffer);

    return {
      provider: this.provider,
      storageKey: input.storageKey,
      mimeType: input.mimeType,
      fileSizeBytes: buffer.byteLength,
      checksum: createHash("sha256").update(buffer).digest("hex"),
      metadata: input.metadata
    };
  }

  async downloadFile(storageKey: string): Promise<Buffer> {
    return readFile(resolveSafePath(this.rootDir, storageKey));
  }

  async getFileMetadata(storageKey: string): Promise<StorageFileMetadata> {
    const filePath = resolveSafePath(this.rootDir, storageKey);
    const info = await stat(filePath);
    return {
      provider: this.provider,
      storageKey,
      fileSizeBytes: info.size,
      updatedAt: info.mtime.toISOString()
    };
  }

  async listFiles(input: ListFilesInput = {}): Promise<StorageFileMetadata[]> {
    const root = path.resolve(this.rootDir, input.prefix ?? ".");
    const files: StorageFileMetadata[] = [];
    await walkFiles(root, path.resolve(this.rootDir), input.limit ?? 100, files);
    return files;
  }

  async deleteFile(storageKey: string): Promise<void> {
    await rm(resolveSafePath(this.rootDir, storageKey), { force: true });
  }

  async createSignedOrShareableReference(): Promise<string | null> {
    return null;
  }

  providerStatus(): ProviderStatus {
    return {
      provider: this.provider,
      configured: Boolean(this.rootDir),
      available: true,
      message: "Local filesystem artifact storage is configured.",
      details: { rootDir: this.rootDir }
    };
  }
}
