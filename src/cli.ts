import { cac } from "cac";
import { check, init, sync } from "./commands.js";
import type { Mode } from "./config.js";

const VERSION = "0.2.0";

/** Translate --file/--block flags into a Mode override (undefined = use config). */
function modeFromOpts(opts: { file?: boolean; block?: boolean }): Mode | undefined {
  if (opts.file) return "file";
  if (opts.block) return "block";
  return undefined;
}

/** Build the CLI and run it against the given argv. */
export function run(argv: string[]): void {
  const cli = cac("onerule");

  cli
    .command("init", "Create a starter AGENTS.md and onerule.json")
    .action(() => init());

  cli
    .command("sync", "Generate every configured agent file from AGENTS.md")
    .option("--block", "Inject into a managed <!-- onerule --> block, preserving hand-written content (default)")
    .option("--file", "Overwrite the whole file instead of a managed block")
    .action((opts) => sync(undefined, modeFromOpts(opts)));

  cli
    .command("check", "Verify agent files are in sync with AGENTS.md (CI-friendly)")
    .option("--block", "Check against managed-block output (default)")
    .option("--file", "Check against full-file output")
    .action((opts) => process.exit(check(undefined, modeFromOpts(opts))));

  cli.help();
  cli.version(VERSION);
  cli.parse(argv);

  // No subcommand given -> show help instead of doing nothing.
  if (argv.slice(2).length === 0) cli.outputHelp();
}