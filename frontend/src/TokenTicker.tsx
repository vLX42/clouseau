import { useEffect, useRef, useState } from "react";
import type { AgentEvent } from "./types";

// Live token meter for the wall: big odometer-style IN/OUT totals summed from
// every event that carries API usage (main turns, subagent turns, compaction
// calls — they all burn tokens). When a single call takes a big bite, a comic
// hurt-word bursts off the meter. Zee tokens, zey 'urt.

const MILD = ["oof.", "aïe!", "ow!"];
const MEDIUM = ["OUCH!", "YOWCH!", "ZUT ALORS!"];
const SEVERE = ["SACREBLEU!!", "MON DIEU!!", "ÇA FAIT MAL!!"];

// Per-call token bite (prompt + completion) that earns a burst. Calibrated to
// the demo recording, where turns run ~800 → ~2500 tokens as context grows.
const T_MILD = 1200;
const T_MEDIUM = 2000;
const T_SEVERE = 3500;

function pick(words: string[]): string {
  return words[Math.floor(Math.random() * words.length)];
}

// Smoothly roll a displayed number toward its target, odometer-style.
function useCountUp(target: number, duration = 700): number {
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);
  useEffect(() => {
    const from = shownRef.current;
    if (from === target) return;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      const v = Math.round(from + (target - from) * eased);
      shownRef.current = v;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return shown;
}

type Burst = { id: number; word: string; right: number; top: number; rot: number; size: number };

function usageOf(ev: AgentEvent): { inTok: number; outTok: number } | null {
  const u = ev.payload?.usage;
  if (!u) return null;
  return { inTok: u.prompt_tokens || 0, outTok: u.completion_tokens || 0 };
}

export default function TokenTicker({ events }: { events: AgentEvent[] }) {
  // Grand totals across everything that hit the API.
  let totalIn = 0;
  let totalOut = 0;
  let rates: { inPerM: number; outPerM: number } | null = null;
  for (const ev of events) {
    const u = usageOf(ev);
    if (u) {
      totalIn += u.inTok;
      totalOut += u.outTok;
    }
    if (ev.type === "usage_meter" && ev.payload?.rates) rates = ev.payload.rates;
  }
  const cost = rates
    ? (totalIn * rates.inPerM + totalOut * rates.outPerM) / 1_000_000
    : null;

  const shownIn = useCountUp(totalIn);
  const shownOut = useCountUp(totalOut);

  // Comic bursts on big per-call bites.
  const processed = useRef(new Set<string>());
  const burstId = useRef(0);
  const [bursts, setBursts] = useState<Burst[]>([]);
  useEffect(() => {
    for (const ev of events) {
      const u = usageOf(ev);
      if (!u || processed.current.has(ev.id)) continue;
      processed.current.add(ev.id);
      const bite = u.inTok + u.outTok;
      const words =
        bite >= T_SEVERE ? SEVERE : bite >= T_MEDIUM ? MEDIUM : bite >= T_MILD ? MILD : null;
      if (!words) continue;
      const size = bite >= T_SEVERE ? 34 : bite >= T_MEDIUM ? 27 : 20;
      const id = ++burstId.current;
      const b: Burst = {
        id,
        word: pick(words),
        right: 150 + Math.random() * 130,
        top: 4 + Math.random() * 40,
        rot: -14 + Math.random() * 28,
        size,
      };
      setBursts((prev) => [...prev, b]);
      setTimeout(() => setBursts((prev) => prev.filter((x) => x.id !== id)), 1900);
    }
  }, [events]);

  return (
    <div
      style={{
        position: "absolute",
        top: 40,
        right: 8,
        zIndex: 6,
        background: "var(--paper)",
        border: "1px solid var(--rule)",
        boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
        padding: "6px 12px 8px",
        transform: "rotate(-0.6deg)",
        minWidth: 168,
        userSelect: "none",
      }}
    >
      <div
        style={{
          fontFamily: "Roboto Slab, serif",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 2,
          color: "var(--accent)",
          marginBottom: 2,
        }}
      >
        TOKEN METER
      </div>
      {(
        [
          ["IN", shownIn, totalIn],
          ["OUT", shownOut, totalOut],
        ] as const
      ).map(([label, shown, target]) => (
        <div
          key={label}
          style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}
        >
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 9,
              letterSpacing: 1.5,
              opacity: 0.6,
            }}
          >
            {label}
          </span>
          {/* key on target: re-runs the bump pop each time a new total lands */}
          <span
            key={target}
            style={{
              fontFamily: "Roboto Slab, serif",
              fontSize: 26,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              color: "#2a201a",
              lineHeight: 1.1,
              animation: target > 0 ? "ticker-bump 300ms ease-out" : undefined,
            }}
          >
            {shown.toLocaleString()}
          </span>
        </div>
      ))}
      <div
        style={{
          fontFamily: "Caveat, cursive",
          fontSize: 14,
          color: "var(--accent)",
          textAlign: "right",
          marginTop: 1,
        }}
      >
        {cost !== null ? `≈ $${cost.toFixed(cost < 0.01 ? 5 : 4)}` : " "}
      </div>

      {bursts.map((b) => (
        // outer div holds position + rotation; inner span runs the pop
        // animation so the keyframes' transform doesn't clobber the rotation
        <div
          key={b.id}
          style={{
            position: "absolute",
            top: b.top,
            right: b.right,
            transform: `rotate(${b.rot}deg)`,
            pointerEvents: "none",
            zIndex: 7,
          }}
        >
          <span
            style={{
              display: "inline-block",
              fontFamily: "Roboto Slab, serif",
              fontWeight: 700,
              fontStyle: "italic",
              fontSize: b.size,
              color: "var(--accent)",
              WebkitTextStroke: "1px #fef7c2",
              textShadow: "2px 3px 0 rgba(42,32,26,0.35)",
              whiteSpace: "nowrap",
              animation: "ticker-burst 1.9s ease-out forwards",
            }}
          >
            {b.word}
          </span>
        </div>
      ))}

      <style>{`
        @keyframes ticker-bump {
          0% { transform: scale(1); }
          35% { transform: scale(1.18); color: var(--accent); }
          100% { transform: scale(1); }
        }
        @keyframes ticker-burst {
          0%   { opacity: 0; transform: scale(0.3) rotate(0deg); }
          12%  { opacity: 1; transform: scale(1.25); }
          20%  { transform: scale(1); }
          75%  { opacity: 1; }
          100% { opacity: 0; transform: scale(1) translateY(-26px); }
        }
      `}</style>
    </div>
  );
}
