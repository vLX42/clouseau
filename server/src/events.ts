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

export type Event = {
  id: string;
  turn: number;
  timestamp: number;
  parentIds: string[];
  type: EventType;
  payload: any;
  subagent?: { id: string };
};

export type Sink = (e: Event) => void | Promise<void>;

export type Emit = (
  type: EventType,
  payload: any,
  parentIds?: string[],
) => Promise<Event>;

export function makeEmitter(turnRef: { value: number }, sink: Sink): Emit {
  let n = 0;
  const prefix = Math.random().toString(36).slice(2, 7);
  return async (type, payload, parentIds = []) => {
    const ev: Event = {
      id: `${prefix}-e${++n}`,
      turn: turnRef.value,
      timestamp: Date.now(),
      parentIds,
      type,
      payload,
    };
    await sink(ev);
    return ev;
  };
}
