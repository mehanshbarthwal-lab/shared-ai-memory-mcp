import { config } from "../config.js";
import type {
  ListFilesInput,
  ProviderStatus,
  StorageAdapter,
  StorageFileMetadata,
  UploadFileInput
} from "./types.js";

export class OneDriveAdapter implements StorageAdapter {
  provider = "onedrive" as const;

  async uploadFile(_input: UploadFileInput): Promise<StorageFileMetadata> {
    throw new Error("OneDrive OAuth storage is not implemented in v1.");
  }

  async downloadFile(_storageKey: string): Promise<Buffer> {
    throw new Error("OneDrive OAuth storage is not implemented in v1.");
  }

  async getFileMetadata(_storageKey: string): Promise<StorageFileMetadata> {
    throw new Error("OneDrive OAuth storage is not implemented in v1.");
  }

  async listFiles(_input?: ListFilesInput): Promise<StorageFileMetadata[]> {
    throw new Error("OneDrive OAuth storage is not implemented in v1.");
  }

  async deleteFile(_storageKey: string): Promise<void> {
    throw new Error("OneDrive OAuth storage is not implemented in v1.");
  }

  async createSignedOrShareableReference(_storageKey: string): Promise<string | null> {
    return null;
  }

  providerStatus(): ProviderStatus {
    const configured = Boolean(
      config.oneDriveClientId && config.oneDriveClientSecret && config.oneDriveRedirectUri
    );
    return {
      provider: this.provider,
      configured,
      available: false,
      message:
        "OneDrive adapter interface is present, but Microsoft Graph OAuth token flow/storage is not implemented in v1.",
      details: {
        clientIdConfigured: Boolean(config.oneDriveClientId),
        clientSecretConfigured: Boolean(config.oneDriveClientSecret),
        tenantIdConfigured: Boolean(config.oneDriveTenantId),
        redirectUriConfigured: Boolean(config.oneDriveRedirectUri),
        folderIdConfigured: Boolean(config.oneDriveFolderId)
      }
    };
  }
}
