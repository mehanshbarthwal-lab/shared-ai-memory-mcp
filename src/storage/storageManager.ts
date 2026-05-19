import { config } from "../config.js";
import { GoogleDriveAdapter } from "./googleDriveAdapter.js";
import { LocalStorageAdapter } from "./localStorageAdapter.js";
import { OneDriveAdapter } from "./oneDriveAdapter.js";
import { S3StorageAdapter } from "./s3StorageAdapter.js";
import type { ProviderStatus, StorageAdapter, StorageProvider } from "./types.js";

export class StorageManager {
  private readonly adapters = new Map<StorageProvider, StorageAdapter>();

  constructor() {
    const local = new LocalStorageAdapter();
    this.adapters.set("local", local);

    for (const provider of ["s3", "cloudflare_r2", "aws_s3", "backblaze_b2", "minio"] as const) {
      this.adapters.set(provider, new S3StorageAdapter(provider));
    }

    this.adapters.set("google_drive", new GoogleDriveAdapter());
    this.adapters.set("onedrive", new OneDriveAdapter());
  }

  getAdapter(provider: StorageProvider = config.artifactStorageProvider): StorageAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`Unsupported storage provider: ${provider}`);
    }

    return adapter;
  }

  providerStatuses(): ProviderStatus[] {
    return [...this.adapters.values()].map((adapter) => adapter.providerStatus());
  }

  activeProviderStatus(): ProviderStatus {
    return this.getAdapter().providerStatus();
  }
}

export const storageManager = new StorageManager();
