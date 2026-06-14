import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

/** Write a file, creating any missing parent directories first. */
export function writeFileEnsured(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}