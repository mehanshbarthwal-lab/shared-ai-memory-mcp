import "dotenv/config";
import { z } from "zod";

const configSchema = z.object({
  supabaseUrl: z.string().url(),
  supabaseServiceRoleKey: z.string().min(1),
  memoryMcpToken: z.string().min(16),
  tokenEncryptionKey: z.string().optional(),
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  port: z.coerce.number().int().positive().default(3000),
  databaseProvider: z.string().default("supabase"),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
  maxSearchResults: z.coerce.number().int().min(1).max(100).default(10),
  artifactStorageProvider: z
    .enum(["local", "s3", "cloudflare_r2", "aws_s3", "backblaze_b2", "minio", "google_drive", "onedrive"])
    .default("local"),
  localArtifactDir: z.string().default("./artifacts"),
  s3Endpoint: z.string().optional(),
  s3Region: z.string().default("auto"),
  s3Bucket: z.string().optional(),
  s3AccessKeyId: z.string().optional(),
  s3SecretAccessKey: z.string().optional(),
  s3ForcePathStyle: z.coerce.boolean().default(true),
  googleDriveClientId: z.string().optional(),
  googleDriveClientSecret: z.string().optional(),
  googleDriveRedirectUri: z.string().optional(),
  googleDriveFolderId: z.string().optional(),
  oneDriveClientId: z.string().optional(),
  oneDriveClientSecret: z.string().optional(),
  oneDriveTenantId: z.string().optional(),
  oneDriveRedirectUri: z.string().optional(),
  oneDriveFolderId: z.string().optional()
});

export const config = configSchema.parse({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  memoryMcpToken: process.env.MEMORY_MCP_TOKEN,
  tokenEncryptionKey: process.env.TOKEN_ENCRYPTION_KEY || undefined,
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: process.env.PORT ?? 3000,
  databaseProvider: process.env.DATABASE_PROVIDER ?? "supabase",
  logLevel: process.env.LOG_LEVEL ?? "info",
  maxSearchResults: process.env.MAX_SEARCH_RESULTS ?? 10,
  artifactStorageProvider: process.env.ARTIFACT_STORAGE_PROVIDER ?? "local",
  localArtifactDir: process.env.LOCAL_ARTIFACT_DIR ?? "./artifacts",
  s3Endpoint: process.env.S3_ENDPOINT || undefined,
  s3Region: process.env.S3_REGION ?? "auto",
  s3Bucket: process.env.S3_BUCKET || undefined,
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID || undefined,
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY || undefined,
  s3ForcePathStyle: process.env.S3_FORCE_PATH_STYLE ?? true,
  googleDriveClientId: process.env.GOOGLE_DRIVE_CLIENT_ID || undefined,
  googleDriveClientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET || undefined,
  googleDriveRedirectUri: process.env.GOOGLE_DRIVE_REDIRECT_URI || undefined,
  googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID || undefined,
  oneDriveClientId: process.env.ONEDRIVE_CLIENT_ID || undefined,
  oneDriveClientSecret: process.env.ONEDRIVE_CLIENT_SECRET || undefined,
  oneDriveTenantId: process.env.ONEDRIVE_TENANT_ID || undefined,
  oneDriveRedirectUri: process.env.ONEDRIVE_REDIRECT_URI || undefined,
  oneDriveFolderId: process.env.ONEDRIVE_FOLDER_ID || undefined
});

export const isProduction = config.nodeEnv === "production";
