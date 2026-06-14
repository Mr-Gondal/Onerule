import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import pc from "picocolors";
import { CONFIG_FILE, DEFAULT_CONFIG, loadConfig } from "./config.js";
import { TARGETS, type Target } from "./targets.js";
import { writeFileEnsured } from "./util.js";

const STARTER_AGENTS = `# AGENTS.md

> Single source of truth for AI coding agents.
> Edit this file, then run \`onerule sync\` to update every tool.

## Project overview
Describe what this project does in 1-2 sentences.

## Setup
- Install: \`npm install\`
- Dev: \`npm run dev\`
- Test: \`npm test\`

## Conventions
- Use TypeScript.
- Write tests for new behaviour.
- Keep functions small and focused.

## Do / Don't
- Do: explain non-obvious decisions in comments.
- Don't: commit secrets or large generated files.
`;

interface RenderedOutput {
  target: Target;
  path: string;
  content: string;
}

/** Resolve config + source and render every configured target in memory. */
function renderAll(cwd: string): RenderedOutput[] {
  const config = loadConfig(cwd);
  const sourcePath = resolve(cwd, config.source);

  if (!existsSync(sourcePath)) {
    throw new Error(
      `Source file "${config.source}" not found. Run \`onerule init\` first.`,
    );
  }

  const body = readFileSync(sourcePath, "utf8").trim();
  const outputs: RenderedOutput[] = [];

  for (const id of config.targets) {
    const target = TARGETS[id];
    if (!target) {
      console.log(pc.yellow(`! unknown target "${id}" (skipped)`));
      continue;
    }
    outputs.push({
      target,
      path: resolve(cwd, target.outputPath),
      content: target.render(body),
    });
  }

  return outputs;
}

/** Create a starter AGENTS.md and onerule.json if they don't exist. */
export function init(cwd: string = process.cwd()): void {
  const sourcePath = resolve(cwd, DEFAULT_CONFIG.source);
  if (existsSync(sourcePath)) {
    console.log(pc.dim(`• ${DEFAULT_CONFIG.source} already exists, leaving it`));
  } else {
    writeFileEnsured(sourcePath, STARTER_AGENTS);
    console.log(`${pc.green("✓")} created ${DEFAULT_CONFIG.source}`);
  }

  const configPath = resolve(cwd, CONFIG_FILE);
  if (existsSync(configPath)) {
    console.log(pc.dim(`• ${CONFIG_FILE} already exists, leaving it`));
  } else {
    writeFileEnsured(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2) + "\n");
    console.log(`${pc.green("✓")} created ${CONFIG_FILE}`);
  }

  console.log(
    `\nNext: edit ${pc.cyan(DEFAULT_CONFIG.source)} then run ${pc.cyan("onerule sync")}`,
  );
}

/** Write every configured target file from the source. */
export function sync(cwd: string = process.cwd()): void {
  const outputs = renderAll(cwd);

  for (const out of outputs) {
    writeFileEnsured(out.path, out.content);
    console.log(
      `${pc.green("✓")} ${out.target.label.padEnd(16)} ${pc.dim(out.target.outputPath)}`,
    );
  }

  console.log(pc.green(`\nSynced ${outputs.length} target(s) from AGENTS.md.`));
}

/**
 * Compare on-disk files to freshly rendered output.
 * Returns 0 when everything is in sync, 1 when any target has drifted.
 */
export function check(cwd: string = process.cwd()): number {
  const outputs = renderAll(cwd);
  const drift: string[] = [];

  for (const out of outputs) {
    const current = existsSync(out.path) ? readFileSync(out.path, "utf8") : null;
    if (current !== out.content) drift.push(out.target.outputPath);
  }

  if (drift.length === 0) {
    console.log(pc.green("✓ all agent files are in sync with AGENTS.md"));
    return 0;
  }

  console.log(pc.red("✗ out of sync:"));
  for (const path of drift) console.log(pc.red(`  - ${path}`));
  console.log(pc.dim("\nRun `onerule sync` to update them."));
  return 1;
}