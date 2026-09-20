import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  PLACED,
  STEPS,
  TITLE_END,
  WALL_HOLD_START,
  OUTRO_START,
  PLAYBACK_TOTAL_FRAMES,
} from "./timeline";
import type { Placed } from "./types";
import { artifactOf } from "./types";
import Card from "./artifacts/Card";
import Polaroid from "./artifacts/Polaroid";
import Stamp from "./artifacts/Stamp";
import StickyNote from "./artifacts/StickyNote";
import SkillEnvelope from "./artifacts/SkillEnvelope";
import Pin from "./artifacts/Pin";

// Pick the artifact renderer for an event — mirrors the live app's
// renderArtifact(). Each component takes `ev: Placed` and a static
// `expanded={false}` for playback (we render the un-hovered view).
function renderArtifact(ev: Placed) {
  const cat = artifactOf(ev.type);
  if (cat === "card") return <Card ev={ev} expanded={false} />;
  if (cat === "polaroid") return <Polaroid ev={ev} expanded={false} />;
  if (cat === "stamp") return <Stamp ev={ev} expanded={false} />;
  if (cat === "sticky") return <StickyNote ev={ev} expanded={false} />;
  if (cat === "envelope") return <SkillEnvelope ev={ev} expanded={false} />;
  return null;
}

// =====================================================================
// CAMERA
//
// Phases:
//   0..TITLE_END        — held wide, centered on the area where the first
//                          artifact will land (so the wall feels staged)
//   STEPS               — tracks each step's artifact: zoom in, pan, hold
//   WALL_HOLD           — static pull-back showing the full wall
//   OUTRO               — slow ken-burns over the full wall
// =====================================================================

function visibleAt(frame: number): { placed: Placed[]; latestId: string | null } {
  // Find the latest step whose start <= frame. Everything up to and
  // including that step is visible. During the title we show nothing.
  if (frame < TITLE_END) return { placed: [], latestId: null };
  let cutoff = -1;
  for (let i = 0; i < STEPS.length; i++) {
    if (STEPS[i].start <= frame) cutoff = i;
    else break;
  }
  if (cutoff < 0) return { placed: [], latestId: null };
  return { placed: PLACED.slice(0, cutoff + 1), latestId: PLACED[cutoff].id };
}

// Bounds of the *entire* wall layout (used for the final pull-back).
function wallBounds() {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of PLACED) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x + p.w > maxX) maxX = p.x + p.w;
    if (p.y + p.h > maxY) maxY = p.y + p.h;
  }
  return { minX, minY, maxX, maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, w: maxX - minX, h: maxY - minY };
}

const VIEWPORT_W = 1920;
const VIEWPORT_H = 1080;

function camForStep(latest: Placed) {
  // Center the camera ~1/3 in from the right so the previous events stay
  // visible on the left as context.
  const focusX = latest.x + latest.w / 2;
  const focusY = latest.y + latest.h / 2;
  // Zoom: 1.05× for "close" view, gives ~1820×1030 visible — perfect for HD.
  return { x: focusX - 280, y: focusY, zoom: 1.05 };
}

function camForBounds(b: ReturnType<typeof wallBounds>) {
  const margin = 240;
  const totalW = b.w + margin * 2;
  const totalH = b.h + margin * 2;
  const zoomFit = Math.min(VIEWPORT_W / totalW, VIEWPORT_H / totalH);
  return { x: b.cx, y: b.cy, zoom: zoomFit };
}

function cameraAt(frame: number) {
  const bounds = wallBounds();

  // Title — wide on first-event area
  if (frame < TITLE_END) {
    const first = PLACED[0];
    const target = first
      ? { x: first.x + first.w / 2 + 220, y: first.y + first.h / 2, zoom: 0.95 }
      : camForBounds(bounds);
    return target;
  }

  // Outro — slow ken-burns over the fitted wall
  if (frame >= OUTRO_START) {
    const fit = camForBounds(bounds);
    const local = frame - OUTRO_START;
    const z = fit.zoom + interpolate(local, [0, PLAYBACK_TOTAL_FRAMES - OUTRO_START], [0, 0.05]);
    return { x: fit.x, y: fit.y, zoom: z };
  }

  // Wall hold — fitted full wall
  if (frame >= WALL_HOLD_START) {
    return camForBounds(bounds);
  }

  // Step phase — find the active step, tween between previous step's camera
  // and current step's camera with a spring.
  // (We compute the previous step's center so transitions ease.)
  let activeIdx = -1;
  for (let i = 0; i < STEPS.length; i++) {
    if (STEPS[i].start <= frame) activeIdx = i;
    else break;
  }
  if (activeIdx < 0) return camForBounds(bounds);
  const active = STEPS[activeIdx];
  const prev = activeIdx > 0 ? STEPS[activeIdx - 1] : active;
  const localFrame = frame - active.start;

  const camA = camForStep(prev.event);
  const camB = camForStep(active.event);
  // Spring the camera handoff over ~26 frames at each step boundary.
  const fps = 30;
  const ease = spring({
    frame: localFrame,
    fps,
    config: { damping: 24, stiffness: 90 },
    durationInFrames: 30,
  });
  const x = interpolate(ease, [0, 1], [camA.x, camB.x]);
  const y = interpolate(ease, [0, 1], [camA.y, camB.y]);
  const z = interpolate(ease, [0, 1], [camA.zoom, camB.zoom]);

  // Subtle ken burns inside the step so it doesn't feel frozen.
  const dwell = active.end - active.start;
  const beatProg = (frame - active.start) / Math.max(1, dwell);
  const drift = Math.sin(beatProg * Math.PI) * 12;
  return { x: x + drift * 0.5, y, zoom: z };
}

// =====================================================================
// WIRES
// Connect parent→child as red string. Drawn behind artifacts.
// =====================================================================
function wirePath(parent: Placed, child: Placed): string {
  const px = parent.x + parent.w / 2;
  const py = parent.y;          // top-center pin
  const cx = child.x + child.w / 2;
  const cy = child.y;
  // Slight downward sag — gravity look
  const midX = (px + cx) / 2;
  const midY = Math.max(py, cy) + 38;
  return `M ${px} ${py} Q ${midX} ${midY} ${cx} ${cy}`;
}

// =====================================================================
// MAIN
// =====================================================================
export const PlaybackWall: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { placed, latestId } = visibleAt(frame);
  const cam = cameraAt(frame);

  // Map id → Placed (for wire lookups)
  const byId = new Map<string, Placed>();
  for (const p of PLACED) byId.set(p.id, p);

  // Pin coordinates for the wire layer
  const bounds = wallBounds();
  const SVG_PAD = 600;
  const svgX = bounds.minX - SVG_PAD;
  const svgY = bounds.minY - SVG_PAD;
  const svgW = bounds.w + SVG_PAD * 2;
  const svgH = bounds.h + SVG_PAD * 2;

  const cx = VIEWPORT_W / 2;
  const cy = VIEWPORT_H / 2;
  const transform = `translate(${cx - cam.x * cam.zoom}px, ${cy - cam.y * cam.zoom}px) scale(${cam.zoom})`;

  return (
    <AbsoluteFill
      style={{
        background:
          "repeating-linear-gradient(45deg, transparent 0 22px, rgba(120,90,60,0.06) 22px 24px), var(--paper-dim)",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform }}>
          {/* WIRES layer */}
          <svg
            width={svgW}
            height={svgH}
            viewBox={`${svgX} ${svgY} ${svgW} ${svgH}`}
            style={{ position: "absolute", left: svgX, top: svgY, pointerEvents: "none" }}
          >
            <defs>
              <filter id="jute" x="-5%" y="-5%" width="110%" height="110%">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n1" />
                <feDisplacementMap in="SourceGraphic" in2="n1" scale="3.2" />
              </filter>
            </defs>
            {placed.flatMap((child) =>
              child.parentIds
                .map((pid) => {
                  const parent = byId.get(pid);
                  if (!parent || !placed.some((p) => p.id === parent.id)) return null;
                  const isToolReturn = parent.type === "tool_result" && child.type === "response_received";
                  return (
                    <path
                      key={`${pid}->${child.id}`}
                      d={wirePath(parent, child)}
                      fill="none"
                      stroke="var(--string)"
                      strokeWidth={isToolReturn ? 2.4 : 1.7}
                      opacity={isToolReturn ? 0.95 : 0.7}
                      strokeLinecap="round"
                      filter="url(#jute)"
                    />
                  );
                })
                .filter(Boolean),
            )}
          </svg>

          {/* ARTIFACTS — drawn in placement order */}
          {placed.map((ev) => {
            // Entry animation: when this is the latest artifact, scale-in & fall
            const isLatest = ev.id === latestId;
            // Compute frames since the artifact appeared, using the matching
            // step start. We linear-search the steps — fine at this scale.
            const step = STEPS.find((s) => s.event.id === ev.id);
            const localFrame = step ? frame - step.start : 9999;
            const enterS = spring({
              frame: localFrame,
              fps,
              config: { damping: 14, stiffness: 220 },
              durationInFrames: 28,
            });
            const dy = interpolate(enterS, [0, 1], [-50, 0]);
            // Subagent-tagged events get a blue/desaturated treatment
            const isSub = !!ev.subagent;
            return (
              <div
                key={ev.id}
                style={{
                  position: "absolute",
                  left: ev.x,
                  top: ev.y,
                  width: ev.w,
                  transform: `translateY(${dy}px) rotate(${ev.rot}deg)`,
                  transformOrigin: "top center",
                  opacity: enterS,
                  filter: isSub ? "saturate(0.6) hue-rotate(180deg) brightness(0.95)" : undefined,
                }}
              >
                {isSub && (
                  <div
                    style={{
                      position: "absolute",
                      top: -22,
                      left: 0,
                      fontFamily: "Roboto Slab, serif",
                      fontSize: 11,
                      letterSpacing: 1.6,
                      color: "#1f3d6e",
                      background: "rgba(244,237,224,0.85)",
                      padding: "1px 6px",
                      border: "1px dashed #1f3d6e",
                      pointerEvents: "none",
                    }}
                  >
                    {ev.subagent!.id}
                  </div>
                )}
                {renderArtifact(ev)}
                <Pin />
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
