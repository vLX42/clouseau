import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  STEPS,
  TITLE_END,
  WALL_HOLD_START,
  OUTRO_START,
  PLAYBACK_TOTAL_FRAMES,
  currentStepAt,
} from "./timeline";
import type { Placed } from "./types";
import { FONT_HEADING, FONT_MONO } from "../fonts";

// One headline per event type — what to call it on the lower-third strip,
// and a one-line explanation of what just happened.
type Copy = { title: string; body: (ev: Placed) => string };
const COPY: Record<string, Copy> = {
  user_message: {
    title: "User prompt",
    body: () => "The whole investigation starts with one line from the user.",
  },
  instructions_assembled: {
    title: "Instructions assembled",
    body: () => "Harness stitches SYSTEM + CLAUDE.md + tool schemas into one bundle.",
  },
  request_sent: {
    title: "Request sent → OpenAI",
    body: (ev) => {
      const p = ev.payload || {};
      return `POST /chat/completions · ${p.messageCount ?? "?"} messages · ${p.bodyBytes ?? "?"} bytes`;
    },
  },
  response_received: {
    title: "Response received",
    body: (ev) => {
      const u = ev.payload?.usage || {};
      const fin = ev.payload?.finish_reason ?? "?";
      return `finish: ${fin} · in ${u.prompt_tokens ?? "?"} / out ${u.completion_tokens ?? "?"} tokens`;
    },
  },
  tool_call_decided: {
    title: "Tool call",
    body: (ev) => `Model asked us to run ${ev.payload?.name ?? "(?)"}.`,
  },
  permission_check: {
    title: "Permission check",
    body: (ev) =>
      `Side-effect tool — ${ev.payload?.tool ?? ""} ${ev.payload?.decision ?? ""}.`,
  },
  tool_result: {
    title: "Tool result",
    body: (ev) =>
      `${ev.payload?.name ?? "tool"} finished · ${ev.payload?.bytes ?? (ev.payload?.output || "").length}b${
        ev.payload?.truncated ? " (truncated)" : ""
      }.`,
  },
  truncation: {
    title: "Output truncated",
    body: (ev) =>
      `Kept ${ev.payload?.kept}/${ev.payload?.original} bytes — keeps context lean.`,
  },
  compaction: {
    title: "Compaction",
    body: (ev) =>
      `Summarised ${ev.payload?.replacedCount ?? "?"} prior messages into one block.`,
  },
  usage_meter: {
    title: "Tokens · cost",
    body: (ev) => {
      const t = ev.payload?.turn || {};
      const s = ev.payload?.total || {};
      return `+${t.in}/${t.out} this turn · Σ ${s.in}/${s.out} · Σ $${s.cost?.toFixed?.(4) ?? "?"}`;
    },
  },
  skill_listed: {
    title: "Skills discovered",
    body: (ev) => `${ev.payload?.count ?? "?"} skills available — playbooks the agent can load.`,
  },
  skill_loaded: {
    title: "Skill loaded",
    body: (ev) => `Loaded "${ev.payload?.name ?? "(?)"}" — full body now part of the next turn.`,
  },
  subagent_spawned: {
    title: "Subagent spawned",
    body: (ev) =>
      `${ev.payload?.id ?? "sub-1"} starting in a fresh context. Read-only tools.`,
  },
  subagent_finished: {
    title: "Subagent returned",
    body: (ev) =>
      `${ev.payload?.id ?? "sub-1"} returned ${(ev.payload?.result || "").length} chars to the main loop.`,
  },
  assistant_text: {
    title: "Final reply",
    body: () => "Model produced plain text with no tool calls — the conversation is done.",
  },
  stop_reason: {
    title: "Stop",
    body: (ev) => `reason: ${ev.payload?.reason ?? "stop"}. The while-loop exits.`,
  },
};

const COLORS = {
  paper: "#f4ede0",
  ink: "#1a1a1a",
  inkSoft: "#3b3531",
  rule: "#d8cdb6",
  accent: "#5a4634",
  string: "#a8201a",
};

export const Headline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. TITLE phase
  if (frame < TITLE_END) {
    const enter = spring({ frame, fps, config: { damping: 16, stiffness: 200 } });
    return (
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(28,20,12,0.80) 0%, rgba(28,20,12,0.55) 100%)",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 140px",
          opacity: interpolate(frame, [0, 16, TITLE_END - 20, TITLE_END], [0, 1, 1, 0]),
        }}
      >
        <div
          style={{
            fontFamily: FONT_HEADING,
            fontSize: 112,
            fontWeight: 900,
            color: "#f4ede0",
            textAlign: "center",
            lineHeight: 1.02,
            letterSpacing: -1.5,
            textShadow: "0 6px 18px rgba(0,0,0,0.6)",
            transform: `translateY(${interpolate(enter, [0, 1], [40, 0])}px)`,
          }}
        >
          One real agent run.
          <br />
          <span style={{ color: "#ff7a6a" }}>Every event, in order.</span>
        </div>
        <div
          style={{
            marginTop: 28,
            fontFamily: "Caveat, cursive",
            fontSize: 52,
            color: "#e7dec8",
            opacity: 0.9,
          }}
        >
          (no narration · the wall does the talking)
        </div>
      </AbsoluteFill>
    );
  }

  // 2. OUTRO phase
  if (frame >= OUTRO_START) {
    const local = frame - OUTRO_START;
    return (
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(28,20,12,0.0) 0%, rgba(28,20,12,0.78) 100%)",
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 110,
          opacity: interpolate(local, [0, 18], [0, 1]),
        }}
      >
        <div
          style={{
            fontFamily: FONT_HEADING,
            fontSize: 78,
            fontWeight: 900,
            color: "#f4ede0",
            textAlign: "center",
            letterSpacing: -1,
            textShadow: "0 6px 18px rgba(0,0,0,0.5)",
          }}
        >
          One prompt. {pluralCount("event")} events.
          <br />
          That's the whole agent.
        </div>
      </AbsoluteFill>
    );
  }

  // 3. WALL HOLD — no headline, let the eye roam the full wall
  if (frame >= WALL_HOLD_START) return null;

  // 4. STEP phase — bottom-left explainer that mirrors what's happening on
  //    the wall right now.
  const step = currentStepAt(frame);
  if (!step) return null;

  const copy = COPY[step.event.type];
  if (!copy) return null;

  const local = frame - step.start;
  const enter = spring({ frame: local, fps, config: { damping: 18, stiffness: 200 } });
  const exit = interpolate(step.end - frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const op = enter * exit;

  // Step counter — 1-based
  const stepIdx = STEPS.indexOf(step);
  const stepNum = stepIdx + 1;
  const total = STEPS.length;

  // Indicator color per event family (gives a subtle visual rhythm)
  const tint = tintFor(step.event.type);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Progress bar at the very top of the viewport */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: "rgba(120,90,60,0.18)",
        }}
      >
        <div
          style={{
            width: `${(frame / Math.max(1, PLAYBACK_TOTAL_FRAMES)) * 100}%`,
            height: "100%",
            background: COLORS.string,
          }}
        />
      </div>

      {/* Top-right HUD: event counter + clock */}
      <div
        style={{
          position: "absolute",
          top: 28,
          right: 36,
          background: "rgba(244,237,224,0.93)",
          border: `2px solid ${COLORS.accent}`,
          padding: "8px 16px",
          fontFamily: FONT_MONO,
          fontSize: 20,
          color: COLORS.ink,
          letterSpacing: 1,
          boxShadow: "0 6px 14px rgba(0,0,0,0.22)",
        }}
      >
        <span style={{ opacity: 0.55 }}>event </span>
        <strong>
          {String(stepNum).padStart(2, "0")} / {total}
        </strong>
        <span style={{ margin: "0 10px", opacity: 0.35 }}>·</span>
        <span style={{ opacity: 0.55 }}>turn </span>
        <strong>{step.event.turn}</strong>
        <span style={{ margin: "0 10px", opacity: 0.35 }}>·</span>
        <span style={{ opacity: 0.55 }}>t </span>
        <strong>{(frame / 30).toFixed(1)}s</strong>
      </div>

      {/* Bottom-left explainer card */}
      <div
        style={{
          position: "absolute",
          left: 40,
          bottom: 48,
          width: 760,
          background: "rgba(244,237,224,0.97)",
          border: `2px solid ${COLORS.accent}`,
          borderLeft: `12px solid ${tint}`,
          padding: "22px 28px 22px",
          opacity: op,
          transform: `translateY(${interpolate(enter, [0, 1], [34, 0])}px)`,
          boxShadow: "0 18px 30px rgba(0,0,0,0.28)",
        }}
      >
        <div
          style={{
            fontFamily: FONT_HEADING,
            fontSize: 16,
            letterSpacing: 2.6,
            color: tint,
            fontWeight: 900,
            marginBottom: 6,
          }}
        >
          STEP {stepNum}/{total} · {step.event.type.replace(/_/g, " ").toUpperCase()}
        </div>
        <div
          style={{
            fontFamily: FONT_HEADING,
            fontSize: 38,
            fontWeight: 700,
            color: COLORS.ink,
            lineHeight: 1.05,
            marginBottom: 10,
          }}
        >
          {copy.title}
        </div>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 21,
            lineHeight: 1.45,
            color: COLORS.inkSoft,
          }}
        >
          {copy.body(step.event)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

function tintFor(type: string): string {
  // Family palette so the eye learns the rhythm:
  //  - user/prompt-side: cool blue
  //  - request/response: warm tans/olives
  //  - tool work:        red/brown
  //  - subagent:         navy
  //  - state:            yellow/gold
  //  - finalize:         near-black
  switch (type) {
    case "user_message":
      return "#2f4a6d";
    case "instructions_assembled":
      return "#7a5a2e";
    case "request_sent":
      return "#7a5d28";
    case "response_received":
      return "#4a5a28";
    case "assistant_text":
      return "#6a4a18";
    case "tool_call_decided":
      return "#7a1d14";
    case "tool_result":
      return "#5a3f15";
    case "permission_check":
      return "#a35a14";
    case "truncation":
      return "#a83227";
    case "compaction":
      return "#1a1a1a";
    case "skill_listed":
      return "#5a3f15";
    case "skill_loaded":
      return "#a78a4f";
    case "subagent_spawned":
    case "subagent_finished":
      return "#1f3d6e";
    case "usage_meter":
      return "#a89020";
    case "stop_reason":
      return "#2a2018";
    default:
      return "#444";
  }
}

function pluralCount(_label: string): string {
  // Final outro line uses the actual visible-event count.
  return String(STEPS.length);
}
