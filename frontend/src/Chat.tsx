import { useEffect, useRef } from "react";
import type { AgentEvent } from "./types";

export type ChatMsg = {
  kind: "user" | "assistant" | "tool" | "error" | "status";
  text: string;
};

export function eventsToChat(events: AgentEvent[]): ChatMsg[] {
  const out: ChatMsg[] = [];
  for (const e of events) {
    // Subagent's internal events stay on the wall but don't appear in the
    // main chat — the main agent only sees the subagent's final summary.
    if (e.subagent) continue;
    if (e.type === "user_message") out.push({ kind: "user", text: e.payload.text });
    else if (e.type === "assistant_text") out.push({ kind: "assistant", text: e.payload.text });
    else if (e.type === "tool_call_decided") {
      const args = e.payload.args || {};
      const argStr = Object.entries(args)
        .map(([k, v]) => {
          const s = typeof v === "string" ? v : JSON.stringify(v);
          const trimmed = s.length > 40 ? s.slice(0, 40) + "…" : s;
          return `${k}=${JSON.stringify(trimmed)}`;
        })
        .join(", ");
      out.push({ kind: "tool", text: `↳ ${e.payload.name}(${argStr})` });
    } else if (e.type === "tool_result") {
      const last = out[out.length - 1];
      const tag = `· ${e.payload.bytes ?? 0}b${e.payload.truncated ? " · truncated" : ""}${
        e.payload.error ? " · error" : ""
      }`;
      if (last && last.kind === "tool") last.text = `${last.text} ${tag}`;
    } else if (e.type === "skill_loaded") {
      out.push({ kind: "tool", text: `✦ skill loaded: ${e.payload.name}` });
    } else if (e.type === "subagent_spawned") {
      out.push({
        kind: "tool",
        text: `▶ subagent ${e.payload.id} spawned: ${(e.payload.task || "").slice(0, 60)}`,
      });
    } else if (e.type === "subagent_finished") {
      out.push({
        kind: "tool",
        text: `◀ subagent ${e.payload.id} returned ${(e.payload.result || "").length} chars`,
      });
    } else if (e.type === "stop_reason" && e.payload.reason === "error") {
      out.push({ kind: "error", text: e.payload.error?.message || "error" });
    }
  }
  return out;
}

// Auto-typed prompts for the two live demos in the talk (see demo.md), so
// the presenter presses one tiny button instead of typing on stage. Each
// script is typed with a deliberate typo that gets noticed, backspaced and
// corrected, so it looks human.
//   before: text typed up to and including the typo
//   typo:   the wrong tail of `before` that gets backspaced
//   fix:    what gets typed instead
//   after:  the rest of the prompt
type DemoScript = { label: string; title: string; before: string; typo: string; fix: string; after: string };
const DEMO_SCRIPTS: DemoScript[] = [
  {
    // Live demo 1: the model asks for a write, the harness does it, the file
    // lands in the evidence locker.
    label: "demo 1",
    title: "auto-type the live demo 1 prompt (write TODO.md, verify it)",
    before: "Create a file TODO.md with three sample items as a checbox",
    typo: "checbox",
    fix: "checkbox",
    after: " list, then verify it exists.",
  },
  {
    // Live demo 2: the emoji police. The prompt itself is innocent; the
    // banned emojis come from the SKILL's rant-list section, so the demo
    // shows: skill instructs, model obeys, harness confiscates.
    label: "demo 2",
    title: "auto-type the live demo 2 prompt (emoji police)",
    before:
      "write me a todo list of chores i hate, it need to have taxes, cleaning the oven and the gym showers. save it as HateList.tsx and use the emjoi",
    typo: "emjoi",
    fix: "emoji",
    after: " skill, really let the anger show",
  },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Chat({
  events,
  onSubmit,
  onNewSession,
  running,
  demoMode,
  demoPrompt,
}: {
  events: AgentEvent[];
  onSubmit: (prompt: string) => void;
  onNewSession: () => void;
  running: boolean;
  demoMode?: boolean;
  demoPrompt?: string | null;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const msgs = eventsToChat(events);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [events.length]);

  const typingRef = useRef(false);

  const autoType = async (script: DemoScript) => {
    const el = inputRef.current;
    if (!el || running || typingRef.current) return;
    typingRef.current = true;
    el.focus();
    el.value = "";
    const typeChars = async (s: string) => {
      for (const ch of s) {
        el.value += ch;
        el.scrollTop = el.scrollHeight;
        await sleep(18 + Math.random() * 55);
      }
    };
    await typeChars(script.before);
    await sleep(650); // …notices the typo
    for (let i = 0; i < script.typo.length; i++) {
      el.value = el.value.slice(0, -1);
      await sleep(70 + Math.random() * 40);
    }
    await sleep(180);
    await typeChars(script.fix);
    await typeChars(script.after);
    await sleep(450);
    typingRef.current = false;
    submit();
  };

  const submit = () => {
    const raw = inputRef.current?.value.trim();
    // In demo mode the recording is fixed — ignore whatever's in the box and
    // replay the captured prompt so the wall fills in with real events.
    const v = demoMode ? demoPrompt || raw : raw;
    if (!v || running) return;
    onSubmit(v);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "12px 14px" }}>
      <div
        style={{
          fontSize: 11,
          letterSpacing: 1.5,
          color: "var(--accent)",
          marginBottom: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>
          CLOUSEAU · chat
          {demoMode && (
            <span
              style={{
                marginLeft: 6,
                padding: "1px 5px",
                background: "var(--accent)",
                color: "var(--paper)",
                fontSize: 9,
                letterSpacing: 1.4,
              }}
            >
              DEMO
            </span>
          )}
        </span>
        <button
          onClick={onNewSession}
          disabled={running || events.length === 0}
          style={{
            background: "transparent",
            border: "1px solid var(--accent)",
            color: "var(--accent)",
            fontSize: 9,
            letterSpacing: 1.2,
            padding: "2px 6px",
            opacity: running || events.length === 0 ? 0.35 : 1,
            cursor: running || events.length === 0 ? "default" : "pointer",
          }}
          title="clear context and start fresh"
        >
          new session
        </button>
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflow: "auto", fontSize: 13, lineHeight: 1.5 }}>
        {msgs.length === 0 && !demoMode && (
          <div style={{ opacity: 0.5, fontStyle: "italic", fontSize: 12 }}>
            ask the agent something about this project.
          </div>
        )}
        {msgs.length === 0 && demoMode && (
          <div style={{ fontSize: 12, lineHeight: 1.5 }}>
            <div
              style={{
                opacity: 0.65,
                fontStyle: "italic",
                marginBottom: 8,
              }}
            >
              this is a recorded session — press <strong>play</strong> below to
              replay the real events from disk. no tokens, no API key.
            </div>
            {demoPrompt && (
              <div
                style={{
                  background: "rgba(0,0,0,0.04)",
                  border: "1px dashed var(--rule)",
                  padding: 6,
                  whiteSpace: "pre-wrap",
                  fontSize: 12,
                }}
              >
                <span style={{ opacity: 0.55, fontSize: 10, letterSpacing: 1.2 }}>
                  RECORDED PROMPT
                </span>
                <br />
                {demoPrompt}
              </div>
            )}
          </div>
        )}
        {msgs.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.kind === "user" ? "flex-end" : "flex-start",
              margin: "6px 0",
            }}
          >
            <div
              style={{
                maxWidth: "85%",
                whiteSpace: "pre-wrap",
                color:
                  m.kind === "error"
                    ? "#8a1a13"
                    : m.kind === "tool"
                    ? "var(--ink-soft)"
                    : "var(--ink)",
                opacity: m.kind === "tool" ? 0.75 : 1,
                fontSize: m.kind === "tool" ? 11 : 13,
                fontFamily: m.kind === "tool" ? "JetBrains Mono, monospace" : "inherit",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {running && (
          <div style={{ opacity: 0.6, fontSize: 11, marginTop: 6 }}>… thinking</div>
        )}
      </div>
      <div style={{ borderTop: "1px solid var(--rule)", paddingTop: 8, marginTop: 8 }}>
        {demoMode ? (
          <button
            onClick={submit}
            disabled={running}
            style={{
              width: "100%",
              border: "1px solid var(--accent)",
              background: running ? "transparent" : "var(--accent)",
              color: running ? "var(--accent)" : "var(--paper)",
              padding: "10px 12px",
              fontFamily: "Roboto Slab, serif",
              fontSize: 12,
              letterSpacing: 1.6,
              fontWeight: 700,
              cursor: running ? "default" : "pointer",
              opacity: running ? 0.6 : 1,
            }}
          >
            {running ? "REPLAYING…" : events.length === 0 ? "▶ PLAY RECORDING" : "▶ REPLAY"}
          </button>
        ) : (
          <>
            <textarea
              ref={inputRef}
              placeholder="ask…"
              rows={4}
              disabled={running}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              style={{
                width: "100%",
                border: "1px solid var(--accent)",
                background: "transparent",
                color: "var(--ink)",
                padding: 8,
                fontFamily: "inherit",
                fontSize: 13,
                resize: "none",
                outline: "none",
                opacity: running ? 0.5 : 1,
              }}
            />
            <div
              style={{
                fontSize: 10,
                marginTop: 4,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ opacity: 0.55 }}>enter to send · shift+enter for newline</span>
              <span style={{ display: "flex", gap: 4 }}>
                {DEMO_SCRIPTS.map((d) => (
                  <button
                    key={d.label}
                    onClick={() => autoType(d)}
                    disabled={running}
                    title={d.title}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--accent)",
                      color: "var(--accent)",
                      fontSize: 9,
                      letterSpacing: 1.2,
                      padding: "2px 6px",
                      opacity: running ? 0.35 : 1,
                      cursor: running ? "default" : "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    🎬 {d.label}
                  </button>
                ))}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
