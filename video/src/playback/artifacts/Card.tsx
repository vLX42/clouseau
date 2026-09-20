import type { CSSProperties, ReactNode } from "react";
import type { Placed } from "../types";

// Per-kind visual styling so the audience can tell user vs request vs
// response vs assistant vs compaction apart from across the room.
type Style = {
  title: string;
  bg: string;
  topBar: string;
  topBarThickness: number;
  accent: string;
};

function trunc(s: string | undefined, n: number): string {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + `… (+${s.length - n} chars)` : s;
}

const STYLES: Record<string, Style> = {
  user_message: {
    title: "USER",
    bg: "#ffffff",
    topBar: "#2f4a6d",
    topBarThickness: 8,
    accent: "#2f4a6d",
  },
  instructions_assembled: {
    title: "INSTRUCTIONS",
    bg: "#efe4cc",
    topBar: "#7a5a2e",
    topBarThickness: 12,
    accent: "#5a3f15",
  },
  request_sent: {
    title: "REQUEST SENT",
    bg: "#fbf7ec",
    topBar: "#b0a07a",
    topBarThickness: 6,
    accent: "#7a5d28",
  },
  response_received: {
    title: "RESPONSE",
    bg: "#f0f4e3",
    topBar: "#7a8f4a",
    topBarThickness: 6,
    accent: "#4a5a28",
  },
  assistant_text: {
    title: "ASSISTANT",
    bg: "#faf2dc",
    topBar: "#9c7a3a",
    topBarThickness: 8,
    accent: "#6a4a18",
  },
  compaction: {
    title: "COMPACTED",
    bg: "#fef7c2",
    topBar: "#1a1a1a",
    topBarThickness: 0,
    accent: "#1a1a1a",
  },
};

function condense(ev: Placed): string {
  const p = ev.payload || {};
  if (ev.type === "user_message") return p.text || "";
  if (ev.type === "assistant_text") return p.text || "";
  if (ev.type === "request_sent") {
    const lm = p.lastMessage || {};
    const last =
      typeof lm.content === "string"
        ? lm.content
        : Array.isArray(lm.tool_calls)
        ? `[${lm.tool_calls.length} tool_call(s)]`
        : JSON.stringify(lm.content || "");
    return (
      `→ ${p.model}\n` +
      `${p.messageCount} msgs · ${p.toolCount ?? "?"} tools · ${
        p.bodyBytes ?? "?"
      }b\n` +
      `last (${lm.role}): ${last}`
    );
  }
  if (ev.type === "response_received") {
    const u = p.usage || {};
    return (
      `finish: ${p.finish_reason}\n` +
      `tools: ${p.hasToolCalls ? "yes" : "no"}\n` +
      `tokens: in ${u.prompt_tokens ?? "?"} · out ${u.completion_tokens ?? "?"}\n\n` +
      (p.contentPreview || "")
    );
  }
  if (ev.type === "compaction")
    return `compacted ${p.replacedCount} messages\n\n${p.summary || ""}`;
  if (ev.type === "instructions_assembled") {
    const lines = [
      `total: ${p.totalChars} chars · ${p.toolCount} tools`,
      "",
      ...((p.sources || []) as Array<{ name: string; chars: number }>).map(
        (s) => `· ${s.name} (${s.chars}c)`,
      ),
      "",
      `tools: ${(p.toolNames || []).join(", ")}`,
    ];
    return lines.join("\n");
  }
  return JSON.stringify(p).slice(0, 80);
}

// Rich expanded views with labeled sections. Falls back to raw JSON for
// types that don't have a custom view (compaction, user_message, etc.).
function ExpandedDetails({ ev }: { ev: Placed }) {
  const p = ev.payload || {};

  if (ev.type === "instructions_assembled") {
    const sources = (p.sources || []) as Array<{
      name: string;
      chars: number;
      body: string;
    }>;
    const tools = (p.tools || []) as Array<{
      function: { name: string; description: string; parameters: any };
    }>;
    return (
      <div>
        <SectionLabel>SOURCES STITCHED INTO THE SYSTEM MESSAGE</SectionLabel>
        {sources.map((s, i) => (
          <div key={i} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: "#5a3f15" }}>
              {s.name} <span style={{ opacity: 0.55, fontWeight: 400 }}>· {s.chars}c</span>
            </div>
            <pre style={preStyle}>{trunc(s.body, 1200)}</pre>
          </div>
        ))}
        <SectionLabel>TOOLS EXPOSED TO THE MODEL ({tools.length})</SectionLabel>
        {tools.map((t, i) => (
          <div
            key={i}
            style={{
              fontSize: 7,
              marginBottom: 4,
              paddingLeft: 6,
              borderLeft: "2px solid #a78a4f",
            }}
          >
            <span style={{ fontWeight: 700, color: "#5a3f15" }}>{t.function.name}</span>
            <span style={{ opacity: 0.7 }}> — {t.function.description}</span>
          </div>
        ))}
      </div>
    );
  }

  if (ev.type === "request_sent") {
    const msgs = (p.messages || []) as Array<any>;
    return (
      <div>
        <KeyVal k="endpoint" v={p.endpoint} />
        <KeyVal k="model" v={p.model} />
        <KeyVal k="messages" v={`${p.messageCount}`} />
        <KeyVal k="tools" v={`${p.toolCount} (${(p.toolNames || []).join(", ")})`} />
        <KeyVal k="body" v={`${p.bodyBytes}b`} />
        <SectionLabel>MESSAGES SENT (full conversation state)</SectionLabel>
        {msgs.map((m, i) => (
          <div
            key={i}
            style={{
              marginBottom: 6,
              paddingLeft: 6,
              borderLeft: `2px solid ${roleColor(m.role)}`,
            }}
          >
            <div style={{ fontSize: 7, fontWeight: 700, color: roleColor(m.role) }}>
              [{i}] {m.role}
              {m.name ? ` (${m.name})` : ""}
              {m.tool_call_id ? ` ← ${m.tool_call_id}` : ""}
            </div>
            {typeof m.content === "string" && m.content && (
              <pre style={preStyle}>{m.content}</pre>
            )}
            {Array.isArray(m.tool_calls) &&
              m.tool_calls.map((tc: any, j: number) => (
                <div key={j} style={{ fontSize: 7, opacity: 0.85, marginTop: 2 }}>
                  → {tc.function?.name}({trunc(tc.function?.arguments, 80)})
                </div>
              ))}
          </div>
        ))}
      </div>
    );
  }

  if (ev.type === "response_received") {
    const u = p.usage || {};
    return (
      <div>
        <KeyVal k="finish_reason" v={p.finish_reason} />
        <KeyVal
          k="tokens"
          v={`prompt ${u.prompt_tokens ?? "?"} · completion ${u.completion_tokens ?? "?"}`}
        />
        <SectionLabel>ASSISTANT MESSAGE</SectionLabel>
        {p.message?.content && <pre style={preStyle}>{p.message.content}</pre>}
        {Array.isArray(p.message?.tool_calls) && p.message.tool_calls.length > 0 && (
          <>
            <div style={{ fontSize: 8, marginTop: 4, opacity: 0.7 }}>tool calls:</div>
            {p.message.tool_calls.map((tc: any, j: number) => (
              <div key={j} style={{ fontSize: 7, opacity: 0.85, marginTop: 2 }}>
                → {tc.function?.name}({trunc(tc.function?.arguments, 120)})
              </div>
            ))}
          </>
        )}
      </div>
    );
  }

  return <pre style={preStyle}>{JSON.stringify(p, null, 2)}</pre>;
}

function roleColor(role: string): string {
  if (role === "system") return "#5a3f15";
  if (role === "user") return "#2f4a6d";
  if (role === "assistant") return "#9c7a3a";
  if (role === "tool") return "#7a1d14";
  return "#444";
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "Roboto Slab, serif",
        fontSize: 8,
        letterSpacing: 1.2,
        color: "var(--accent)",
        marginTop: 8,
        marginBottom: 4,
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );
}

function KeyVal({ k, v }: { k: string; v: any }) {
  return (
    <div style={{ display: "flex", gap: 6, fontSize: 8, lineHeight: 1.4 }}>
      <span style={{ opacity: 0.6, minWidth: 70 }}>{k}</span>
      <span style={{ wordBreak: "break-word", fontFamily: "JetBrains Mono, monospace" }}>
        {v ?? "—"}
      </span>
    </div>
  );
}

// Inner <pre> tags flow into the outer scroll container — no nested scrollbars.
const preStyle: CSSProperties = {
  fontSize: 7,
  fontFamily: "JetBrains Mono, monospace",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  marginTop: 2,
  marginBottom: 0,
  padding: 5,
  background: "rgba(255,255,255,0.55)",
  border: "1px dashed rgba(0,0,0,0.18)",
  color: "#1a1a1a",
};

export default function Card({ ev, expanded }: { ev: Placed; expanded: boolean }) {
  const s = STYLES[ev.type] || STYLES.assistant_text;
  const isCompact = ev.type === "compaction";
  return (
    <div
      style={{
        width: ev.w,
        minHeight: ev.h,
        background: s.bg,
        border: isCompact ? "3px solid #1a1a1a" : undefined,
        borderTop: isCompact ? "3px solid #1a1a1a" : `${s.topBarThickness}px solid ${s.topBar}`,
        boxShadow: expanded
          ? "0 10px 20px rgba(0,0,0,0.25)"
          : "0 6px 12px rgba(0,0,0,0.18)",
        padding: "10px 12px 8px",
        fontSize: 8,
        lineHeight: 1.35,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isCompact && (
        <div
          style={{
            position: "absolute",
            top: 4,
            right: 6,
            fontFamily: "Roboto Slab, serif",
            fontSize: 11,
            color: "#1a1a1a",
            fontWeight: 700,
          }}
        >
          [s]
        </div>
      )}
      <div style={{ fontSize: 9, letterSpacing: 1.4, color: s.accent, marginBottom: 6 }}>
        {s.title}
        <span style={{ float: "right", opacity: 0.6 }}>t{ev.turn}</span>
      </div>
      <div
        style={{
          fontSize: expanded ? 9 : 8,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          maxHeight: expanded ? 280 : ev.h - 30,
          overflow: "auto",
          overscrollBehavior: "contain",
        }}
      >
        {condense(ev)}
      </div>
      {expanded && (
        <div
          style={{
            marginTop: 8,
            padding: 6,
            background: "rgba(255,255,255,0.55)",
            border: `1px dashed ${s.accent}`,
            color: "#1a1a1a",
            maxHeight: 560,
            overflow: "auto",
            overscrollBehavior: "contain",
          }}
        >
          <ExpandedDetails ev={ev} />
        </div>
      )}
    </div>
  );
}
