import type { Placed } from "./types";

export default function SkillEnvelope({
  ev,
  expanded,
}: {
  ev: Placed;
  expanded: boolean;
}) {
  const p = ev.payload || {};
  return (
    <div
      style={{
        width: ev.w,
        height: expanded ? "auto" : ev.h,
        minHeight: ev.h,
        background:
          "linear-gradient(135deg, #d9b97a 0%, #c9a55f 50%, #b18d4b 100%)",
        border: "1px solid #6b4a1f",
        boxShadow: "0 8px 14px rgba(60,40,15,0.35), inset 0 0 0 2px rgba(255,250,235,0.18)",
        padding: "12px 14px 10px",
        position: "relative",
        overflow: expanded ? "visible" : "hidden",
        color: "#2a1d0c",
        fontFamily: "JetBrains Mono, monospace",
      }}
    >
      {/* envelope flap accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 18,
          background:
            "linear-gradient(180deg, rgba(70,45,15,0.18) 0%, transparent 100%)",
          borderBottom: "1px dashed rgba(80,55,20,0.45)",
        }}
      />
      <div
        style={{
          fontFamily: "Roboto Slab, serif",
          fontSize: 9,
          letterSpacing: 2,
          fontWeight: 700,
          color: "#5a3f15",
          marginTop: 6,
        }}
      >
        📜 SKILL LOADED
      </div>
      <div
        style={{
          fontSize: expanded ? 14 : 13,
          fontWeight: 700,
          marginTop: 4,
          fontFamily: "Roboto Slab, serif",
        }}
      >
        {p.name || p.title}
      </div>
      {p.description && (
        <div style={{ fontSize: expanded ? 11 : 9, marginTop: 4, lineHeight: 1.3 }}>
          {p.description}
        </div>
      )}
      {expanded && (
        <pre
          style={{
            fontSize: 7,
            marginTop: 8,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            maxHeight: 480,
            overflow: "auto",
            overscrollBehavior: "contain",
            background: "rgba(255,250,235,0.45)",
            padding: 8,
            border: "1px dashed rgba(80,55,20,0.4)",
          }}
        >
          {p.body}
        </pre>
      )}
    </div>
  );
}
