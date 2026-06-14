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

  it("block mode preserves hand-written content outside the markers", () => {
    writeFileSync(join(dir, "AGENTS.md"), "# Rules\n\nUse TypeScript.");
    // A CLAUDE.md the developer wrote by hand, with no OneRule markers yet.
    writeFileSync(join(dir, "CLAUDE.md"), "# My hand-written notes\n\nKeep me!");

    sync(dir); // default mode is "block"

    const out = readFileSync(join(dir, "CLAUDE.md"), "utf8");
    expect(out).toContain("Keep me!"); // hand-written content survives
    expect(out).toContain("Use TypeScript."); // synced content is added
    expect(out).toContain("<!-- onerule:start");
    expect(out).toContain("<!-- onerule:end -->");
  });

  it("block mode updates only the managed block, leaving notes intact", () => {
    writeFileSync(join(dir, "CLAUDE.md"), "# Notes\n\nKeep me!");
    writeFileSync(join(dir, "AGENTS.md"), "# Rules\n\nUse TypeScript.");
    sync(dir);

    writeFileSync(join(dir, "AGENTS.md"), "# Rules\n\nUse Rust.");
    sync(dir);

    const out = readFileSync(join(dir, "CLAUDE.md"), "utf8");
    expect(out).toContain("Keep me!");
    expect(out).toContain("Use Rust.");
    expect(out).not.toContain("Use TypeScript."); // old block content replaced
    // Exactly one managed block (no duplication on re-sync).
    expect(out.split("<!-- onerule:start").length - 1).toBe(1);
  });

  it("block mode is idempotent (check passes after sync)", () => {
    writeFileSync(join(dir, "CLAUDE.md"), "# Notes\n\nKeep me!");
    writeFileSync(join(dir, "AGENTS.md"), "# Rules\n\nUse TypeScript.");
    sync(dir);
    expect(check(dir)).toBe(0);
  });

  it("file mode overwrites the whole file", () => {
    writeFileSync(join(dir, "CLAUDE.md"), "# Hand-written\n\nClobber me.");
    writeFileSync(join(dir, "AGENTS.md"), "# Rules\n\nUse TypeScript.");
    sync(dir, "file");

    const out = readFileSync(join(dir, "CLAUDE.md"), "utf8");
    expect(out).not.toContain("Clobber me."); // whole file replaced
    expect(out).toContain("Use TypeScript.");
    expect(out).not.toContain("<!-- onerule:start"); // no markers in file mode
  });
});