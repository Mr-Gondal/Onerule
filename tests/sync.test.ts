import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { check, init, sync } from "../src/commands.js";

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "onerule-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("onerule", () => {
  it("init creates AGENTS.md and onerule.json", () => {
    init(dir);
    expect(existsSync(join(dir, "AGENTS.md"))).toBe(true);
    expect(existsSync(join(dir, "onerule.json"))).toBe(true);
  });

  it("sync generates target files containing the source body", () => {
    writeFileSync(join(dir, "AGENTS.md"), "# Rules\n\nUse TypeScript.");
    sync(dir);

    expect(readFileSync(join(dir, "CLAUDE.md"), "utf8")).toContain("Use TypeScript.");
    expect(existsSync(join(dir, ".github/copilot-instructions.md"))).toBe(true);
    expect(existsSync(join(dir, ".cursor/rules/onerule.mdc"))).toBe(true);
    expect(existsSync(join(dir, "GEMINI.md"))).toBe(true);
    expect(existsSync(join(dir, ".windsurfrules"))).toBe(true);
  });

  it("check returns 0 when in sync and 1 when drifted", () => {
    writeFileSync(join(dir, "AGENTS.md"), "# Rules\n\nUse TypeScript.");
    sync(dir);
    expect(check(dir)).toBe(0);

    // Change the source without re-syncing -> drift.
    writeFileSync(join(dir, "AGENTS.md"), "# Rules\n\nUse Rust.");
    expect(check(dir)).toBe(1);
  });

  it("check returns 1 when a target file is missing", () => {
    writeFileSync(join(dir, "AGENTS.md"), "# Rules\n\nUse TypeScript.");
    sync(dir);
    rmSync(join(dir, "CLAUDE.md"));
    expect(check(dir)).toBe(1);
  });
});