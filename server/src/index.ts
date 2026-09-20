import "./env.ts";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { streamSSE } from "hono/streaming";
import { runAgent, resetSession } from "./agent.ts";
import type { Event } from "./events.ts";

const app = new Hono();

// The frontend probes this on load. No key (or no server at all, as on a
// static deploy) means the wall falls back to replaying recordings.
app.get("/health", (c) => c.json({ ok: true, apiKey: Boolean(process.env.OPENAI_API_KEY) }));

app.post("/reset", async (c) => {
  let sessionId = "";
  try {
    const body = (await c.req.json()) as { sessionId?: string };
    sessionId = body?.sessionId || "";
  } catch {}
  if (sessionId) resetSession(sessionId);
  return c.json({ ok: true, reset: sessionId });
});

app.post("/run", (c) =>
  streamSSE(c, async (stream) => {
    let prompt = "";
    let sessionId = "default";
    try {
      const body = (await c.req.json()) as { prompt?: string; sessionId?: string };
      prompt = (body?.prompt || "").trim();
      sessionId = (body?.sessionId || "default").trim();
    } catch {}

    if (!prompt) {
      await stream.writeSSE({
        event: "error",
        data: JSON.stringify({ message: "missing prompt" }),
      });
      return;
    }

    let counter = 0;
    const send = async (e: Event) => {
      await stream.writeSSE({
        id: String(++counter),
        event: e.type,
        data: JSON.stringify(e),
      });
    };

    try {
      await runAgent(prompt, (e) => send(e), sessionId);
    } catch (err: any) {
      await stream.writeSSE({
        event: "error",
        data: JSON.stringify({ message: err?.message || String(err) }),
      });
    }
  }),
);

const port = Number(process.env.PORT || 3001);
serve({ fetch: app.fetch, port }, () =>
  console.log(`[clouseau] server on http://localhost:${port}`),
);
