export const memoryScopes = ["global", "project", "account"];
export const memoryTypes = [
    "preference",
    "project_context",
    "instruction",
    "fact",
    "workflow",
    "file_path",
    "decision"
];
export const artifactTypes = [
    "document",
    "pdf",
    "spreadsheet",
    "image",
    "dataset",
    "code_file",
    "log_file",
    "chat_export",
    "audio",
    "video",
    "archive",
    "other"
];
export const artifactProviders = [
    "local",
    "s3",
    "cloudflare_r2",
    "aws_s3",
    "backblaze_b2",
    "minio",
    "google_drive",
    "onedrive"
];
export const artifactIndexStatuses = ["pending", "indexed", "failed", "skipped"];
//# sourceMappingURL=index.js.map