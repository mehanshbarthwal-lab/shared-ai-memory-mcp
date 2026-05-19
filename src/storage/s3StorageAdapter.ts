import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { config } from "../config.js";
import type {
  ListFilesInput,
  ProviderStatus,
  StorageAdapter,
  StorageFileMetadata,
  StorageProvider,
  UploadFileInput
} from "./types.js";

export class S3StorageAdapter implements StorageAdapter {
  readonly provider: StorageProvider;
  private readonly client: S3Client;

  constructor(provider: StorageProvider = "s3") {
    this.provider = provider;
    this.client = new S3Client({
      endpoint: config.s3Endpoint,
      region: config.s3Region,
      forcePathStyle: config.s3ForcePathStyle,
      credentials:
        config.s3AccessKeyId && config.s3SecretAccessKey
          ? {
              accessKeyId: config.s3AccessKeyId,
              secretAccessKey: config.s3SecretAccessKey
            }
          : undefined
    });
  }

  async uploadFile(input: UploadFileInput): Promise<StorageFileMetadata> {
    if (!config.s3Bucket) {
      throw new Error("S3_BUCKET is required");
    }

    await this.client.send(
      new PutObjectCommand({
        Bucket: config.s3Bucket,
        Key: input.storageKey,
        Body: input.content,
        ContentType: input.mimeType,
        Metadata: input.metadata
      })
    );

    return this.getFileMetadata(input.storageKey);
  }

  async downloadFile(storageKey: string): Promise<Buffer> {
    if (!config.s3Bucket) {
      throw new Error("S3_BUCKET is required");
    }

    const response = await this.client.send(
      new GetObjectCommand({ Bucket: config.s3Bucket, Key: storageKey })
    );
    const bytes = await response.Body?.transformToByteArray();
    return Buffer.from(bytes ?? []);
  }

  async getFileMetadata(storageKey: string): Promise<StorageFileMetadata> {
    if (!config.s3Bucket) {
      throw new Error("S3_BUCKET is required");
    }

    const response = await this.client.send(
      new HeadObjectCommand({ Bucket: config.s3Bucket, Key: storageKey })
    );

    return {
      provider: this.provider,
      storageKey,
      mimeType: response.ContentType,
      fileSizeBytes: response.ContentLength,
      checksum: response.ChecksumSHA256 ?? response.ETag?.replaceAll('"', ""),
      updatedAt: response.LastModified?.toISOString(),
      metadata: response.Metadata
    };
  }

  async listFiles(input: ListFilesInput = {}): Promise<StorageFileMetadata[]> {
    if (!config.s3Bucket) {
      throw new Error("S3_BUCKET is required");
    }

    const response = await this.client.send(
      new ListObjectsV2Command({
        Bucket: config.s3Bucket,
        Prefix: input.prefix,
        MaxKeys: input.limit ?? 100
      })
    );

    return (response.Contents ?? []).map((item) => ({
      provider: this.provider,
      storageKey: item.Key ?? "",
      fileSizeBytes: item.Size,
      checksum: item.ETag?.replaceAll('"', ""),
      updatedAt: item.LastModified?.toISOString()
    }));
  }

  async deleteFile(storageKey: string): Promise<void> {
    if (!config.s3Bucket) {
      throw new Error("S3_BUCKET is required");
    }

    await this.client.send(new DeleteObjectCommand({ Bucket: config.s3Bucket, Key: storageKey }));
  }

  async createSignedOrShareableReference(storageKey: string): Promise<string | null> {
    if (!config.s3Bucket) {
      return null;
    }

    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: config.s3Bucket, Key: storageKey }),
      { expiresIn: 900 }
    );
  }

  providerStatus(): ProviderStatus {
    const configured = Boolean(
      config.s3Bucket && config.s3AccessKeyId && config.s3SecretAccessKey
    );
    return {
      provider: this.provider,
      configured,
      available: configured,
      message: configured
        ? "S3-compatible artifact storage is configured."
        : "S3-compatible storage needs S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY.",
      details: {
        endpointConfigured: Boolean(config.s3Endpoint),
        bucketConfigured: Boolean(config.s3Bucket),
        forcePathStyle: config.s3ForcePathStyle
      }
    };
  }
}
