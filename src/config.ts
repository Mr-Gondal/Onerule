import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * How OneRule writes each target file.
 * - "block": inject into a managed `<!-- onerule -->` marker block, preserving
 *   any hand-written content outside it. Safe default — never clobbers notes.
 * - "file": overwrite the entire file from AGENTS.md.
 */
export type Mode = "file" | "block";

export interface OneRuleConfig {
  /** Path (relative to cwd) of the single source-of-truth file. */
  source: string;
  /** Target ids to generate. See targets.ts for the registry. */
  targets: string[];
  /** Write mode. See {@link Mode}. */
  mode: Mode;
}

export const CONFIG_FILE = "onerule.json";

export const DEFAULT_CONFIG: OneRuleConfig = {
  source: "AGENTS.md",
  targets: ["claude", "cursor", "copilot", "gemini", "windsurf"],
  mode: "block",
};

/**
 * Load onerule.json from `cwd`, falling back to defaults. Unknown keys in the
 * file are ignored; provided keys override the defaults.
 */
export function loadConfig(cwd: string = process.cwd()): OneRuleConfig {
  const path = resolve(cwd, CONFIG_FILE);
  if (!existsSync(path)) return { ...DEFAULT_CONFIG };

  const raw = JSON.parse(readFileSync(path, "utf8")) as Partial<OneRuleConfig>;
  return {
    source: raw.source ?? DEFAULT_CONFIG.source,
    targets: raw.targets ?? DEFAULT_CONFIG.targets,
    mode: raw.mode ?? DEFAULT_CONFIG.mode,
  };
}