# OneRule

**Write your AI coding rules once. Sync them to every agent.**

`AGENTS.md` is your single source of truth. OneRule compiles it into the config files that Claude Code, Cursor, GitHub Copilot, Gemini CLI, and Windsurf each expect — and a `check` command fails CI when they drift.

```bash
npx onerule init   # create AGENTS.md + config
npx onerule sync   # generate every tool's rules file
npx onerule check  # CI: fail if they're out of sync
```

<!-- TODO: replace with a 45s demo GIF: edit AGENTS.md -> run sync -> 5 files turn green -->
<!-- ![demo](docs/demo.gif) -->

[![CI](https://github.com/USERNAME/onerule/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/onerule/actions)
[![npm](https://img.shields.io/npm/v/onerule.svg)](https://www.npmjs.com/package/onerule)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Why?

You use more than one AI coding agent. Each reads its **own** rules file:

| Tool | File |
|---|---|
| Claude Code | `CLAUDE.md` |
| Cursor | `.cursor/rules/onerule.mdc` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Gemini CLI | `GEMINI.md` |
| Windsurf | `.windsurfrules` |

Today you copy-paste the same rules into all of them and they **drift**. Update `CLAUDE.md`, forget `GEMINI.md`, and now two agents disagree about how your project works.

OneRule makes `AGENTS.md` the source of truth and generates the rest. One file to edit. Zero drift.

- ⚡ **Zero config** — `npx onerule init` and go.
- 🔒 **Local-first** — no API key, no network, your code never leaves your machine.
- ✅ **CI-ready** — `onerule check` fails the build if rules are stale.
- 🧩 **Extensible** — adding a new agent is one small entry in `src/targets.ts`.

## Install

Run with no install:

```bash
npx onerule <command>
```

Or add it as a dev dependency:

```bash
npm install -D onerule
```

## Quickstart

```bash
# 1. Create AGENTS.md and onerule.json
npx onerule init

# 2. Edit AGENTS.md — your project overview, setup, conventions, do/don't

# 3. Generate every agent's rules file
npx onerule sync
```

Output:

```text
✓ Claude Code      CLAUDE.md
✓ Cursor           .cursor/rules/onerule.mdc
✓ GitHub Copilot   .github/copilot-instructions.md
✓ Gemini CLI       GEMINI.md
✓ Windsurf         .windsurfrules

Synced 5 target(s) from AGENTS.md.
```

## Keep it in sync (CI)

Add a step so stale rules fail the build:

```yaml
# .github/workflows/agents.yml
- run: npx onerule check
```

If someone edits `AGENTS.md` without running `sync`, CI goes red and tells them exactly which files drifted.

## Configuration

`onerule.json` (optional — these are the defaults):

```json
{
  "source": "AGENTS.md",
  "targets": ["claude", "cursor", "copilot", "gemini", "windsurf"]
}
```

Drop a target you don't use, or open a PR to add one.

## Roadmap

- [ ] GitHub Action (auto-`sync` on PRs)
- [ ] Managed-block mode (preserve hand-written sections)
- [ ] More targets: Codex, Cline, Aider, Zed, JetBrains AI
- [ ] MCP config sync
- [ ] Community `AGENTS.md` template registry

See [PROJECT.md](PROJECT.md) for the full design and rationale.

## Contributing

New agents and tools are the easiest contribution — see [CONTRIBUTING.md](CONTRIBUTING.md). Each target is one object in [`src/targets.ts`](src/targets.ts).

## License

[MIT](LICENSE) © Mr-Gondal
