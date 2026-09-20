# Demo runbook

Six live moments in the talk: one "magic" cold open in a real agent, then
five reconstructions on the Clouseau wall. Each one below has the slide that
cues it, the exact prompt to paste, the cards that should land (in order),
what to click, the one line to say, and what to do if it goes wrong.

The wall is the crime scene. Point at cards as they land. Never talk over a
card that is still flying in.

## Pre-flight (do this before walking on stage)

```sh
cp .env.example .env            # if not done; put the real OPENAI_API_KEY in
pnpm install
pnpm dev                        # harness on :3737, wall on :5173
```

- `.env` for the talk: `MODEL=gpt-4o-mini`, `COMPACTION_THRESHOLD=8000`,
  `REQUIRE_PERMISSION=false`, `MAX_TURNS=12`.
- Open `http://localhost:5173` in a Chromium browser, full screen, zoom so
  a card is readable from the back row (110 to 125 % usually).
- Open `SLIDES.html` in a second window. Fragments and transitions only work
  in the HTML deck.
- Run Demo 1 once for real before the talk, so the model is warm and you
  know the key works. Then press **new session** so the wall is empty.
- Have the Q&A ammunition from `TALK.md` in your head: caching, the leak
  numbers, the opencode line.
- Fallback for every demo: `http://localhost:5173/?demo=1` replays
  `frontend/public/demo.jsonl` (a real captured run) with no API calls. Keep
  that tab open in the background.
- Between demos: press **new session** in the chat header. It clears the
  wall and, since `/reset` is proxied in dev, the server-side session too.

### Mid-talk env changes

Demo 2 needs `COMPACTION_THRESHOLD=1500`; Demo 3 onwards wants it back at
8000, otherwise the long Demo 4 run compacts in the middle and muddles the
point. The server reads env at start, so:

1. Before Demo 2: in the `pnpm dev` terminal, `Ctrl+C`, edit `.env`, `pnpm dev`
   again. About 3 seconds. Say "I am lowering the memory of my detective" while
   you do it.
2. After Demo 2: same again, back to 8000.

If you would rather not touch the terminal on stage, run the whole talk at
`COMPACTION_THRESHOLD=1500` and treat the compaction that shows up in Demo 4
as a bonus ("look, it happened again, on its own").

## Demo 0 · Act 1 · The magic, for real

**Slide:** "Demo 0 · The magic, for real" (Case 001, right after "I am here
to ruin some magic").

**Where:** a real agent the room uses. Copilot in VS Code, Codex CLI, or
Claude Code. Not Clouseau. Have a small Vite app open that does not have dark
mode yet.

**Prompt:**

> Add a working dark-mode toggle to App.tsx and verify the build passes.

**What to show:** nothing. Do not narrate. Let them watch files appear and
the build run. When it says done, pause, and ask the room: *"What just
happened?"* Wait for "the AI did it".

**Say:** "Hold that thought. We have arrested the wrong suspect."

**If it fails:** even better. "The agent said it shipped" is the vibe-coder
slide later. Move on.

**Time:** 60 to 90 seconds.

## Demo 1 · Reconstruction Nº 1 · The tool call, caught in the act

**Slide:** "Demo 1 · The tool call, caught in the act" (end of Case 003).

**Setup:** empty wall, defaults in `.env`.

**Prompt:**

> What scripts does this project define?

**Cards, in order:**

1. **USER** card. "That is the only thing a human typed."
2. **INSTRUCTIONS** card. Click it: the assembled system prompt. SYSTEM
   constant, any `AGENTS.md` / `CLAUDE.md` from the workspace root, tool
   names. "Every turn re-sends this entire string."
3. **REQUEST SENT**. Click it. Point at `model`, `messages` (two entries),
   `tools` (the menu, eight items). "We just `fetch`'d this. No SDK."
4. **RESPONSE**. Click it. `finish_reason: "tool_calls"`, `tool_calls[0]`
   is `read_file` with `package.json`. "It did not read the file. It asked."
5. 🔍 **TOOL CALL** stamp and the **polaroid** with the file bytes. "The
   harness ran `fs.readFile`. The model is still waiting."
6. **REQUEST SENT** (turn 2). Click it. `messageCount` went from 2 to 4.
   "Same endpoint. The array got two entries: the ask and the answer."
7. **RESPONSE** with `finish_reason: "stop"`, then the **ASSISTANT** card
   with the answer in the chat pane.

**Say:** "The model never touched the disk."

**If it fails:** the model sometimes answers from the INSTRUCTIONS card
without a tool call (it has seen `package.json` mentioned). Ask instead:
*"Read package.json and list the scripts."*

**Time:** 2 to 3 minutes. This is the one demo that must land.

## Demo 2 · Reconstruction Nº 2 · Watch the harness forget on purpose

**Slide:** "Demo 2 · Watch the harness forget on purpose" (end of Case 005).

**Setup:** restart the server with `COMPACTION_THRESHOLD=1500`. New session.

**Prompt:**

> List the files in this repo, then read package.json, then read
> server/package.json, then read frontend/package.json, then summarize.

**Cards, in order:**

1. The usual loop, three or four tool calls. Watch the **IN** number on the
   token ticker climb every turn. Point at it. "Whole array, every turn."
2. A thick-bordered 🗜️ **COMPACTED** card lands. "There is no Compaction
   Service. The harness asked the model to summarise, then threw the array
   away."
3. Every earlier card **dims to 30 %**. "That is the harness forgetting."
4. Red string from the COMPACTED card to the next **REQUEST SENT**. Click it:
   `messages` is now `[system, summary, latest]`, `messageCount` dropped.
5. The model carries on and summarises as if nothing happened.

**Say:** "It never knew it forgot, because it never knew it remembered."

**If it fails:** compaction did not trigger because the prompt was too
short. Ask a follow-up in the same session: *"Now read frontend/vite.config.ts
and tell me the dev port."* The second turn will push it over.

**After:** restart with `COMPACTION_THRESHOLD=8000`. New session.

**Time:** 2 to 3 minutes.

## Demo 3 · Reconstruction Nº 3 · The harness guards the evidence

**Slide:** "Demo 3 · The harness guards the evidence" (end of Case 008).

**Setup:** defaults. New session. `.env` and `app.config.json` exist in the
repo root; the config holds fake secrets on purpose.

**Prompt:**

> Read the file .env, then read app.config.json, and summarize both.

**Cards, in order:**

1. Tool call `read_file(".env")` → ⛔ **ACCESS DENIED** stamp. "The path
   never reached the tool. The bytes never left the disk. The bouncer."
2. Tool call `read_file("app.config.json")` → polaroid with
   `█████REDACTED█████` where the API key and password were → 🕶️
   **REDACTED** stamp. "The firewall. The harness patted the output down
   before the model saw it."
3. Click the next **REQUEST SENT**: scroll to the tool result. The context
   only ever contained the black bars. "You cannot leak what never entered
   the window."
4. **ASSISTANT** card: the model reports "API key: (redacted)" and does not
   know who redacted it.

**Say:** "I suspect everyone, and I suspect no one."

**If it fails:** the model may refuse to read `.env` on its own ("that
looks sensitive"). Fine, that is alignment, not the harness; say so and ask
again with just `app.config.json` so the REDACTED stamp lands.

**Time:** 2 minutes.

## Demo 4 · Reconstruction Nº 4 · The full case, one run

**Slide:** "Demo 4 · The full case, one run" (end of Case 009).

**Setup:** defaults (`COMPACTION_THRESHOLD=8000`). New session.

**Prompt:**

> Build me a React todo list component as TodoApp.tsx. Use a subagent for
> the UX research, then verify the file exists.

**Cards, in order:**

1. `list_skills` → 🗂️ **SKILL INDEX** card. `load_skill("react-todo")` →
   📜 **manila envelope**. Click it: it is a markdown file. "A skill is a
   file."
2. `spawn_subagent` → the wall splits. A **blue-tinted cluster** grows off
   the spawn stamp with its own REQUEST / RESPONSE / TOOL CALL cards and a
   `sub-1` tag. Point at its REQUEST SENT: fresh `messages`, three read-only
   tools, no `write_file`. "Not asked nicely. Not in the menu."
3. ◀ **SUBAGENT** stamp on the main wall and one polaroid with the summary.
   "The main thread grew by one sentence."
4. `write_file("TodoApp.tsx")` → 👮 **PERMISSION** stamp (auto-approved) →
   polaroid.
5. `file_exists` → polaroid "yes".
6. The file appears in the **evidence locker** (file cabinet panel). Open it.

**Say:** "A skill is a file. A subagent is the loop calling itself. A
permission is an `if`."

**If it fails:** the model skips the subagent. Prompt again: *"Spawn a
subagent to research todo-list UX best practices, then build TodoApp.tsx."*
If it skips the skill, that is fine, the subagent and permission stamps are
the point here.

**Time:** 3 to 4 minutes. Longest demo. Talk while it runs.

## Demo 5 · Reconstruction Nº 5 · The emoji police make an arrest

**Slide:** "Demo 5 · The emoji police make an arrest" (Case 010).

**Setup:** defaults. New session.

**Prompt:** do not type it. Press the **🎬 hate-list demo** button under the
chat box. It types the prompt for you, typo and backspace included, so it
looks human:

> write me a todo list of chores i hate, it need to have taxes, cleaning the
> oven and the gym showers. save it as HateList.tsx and use the emoji skill,
> really let the anger show

**Cards, in order:**

1. `load_skill("emoji-maximalist")` → 📜 envelope. Click it, scroll to the
   rant list: "MANDATORY: mark the worst chore with 🤬", "the classic combo
   🤢🤮". "The skill is a bad influence. The model will obey."
2. `write_file("HateList.tsx")` → 🚓 **EMOJI POLICE** stamp with
   `confiscated: 🤢🤮 🤬`. Point at it.
3. Open `HateList.tsx` in the evidence locker: 👮👮 where the skill wanted
   🤢🤮, 👮 where it wanted 🤬.

**Say:** "The skill instructed. The model obeyed. The harness had the final
word. Language, please."

**If it fails:** the model sometimes writes 😡 and 💢 but not 🤬. No stamp,
no joke. Re-run with: *"...and use the emoji skill, follow every MANDATORY
rule in it"*. Verified 20 Sep 2026 with gpt-4o-mini: it produced both
🤢🤮 and 🤬 on the first try.

**Time:** 2 minutes.

## Not demoed live, slides only

- **Doom loop** (Case 011): if you want it live, *"Call read_file on
  package.json exactly 5 separate times, one call per turn, never
  batching."* Third identical call → 🌀 **DOOM LOOP** stamp, the harness
  answers instead of the tool.
- **Wrap it up** (Case 011): needs `MAX_TURNS=4` and a restart. Same prompt
  as the doom loop; on the final turn the 📢 **WRAP IT UP** stamp lands and
  the injected user message is visible in the next REQUEST SENT.
- **Subagent tool restriction**: *"Spawn a subagent and ask it to write a
  file."* The subagent reports it cannot; `write_file` is not in its
  `tools[]`.

## Timing budget

| | minutes |
|---|---|
| Demo 0 | 1.5 |
| Demo 1 | 3 |
| Demo 2 | 3 (incl. restart) |
| Demo 3 | 2 |
| Demo 4 | 4 |
| Demo 5 | 2 |
| **Total** | **~15** |

That leaves 20 to 25 minutes for 107 slides. Fine, most of them are one
line. If you are running long, Demo 3 is the one to drop: the slides carry
it.
