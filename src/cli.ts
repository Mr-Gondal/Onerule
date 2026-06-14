import { cac } from "cac";
import { init, sync, check } from "./commands.js";

const VERSION = "0.1.0";

/** Build the CLI and run it against the given argv. */
export function run(argv: string[]): void {
  const cli = cac("onerule");

  cli
    .command("init", "Create a starter AGENTS.md and onerule.json")
    .action(() => init());

  cli
    .command("sync", "Generate every configured agent file from AGENTS.md")
    .action(() => sync());

  cli
    .command("check", "Verify agent files are in sync with AGENTS.md (CI-friendly)")
    .action(() => process.exit(check()));

  cli.help();
  cli.version(VERSION);
  cli.parse(argv);

  // No subcommand given -> show help instead of doing nothing.
  if (argv.slice(2).length === 0) cli.outputHelp();
}