import { useEffect, useMemo, useRef, useState } from "react";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import type { Placed, AgentEvent } from "./types";
import { artifactOf } from "./types";
import { wirePath } from "./Wire";
import Card from "./Card";
import Polaroid from "./Polaroid";
import Stamp from "./Stamp";
import StickyNote from "./StickyNote";
import SkillEnvelope from "./SkillEnvelope";
import Pin from "./Pin";
import Minimap from "./Minimap";
import GridView from "./GridView";
import TokenTicker from "./TokenTicker";
import FileCabinet from "./FileCabinet";

type Props = {
  nodes: Placed[];
  events: AgentEvent[];
  autoFollow: boolean;
  onToggleAutoFollow: () => void;
};

type View = "wall" | "grid";

function renderArtifact(ev: Placed, expanded: boolean) {
  const cat = artifactOf(ev.type);
  if (cat === "card") return <Card ev={ev} expanded={expanded} />;
  if (cat === "polaroid") return <Polaroid ev={ev} expanded={expanded} />;
  if (cat === "stamp") return <Stamp ev={ev} expanded={expanded} />;
  if (cat === "sticky") return <StickyNote ev={ev} expanded={expanded} />;
  if (cat === "envelope") return <SkillEnvelope ev={ev} expanded={expanded} />;
  return null;
}

function isRedWire(parent: AgentEvent | undefined, child: AgentEvent): boolean {
  return !!parent && parent.type === "tool_result" && child.type === "response_received";
}

function isCompactionLink(parent: Placed, child: Placed): boolean {
  return child.type === "compaction";
}

// Inner wall content with access to TransformWrapper controls
function Inner({
  nodes,
  events,
  autoFollow,
  onToggleAutoFollow,
  containerSize,
}: Props & { containerSize: { w: number; h: number } }) {
  const { setTransform, instance } = useControls();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [hovered, setHovered] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const lastFollowedRef = useRef<string | null>(null);

  const byId = useMemo(() => {
    const m = new Map<string, Placed>();
    for (const n of nodes) m.set(n.id, n);
    return m;
  }, [nodes]);

  const eventById = useMemo(() => {
    const m = new Map<string, AgentEvent>();
    for (const e of events) m.set(e.id, e);
    return m;
  }, [events]);

  // Compaction: dim originals (everything between previous user_message and the compaction event)
  const dimmed = useMemo(() => {
    const out = new Set<string>();
    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      if (e.type !== "compaction") continue;
      // walk backwards until a user_message
      for (let j = i - 1; j >= 0; j--) {
        const k = events[j];
        if (k.type === "user_message") break;
        out.add(k.id);
      }
    }
    return out;
  }, [events]);

  // Lazy auto-follow on the newest node
  useEffect(() => {
    if (!autoFollow || nodes.length === 0) return;
    const latest = nodes[nodes.length - 1];
    if (lastFollowedRef.current === latest.id) return;
    const state = instance.transformState;
    const z = state.scale || 1;
    const vw = containerSize.w / z;
    const vh = containerSize.h / z;
    const vx = -state.positionX / z;
    const vy = -state.positionY / z;
    const margin = 0.2;
    const onEdge =
      latest.x < vx + vw * margin ||
      latest.x + latest.w > vx + vw * (1 - margin) ||
      latest.y < vy + vh * margin ||
      latest.y + latest.h > vy + vh * (1 - margin);
    if (onEdge) {
      const cx = -((latest.x + latest.w / 2) * z - containerSize.w / 2);
      const cy = -((latest.y + latest.h / 2) * z - containerSize.h / 2);
      setTransform(cx, cy, z, 400, "easeOut");
    }
    lastFollowedRef.current = latest.id;
  }, [nodes, autoFollow, containerSize, setTransform, instance]);

  // Track transform changes so the minimap re-renders
  useEffect(() => {
    const onChange = () => setTick((t) => t + 1);
    const el: any = instance;
    // react-zoom-pan-pinch fires onTransformed via callback prop; we poll instead
    const id = setInterval(onChange, 200);
    return () => clearInterval(id);
  }, [instance]);

  const state = instance.transformState;
  const z = state.scale || 1;
  const vw = containerSize.w / z;
  const vh = containerSize.h / z;
  const viewport = {
    x: -state.positionX / z,
    y: -state.positionY / z,
    w: vw,
    h: vh,
  };

  const onJump = (px: number, py: number) => {
    const cx = -(px * z - containerSize.w / 2);
    const cy = -(py * z - containerSize.h / 2);
    setTransform(cx, cy, z, 350, "easeOut");
  };

  // Bounds for SVG sizing
  const bx = Math.min(0, ...nodes.map((n) => n.x)) - 200;
  const by = Math.min(0, ...nodes.map((n) => n.y)) - 200;
  const bw = Math.max(2000, ...nodes.map((n) => n.x + n.w)) + 400;
  const bh = Math.max(1400, ...nodes.map((n) => n.y + n.h)) + 400;

  // Per-turn dot data for scrubber
  const turns = useMemo(() => {
    const counts = new Map<number, number>();
    for (const e of events) counts.set(e.turn, (counts.get(e.turn) || 0) + 1);
    return [...counts.entries()].sort((a, b) => a[0] - b[0]);
  }, [events]);

  const scrubTo = (turn: number) => {
    const first = nodes.find((n) => n.turn === turn);
    if (first) onJump(first.x + first.w / 2, first.y + first.h / 2);
  };

  return (
    <>
      <div style={{ position: "absolute", top: 8, left: 8, zIndex: 5, display: "flex", gap: 8, fontSize: 11 }}>
        <button
          onClick={onToggleAutoFollow}
          style={{
            background: autoFollow ? "var(--accent)" : "transparent",
            color: autoFollow ? "var(--paper)" : "var(--accent)",
            border: "1px solid var(--accent)",
            padding: "3px 8px",
            fontSize: 10,
            letterSpacing: 1.2,
          }}
        >
          follow {autoFollow ? "on" : "off"}
        </button>
        <div style={{ opacity: 0.55 }}>nodes {nodes.length}</div>
      </div>

      {/* scrubber */}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 5,
          display: "flex",
          gap: 4,
          alignItems: "center",
          background: "rgba(244,237,224,0.85)",
          padding: "4px 8px",
          border: "1px solid var(--rule)",
        }}
      >
        <span style={{ fontSize: 9, letterSpacing: 1.2, color: "var(--accent)", marginRight: 4 }}>turns</span>
        {turns.map(([t, n]) => (
          <button
            key={t}
            title={`turn ${t} · ${n} events`}
            onClick={() => scrubTo(t)}
            style={{
              width: 12 + Math.min(n, 12),
              height: 10,
              border: "1px solid var(--accent)",
              background: `rgba(90,70,52,${Math.min(0.15 + n * 0.07, 0.9)})`,
              padding: 0,
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      <TransformComponent
        wrapperStyle={{ width: "100%", height: "100%" }}
        contentStyle={{ width: bw, height: bh }}
      >
        <div style={{ position: "relative", width: bw, height: bh }}>
          {/* wires layer */}
          <svg
            width={bw - bx}
            height={bh - by}
            viewBox={`${bx} ${by} ${bw - bx} ${bh - by}`}
            style={{ position: "absolute", top: by, left: bx, pointerEvents: "none" }}
          >
            <defs>
              <filter id="jute" x="-5%" y="-5%" width="110%" height="110%">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n1" />
                <feDisplacementMap in="SourceGraphic" in2="n1" scale="3.2" />
              </filter>
              <filter id="juteFiber" x="-5%" y="-5%" width="110%" height="110%">
                <feTurbulence type="fractalNoise" baseFrequency="3.5" numOctaves="2" seed="7" result="n2" />
                <feDisplacementMap in="SourceGraphic" in2="n2" scale="0.9" />
              </filter>
            </defs>
            {/* faint summary wires: compaction → each dimmed original */}
            {events
              .filter((e) => e.type === "compaction")
              .flatMap((cev) => {
                const cnode = byId.get(cev.id);
                if (!cnode) return [];
                const range: AgentEvent[] = [];
                const idx = events.indexOf(cev);
                for (let i = idx - 1; i >= 0; i--) {
                  if (events[i].type === "user_message") break;
                  range.push(events[i]);
                }
                return range
                  .map((o) => {
                    const onode = byId.get(o.id);
                    if (!onode) return null;
                    return (
                      <path
                        key={`comp-${cev.id}-${o.id}`}
                        d={wirePath(cnode, onode)}
                        fill="none"
                        stroke="var(--string)"
                        strokeWidth={1.2}
                        opacity={0.35}
                        strokeLinecap="round"
                        filter="url(#juteFiber)"
                      />
                    );
                  })
                  .filter(Boolean);
              })}
            {events.flatMap((child) =>
              child.parentIds
                .map((pid) => {
                  const parent = byId.get(pid);
                  if (!parent) return null;
                  const childPlaced = byId.get(child.id);
                  if (!childPlaced) return null;
                  const parentEv = eventById.get(pid);
                  const red = isRedWire(parentEv, child);
                  const fadedDueToCompaction =
                    isCompactionLink(parent, childPlaced) || dimmed.has(parent.id);
                  return (
                    <path
                      key={`${pid}->${child.id}`}
                      d={wirePath(parent, childPlaced)}
                      fill="none"
                      stroke="var(--string)"
                      strokeWidth={red ? 1.8 : 1.3}
                      opacity={fadedDueToCompaction ? 0.18 : red ? 0.95 : 0.7}
                      strokeLinecap="round"
                      filter={red ? "url(#jute)" : "url(#juteFiber)"}
                    />
                  );
                })
                .filter(Boolean),
            )}
          </svg>

          {/* nodes layer */}
          {nodes.map((n) => {
            const isExpanded = expanded.has(n.id);
            const isHover = hovered === n.id;
            const isDim = dimmed.has(n.id);
            const isSub = !!n.subagent;
            const subScale = isSub ? 0.85 : 1;
            return (
              <div
                key={n.id}
                onMouseEnter={() => setHovered(n.id)}
                onMouseLeave={() => setHovered((h) => (h === n.id ? null : h))}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded((prev) => {
                    const next = new Set(prev);
                    if (next.has(n.id)) next.delete(n.id);
                    else next.add(n.id);
                    return next;
                  });
                }}
                style={{
                  position: "absolute",
                  left: n.x,
                  top: n.y,
                  width: n.w,
                  transform: `rotate(${n.rot}deg) scale(${subScale}) ${
                    isHover && !isExpanded ? "translateY(-4px) scale(1.02)" : ""
                  }`,
                  transformOrigin: "top center",
                  transition: "transform 180ms ease, opacity 400ms ease",
                  zIndex: isHover || isExpanded ? 30 : isDim ? 1 : 10,
                  cursor: "pointer",
                  opacity: isDim && !isHover && !isExpanded ? 0.3 : 1,
                  filter: isSub
                    ? "saturate(0.55) hue-rotate(180deg) brightness(0.95)"
                    : undefined,
                  animation: "drop 420ms cubic-bezier(0.55,0.06,0.68,0.19)",
                }}
              >
                {isSub && (
                  <div
                    style={{
                      position: "absolute",
                      top: -22,
                      left: 0,
                      fontFamily: "Roboto Slab, serif",
                      fontSize: 9,
                      letterSpacing: 1.4,
                      color: "#1f3d6e",
                      background: "rgba(244,237,224,0.85)",
                      padding: "1px 5px",
                      border: "1px dashed #1f3d6e",
                      pointerEvents: "none",
                    }}
                  >
                    {n.subagent!.id}
                  </div>
                )}
                {renderArtifact(n, isExpanded || isHover)}
                <Pin />
              </div>
            );
          })}
        </div>
      </TransformComponent>

      <Minimap key={tick} nodes={nodes} viewport={viewport} onJump={onJump} />

      <style>{`
        @keyframes drop {
          0%   { translate: 0 -30px; opacity: 0; }
          70%  { opacity: 1; }
          100% { translate: 0 0; opacity: 1; }
        }
      `}</style>
    </>
  );
}

export default function Wall(props: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [view, setView] = useState<View>("wall");

  useEffect(() => {
    const measure = () => {
      if (!wrapRef.current) return;
      const r = wrapRef.current.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background:
          "repeating-linear-gradient(45deg, transparent 0 12px, rgba(120,90,60,0.04) 12px 13px), var(--paper-dim)",
        overflow: "hidden",
      }}
    >
      {/* View toggle — sits above whichever subview renders so the user can
          always flip between the visual wall and the raw event grid. */}
      <div
        style={{
          position: "absolute",
          top: 8,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 6,
          display: "flex",
          gap: 0,
          border: "1px solid var(--accent)",
          background: "var(--paper)",
        }}
      >
        {(["wall", "grid"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              background: view === v ? "var(--accent)" : "transparent",
              color: view === v ? "var(--paper)" : "var(--accent)",
              border: "none",
              padding: "3px 12px",
              fontSize: 10,
              letterSpacing: 1.4,
              cursor: "pointer",
              fontFamily: "Roboto Slab, serif",
              fontWeight: 700,
            }}
          >
            {v.toUpperCase()}
          </button>
        ))}
      </div>

      <TokenTicker events={props.events} />
      <FileCabinet events={props.events} />

      {view === "wall" ? (
        <TransformWrapper
          minScale={0.2}
          maxScale={3}
          initialScale={0.9}
          initialPositionX={size.w / 2 - 100}
          initialPositionY={80}
          limitToBounds={false}
          wheel={{ step: 0.08 }}
          doubleClick={{ disabled: true }}
          panning={{ velocityDisabled: true }}
        >
          <Inner {...props} containerSize={size} />
        </TransformWrapper>
      ) : (
        <GridView events={props.events} />
      )}
    </div>
  );
}
