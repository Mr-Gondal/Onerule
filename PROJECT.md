# OneRule — Project Specification

> **One-line pitch:** Write `AGENTS.md` once. OneRule syncs your AI coding rules to Claude Code, Cursor, Copilot, Gemini, Windsurf, and more — and fails CI when they drift.

Status: **v0.1 (MVP in progress)**
Author: Mr-Gondal
License: MIT
Last updated: 2026-06-14

---

## 1. Why this project exists

### 1.1 The problem
Developers now use **multiple AI coding agents at the same time** — Claude Code, Cursor, GitHub Copilot, Gemini CLI, Windsurf, Codex, and others. Each one reads its own configuration / "rules" file:

| Tool | Config file it reads |
|---|---|
| Claude Code | `CLAUDE.md` |
| Cursor | `.cursor/rules/*.mdc` (or legacy `.cursorrules`) |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Gemini CLI | `GEMINI.md` |
| Windsurf | `.windsurfrules` |
| Codex / generic | `AGENTS.md` |

These files all contain **basically the same content**: project overview, setup commands, conventions, do/don't rules. Today developers either:
1. Copy-paste the same rules into 5 files and maintain them by hand, or
2. Only set up one tool and get worse results from the others.

Over time the files **drift** — someone updates `CLAUDE.md` but forgets `GEMINI.md`, and now two agents disagree about how the project works.

### 1.2 The insight
[`AGENTS.md`](https://agents.md) is emerging as an open, tool-agnostic standard. Treat it as the **single source of truth**, and *compile* it down to every proprietary format — the same way Terraform/Prettier/Babel turn one canonical input into many outputs.

### 1.3 Why it can grow (mapped to the scrape data)
From `oss_5k_research_and_project_plan.md`, the highest-growth zone is **AI + CLI + developer-tools**, especially Claude Code / Codex / Gemini / MCP workflows. OneRule sits squarely in that zone **without** competing in the saturated "repo → LLM context" category (Repomix, gitingest, code2prompt, etc.).

Differentiators that match proven star-drivers:
- **Instant "wow" demo** — edit one file, watch 5 files update (great GIF).
- **One-command install / zero config** — `npx onerule init`.
- **Local-first, no API key, works offline** — strong trust signal, zero external-API fragility.
- **Sticky retention hook** — once `onerule check` is in a team's CI, they keep it.
- **Shareable artifact** — a clean `AGENTS.md` is itself a social-value asset.
- **Obvious contribution path** — every new agent/tool is "add one small target file." Perfect good-first-issues.

---

## 2. Scope

### 2.1 What OneRule IS
- A small, fast CLI that reads one canonical `AGENTS.md` and writes tool-specific rule files.
- A `check` command for CI that verifies the generated files are up to date.
- Deterministic, dependency-light, and offline.

### 2.2 What OneRule is NOT (non-goals for v0.1)
- ❌ Not an LLM wrapper — it does **not** call any model.
- ❌ Not a repo analyzer / context packer (that's the saturated lane we're avoiding).
- ❌ Not a docs generator. It transforms rules you write; it does not invent them.
- ❌ Not opinionated about *what* your rules say.

---

## 3. Core concepts

### 3.1 Source of truth
Default source file: **`AGENTS.md`** at the repo root. Configurable via `onerule.json`.

### 3.2 Targets
A **target** is one output format. Each target knows:
- its `id` (e.g. `claude`),
- a human `label` (e.g. `Claude Code`),
- an `outputPath` (e.g. `CLAUDE.md`),
- a `render(body)` function that wraps/transforms the source body into that tool's format.

v0.1 ships these targets:

| id | label | output path |
|---|---|---|
| `claude` | Claude Code | `CLAUDE.md` |
| `cursor` | Cursor | `.cursor/rules/onerule.mdc` |
| `copilot` | GitHub Copilot | `.github/copilot-instructions.md` |
| `gemini` | Gemini CLI | `GEMINI.md` |
| `windsurf` | Windsurf | `.windsurfrules` |

Each generated file carries a **banner** noting it's generated from `AGENTS.md` and should not be hand-edited.

### 3.3 Config file — `onerule.json`
```json
{
  "source": "AGENTS.md",
  "targets": ["claude", "cursor", "copilot", "gemini", "windsurf"]
}
```
If no config file exists, sensible defaults (above) are used.

---

## 4. Commands (v0.1)

| Command | What it does |
|---|---|
| `onerule init` | Creates a starter `AGENTS.md` (if missing) and `onerule.json` (if missing). |
| `onerule sync` | Reads the source and writes/overwrites every configured target file. |
| `onerule check` | Re-renders in memory and compares to files on disk. Exit `0` if in sync, `1` if drifted. CI-friendly. |
| `onerule --help` / `--version` | Standard CLI help. |

### Example session
```bash
npx onerule init      # creates AGENTS.md + onerule.json
# ...edit AGENTS.md...
npx onerule sync      # ✓ Claude Code  CLAUDE.md
                        # ✓ Cursor       .cursor/rules/onerule.mdc
                        # ✓ GitHub Copilot .github/copilot-instructions.md
                        # ✓ Gemini CLI   GEMINI.md
                        # ✓ Windsurf     .windsurfrules
npx onerule check     # ✓ all agent files are in sync with AGENTS.md
```

---

## 5. Architecture

```
src/
  index.ts        # shebang entry; calls cli.run(argv)
  cli.ts          # cac setup: init / sync / check commands
  commands.ts     # init(), sync(), check() — the actual logic
  config.ts       # loadConfig(), defaults, config-file constants
  targets.ts      # TARGETS registry (id -> { label, outputPath, render })
  util.ts         # writeFileEnsured(), small fs helpers
tests/
  sync.test.ts    # vitest: init creates files, sync writes targets, check detects drift
.github/workflows/
  ci.yml          # install, build, test, and dogfood `onerule check`
AGENTS.md         # the repo dogfoods itself
README.md         # the landing page
LICENSE           # MIT
CONTRIBUTING.md
PROJECT.md        # this file
```

**Design principles**
- Pure functions where possible; all commands accept an optional `cwd` so they're unit-testable in temp dirs.
- No network, no LLM, minimal deps (`cac` for CLI parsing, `picocolors` for output).
- Adding a target = one object in `targets.ts`. That's the whole extensibility story for v0.1.

---

## 6. Roadmap

### v0.1 — MVP (now)
- [x] `init`, `sync`, `check`
- [x] 5 targets (Claude, Cursor, Copilot, Gemini, Windsurf)
- [x] `onerule.json` config
- [x] Tests + CI + dogfooding
- [ ] Polished README with demo GIF

### v0.2 — adoption
- [ ] **GitHub Action** (`onerule-action`) that runs `check` on PRs and can auto-commit `sync`.
- [ ] **Managed-block mode** — inject rules between markers so hand-written sections of `CLAUDE.md` are preserved.
- [ ] `--write`/`--check` flags, `--target` filter, `--dry-run`.
- [ ] More targets: Codex, Cline, Aider, Zed, JetBrains AI, `.cursorrules` legacy.
- [ ] Watch mode: `onerule sync --watch`.

### v0.3 — ecosystem
- [ ] **MCP config sync** — keep MCP server definitions consistent across `.mcp.json`, Cursor, Claude Desktop.
- [ ] **Sections/partials** — split `AGENTS.md` into includable fragments.
- [ ] **Template registry** — community `AGENTS.md` starters for Next.js, FastAPI, Django, Go, Rust, monorepos.
- [ ] VS Code extension (status bar: "in sync / drifted").

---

## 7. Distribution & launch plan

### Packaging
- Published to **NPM** as `onerule` (verify availability with `npm view onerule` before publishing; fallbacks: `agent-sync`, `agentsmd`, `syncagents`).
- Runnable with zero install via `npx onerule`.

### Launch checklist
- [ ] README first screen answers: *what / why / how-fast-to-try / is-it-safe.*
- [ ] 45-second demo GIF (edit `AGENTS.md` → run `sync` → 5 files light up green).
- [ ] Example `AGENTS.md` outputs for 3–5 well-known repos.
- [ ] Blog post: "Stop maintaining 5 AI rules files — use one `AGENTS.md`."
- [ ] GitHub topics: `ai`, `cli`, `developer-tools`, `claude-code`, `cursor`, `copilot`, `gemini`, `agents-md`, `mcp`, `typescript`.
- [ ] Good-first-issues labelled (each = "add a target").

### Channels
- **Show HN:** "Show HN: Write your AI coding rules once, sync to every agent"
- **Reddit:** r/ClaudeAI, r/cursor, r/ChatGPTCoding, r/programming, r/opensource
- **Dev.to / Hashnode** tutorial
- **X / LinkedIn** demo clip
- Claude Code / Cursor / Codex communities (genuine participation, no spam)

### Star math (from the research, kept honest)
- 5,000 stars ≈ top ~0.1% of repos. Stars arrive as a **launch spike + sustained momentum**, not a steady daily drip.
- Plan: land a strong launch (target a few hundred → low thousands if the demo connects), then ship weekly for 8 weeks, reply to every issue, add the targets people request.
- This is hard and partly luck-dependent. We build it to be genuinely useful **regardless** of the star count.

---

## 8. Success metrics
- ⭐ GitHub stars (north-star for the program goal).
- 📦 NPM weekly downloads (the alternate qualification path: 1M/month).
- 🔁 Repos with `onerule check` in CI (true retention signal).
- 🧩 Number of supported targets (community-driven growth).
- 🐛 Issue response time (signals active maintenance — required for the OSS program).

---

## 9. Open questions / decisions to revisit
- Final package name (pending NPM availability check).
- Default for `CLAUDE.md`: full-file generation (v0.1, simple) vs. managed-block injection (v0.2, preserves hand-written content). Start simple, document the trade-off.
- Whether to support multiple source files / includes in v0.1 (decision: **no**, keep MVP tiny).