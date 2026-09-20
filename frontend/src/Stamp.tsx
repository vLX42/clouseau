import type { Placed } from "./types";
import { iconFor } from "./icons";

const LABEL: Record<string, string> = {
  tool_call_decided: "TOOL CALL",
  permission_check: "PERMISSION",
  truncation: "TRUNCATED",
  read_blocked: "ACCESS DENIED",
  redaction: "REDACTED",
  doom_loop: "DOOM LOOP",
  tool_repair: "NO SUCH TOOL",
  harness_nudge: "WRAP IT UP",
  emoji_blocked: "EMOJI POLICE",
  compaction: "COMPACTED",
  stop_reason: "STOP",
  skill_listed: "SKILL INDEX",
  subagent_spawned: "SUBAGENT ▶",
  subagent_finished: "◀ SUBAGENT",
};

const INK: Record<string, string> = {
  tool_call_decided: "#7a1d14",
  permission_check: "#a35a14",
  truncation: "#a83227",
  read_blocked: "#8f1010",
  redaction: "#1a1a1a",
  doom_loop: "#5b1a6e",
  tool_repair: "#6e4a1a",
  harness_nudge: "#1f3d6e",
  emoji_blocked: "#14417a",
  stop_reason: "#2a2018",
  skill_listed: "#5a3f15",
  subagent_spawned: "#1f3d6e",
  subagent_finished: "#1f3d6e",
};

function detail(ev: Placed): string {
  const p = ev.payload || {};
  if (ev.type === "tool_call_decided") return p.name;
  if (ev.type === "permission_check")
    return p.decision === "auto-approved" ? "AUTO ✓" : p.decision;
  if (ev.type === "truncation") return `${p.kept}/${p.original}`;
  if (ev.type === "read_blocked") return `${p.path} · ${p.rule}`;
  if (ev.type === "redaction")
    return `${p.count}× secret in ${p.name} output`;
  if (ev.type === "doom_loop") return `${p.name} ×${p.streak}`;
  if (ev.type === "tool_repair") return p.requested;
  if (ev.type === "harness_nudge") return `turn ${p.turn}/${p.maxTurns}`;
  if (ev.type === "emoji_blocked")
    return `confiscated: ${(p.removed || []).join(" ")}`;
  if (ev.type === "compaction") return `${p.replacedCount} msgs`;
  if (ev.type === "stop_reason") return p.reason || "stop";
  if (ev.type === "skill_listed") return `${p.count} found`;
  if (ev.type === "subagent_spawned") return (p.task || "").slice(0, 32);
  if (ev.type === "subagent_finished") return (p.result || "").slice(0, 32);
  return "";
}

export default function Stamp({ ev, expanded }: { ev: Placed; expanded: boolean }) {
  const ink = INK[ev.type] || "#2a201a";
  return (
    <div
      style={{
        width: ev.w,
        minHeight: ev.h,
        background: expanded ? "rgba(244,237,224,0.95)" : "transparent",
        position: "relative",
        fontFamily: "Roboto Slab, serif",
        fontWeight: 700,
        color: ink,
        opacity: 0.92,
        border: `2px solid ${ink}`,
        outline: `1px dashed ${ink}`,
        outlineOffset: 2,
        padding: 6,
        boxShadow: expanded ? "0 6px 14px rgba(0,0,0,0.25)" : "none",
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: 1.5, lineHeight: 1.1 }}>
        <span style={{ fontSize: 13, marginRight: 3 }}>{iconFor(ev)}</span>
        {LABEL[ev.type] || ev.type}
      </div>
      <div
        style={{
          fontSize: 9,
          marginTop: 4,
          opacity: 0.85,
          fontFamily: "JetBrains Mono, monospace",
          wordBreak: "break-word",
        }}
      >
        {detail(ev)}
      </div>
      {expanded && (
        <pre
          className="scrollbox"
          style={{
            fontSize: 7,
            marginTop: 8,
            padding: 6,
            fontFamily: "JetBrains Mono, monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            maxHeight: 360,
            overflow: "auto",
            overscrollBehavior: "contain",
            background: "rgba(255,255,255,0.65)",
            border: `1px dashed ${ink}`,
            color: "#1a1a1a",
            fontWeight: 400,
          }}
        >
          {JSON.stringify(ev.payload, null, 2)}
        </pre>
      )}
    </div>
  );
}
