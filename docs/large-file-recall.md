# Large File Recall

Recall should be concise and targeted.

Recommended behavior:

1. Search normal memories first.
2. Search artifact metadata and chunks if the answer may depend on large files.
3. Recall only relevant chunks from specific artifacts.
4. Mention the artifact title/id used.
5. Avoid loading huge files fully unless explicitly requested.
6. Prefer summaries and selected snippets over raw dumps.

## Indexing

`index_artifact` downloads an artifact through the configured adapter and stores useful text chunks in `public.artifact_chunks`.

The v1 indexer is intentionally simple and text-focused. PDFs, images, audio, and video can be registered and summarized, but rich extraction/OCR/transcription should be added later.
