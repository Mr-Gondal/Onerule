import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface OneRuleConfig {
  /** Path (relative to cwd) of the single source-of-truth file. */
  source: string;
  /** Target ids to generate. See targets.ts for the registry. */
  targets: string[];
}

export const CONFIG_FILE = "onerule.json";

export const DEFAULT_CONFIG: OneRuleConfig = {
  source: "AGENTS.md",
  targets: ["claude", "cursor", "copilot", "gemini", "windsurf"],
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
  };
}