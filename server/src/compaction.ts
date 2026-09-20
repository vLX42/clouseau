import type { Emit } from "./events.ts";

const MODEL = process.env.MODEL || "gpt-4o-mini";
const KEY = process.env.OPENAI_API_KEY!;

// Flatten an OpenAI-shaped messages array into a single text transcript.
// We do this so the summarisation call gets a valid prompt — passing the
// raw messages with assistant `tool_calls` entries (but without their
// matching tool replies) would fail the API's invariant checks.
function transcript(messages: any[]): string {
  const lines: string[] = [];
  for (const m of messages) {
    if (m.role === "system") continue;
    if (m.role === "user") {
      lines.push(`USER: ${m.content}`);
    } else if (m.role === "assistant") {
      if (typeof m.content === "string" && m.content.trim()) {
        lines.push(`ASSISTANT: ${m.content}`);
      }
      if (Array.isArray(m.tool_calls)) {
        for (const c of m.tool_calls) {
          lines.push(`ASSISTANT calls ${c.function?.name}(${c.function?.arguments || ""})`);
        }
      }
    } else if (m.role === "tool") {
      const out = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
      lines.push(`TOOL: ${out.slice(0, 400)}${out.length > 400 ? "…" : ""}`);
    }
  }
  return lines.join("\n");
}

export async function compact(
  messages: any[],
  emit: Emit,
  parent: string,
): Promise<{ messages: any[]; eventId: string }> {
  const system = messages[0];
  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  const summaryPrompt = `You are a conversation summarizer. Below is a transcript of an agent's session. Produce a TERSE summary of the assistant's progress so far. Preserve: file paths created or read, key decisions, and any open user request. Plain text under 800 chars.

--- TRANSCRIPT ---
${transcript(messages)}
--- END TRANSCRIPT ---`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: summaryPrompt }],
    }),
  });
  const json: any = await res.json();
  const summary = json?.choices?.[0]?.message?.content?.trim() || "(empty summary)";
  const ev = await emit(
    "compaction",
    {
      summary,
      replacedCount: messages.length - 2,
      usage: json?.usage,
      error: json?.error,
    },
    [parent],
  );
  const next: any[] = [system];
  next.push({
    role: "system",
    content: `[compacted session summary]\n${summary}`,
  });
  if (lastUser) next.push(lastUser);
  return { messages: next, eventId: ev.id };
}
