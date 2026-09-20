import type { AgentEvent } from "./types";

// Detective-comic icon per event so the audience can read the wall from
// across the room: police for the permission gate, magnifying glass for
// investigation reads, a beumb for bash, the sub-detective for subagents.
// Tool-flavoured events (tool_call_decided / tool_result) pick their icon
// from the tool being run, not the event type.
const TOOL_ICONS: Record<string, string> = {
  list_files: "🔍",
  read_file: "🔍",
  file_exists: "🔍",
  list_skills: "🗂️",
  load_skill: "📜",
  write_file: "✍️",
  run_bash: "💣",
  spawn_subagent: "🕵️",
};

const EVENT_ICONS: Record<string, string> = {
  user_message: "🗣️",
  instructions_assembled: "📋",
  request_sent: "✉️",
  response_received: "📨",
  assistant_text: "💬",
  permission_check: "👮",
  read_blocked: "⛔",
  redaction: "🕶️",
  doom_loop: "🌀",
  tool_repair: "🔧",
  harness_nudge: "📢",
  emoji_blocked: "🚓",
  truncation: "✂️",
  compaction: "🗜️",
  usage_meter: "💰",
  stop_reason: "🛑",
  skill_listed: "🗂️",
  skill_loaded: "📜",
  subagent_spawned: "🕵️",
  subagent_finished: "🕵️",
};

export function iconFor(ev: Pick<AgentEvent, "type" | "payload">): string {
  if (
    ev.type === "tool_call_decided" ||
    ev.type === "tool_call_started" ||
    ev.type === "tool_result"
  ) {
    return TOOL_ICONS[ev.payload?.name] || "🔧";
  }
  return EVENT_ICONS[ev.type] || "";
}
