import type { Placed } from "./types";
import { iconFor } from "./icons";

const WRITE_TOOLS = new Set(["write_file", "run_bash"]);
const SKILL_TOOLS = new Set(["list_skills", "load_skill"]);

export default function Polaroid({
  ev,
  expanded,
}: {
  ev: Placed;
  expanded: boolean;
}) {
  const p = ev.payload || {};
  const out: string = p.output || "";
  const argSummary = p.args
    ? Object.values(p.args)
        .map((v: any) => {
          const s = typeof v === "string" ? v : JSON.stringify(v);
          return s.length > 28 ? s.slice(0, 28) + "…" : s;
        })
        .join(", ")
    : "";
  const caption = `${p.name}(${argSummary}) · ${p.bytes ?? out.length}b${
    p.truncated ? " · truncated" : ""
  }`;

  // Caption strip color encodes the tool's intent.
  const isWrite = WRITE_TOOLS.has(p.name);
  const isSkill = SKILL_TOOLS.has(p.name);
  const isSubReturn = p.name === "spawn_subagent";
  const captionBg = isSubReturn
    ? "#d6e2f0"
    : isWrite
    ? "#f3d5cf"
    : isSkill
    ? "#e7d8b8"
    : "#f7f2e4";
  const captionFg = isSubReturn
    ? "#1f3d6e"
    : isWrite
    ? "#6a1b14"
    : isSkill
    ? "#5a3f15"
    : "var(--ink-soft)";
  const borderCol = isSubReturn
    ? "#1f3d6e"
    : isWrite
    ? "#a8201a"
    : isSkill
    ? "#a78a4f"
    : "#d8cdb6";
  const tag = `${iconFor(ev)} ${isSubReturn ? "◀ " : ""}`;

  return (
    <div
      style={{
        width: ev.w,
        height: expanded ? "auto" : ev.h,
        minHeight: ev.h,
        background: "#f7f2e4",
        border: `1px solid ${borderCol}`,
        boxShadow: "0 8px 14px rgba(0,0,0,0.2)",
        padding: 8,
        paddingBottom: 30,
        position: "relative",
        overflow: expanded ? "visible" : "hidden",
      }}
    >
      {isSubReturn && (
        <div
          style={{
            position: "absolute",
            top: -10,
            left: 8,
            background: "#1f3d6e",
            color: "#e9e1cd",
            fontFamily: "Roboto Slab, serif",
            fontSize: 8,
            letterSpacing: 1.4,
            padding: "2px 6px",
            fontWeight: 700,
            transform: "rotate(-2deg)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          FROM SUBAGENT
        </div>
      )}
      <div
        style={{
          background: "#1a1a1a",
          color: "#e9e1cd",
          fontSize: expanded ? 8 : 7,
          padding: 6,
          height: expanded ? "auto" : ev.h - 50,
          maxHeight: expanded ? 600 : ev.h - 50,
          overflow: "auto",
          overscrollBehavior: "contain",
          whiteSpace: "pre-wrap",
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        {expanded ? out : out.slice(0, 220)}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: captionBg,
          padding: "4px 8px",
          fontFamily: "Caveat, cursive",
          fontSize: 16,
          color: captionFg,
          textAlign: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          borderTop: `1px solid ${borderCol}`,
        }}
      >
        {tag}
        {caption}
      </div>
    </div>
  );
}
