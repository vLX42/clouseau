import { useMemo, useState } from "react";
import type { AgentEvent } from "./types";

// The evidence locker: a live view of every file the agent has written this
// session. Derived entirely from write_file tool_result events, so it works
// identically in live mode and demo replay — no filesystem endpoint needed.
type FileRow = {
  path: string;
  bytes: number;
  content: string;
  turn: number;
  rev: number;
};

export default function FileCabinet({ events }: { events: AgentEvent[] }) {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const files = useMemo(() => {
    const map = new Map<string, FileRow>();
    for (const ev of events) {
      if (ev.type !== "tool_result") continue;
      const p = ev.payload || {};
      if (p.name !== "write_file" || p.error) continue;
      const path = p.args?.path;
      if (!path) continue;
      const content: string = p.args?.content ?? "";
      const prev = map.get(path);
      map.set(path, {
        path,
        bytes: content.length,
        content,
        turn: ev.turn,
        rev: (prev?.rev ?? 0) + 1,
      });
    }
    return [...map.values()];
  }, [events]);

  if (files.length === 0) return null;
  const sel = files.find((f) => f.path === selected) || null;

  return (
    <div
      style={{
        position: "absolute",
        left: 8,
        bottom: 8,
        zIndex: 6,
        width: sel ? 340 : 240,
        background: "#e7d8b8",
        border: "1px solid #a78a4f",
        boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 10,
        color: "#2a201a",
      }}
    >
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          padding: "5px 8px",
          fontFamily: "Roboto Slab, serif",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 1.6,
          color: "#5a3f15",
          cursor: "pointer",
          borderBottom: open ? "1px dashed #a78a4f" : "none",
          userSelect: "none",
        }}
      >
        🗄️ EVIDENCE LOCKER · {files.length} file{files.length === 1 ? "" : "s"}
        <span style={{ float: "right", opacity: 0.6 }}>{open ? "▾" : "▸"}</span>
      </div>
      {open && (
        <div style={{ maxHeight: "40vh", overflow: "auto", overscrollBehavior: "contain" }}>
          {files.map((f) => (
            <div
              key={f.path}
              onClick={() => setSelected((s) => (s === f.path ? null : f.path))}
              style={{
                padding: "4px 8px",
                cursor: "pointer",
                background: sel?.path === f.path ? "rgba(255,255,255,0.55)" : "transparent",
                borderBottom: "1px solid rgba(167,138,79,0.35)",
              }}
            >
              📄 {f.path}
              <span style={{ float: "right", opacity: 0.6 }}>
                {f.bytes}b{f.rev > 1 ? ` · rev ${f.rev}` : ""}
              </span>
            </div>
          ))}
          {sel && (
            <pre
              style={{
                margin: 0,
                padding: 8,
                fontSize: 8,
                lineHeight: 1.35,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                maxHeight: 240,
                overflow: "auto",
                overscrollBehavior: "contain",
                background: "rgba(255,255,255,0.6)",
                borderTop: "1px dashed #a78a4f",
              }}
            >
              {sel.content}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
