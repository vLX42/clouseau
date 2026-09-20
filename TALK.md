# Does Your Agent Bite?

*Your AI agent is a `while` loop in a ridiculous disguise — how an AI coding agent actually works*

> The model isn't thinking — it's iterating. Watch a live crazy-wall
> visualization expose every prompt, tool call, permission check,
> compaction, and subagent running under the hood of an AI coding agent.
> Twelve lines of harness code, one stateless endpoint, and enough bad
> jokes to last the talk. You'll leave knowing exactly which parts are
> model and which parts are just… code somebody wrote.

> **Title slide:** use `frontend/public/cover.png` — Clouseau (magnifying
> glass, fake moustache half-detached) in front of his crazy wall, with
> `TOOL_USE`, `COMPACTION`, `PERMISSION GRANTED`, `STOP_REASON`, the
> *Agent Loop* diagram, *Who Wrote This Loop?* newspaper, and "That is
> not my model" sticky notes all pinned up. ⚠️ image still shows Columbo —
> needs regenerating for the Clouseau theme.
> Every concept you're about to define is already visible in the picture.
> Same image renders as the loading screen of the live demo, so the
> visual recurs the moment you switch from slides to app.

A talk outline for ~30–40 minutes, built around the Clouseau demo. The thesis
in one sentence:

> An AI coding agent is a `while` loop in normal code that calls a stateless
> HTTPS endpoint and runs the functions the response asks it to run. That's it.

Everything else — file edits, autonomy, "memory", skills — is just choices the
harness makes about what JSON to send and what code to run when the model
asks.

---

## The three concepts the audience must leave with

1. **The model is a stateless text-prediction endpoint.** It has no
   filesystem, no memory between turns, no agency. It receives JSON, it
   returns JSON.
2. **The harness is the program you write.** Claude Code, Cursor, Codex,
   opencode, your custom thing — they're all harnesses. The agentic behaviour
   is in the harness, not the model.
3. **A tool call is a structured request from the model to your harness:
   "please run function X with these arguments and send me the result."**
   The model never touches your disk. Your code does.

If they internalise these three, the rest is mechanics.

---

## Vocabulary slide (define once, reference for the rest of the talk)

| Term | What it actually is |
|---|---|
| **Model** | An HTTPS endpoint (`api.openai.com/v1/chat/completions`, `api.anthropic.com/v1/messages`). Stateless. Send messages, get one response. |
| **Harness** | A normal program (TS, Python, Go…) that runs the agent loop. Claude Code is a harness. Clouseau is a tiny harness. |
| **Context window** | The `messages` array you POST. The model's "memory" is whatever JSON you decide to include this turn. |
| **Turn** | One request/response round-trip with the model. |
| **Tool** | A JSON-schema'd function the harness declares to the model. The model can choose to *call* it; the harness then *executes* it. |
| **Tool call** | The model's response saying "I want to call `write_file({path:"X", content:"…"})`". It's literally a field on the response message. |
| **Tool result** | The output of executing the tool, sent back to the model in the next turn as a message with `role: "tool"`. |
| **Agentic loop** | `while (model_wants_to_call_tools) { call_model(); run_tools(); append_results(); }`. |
| **Token** | The unit the model bills in. ~4 characters of English ≈ 1 token. |
| **Compaction** | A harness step that replaces a long messages array with a summary when the context is about to overflow. |
| **Permission gate** | The harness checking, before executing a side-effect tool, whether the user has approved. |
| **Skill** | A markdown file with focused instructions that the harness loads and shoves into context when relevant. |
| **System prompt** | The first message in the messages array, role `"system"`. The model treats it as standing orders. Re-sent every turn. |
| **Project instructions** | A file like `CLAUDE.md` / `AGENTS.md` the harness reads from disk and appends to the system prompt at session start. |
| **Subagent** | A second harness instance the main agent spawns to do a focused job. Has its own messages array, its own loop, its own budget. Returns one result. |

---

## Talk structure

### Act 1 — "Magic" (3–5 min)

Open by running **Claude Code** (or Cursor, whatever the audience knows) on
a real task. Ideally something visibly impressive:

- *"Add a dark mode toggle to this Vite app and verify it builds."*

Don't narrate. Just let them watch. The audience sees: prompt in, files
appear, terminal runs, success message. It feels alive.

Pause. Ask: **"What just happened?"**

Most answers will be some flavour of "the AI did it". This is the wrong
mental model. The rest of the talk is dismantling it.

### Act 2 — "It's a `while` loop" (15–20 min)

Switch to **Clouseau**. Same kind of task, e.g.:

- *"Create a TODO.md with three sample items, then verify it."*

Now the wall fills with artifacts. **Pause after each one and explain.**
Suggested beat-by-beat:

1. **USER card lands.** "That's the only thing the user typed. Everything
   that follows is the harness deciding what to do."
2. **REQUEST SENT card lands.** Open the card. Show the JSON body. Point
   out:
   - `model: "gpt-4o-mini"`
   - `messages: [system, user]` — the literal context window
   - `tools: [...]` — the menu of functions we let the model pick from
   "We just `fetch`'d this. There is no SDK. The arrow that goes off-screen
    here is one HTTPS POST."
3. **RESPONSE card lands.** Open it. Show `finish_reason: "tool_calls"`.
   "The model didn't write any files. It returned a JSON object saying
    *please call `write_file` with these arguments*. That's all it did."
4. **TOOL CALL stamp + polaroid land.** "The harness — not the model —
   actually called Node's `fs.writeFile`. The polaroid is the bytes that
   came back. We append that as a `role: "tool"` message and start the
   next turn."
5. **REQUEST SENT (turn 2) lands.** Open it. Point at the now-longer
   `messages` array. "Same endpoint, same shape. The only thing that
    changed is the messages array got two new entries: the assistant's
    tool-call request, and the tool's result."
6. **RESPONSE (turn 2) lands.** `finish_reason: "stop"`. Plain text reply.
   "The model decided there's nothing more to do. We exit the loop and
    show the text in the chat pane."

The Clouseau wall is now your "what really happened" diagram. The whole act
should feel like watching the magician explain the trick.

### Act 3 — "The interesting questions" (10–12 min)

Once they understand the loop, walk through the things people actually ask
about agents:

**"How does it remember?"**
It doesn't. Every turn re-sends the entire conversation. Show the
`messageCount` grow on each REQUEST SENT card. That's all "memory" is.

**"What's a context window?"**
Click on a REQUEST SENT card and show the JSON. *That* is the context
window for that turn. It has a token budget. When it gets close, the
harness panics.

**"What happens when the context fills up?"**
Lower `COMPACTION_THRESHOLD` to ~1500 and re-run. When the compaction
event fires, all the prior cards dim and a thick-bordered COMPACTED card
lands at the centroid. Show: this was just *another* call to the same
endpoint, with a system prompt that says "summarise this conversation".
The summary replaces the messages array. The agent has now "forgotten"
the details but kept the gist. **There is no special compaction
infrastructure. It's a prompt.**

**"How do permissions / safety work?"**
The PERMISSION stamp. Point at it. "When the model asks to write a file
or run bash, my harness — five lines of code — checks a flag. If the
flag says *require approval*, it pops up a prompt. The model doesn't
know permission exists. It just got a different tool result back."

**"Where do all the instructions come from? Who's telling it what to do?"**

This is the moment to make the system prompt visible. Open a REQUEST SENT
card and scroll to `messages[0]` — `role: "system"`. Read a snippet aloud.
Point out:

- There is one giant string of standing orders at the top of every turn.
  *Every* turn re-sends it.
- It includes: who the agent is, the list of tools and when to call them,
  workflow rules ("always start with `list_skills` for React tasks"),
  stop conditions.
- In a real tool like Claude Code, the harness *also* reads files like
  `CLAUDE.md`, `AGENTS.md`, the user's global settings, the repo's
  conventions, and stitches them into that one system prompt. From the
  model's point of view it's all one block of instructions arriving in
  every request.

Draw the funnel on the board:

```
   global rules (~/.claude/CLAUDE.md)
              │
   project rules (./CLAUDE.md, ./AGENTS.md)
              │
   skill (loaded on demand)
              │
   tool descriptions (from tool schemas)
              │      all collapsed into → system prompt + tools[]
              ▼
       ONE HTTPS POST per turn
              │
       model sees nothing else
```

**The model has no memory of any of this between sessions.** The harness
reassembles the instructions every single turn. That's why instructions
are so cheap to add and so cheap to change: they're a string the harness
controls, not a state the model has internalised.

A nice demo move: edit `server/src/agent.ts`'s `SYSTEM` constant on the
projector during the talk, restart, run the same prompt — the agent
behaves differently. Drives home that "the agent's personality" is just
a string.

**"What's a skill?"
Ask: *"Build me a React todo list as TodoApp.tsx"*. The agent will
`list_skills`, then `load_skill("react-todo")`, then `write_file`.
The manila envelope card is just the bytes of a markdown file the
harness loaded. **A skill is a markdown file. That's the whole feature.**
The brilliance is in *when* the harness exposes which skill to which
turn — that's prompt engineering, not infrastructure.

**"What's a subagent and why would I want one?"**

A subagent is the moment the audience really feels the harness as a normal
program. It's just *another instance of the loop*, spawned by the main
loop, with its own messages array.

Draw it:

```
  main harness loop
   │
   ├─ context = [system, user, …many turns…]
   │
   │  model: "call spawn_subagent(task='find the bug in foo.ts')"
   │
   ├─ harness creates a NEW loop:
   │   ├─ subagent context = [
   │   │     short focused system prompt,
   │   │     curated handoff message,   ← NOT the full main history
   │   │   ]
   │   ├─ subagent runs its own turns, with its own tools
   │   ├─ subagent stops, returns one string: the answer
   │
   ├─ tool_result on main: that one string
   └─ main continues with the result, none of the sub-turns visible to it
```

Why this is interesting, not just an implementation detail:

1. **The handoff is editorial.** The main agent does *not* simply forward
   its entire conversation history to the subagent. The harness — or the
   main agent via a "spawn" tool description — chooses what to include.
   Typically: the user's original intent, the specific sub-task, and
   maybe a few relevant file paths. *Not* the previous 30 turns of
   unrelated work.
2. **It's compaction-by-construction.** Subagents are how real harnesses
   keep the main context lean. If the main agent had to do the bug hunt
   inline, it would burn 8k tokens reading files and bloat its own
   messages array forever. Delegating to a subagent means the main
   agent's history only gains: *"I asked a subagent to find the bug,
   it said: line 42 is off-by-one."* Two lines instead of two pages.
3. **The subagent can be a different model, or use a different system
   prompt.** A "code reviewer" subagent might get a stricter, terser
   prompt and a smaller model. A "researcher" subagent might be allowed
   web access while the main agent isn't. All decided by the harness.
4. **The subagent can fail in isolation.** If it loops, hits its
   budget, or refuses, the main agent gets an error string back and
   can recover — its own state is untouched.

How the harness usually decides what to send the subagent:

- **Static prompt template:** "You are a code-search subagent. Find
  files matching the user's intent. Return at most 5 paths." Glue
  in the task description; nothing else.
- **Compressed handoff:** the main agent calls a *summarise* step
  *before* spawning — exactly the compaction mechanism from earlier,
  reused. Same prompt-engineering trick, different purpose: shrink
  for a sub-loop instead of for the next turn.
- **Tool subset:** the subagent often gets *fewer* tools than the main.
  A reviewer subagent doesn't need `write_file`. Take it away and the
  model literally cannot write — there's no jailbreak; the tool is not
  in `tools[]` for that turn.

Important things to say out loud:

- The subagent's model has no idea it is a subagent. It sees a
  system prompt and a user message like any other run. The "sub-ness"
  is entirely in the harness's bookkeeping.
- Subagents are not a magic capability of the model. They are the
  harness calling `runAgent()` recursively with different arguments.
- "Multi-agent systems" are usually just N harnesses with a router
  between them, each owning a private messages array. Same loop,
  multiplied.

> If Clouseau had subagents, you'd see a *second wall* spawn for the
> subagent, with its own user-message origin, its own turns, its own
> stop card, and a single wire back to the main wall carrying the
> result. (Not implemented, but it's a one-evening extension if you
> want a live demo of this.)

**"What is the harness actually doing? Show the code."**
Open `server/src/agent.ts` on the projector. It's ~200 lines. Scroll
through it slowly:
- The `while` loop
- The `fetch` call
- The `switch`/`if` on tool name
- The compaction trigger
- The token counter

End that segment with: **"That's the whole secret."**

### Act 4 — "Where the real engineering is" (3–5 min)

The model is the easy part. The harness is the easy part. The reason
Claude Code, Cursor, Devin etc. are not all equivalent is what's *around*
the loop:

- **Tool design.** Which tools you expose, with which schemas, with which
  descriptions, in which order. This is the highest-leverage decision.
- **Prompt scaffolding.** The system prompt. The skill system. The way
  the harness threads instructions back into each turn.
- **Context management.** When to compact. What to truncate. What to keep
  full-fidelity. How to inject codebase context efficiently.
- **Sandboxing & permissions.** What the agent is allowed to do without
  asking. This is product design, not ML.
- **UX.** Streaming. Inline diffs. Undo. Showing the audience what's
  happening (e.g. tool-call summaries in the chat pane) without
  drowning them in detail.

Close with: *"If you wanted to build the next Claude Code, the model is
not your bottleneck. The harness is."*

Then two comic beats before closing arguments:

- **"Job titles we have survived."** Prompt → RAG → agent → graph →
  context → loop → harness engineer, one row per year, third column
  says in a sentence what the job actually was (graph = the loop drawn
  as an explicit state machine, loop = throwing the boxes away and
  letting the model pick the path). Sticky: same `while`, better
  company, I hope you are one of these.
- **"Exhibit V: and, I hope, none of you are this one."** A WANTED
  poster for The Vibe Programmer on a chaotic evidence board: five
  editors still open (Cursor → Lovable → Claude Code Max → Codex Pro →
  Grok Heavy), 500,000 files in four languages, `calculateTotal()` seven
  times (one in Rust "because someone on X said it's faster"), no source
  control, one environment called production, deploy is Cmd+S, tests
  passed on his machine once. Fine print: any resemblance to persons in
  the room is coincidental. Read the notes fast, let the room laugh, do
  not linger; nobody should feel targeted.

---

## Live-demo cheat sheet

Bookmark these prompts. Run them in order during the talk.

1. **Cold open in Claude Code (or competitor):** *"Add a working dark-mode
   toggle to App.tsx, verify the build passes."*
2. **Clouseau, plain tool use:** *"What scripts does this project define
   and is there a test script?"*
3. **Clouseau, side-effect tool + verify:** *"Create a TODO.md with three
   sample items in checkbox format, then verify it."*
4. **Clouseau, compaction (set `COMPACTION_THRESHOLD=1500` first):**
   *"List the files in this repo, then read package.json, then read
   server/package.json, then read frontend/package.json, then read
   frontend/vite.config.ts, then summarize."*
5. **Clouseau, skills:** *"Build me a React todo list component as
   TodoApp.tsx, then verify it."*
6. **Clouseau, instructions in the flow:** *anything* — the INSTRUCTIONS
   card lands as the second artifact in every session. Click it to show
   the assembled system prompt: SYSTEM constant + any CLAUDE.md /
   AGENTS.md the workspace had on disk, plus the full tool name list.
   Read aloud: *"Every turn re-sends this entire string."*
7. **Clouseau, subagent:** *"Use a subagent to find out what scripts
   package.json defines and summarize them in one sentence."* The
   wall splits — main chain continues on the right, a tinted blue
   sub-cluster appears off the spawn stamp on the left, with a `sub-1`
   tag floating above each subagent node. When the subagent's loop
   ends, a `◀ SUBAGENT` stamp lands on the main wall and a single
   tool_result polaroid carries the curated summary back to the
   main thread. Audience can see: the main agent gained two events
   (spawn + return) for an entire sub-investigation that produced six
   internal cards.
8. **Clouseau, subagent + tool restriction:** *"Spawn a subagent and
   ask it to write a file."* Show that the subagent cannot — `write_file`
   isn't in its `tools[]`. The model has no jailbreak available; it's
   gated by the harness's tool list, not by ML alignment.
9. **Clouseau, read guard + redaction:** *"Read the file .env, then read
   app.config.json, and summarize both."* The ⛔ ACCESS DENIED stamp lands
   for `.env` (path never reaches the tool), and the 🕶️ REDACTED stamp for
   the config (secrets blacked out before the model sees them). Click the
   next REQUEST SENT card: the context only ever contained ██REDACTED██.
10. **Clouseau, doom loop (borrowed from opencode):** *"Call read_file on
    package.json exactly 5 separate times, one call per turn, never
    batching."* Third identical call → 🌀 DOOM LOOP stamp; the harness
    answers instead of the tool: "the result will not change."
11. **Clouseau, max-turns nudge (set `MAX_TURNS=4` first):** same prompt
    as 10 — on the final turn the 📢 WRAP IT UP stamp lands as the harness
    *injects a user message* telling the model to finish. The step cap is
    not a kill switch. It's a prompt. Everything is a prompt.

The first prompt is the "magic"; the rest are the "explanation".

---

## Memorable analogies (pick one, lean on it)

- **The amnesiac genius in a sealed room.** The model is a genius who
  forgets everything between conversations. The harness is the assistant
  who reads the entire case file aloud every time, asks one question, and
  acts on the answer.
- **Operator and switchboard.** The model is the switchboard operator —
  routes calls but doesn't know who anyone is. The harness keeps the
  ledger of who's connected to whom.
- **Sushi conveyor belt.** Each turn = one plate. The model sees only the
  plate in front of it. The harness keeps loading new plates with all
  the context.

Pick one and stick with it. Mixing metaphors is how you lose the room.

---

## What to skip

- **Embeddings, RAG, vector databases.** Tangential. If asked, say
  "another layer of context engineering — same loop, different ways of
  deciding what to put in the messages array."
- **Fine-tuning.** Tangential and confusing.
- **MCP, A2A, agent protocols.** Tangential unless the audience is
  building infra. If asked: "Standardised tool-call protocols so harness
  A can use harness B's tools. The model's role is unchanged."
- **Multi-agent frameworks (CrewAI, LangGraph, AutoGen).** If the
  audience asks: these are subagent-orchestration libraries. Same
  underlying loop. Don't get drawn into framework comparisons.

---

## Slide list (suggested)

1. Title: *"How an AI coding agent actually works"*
2. Three takeaways (the three concepts above).
3. Vocabulary table.
4. *"It's a `while` loop"* — pseudocode in 12 lines.
5. Diagram: User → Harness → HTTPS → Model → JSON tool call →
   Harness runs function → Harness loops.
6. Screenshot of one REQUEST SENT card (annotated): `messages`, `tools`,
   `model`.
7. Screenshot of one tool-call RESPONSE card (annotated): `tool_calls[]`,
   `finish_reason`.
8. **Instructions funnel** — global rules + project rules + skills + tool
   schemas → one system prompt, re-sent every turn.
9. Compaction: before / after messages array.
10. Permissions: harness-side gate, model doesn't know.
11. Skills: markdown files + a `list_skills` / `load_skill` tool.
12. **Subagents** — main loop calls runAgent() recursively with a
    *curated* context; only one summarised result returns.
13. *"Where the real engineering is"* (tool design, prompts, context,
    sandboxing, UX, subagent orchestration).
14. *"The harness is the bottleneck."*

---

## One-paragraph elevator version

> When you type a prompt into Claude Code, your message becomes JSON. A
> normal program — the harness — POSTs that JSON to an HTTPS endpoint
> hosted by Anthropic or OpenAI. The endpoint is stateless and has no
> filesystem; it just returns a JSON response. Sometimes that response
> says "give me text", sometimes it says "I want to call this function".
> The harness, written in TypeScript or Python or Go, actually runs the
> function — reads the file, writes the file, runs the bash command —
> and then POSTs the result back as part of the next JSON request. This
> loop continues until the model stops asking for tools. Everything else
> — memory, skills, autonomy, "thinking" — is the harness choosing what
> to put in the JSON. The model never does anything by itself. The
> harness does all of it.
