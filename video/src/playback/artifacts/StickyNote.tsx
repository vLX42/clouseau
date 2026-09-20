import type { Placed } from "../types";

function fmt(n: number | undefined): string {
  if (n === undefined || n === null) return "—";
  return n.toLocaleString();
}

function money(n: number | undefined): string {
  if (n === undefined || n === null) return "—";
  // Show enough digits to see sub-cent costs but not pixel dust.
  return `$${n.toFixed(n < 0.01 ? 5 : 4)}`;
}

export default function StickyNote({ ev, expanded }: { ev: Placed; expanded: boolean }) {
  const p = ev.payload || {};
  const turn = p.turn || {};
  const total = p.total || {};
  return (
    <div
      style={{
        width: ev.w,
        minHeight: ev.h,
        background: "#fef7c2",
        padding: 8,
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 9,
        lineHeight: 1.3,
        boxShadow: expanded
          ? "0 6px 14px rgba(0,0,0,0.25)"
          : "0 4px 10px rgba(0,0,0,0.15)",
        color: "#2a201a",
        position: "relative",
      }}
    >
      <div
        style={{
          fontFamily: "Roboto Slab, serif",
          fontSize: 9,
          letterSpacing: 1.5,
          fontWeight: 700,
          color: "#6a4a18",
          borderBottom: "1px dashed rgba(0,0,0,0.25)",
          paddingBottom: 3,
          marginBottom: 5,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>USAGE</span>
        <span style={{ opacity: 0.6 }}>t{ev.turn}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 6, rowGap: 2 }}>
        <span style={{ opacity: 0.6 }}>in</span>
        <span style={{ textAlign: "right" }}>{fmt(turn.in)}</span>
        <span style={{ opacity: 0.6 }}>out</span>
        <span style={{ textAlign: "right" }}>{fmt(turn.out)}</span>
        <span style={{ opacity: 0.6 }}>cost</span>
        <span style={{ textAlign: "right", fontWeight: 700 }}>{money(turn.cost)}</span>
      </div>

      <div
        style={{
          marginTop: 6,
          paddingTop: 4,
          borderTop: "1px dashed rgba(0,0,0,0.25)",
          fontSize: 8,
          opacity: 0.85,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 6 }}>
          <span style={{ opacity: 0.6 }}>Σ tok</span>
          <span style={{ textAlign: "right" }}>
            {fmt(total.in)} / {fmt(total.out)}
          </span>
          <span style={{ opacity: 0.6 }}>Σ $</span>
          <span style={{ textAlign: "right", fontWeight: 700 }}>{money(total.cost)}</span>
        </div>
      </div>

      {expanded && (
        <div
          style={{
            marginTop: 8,
            paddingTop: 6,
            borderTop: "1px dashed rgba(0,0,0,0.25)",
            fontSize: 8,
            lineHeight: 1.4,
          }}
        >
          <div style={{ opacity: 0.6, marginBottom: 2 }}>model</div>
          <div style={{ marginBottom: 4 }}>{p.model || "—"}</div>
          <div style={{ opacity: 0.6, marginBottom: 2 }}>rate ($/1M tok)</div>
          <div>
            in {p.rates?.inPerM ?? "—"} · out {p.rates?.outPerM ?? "—"}
          </div>
        </div>
      )}
    </div>
  );
}
