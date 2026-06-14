import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

/** Write a file, creating any missing parent directories first. */
export function writeFileEnsured(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

/** Stable tokens used to locate the OneRule-managed block in an existing file. */
export const BLOCK_START_TOKEN = "<!-- onerule:start";
export const BLOCK_END_TOKEN = "<!-- onerule:end -->";

const BLOCK_START_LINE =
  "<!-- onerule:start — synced from AGENTS.md by `onerule sync`. " +
  "Edit AGENTS.md, not this block. Anything outside the markers is preserved. -->";

/**
 * Insert or update the OneRule-managed block inside `existing`, preserving any
 * hand-written content outside the markers.
 *
 * - If the markers already exist, only the content between them is replaced.
 * - If they don't, the block is appended, keeping whatever was already there.
 * - If the file is empty/new, just the block is written.
 *
 * This is what lets OneRule update `CLAUDE.md` without clobbering notes a
 * developer wrote by hand above or below the managed section.
 */
export function injectBlock(existing: string, body: string): string {
  const block = `${BLOCK_START_LINE}\n\n${body}\n\n${BLOCK_END_TOKEN}`;

  const start = existing.indexOf(BLOCK_START_TOKEN);
  const end = existing.indexOf(BLOCK_END_TOKEN);

  if (start !== -1 && end !== -1 && end > start) {
    const before = existing.slice(0, start);
    const after = existing.slice(end + BLOCK_END_TOKEN.length);
    return `${before}${block}${after}`;
  }

  const head = existing.replace(/\s+$/, "");
  return head.length > 0 ? `${head}\n\n${block}\n` : `${block}\n`;
}