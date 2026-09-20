import { useMemo, useState, Fragment } from "react";
import type { ReactNode } from "react";
import type { AgentEvent } from "./types";
import { iconFor } from "./icons";

// Short, readable summary per event type. The wall encodes intent through
// shape/color; the grid encodes it through this string + the type column.
function summarize(ev: AgentEvent): string {
  const p = ev.payload || {};
  switch (ev.type) {
    case "user_message":
      return (p.text || "").slice(0, 140);
    case "instructions_assembled":
      return `${p.totalChars}c · ${p.toolCount} tools · sources: ${
        (p.sources || []).map((s: any) => s.name).join(", ") || "—"
      }`;
    case "request_sent": {
      const lm = p.lastMessage || {};
      const last =
        typeof lm.content === "string"
          ? lm.content.slice(0, 80)
          : Array.isArray(lm.tool_calls)
          ? `[${lm.tool_calls.length} tool_call]`
          : "";
      return `${p.model} · ${p.messageCount} msgs · last(${lm.role}): ${last}`;
    }
    case "response_received": {
      const u = p.usage || {};
      return `${p.finish_reason} · tools:${p.hasToolCalls ? "yes" : "no"} · in ${
        u.prompt_tokens ?? "?"
      } / out ${u.completion_tokens ?? "?"}`;
    }
    case "assistant_text":
      return (p.text || "").slice(0, 140);
    case "tool_call_decided":
      return `${p.name}(${
        p.args ? JSON.stringify(p.args).slice(0, 80) : ""
      })`;
    case "tool_result":
      return `${p.name} → ${p.bytes ?? (p.output || "").length}b${
        p.truncated ? " · truncated" : ""
      }`;
    case "permission_check":
      return `${p.tool} · ${p.decision}`;
    case "truncation":
      return `kept ${p.kept} / ${p.original}`;
    case "read_blocked":
      return `${p.tool} → ${p.path} · blocked (${p.rule})`;
    case "redaction":
      return `${p.count}× secret redacted from ${p.name} output (${(p.rules || []).join(", ")})`;
    case "doom_loop":
      return `${p.name} called ${p.streak}× with identical args — harness intervened`;
    case "tool_repair":
      return `model asked for "${p.requested}" — no such tool; harness sent the menu`;
    case "harness_nudge":
      return `turn ${p.turn}/${p.maxTurns} — harness injected "wrap it up" prompt`;
    case "emoji_blocked":
      return `emoji police confiscated ${(p.removed || []).join(" ")} from ${p.name} content`;
    case "compaction":
      return `${p.replacedCount} msgs → ${(p.summary || "").slice(0, 80)}`;
    case "usage_meter": {
      const t = p.turn || {};
      const s = p.total || {};
      return `+${t.in}/${t.out} tok · +$${t.cost} · Σ ${s.in}/${s.out} · Σ $${s.cost}`;
    }
    case "stop_reason":
      return p.reason || "";
    case "skill_listed":
      return `${p.count} skills`;
    case "skill_loaded":
      return `${p.name} (${(p.body || "").length}c)`;
    case "subagent_spawned":
      return (p.task || "").slice(0, 140);
    case "subagent_finished":
      return (p.result || "").slice(0, 140);
    default:
      return JSON.stringify(p).slice(0, 140);
  }
}

const TYPE_COLOR: Record<string, string> = {
  user_message: "#2f4a6d",
  instructions_assembled: "#7a5a2e",
  request_sent: "#b0a07a",
  response_received: "#7a8f4a",
  assistant_text: "#9c7a3a",
  tool_call_decided: "#7a1d14",
  tool_result: "#5a3f15",
  permission_check: "#a35a14",
  truncation: "#a83227",
  read_blocked: "#8f1010",
  redaction: "#1a1a1a",
  doom_loop: "#5b1a6e",
  tool_repair: "#6e4a1a",
  harness_nudge: "#1f3d6e",
  emoji_blocked: "#14417a",
  compaction: "#1a1a1a",
  usage_meter: "#a89020",
  stop_reason: "#2a2018",
  skill_listed: "#5a3f15",
  skill_loaded: "#a78a4f",
  subagent_spawned: "#1f3d6e",
  subagent_finished: "#1f3d6e",
};

function fmtTime(ts: number, base: number): string {
  const ms = ts - base;
  if (ms < 1000) return `+${ms}ms`;
  return `+${(ms / 1000).toFixed(1)}s`;
}

export default function GridView({ events }: { events: AgentEvent[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("");
  const base = events[0]?.timestamp ?? Date.now();

  const filtered = useMemo(() => {
    if (!filter.trim()) return events;
    const q = filter.toLowerCase();
    return events.filter(
      (e) =>
        e.type.includes(q) ||
        summarize(e).toLowerCase().includes(q) ||
        (e.subagent?.id || "").toLowerCase().includes(q),
    );
  }, [events, filter]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--paper)",
        overflow: "auto",
        padding: "44px 12px 12px",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 11,
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "var(--paper)",
          padding: "0 0 8px",
          zIndex: 2,
          display: "flex",
          gap: 12,
          alignItems: "center",
          borderBottom: "1px solid var(--rule)",
          marginBottom: 6,
        }}
      >
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="filter by type / text…"
          style={{
            border: "1px solid var(--rule)",
            background: "transparent",
            padding: "3px 6px",
            fontSize: 11,
            width: 220,
            fontFamily: "JetBrains Mono, monospace",
          }}
        />
        <span style={{ opacity: 0.55, fontSize: 10 }}>
          {filtered.length} / {events.length} events
        </span>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--rule)", textAlign: "left" }}>
            <Th w={28}>#</Th>
            <Th w={36}>turn</Th>
            <Th w={64}>t+</Th>
            <Th w={140}>type</Th>
            <Th w={120}>parents</Th>
            <Th w={60}>sub</Th>
            <Th>summary</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((ev, i) => {
            const isOpen = expanded.has(ev.id);
            const color = TYPE_COLOR[ev.type] || "#444";
            return (
              <Fragment key={ev.id}>
                <tr
                  onClick={() =>
                    setExpanded((prev) => {
                      const next = new Set(prev);
                      if (next.has(ev.id)) next.delete(ev.id);
                      else next.add(ev.id);
                      return next;
                    })
                  }
                  style={{
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                    cursor: "pointer",
                    background: isOpen ? "rgba(0,0,0,0.04)" : "transparent",
                  }}
                >
                  <Td mono dim>
                    {i + 1}
                  </Td>
                  <Td mono>{ev.turn}</Td>
                  <Td mono dim>
                    {fmtTime(ev.timestamp, base)}
                  </Td>
                  <Td>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "1px 6px",
                        background: color,
                        color: "#f4ede0",
                        fontSize: 10,
                        letterSpacing: 0.5,
                        fontFamily: "Roboto Slab, serif",
                      }}
                    >
                      {iconFor(ev)} {ev.type}
                    </span>
                  </Td>
                  <Td mono dim>
                    {ev.parentIds.length ? ev.parentIds.join(", ") : "—"}
                  </Td>
                  <Td mono dim>
                    {ev.subagent?.id || ""}
                  </Td>
                  <Td>
                    <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {summarize(ev) || <em style={{ opacity: 0.5 }}>(empty)</em>}
                    </span>
                  </Td>
                </tr>
                {isOpen && (
                  <tr style={{ background: "rgba(0,0,0,0.03)" }}>
                    <td colSpan={7} style={{ padding: "6px 8px 12px 8px" }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "100px 1fr",
                          columnGap: 10,
                          rowGap: 3,
                          fontSize: 10,
                        }}
                      >
                        <span style={{ opacity: 0.55 }}>id</span>
                        <span>{ev.id}</span>
                        <span style={{ opacity: 0.55 }}>timestamp</span>
                        <span>{new Date(ev.timestamp).toISOString()}</span>
                      </div>
                      <pre
                        style={{
                          margin: "8px 0 0",
                          fontSize: 10,
                          background: "rgba(255,255,255,0.7)",
                          border: "1px dashed rgba(0,0,0,0.2)",
                          padding: 8,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          maxHeight: 360,
                          overflow: "auto",
                          overscrollBehavior: "contain",
                        }}
                      >
                        {JSON.stringify(ev.payload, null, 2)}
                      </pre>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, w }: { children: ReactNode; w?: number }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "4px 6px",
        fontFamily: "Roboto Slab, serif",
        fontSize: 10,
        letterSpacing: 1.2,
        color: "var(--accent)",
        width: w,
        fontWeight: 700,
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  mono,
  dim,
}: {
  children: ReactNode;
  mono?: boolean;
  dim?: boolean;
}) {
  return (
    <td
      style={{
        padding: "4px 6px",
        fontFamily: mono ? "JetBrains Mono, monospace" : undefined,
        opacity: dim ? 0.7 : 1,
        verticalAlign: "top",
      }}
    >
      {children}
    </td>
  );
}
