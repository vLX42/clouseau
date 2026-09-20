#!/usr/bin/env node
// Reads frontend/public/demo.jsonl and emits a TypeScript module containing
// the recorded events as a typed const. Remotion can't read JSONL at runtime,
// so we bake the events into the bundle at build time.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, "../../frontend/public/demo.jsonl");
const OUT = resolve(here, "../src/playback/events.generated.ts");

const txt = await readFile(SRC, "utf8");
const events = txt
  .split("\n")
  .filter((l) => l.trim())
  .map((l) => JSON.parse(l));

const body = `// AUTO-GENERATED — do not edit. Regenerate via \`node scripts/build-events.mjs\`.
// Source: frontend/public/demo.jsonl (${events.length} events).
import type { AgentEvent } from "./types";

export const EVENTS: AgentEvent[] = ${JSON.stringify(events, null, 2)};
`;

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, body, "utf8");
console.log(`wrote ${events.length} events to ${OUT}`);
