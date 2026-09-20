import type { AgentEvent } from "./types";

type Handler = (e: AgentEvent) => void;

// Demo mode: replay a real captured session from /demos/*.jsonl with the
// original inter-event timing (capped so the audience isn't waiting on
// 30-second LLM stalls).
//
// How the app decides between live and replay:
//   ?demo=1            force replay (the "API is down" button in the talk)
//   ?demo=0            force live
//   VITE_DEMO_MODE=1   build-time default for static deploys
//   otherwise          probe GET /health. No server, or a server without an
//                      OPENAI_API_KEY, means replay-only. That is what a
//                      public deploy runs on: nobody can spend your tokens.
export type Mode = "live" | "demo";
export type DemoReason = "forced" | "build" | "no-server" | "no-key" | null;

function urlDemoFlag(): "1" | "0" | null {
  if (typeof window === "undefined") return null;
  const v = new URL(window.location.href).searchParams.get("demo");
  if (v === "1" || v === "true") return "1";
  if (v === "0") return "0";
  return null;
}

// Synchronous best guess, used before the health probe resolves and by
// resetSession(). Stays true for forced/build demo; the probe may flip the
// app into demo later.
export function isDemoMode(): boolean {
  const f = urlDemoFlag();
  if (f === "1") return true;
  if (f === "0") return false;
  // @ts-ignore — vite injects this
  return import.meta.env?.VITE_DEMO_MODE === "1";
}

export async function detectMode(): Promise<{ mode: Mode; reason: DemoReason }> {
  const f = urlDemoFlag();
  if (f === "1") return { mode: "demo", reason: "forced" };
  if (f !== "0" && isDemoMode()) return { mode: "demo", reason: "build" };
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 2500);
    const res = await fetch("/health", { cache: "no-cache", signal: ctl.signal });
    clearTimeout(t);
    if (!res.ok) return { mode: "demo", reason: "no-server" };
    // A static host with an SPA fallback answers /health with index.html.
    if (!(res.headers.get("content-type") || "").includes("json")) {
      return { mode: "demo", reason: "no-server" };
    }
    const j = (await res.json()) as { ok?: boolean; apiKey?: boolean };
    if (!j.ok) return { mode: "demo", reason: "no-server" };
    if (j.apiKey === false) return { mode: "demo", reason: "no-key" };
    return { mode: "live", reason: null };
  } catch {
    return { mode: "demo", reason: "no-server" };
  }
}

export type Recording = { id: string; label: string; file: string; prompt?: string };

const MIN_GAP_MS = 60;
const MAX_GAP_MS = 1100;

async function loadJsonl(file: string): Promise<AgentEvent[]> {
  const res = await fetch(file, { cache: "no-cache" });
  if (!res.ok) throw new Error(`recording missing: ${file} (HTTP ${res.status})`);
  const text = await res.text();
  return text
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as AgentEvent);
}

// The manifest lists the recordings; each one's first user_message is
// pulled out so the chat panel can show what was actually asked.
export async function loadRecordings(): Promise<Recording[]> {
  const res = await fetch("/demos/index.json", { cache: "no-cache" });
  if (!res.ok) throw new Error(`demos/index.json missing: HTTP ${res.status}`);
  const list = (await res.json()) as Recording[];
  return Promise.all(
    list.map(async (r) => {
      try {
        const evs = await loadJsonl(r.file);
        const u = evs.find((e) => e.type === "user_message");
        return { ...r, prompt: (u?.payload?.text as string) ?? undefined };
      } catch {
        return r;
      }
    }),
  );
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function replayRecording(
  file: string,
  onEvent: Handler,
  onDone: () => void,
  onError: (m: string) => void,
) {
  let events: AgentEvent[];
  try {
    events = await loadJsonl(file);
  } catch (err: any) {
    onError(err?.message || "failed to load demo recording");
    return;
  }
  if (events.length === 0) {
    onError("demo recording is empty");
    return;
  }

  const base = events[0].timestamp;
  let prev = 0;
  for (const ev of events) {
    const dueOffset = (ev.timestamp || base) - base;
    const gap = Math.max(MIN_GAP_MS, Math.min(MAX_GAP_MS, dueOffset - prev));
    await sleep(gap);
    prev = dueOffset;
    onEvent(ev);
  }
  onDone();
}

export async function resetSession(sessionId: string): Promise<void> {
  if (isDemoMode()) return;
  try {
    await fetch("/reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
  } catch {}
}

export async function runPrompt(
  prompt: string,
  sessionId: string,
  onEvent: Handler,
  onDone: () => void,
  onError: (m: string) => void,
  replayFile?: string,
) {
  if (replayFile) {
    await replayRecording(replayFile, onEvent, onDone, onError);
    return;
  }

  let res: Response;
  try {
    res = await fetch("/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt, sessionId }),
    });
  } catch (err: any) {
    onError(err?.message || "network error");
    return;
  }
  if (!res.body) {
    onError("no stream body");
    return;
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    // SSE messages separated by blank line
    let idx: number;
    while ((idx = buf.indexOf("\n\n")) >= 0) {
      const chunk = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      let data = "";
      for (const line of chunk.split("\n")) {
        if (line.startsWith("data:")) data += line.slice(5).trimStart();
      }
      if (!data) continue;
      try {
        const ev = JSON.parse(data) as AgentEvent;
        onEvent(ev);
      } catch (err) {
        console.warn("parse fail", err, data);
      }
    }
  }
  onDone();
}
