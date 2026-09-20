import { EVENTS } from "./events.generated";
import { place } from "./physics";
import { artifactOf } from "./types";
import type { AgentEvent, Placed } from "./types";

// Per-event dwell time in frames @ 30fps. Big "reveal" events (user message,
// final assistant reply, skill load, subagent spawn) get longer holds so the
// audience has time to read. Mechanical/repetitive events (request_sent,
// usage_meter) flow fast so the loop's rhythm comes through.
function dwellFor(type: string): number {
  switch (type) {
    case "user_message":
      return 210; // 7s
    case "assistant_text":
      return 240; // 8s — there's prose to read
    case "instructions_assembled":
      return 195; // 6.5s
    case "compaction":
      return 180;
    case "request_sent":
      return 95;
    case "response_received":
      return 110;
    case "tool_call_decided":
      return 95;
    case "permission_check":
      return 80;
    case "tool_result":
      return 140;
    case "skill_listed":
      return 120;
    case "skill_loaded":
      return 165;
    case "subagent_spawned":
      return 165;
    case "subagent_finished":
      return 150;
    case "truncation":
      return 95;
    case "stop_reason":
      return 105;
    case "usage_meter":
      return 75;
    default:
      return 95;
  }
}

// Pre-bake the deterministic layout. We run the live physics once over the
// recording, producing a Placed[] in event order. Skipped events (no visual)
// drop out here.
export const PLACED: Placed[] = (() => {
  const out: Placed[] = [];
  const map = new Map<string, Placed>();
  for (const ev of EVENTS) {
    if (artifactOf(ev.type) === "skip") continue;
    const p = place(ev, map, EVENTS);
    if (p) {
      out.push(p);
      map.set(p.id, p);
    }
  }
  return out;
})();

// Build a frame schedule. Each visible event gets a window [start, end) and
// becomes the "current focus" while frame ∈ [start, end). The wall accumulates
// — past events stay visible at their placement.
export type Step = {
  event: Placed;
  start: number;
  end: number;
};

const TITLE_FRAMES = 150; // 5s title card
const OUTRO_FRAMES = 180; // 6s outro (slow pull-back)
const WALL_HOLD_FRAMES = 240; // 8s static look at the finished wall before outro

export const STEPS: Step[] = (() => {
  let t = TITLE_FRAMES;
  const out: Step[] = [];
  for (const ev of PLACED) {
    const dwell = dwellFor(ev.type);
    out.push({ event: ev, start: t, end: t + dwell });
    t += dwell;
  }
  return out;
})();

export const STEPS_END_FRAME =
  STEPS.length > 0 ? STEPS[STEPS.length - 1].end : TITLE_FRAMES;

export const WALL_HOLD_START = STEPS_END_FRAME;
export const WALL_HOLD_END = WALL_HOLD_START + WALL_HOLD_FRAMES;
export const OUTRO_START = WALL_HOLD_END;
export const PLAYBACK_TOTAL_FRAMES = OUTRO_START + OUTRO_FRAMES;

export const TITLE_START = 0;
export const TITLE_END = TITLE_FRAMES;

// Locate the current step at a given frame (binary search ok at this scale).
export function currentStepAt(frame: number): Step | null {
  for (const s of STEPS) {
    if (frame >= s.start && frame < s.end) return s;
  }
  return null;
}
