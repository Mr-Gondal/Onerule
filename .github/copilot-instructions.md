<!-- onerule:start — synced from AGENTS.md by `onerule sync`. Edit AGENTS.md, not this block. Anything outside the markers is preserved. -->

# AGENTS.md

> Single source of truth for AI coding agents working on **OneRule**.
> Edit this file, then run `npm run dev -- sync` (or `onerule sync`).

## Project overview
OneRule is a small, local-first TypeScript CLI that reads one `AGENTS.md` and
generates the rules files that Claude Code, Cursor, Copilot, Gemini, and
Windsurf each expect. It calls no LLM and makes no network requests.

## Setup
- Install: `npm install`
- Run from source: `npm run dev -- <command>`
- Test: `npm test`
- Build: `npm run build`

## Conventions
- TypeScript, ESM, Node >= 18. Use `.js` extensions in relative imports.
- Keep dependencies minimal; the CLI must stay offline and local-first.
- Every command accepts an optional `cwd` so it is unit-testable in temp dirs.
- Prefer small pure functions; side effects (fs writes) live in `util.ts`.

## Adding a target
A new agent = one entry in `src/targets.ts` (`id`, `label`, `outputPath`,
`render`). Add it to defaults in `src/config.ts` if it should be on by default,
and add a README row.

## Do / Don't
- Do: add a test in `tests/` for behaviour changes.
- Do: keep generated-file banners so users know to edit AGENTS.md instead.
- Don't: add network calls, telemetry, or LLM dependencies.
- Don't: commit `dist/` or `node_modules/`.

<!-- onerule:end -->
