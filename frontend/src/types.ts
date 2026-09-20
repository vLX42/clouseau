export type EventType =
  | "user_message"
  | "instructions_assembled"
  | "request_sent"
  | "response_received"
  | "assistant_text"
  | "tool_call_decided"
  | "permission_check"
  | "tool_call_started"
  | "tool_result"
  | "truncation"
  | "read_blocked"
  | "redaction"
  | "doom_loop"
  | "tool_repair"
  | "harness_nudge"
  | "emoji_blocked"
  | "compaction"
  | "usage_meter"
  | "stop_reason"
  | "skill_listed"
  | "skill_loaded"
  | "subagent_spawned"
  | "subagent_finished"
  | "session_end";

export type AgentEvent = {
  id: string;
  turn: number;
  timestamp: number;
  parentIds: string[];
  type: EventType;
  payload: any;
  subagent?: { id: string };
};

export type Placed = AgentEvent & {
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
};

export type Artifact = "card" | "polaroid" | "stamp" | "sticky" | "envelope" | "skip";

// Map event type → artifact category
export function artifactOf(t: EventType): Artifact {
  switch (t) {
    case "user_message":
    case "request_sent":
    case "response_received":
    case "assistant_text":
    case "instructions_assembled":
      return "card";
    case "tool_result":
      return "polaroid";
    case "tool_call_decided":
    case "permission_check":
    case "truncation":
    case "read_blocked":
    case "redaction":
    case "doom_loop":
    case "tool_repair":
    case "harness_nudge":
    case "emoji_blocked":
    case "stop_reason":
    case "skill_listed":
    case "subagent_spawned":
    case "subagent_finished":
      return "stamp";
    case "compaction":
      return "card";
    case "skill_loaded":
      return "envelope";
    case "usage_meter":
      return "sticky";
    case "tool_call_started":
    case "session_end":
      return "skip";
  }
}

export function sizeOf(t: EventType): [number, number] {
  if (t === "compaction") return [260, 160];
  if (t === "skill_loaded") return [220, 150];
  if (t === "instructions_assembled") return [240, 140];
  if (t === "subagent_spawned" || t === "subagent_finished") return [120, 70];
  switch (artifactOf(t)) {
    case "card": return [200, 120];
    case "polaroid": return [180, 200];
    case "stamp": return [90, 60];
    case "sticky": return [130, 110];
    default: return [0, 0];
  }
}
