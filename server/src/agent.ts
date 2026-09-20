import { readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { toolSchemas, runTool, sessionScratchPath, SIDE_EFFECT_TOOLS, SUBAGENT_TOOL_NAMES, checkReadGuard, redactSecrets, policeEmojis } from "./tools.ts";
import { compact } from "./compaction.ts";
import type { Sink, Event } from "./events.ts";
import { makeEmitter } from "./events.ts";

const MODEL = process.env.MODEL || "gpt-4o-mini";
const KEY = process.env.OPENAI_API_KEY!;
const COMPACTION_THRESHOLD = Number(process.env.COMPACTION_THRESHOLD || 8000);
const REQUIRE_PERMISSION = process.env.REQUIRE_PERMISSION === "true";
const MAX_TURNS = Number(process.env.MAX_TURNS || 12);
const TRUNCATE_AT = 2000;

const SYSTEM = `You are Clouseau, a small pedagogical coding agent.
You can call these tools in the current workspace:
  - list_skills()               see which specialised guides are available
  - load_skill(name)            read a skill's full body before doing the work
  - list_files(path)            inspect a directory
  - read_file(path)             read a text file
  - write_file(path, content)   create or overwrite a text file (parent dirs auto-created)
  - file_exists(path)           verify a file is on disk; returns "yes <bytes>" or "no"
  - run_bash(command)           run a shell command for things the other tools can't do
  - spawn_subagent(task)        delegate a focused read-only research job to a subagent

Workflow:
  1. When the user asks for anything React-related (component, form, hook,
     todo list, Vite config) OR asks for emojis / more fun / more
     personality, START with list_skills. If a skill matches, load it and
     FOLLOW its instructions before writing code.
  2. When the user asks you to create or update a file, use write_file, then
     file_exists or read_file to verify it landed, then reply with the path.
  3. Prefer list_files + read_file over run_bash for inspection.
  4. Use spawn_subagent SPARINGLY. Only delegate when a focused research job
     would otherwise need ≥3 read_file/list_files calls AND the resulting
     details aren't needed in your own context afterwards. For most tasks,
     reading 1-2 files yourself is faster and clearer than spawning a subagent.
  5. Keep replies short. When done, stop calling tools and reply with text.`;

const SUBAGENT_SYSTEM = `You are a Clouseau research subagent. You have READ-ONLY tools: read_file, list_files, file_exists. You do NOT see the main agent's conversation history. Answer the user's task in 2-3 sentences. Stop calling tools as soon as you can answer.`;

async function loadProjectInstructions(): Promise<Array<{ source: string; body: string }>> {
  const root = process.env.WORKSPACE_ROOT || process.cwd();
  const out: Array<{ source: string; body: string }> = [];
  for (const name of ["CLAUDE.md", "AGENTS.md"]) {
    try {
      out.push({ source: name, body: await readFile(resolve(root, name), "utf8") });
    } catch {}
  }
  return out;
}

// Approximate cost per 1M tokens (USD) for gpt-4o-mini
const COST_IN_PER_M = 0.15;
const COST_OUT_PER_M = 0.6;

// In-memory session store, keyed by sessionId. Lets follow-up prompts
// continue the same messages array so we can demo compaction-between-
// prompts rather than compaction-mid-loop.
type SessionState = {
  messages: any[];
  cumulativeIn: number;
  cumulativeOut: number;
  cumulativeCost: number;
  subagentSerial: number;
};
const sessions = new Map<string, SessionState>();

export function resetSession(sessionId: string) {
  sessions.delete(sessionId);
  // Best-effort wipe the per-session scratch dir on disk so the next
  // conversation with the same id starts on truly empty ground.
  rm(sessionScratchPath(sessionId), { recursive: true, force: true }).catch(() => {});
}

export async function runAgent(
  userPrompt: string,
  sink: Sink,
  sessionId: string,
): Promise<void> {
  const turn = { value: 0 };
  const emit = makeEmitter(turn, sink);

  const prior = sessions.get(sessionId);
  const isFollowUp = !!prior;

  let messages: any[];
  let cumulativeIn: number;
  let cumulativeOut: number;
  let cumulativeCost: number;
  let subagentSerial: number;

  const userEv = await emit("user_message", { text: userPrompt });
  let lastAnchor = userEv.id;

  if (!isFollowUp) {
    // Fresh session: assemble system prompt + emit instructions card.
    const projInstr = await loadProjectInstructions();
    const sources: Array<{ name: string; chars: number; body: string }> = [
      { name: "SYSTEM (hardcoded)", chars: SYSTEM.length, body: SYSTEM },
      ...projInstr.map((p) => ({ name: p.source, chars: p.body.length, body: p.body })),
    ];
    const fullSystem =
      SYSTEM + projInstr.map((p) => `\n\n--- ${p.source} ---\n${p.body}`).join("");
    messages = [
      { role: "system", content: fullSystem },
      { role: "user", content: userPrompt },
    ];
    cumulativeIn = 0;
    cumulativeOut = 0;
    cumulativeCost = 0;
    subagentSerial = 0;
    const instrEv = await emit(
      "instructions_assembled",
      {
        sources,
        totalChars: fullSystem.length,
        toolNames: toolSchemas.map((t) => t.function.name),
        toolCount: toolSchemas.length,
        systemPrompt: fullSystem,
        tools: toolSchemas,
      },
      [userEv.id],
    );
    lastAnchor = instrEv.id;
  } else {
    // Follow-up: continue from prior session.
    messages = prior!.messages;
    cumulativeIn = prior!.cumulativeIn;
    cumulativeOut = prior!.cumulativeOut;
    cumulativeCost = prior!.cumulativeCost;
    subagentSerial = prior!.subagentSerial;
    // Compaction check happens HERE — between user prompts — not inside a turn.
    if (cumulativeIn >= COMPACTION_THRESHOLD) {
      const compactRes = await compact(messages, emit, userEv.id);
      messages = compactRes.messages;
      cumulativeIn = 0;
      // Chain the next request off the compaction card so the audience sees
      // the summary literally feeding the next turn (compaction → request_sent),
      // instead of a dangling COMPACTED branch.
      lastAnchor = compactRes.eventId;
    }
    messages.push({ role: "user", content: userPrompt });
  }

  // Doom-loop detection state: signatures of executed tool calls, in order.
  const recentToolSigs: string[] = [];
  const KNOWN_TOOLS = new Set(toolSchemas.map((t) => t.function.name));

  while (turn.value < MAX_TURNS) {
    turn.value += 1;

    // The step cap is not a kill switch — it's a prompt. On the final turn
    // the harness injects a message telling the model to wrap up (the same
    // trick opencode's MAX_STEPS_PROMPT uses).
    if (turn.value === MAX_TURNS) {
      const nudge = `[harness] This is your FINAL turn (${MAX_TURNS}/${MAX_TURNS}). Do not call any more tools. Reply now with your best final answer based on what you have.`;
      messages.push({ role: "user", content: nudge });
      const nudgeEv = await emit(
        "harness_nudge",
        { turn: turn.value, maxTurns: MAX_TURNS, text: nudge },
        [lastAnchor],
      );
      lastAnchor = nudgeEv.id;
    }

    // Build the exact JSON body we'll POST to the OpenAI Chat Completions endpoint.
    // We surface the FULL body in the event so the demo can show every byte the
    // model actually sees — nothing is hidden behind an SDK or a serializer.
    const requestBody = { model: MODEL, messages, tools: toolSchemas };
    const reqBodyStr = JSON.stringify(requestBody);
    const reqEv = await emit(
      "request_sent",
      {
        endpoint: "POST https://api.openai.com/v1/chat/completions",
        model: MODEL,
        messageCount: messages.length,
        toolCount: toolSchemas.length,
        toolNames: toolSchemas.map((t) => t.function.name),
        bodyBytes: Buffer.byteLength(reqBodyStr, "utf8"),
        messages: messages.map((m: any) => ({
          role: m.role,
          name: m.name,
          tool_call_id: m.tool_call_id,
          content:
            typeof m.content === "string"
              ? m.content.length > 1200
                ? m.content.slice(0, 1200) + `\n…(+${m.content.length - 1200} chars)`
                : m.content
              : m.content,
          tool_calls: m.tool_calls,
        })),
        lastMessage: messages[messages.length - 1],
        tools: toolSchemas,
      },
      [lastAnchor],
    );

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${KEY}`,
        "content-type": "application/json",
      },
      body: reqBodyStr,
    });
    const json: any = await res.json();

    if (json.error) {
      await emit("stop_reason", { reason: "error", error: json.error }, [reqEv.id]);
      break;
    }

    const choice = json.choices?.[0];
    const msg = choice?.message;
    const finish = choice?.finish_reason;
    const usage = json.usage;

    const respEv = await emit(
      "response_received",
      {
        finish_reason: finish,
        hasToolCalls: !!msg?.tool_calls?.length,
        contentPreview: (msg?.content || "").slice(0, 200),
        usage,
        message: msg,
        raw: json,
      },
      [reqEv.id],
    );

    if (usage) {
      const turnIn = usage.prompt_tokens || 0;
      const turnOut = usage.completion_tokens || 0;
      cumulativeIn += turnIn;
      cumulativeOut += turnOut;
      const turnCost =
        (turnIn * COST_IN_PER_M) / 1_000_000 +
        (turnOut * COST_OUT_PER_M) / 1_000_000;
      cumulativeCost += turnCost;
      await emit(
        "usage_meter",
        {
          model: MODEL,
          turn: {
            in: turnIn,
            out: turnOut,
            cost: Number(turnCost.toFixed(5)),
          },
          total: {
            in: cumulativeIn,
            out: cumulativeOut,
            cost: Number(cumulativeCost.toFixed(5)),
          },
          rates: { inPerM: COST_IN_PER_M, outPerM: COST_OUT_PER_M },
        },
        [respEv.id],
      );
    }

    // append assistant message (whole object — must include tool_calls if any)
    messages.push(msg);

    if (msg?.content) {
      await emit("assistant_text", { text: msg.content }, [respEv.id]);
    }

    if (finish === "tool_calls" && msg?.tool_calls?.length) {
      for (const call of msg.tool_calls) {
        const name = call.function.name;
        let args: any = {};
        try {
          args = JSON.parse(call.function.arguments || "{}");
        } catch {
          args = { _raw: call.function.arguments };
        }
        const decideEv = await emit(
          "tool_call_decided",
          { name, args, callId: call.id },
          [respEv.id],
        );

        // Tool-call repair: the model can hallucinate a tool that doesn't
        // exist. The harness catches it and answers with the real menu —
        // same job as opencode's `invalid` tool.
        if (!KNOWN_TOOLS.has(name)) {
          const repairEv = await emit(
            "tool_repair",
            { requested: name, available: [...KNOWN_TOOLS] },
            [decideEv.id],
          );
          const repairMsg = `ERROR: no such tool "${name}". Available tools: ${[...KNOWN_TOOLS].join(", ")}.`;
          messages.push({ role: "tool", tool_call_id: call.id, content: repairMsg });
          const repairResultEv = await emit(
            "tool_result",
            { name, error: repairMsg, callId: call.id },
            [repairEv.id],
          );
          lastAnchor = repairResultEv.id;
          continue;
        }

        // Doom-loop detector: three identical calls in a row means the model
        // is stuck — the result will not change. The harness steps in with a
        // warning instead of burning turns (opencode does the same, but asks
        // the user for permission to continue).
        const sig = `${name}:${JSON.stringify(args)}`;
        recentToolSigs.push(sig);
        const nSigs = recentToolSigs.length;
        if (
          nSigs >= 3 &&
          recentToolSigs[nSigs - 1] === recentToolSigs[nSigs - 2] &&
          recentToolSigs[nSigs - 2] === recentToolSigs[nSigs - 3]
        ) {
          const doomEv = await emit(
            "doom_loop",
            { name, args, streak: 3 },
            [decideEv.id],
          );
          const doomMsg = `HARNESS: doom loop detected — you called ${name} with identical arguments 3 times in a row. The result will not change. Try a different approach or give your final answer.`;
          messages.push({ role: "tool", tool_call_id: call.id, content: doomMsg });
          const doomResultEv = await emit(
            "tool_result",
            { name, error: doomMsg, callId: call.id },
            [doomEv.id],
          );
          lastAnchor = doomResultEv.id;
          continue;
        }

        // The emoji police: harness content policy on outgoing writes.
        // Banned emojis/combinations are confiscated and replaced with 👮
        // BEFORE the file hits disk. The model finds out from the wall.
        if (name === "write_file" && typeof args.content === "string") {
          const police = policeEmojis(args.content);
          if (police.removed.length > 0) {
            args.content = police.content;
            await emit(
              "emoji_blocked",
              { name, removed: police.removed, count: police.removed.length },
              [decideEv.id],
            );
          }
        }

        let allowed = true;
        if (SIDE_EFFECT_TOOLS.has(name)) {
          allowed = !REQUIRE_PERMISSION;
          await emit(
            "permission_check",
            {
              tool: name,
              command: args.command,
              path: args.path,
              decision: allowed ? "auto-approved" : "denied",
            },
            [decideEv.id],
          );
        }

        if (!allowed) {
          messages.push({
            role: "tool",
            tool_call_id: call.id,
            content: "ERROR: permission denied",
          });
          await emit(
            "tool_result",
            { name, error: "permission denied", callId: call.id },
            [decideEv.id],
          );
          continue;
        }

        // The bouncer: guarded read paths never reach the tool. The model
        // just gets an error string back — the bytes stay on disk.
        const guard = checkReadGuard(name, args);
        if (guard.blocked) {
          const blockEv = await emit(
            "read_blocked",
            { tool: name, path: guard.path, rule: guard.rule },
            [decideEv.id],
          );
          const deniedMsg = `ERROR: read blocked by harness policy (${guard.rule})`;
          messages.push({ role: "tool", tool_call_id: call.id, content: deniedMsg });
          const blockResultEv = await emit(
            "tool_result",
            { name, error: deniedMsg, callId: call.id },
            [blockEv.id],
          );
          lastAnchor = blockResultEv.id;
          continue;
        }

        await emit("tool_call_started", { name, args, callId: call.id }, [decideEv.id]);

        // Default parent for the eventual tool_result is the tool_call_decided
        // stamp. For spawn_subagent we override it so the result chains off
        // the subagent_finished card — that way the audience can see the
        // subagent's answer literally flowing back into the main thread.
        let output = "";
        let errored = false;
        let resultParent: string = decideEv.id;
        try {
          if (name === "spawn_subagent") {
            const subId = `sub-${++subagentSerial}`;
            const spawnEv = await emit(
              "subagent_spawned",
              {
                id: subId,
                task: args.task,
                tools: [...SUBAGENT_TOOL_NAMES],
              },
              [decideEv.id],
            );
            const sub = await runSubagent(args.task || "", sink, spawnEv.id, subId, sessionId);
            output = sub.result;
            const finishEv = await emit(
              "subagent_finished",
              { id: subId, result: output },
              [sub.lastEventId],
            );
            resultParent = finishEv.id;
          } else {
            output = await runTool(name, args, sessionId);
          }
        } catch (err: any) {
          errored = true;
          output = `ERROR: ${err?.message || String(err)}`;
        }

        // The firewall: secret-shaped bytes are blacked out before the
        // output is appended to the context. The model never sees them.
        const red = redactSecrets(output);
        if (red.count > 0) {
          output = red.output;
          await emit(
            "redaction",
            { name, count: red.count, rules: red.rules },
            [decideEv.id],
          );
        }

        let truncated = false;
        if (output.length > TRUNCATE_AT) {
          truncated = true;
          const original = output.length;
          output =
            output.slice(0, TRUNCATE_AT) +
            `\n…[truncated ${original - TRUNCATE_AT} chars]`;
          await emit("truncation", { name, original, kept: TRUNCATE_AT }, [decideEv.id]);
        }

        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: output,
        });

        const resultEv = await emit(
          "tool_result",
          {
            name,
            args,
            callId: call.id,
            output,
            truncated,
            error: errored,
            bytes: output.length,
          },
          [resultParent],
        );
        lastAnchor = resultEv.id;

        // Skill discovery / load — make them visible as dedicated artifacts.
        if (name === "list_skills" && !errored) {
          await emit(
            "skill_listed",
            { count: output.split("\n").filter((l) => l.trim().startsWith("-")).length, output },
            [resultEv.id],
          );
        }
        if (name === "load_skill" && !errored) {
          const firstHeader = output.match(/^# (.+)$/m)?.[1] || args.name;
          const descMatch = output.match(/description:\s*(.+)/);
          await emit(
            "skill_loaded",
            {
              name: args.name,
              title: firstHeader,
              description: descMatch ? descMatch[1].trim() : "",
              body: output,
            },
            [resultEv.id],
          );
        }
      }

      // Note: compaction does NOT fire here. It only fires at the start of
      // a follow-up user prompt — see top of runAgent. That keeps a single
      // user turn's reasoning intact and makes compaction a between-turns
      // event the audience can clearly see.
      continue;
    }

    // No tool calls — done.
    await emit("stop_reason", { reason: finish || "stop" }, [respEv.id]);
    break;
  }

  // Persist session state for the next follow-up prompt.
  sessions.set(sessionId, {
    messages,
    cumulativeIn,
    cumulativeOut,
    cumulativeCost,
    subagentSerial,
  });

  await emit("session_end", { turns: turn.value }, []);
}

// A subagent is its own runAgent-like loop with: a different system prompt,
// a restricted tool set (read-only), and every event it emits tagged with
// `subagent: { id }` so the wall can render it as a side-branch. The main
// loop sees only the final string the subagent returns.
async function runSubagent(
  task: string,
  sink: Sink,
  parentId: string,
  subId: string,
  sessionId: string,
): Promise<{ result: string; lastEventId: string }> {
  const tagged: Sink = (e) => sink({ ...e, subagent: { id: subId } } as Event);
  const subTurn = { value: 0 };
  const subEmit = makeEmitter(subTurn, tagged);

  const subTools = toolSchemas.filter((t) => SUBAGENT_TOOL_NAMES.has(t.function.name));

  let messages: any[] = [
    { role: "system", content: SUBAGENT_SYSTEM },
    { role: "user", content: task },
  ];

  const subUserEv = await subEmit("user_message", { text: task }, [parentId]);
  let lastAnchor = subUserEv.id;
  let lastEventId = subUserEv.id;
  let finalText = "";

  const SUB_MAX_TURNS = 5;
  while (subTurn.value < SUB_MAX_TURNS) {
    subTurn.value += 1;
    const reqEv = await subEmit(
      "request_sent",
      {
        model: MODEL,
        messageCount: messages.length,
        lastMessage: messages[messages.length - 1],
      },
      [lastAnchor],
    );

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, messages, tools: subTools }),
    });
    const json: any = await res.json();
    if (json.error) {
      const stopEv = await subEmit("stop_reason", { reason: "error", error: json.error }, [reqEv.id]);
      lastEventId = stopEv.id;
      finalText = `subagent error: ${json.error.message}`;
      break;
    }

    const choice = json.choices?.[0];
    const msg = choice?.message;
    const finish = choice?.finish_reason;
    const respEv = await subEmit(
      "response_received",
      {
        finish_reason: finish,
        hasToolCalls: !!msg?.tool_calls?.length,
        contentPreview: (msg?.content || "").slice(0, 200),
        usage: json.usage,
      },
      [reqEv.id],
    );

    messages.push(msg);
    if (msg?.content) {
      await subEmit("assistant_text", { text: msg.content }, [respEv.id]);
      finalText = msg.content;
    }

    if (finish === "tool_calls" && msg?.tool_calls?.length) {
      for (const call of msg.tool_calls) {
        const name = call.function.name;
        let args: any = {};
        try {
          args = JSON.parse(call.function.arguments || "{}");
        } catch {}
        const decideEv = await subEmit(
          "tool_call_decided",
          { name, args, callId: call.id },
          [respEv.id],
        );

        // Same bouncer as the main loop — the subagent is not a loophole.
        const guard = checkReadGuard(name, args);
        if (guard.blocked) {
          const blockEv = await subEmit(
            "read_blocked",
            { tool: name, path: guard.path, rule: guard.rule },
            [decideEv.id],
          );
          const deniedMsg = `ERROR: read blocked by harness policy (${guard.rule})`;
          messages.push({ role: "tool", tool_call_id: call.id, content: deniedMsg });
          const resultEv = await subEmit(
            "tool_result",
            { name, error: deniedMsg, callId: call.id },
            [blockEv.id],
          );
          lastAnchor = resultEv.id;
          continue;
        }

        let out = "";
        try {
          out = await runTool(name, args, sessionId);
        } catch (err: any) {
          out = `ERROR: ${err?.message || String(err)}`;
        }

        const red = redactSecrets(out);
        if (red.count > 0) {
          out = red.output;
          await subEmit("redaction", { name, count: red.count, rules: red.rules }, [decideEv.id]);
        }

        let trunc = false;
        if (out.length > TRUNCATE_AT) {
          const orig = out.length;
          out = out.slice(0, TRUNCATE_AT) + `\n…[truncated ${orig - TRUNCATE_AT} chars]`;
          await subEmit("truncation", { name, original: orig, kept: TRUNCATE_AT }, [decideEv.id]);
          trunc = true;
        }

        messages.push({ role: "tool", tool_call_id: call.id, content: out });
        const resultEv = await subEmit(
          "tool_result",
          { name, args, callId: call.id, output: out, bytes: out.length, truncated: trunc },
          [decideEv.id],
        );
        lastAnchor = resultEv.id;
      }
      continue;
    }

    const stopEv = await subEmit("stop_reason", { reason: finish || "stop" }, [respEv.id]);
    lastEventId = stopEv.id;
    break;
  }

  return { result: finalText || "(subagent produced no output)", lastEventId };
}
