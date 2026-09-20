import "./env.ts";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { runAgent, resetSession } from "./agent.ts";
import type { Event } from "./events.ts";

// Records a real agent run to a JSONL file. The frontend bundles this file
// and replays it in demo mode — every event the audience sees is something
// the live agent actually emitted, just played back without burning tokens.
//
// Usage:
//   pnpm capture "Build a React TodoList component" frontend/public/demo.jsonl

const argv = process.argv.slice(2);
const PROMPT = argv[0];
// Default output: <repo-root>/frontend/public/demo.jsonl. WORKSPACE_ROOT
// points at the repo root (the directory containing CLAUDE.md), set by
// env.ts. Falling back to cwd lets the user override with an absolute path.
const REPO_ROOT = process.env.WORKSPACE_ROOT || resolve(process.cwd(), "..");
const OUT = argv[1] || resolve(REPO_ROOT, "frontend/public/demo.jsonl");

if (!PROMPT) {
  console.error('usage: pnpm capture "your prompt" [out.jsonl]');
  process.exit(1);
}

const sessionId = randomUUID();
const events: Event[] = [];

console.log(`[capture] session=${sessionId}`);
console.log(`[capture] prompt=${JSON.stringify(PROMPT)}`);

await runAgent(
  PROMPT,
  async (e) => {
    events.push(e);
    process.stdout.write(`.${events.length % 50 === 0 ? `\n` : ""}`);
  },
  sessionId,
);

process.stdout.write("\n");

const outAbs = resolve(process.cwd(), OUT);
await mkdir(dirname(outAbs), { recursive: true });
const lines = events.map((e) => JSON.stringify(e)).join("\n") + "\n";
await writeFile(outAbs, lines, "utf8");
console.log(`[capture] wrote ${events.length} events to ${outAbs}`);

// Tidy up: drop the in-memory session and its scratch dir.
resetSession(sessionId);
