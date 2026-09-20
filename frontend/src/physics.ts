import type { Placed, AgentEvent } from "./types";
import { sizeOf, artifactOf } from "./types";

// Stable per-id hash → [-1, 1)
function jitter(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) / 0xffffffff) * 2 - 1;
}

export function rotationFor(id: string): number {
  return jitter(id + "rot") * 15; // ±15°
}

const PAD = 16;
const STEP = 8;
const STRIDE_X = 130;
const ZIG_Y = 110;
// Subagents drop into their own lane so the side-trip is spatially obvious.
const SUBAGENT_LANE_Y = 380;

function overlaps(a: Placed, x: number, y: number, w: number, h: number): boolean {
  return (
    x < a.x + a.w + PAD &&
    x + w + PAD > a.x &&
    y < a.y + a.h + PAD &&
    y + h + PAD > a.y
  );
}

export function place(
  ev: AgentEvent,
  placed: Map<string, Placed>,
  history: AgentEvent[] = [],
): Placed | null {
  if (artifactOf(ev.type) === "skip") return null;
  const [w, h] = sizeOf(ev.type);

  // Compaction: hover over the centroid of the range it is summarizing.
  let parents: Placed[];
  if (ev.type === "compaction") {
    const range: Placed[] = [];
    for (let i = history.length - 1; i >= 0; i--) {
      const e = history[i];
      if (e === ev) continue;
      if (e.type === "user_message") break;
      const p = placed.get(e.id);
      if (p) range.push(p);
    }
    parents = range.length
      ? range
      : (ev.parentIds.map((p) => placed.get(p)).filter(Boolean) as Placed[]);
  } else {
    parents = ev.parentIds.map((p) => placed.get(p)).filter(Boolean) as Placed[];
  }

  // Right-flowing zigzag: each new node lands to the right of its parent
  // centroid; vertical offset alternates above/below the parent centerline.
  // Subagent nodes get pushed into a lane below the main flow so the
  // "side trip" is geometrically obvious.
  const isSub = !!ev.subagent;
  let sx = 0;
  let sy = isSub ? SUBAGENT_LANE_Y : 0;
  if (parents.length) {
    const pcx = parents.reduce((s, p) => s + p.x + p.w / 2, 0) / parents.length;
    const pcy = parents.reduce((s, p) => s + p.y + p.h / 2, 0) / parents.length;
    sx = pcx + STRIDE_X - w / 2;
    const parentIsSub = parents.some((p) => p.subagent);
    const idx = history.findIndex((e) => e.id === ev.id);
    const dir = idx >= 0 && idx % 2 === 0 ? 1 : -1;
    if (isSub) {
      // Subagent event — stay in the lane.
      sy = parentIsSub ? pcy + dir * 40 - h / 2 : SUBAGENT_LANE_Y;
    } else if (parentIsSub) {
      // Main event whose causal parent is in the subagent lane —
      // this is the "report-back" moment (subagent_finished and the
      // tool_result polaroid). Drag it back UP to the main row so the
      // wire arcs visibly from the lane back to the main flow.
      sy = dir * 30 - h / 2;
    } else {
      sy = pcy + dir * ZIG_Y - h / 2;
    }
  }

  // Seeded micro-jitter so siblings don't perfectly overlap
  sx += jitter(ev.id) * 24;
  sy += jitter(ev.id + "y") * 18;

  let x = Math.round(sx);
  let y = Math.round(sy);

  // Sweep right until clear of any placed node.
  for (let step = 0; step < 1500; step++) {
    let hit = false;
    for (const a of placed.values()) {
      if (overlaps(a, x, y, w, h)) {
        hit = true;
        break;
      }
    }
    if (!hit) break;
    x += STEP;
  }

  return { ...ev, x, y, w, h, rot: rotationFor(ev.id) };
}
