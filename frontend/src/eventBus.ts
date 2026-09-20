import type { AgentEvent } from "./types";

type Handler = (e: AgentEvent) => void;

// Demo mode: replay a real captured session from /demo.jsonl with the
// original inter-event timing (capped so the audience isn't waiting on
// 30-second LLM stalls). Set VITE_DEMO_MODE=1 at build time, OR append
// ?demo=1 to the URL to flip into replay without rebuilding.
export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  const fromUrl = new URL(window.location.href).searchParams.get("demo");
  if (fromUrl === "1" || fromUrl === "true") return true;
  if (fromUrl === "0") return false;
  // @ts-ignore — vite injects this
  return import.meta.env?.VITE_DEMO_MODE === "1";
}

const MIN_GAP_MS = 60;
const MAX_GAP_MS = 1100;

async function loadRecording(): Promise<AgentEvent[]> {
  const res = await fetch("/demo.jsonl", { cache: "no-cache" });
  if (!res.ok) throw new Error(`demo recording missing: HTTP ${res.status}`);
  const text = await res.text();
  return text
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as AgentEvent);
}

// Pull the first user_message text out of the recording so the chat panel
// can show what was actually asked.
export async function loadDemoPrompt(): Promise<string | null> {
  try {
    const evs = await loadRecording();
    const u = evs.find((e) => e.type === "user_message");
    return (u?.payload?.text as string) ?? null;
  } catch {
    return null;
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function replayRecording(
  onEvent: Handler,
  onDone: () => void,
  onError: (m: string) => void,
) {
  let events: AgentEvent[];
  try {
    events = await loadRecording();
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
) {
  if (isDemoMode()) {
    await replayRecording(onEvent, onDone, onError);
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
