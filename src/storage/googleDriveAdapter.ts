import { config } from "../config.js";
import type {
  ListFilesInput,
  ProviderStatus,
  StorageAdapter,
  StorageFileMetadata,
  UploadFileInput
} from "./types.js";

export class GoogleDriveAdapter implements StorageAdapter {
  provider = "google_drive" as const;

  async uploadFile(_input: UploadFileInput): Promise<StorageFileMetadata> {
    throw new Error("Google Drive OAuth storage is not implemented in v1.");
  }

  async downloadFile(_storageKey: string): Promise<Buffer> {
    throw new Error("Google Drive OAuth storage is not implemented in v1.");
  }

  async getFileMetadata(_storageKey: string): Promise<StorageFileMetadata> {
    throw new Error("Google Drive OAuth storage is not implemented in v1.");
  }

  async listFiles(_input?: ListFilesInput): Promise<StorageFileMetadata[]> {
    throw new Error("Google Drive OAuth storage is not implemented in v1.");
  }

  async deleteFile(_storageKey: string): Promise<void> {
    throw new Error("Google Drive OAuth storage is not implemented in v1.");
  }

  async createSignedOrShareableReference(_storageKey: string): Promise<string | null> {
    return null;
  }

  providerStatus(): ProviderStatus {
    const configured = Boolean(
      config.googleDriveClientId &&
        config.googleDriveClientSecret &&
        config.googleDriveRedirectUri
    );
    return {
      provider: this.provider,
      configured,
      available: false,
      message:
        "Google Drive adapter interface is present, but OAuth token flow/storage is not implemented in v1.",
      details: {
        clientIdConfigured: Boolean(config.googleDriveClientId),
        clientSecretConfigured: Boolean(config.googleDriveClientSecret),
        redirectUriConfigured: Boolean(config.googleDriveRedirectUri),
        folderIdConfigured: Boolean(config.googleDriveFolderId)
      }
    };
  }
}
