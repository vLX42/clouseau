# Demo runbook

Two live demos on the Clouseau wall, four reconstructions that are animated
inside the slides (arrow key steps them, like fragments), and an appendix of
extra live prompts if the room wants more.

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
- Run live demo 1 once for real before the talk, so you know the key works
  and the wall layout is what you expect. Then press **new session** so the
  wall is empty and `tmp/` is wiped.
- Have the Q&A ammunition from `TALK.md` in your head: caching, the leak
  numbers, the opencode line.
- Fallback for every demo: `http://localhost:5173/?demo=1` replays
  `frontend/public/demo.jsonl` (a real captured run) with no API calls. Keep
  that tab open in the background.
- Between the two demos: press **new session** in the chat header. It clears
  the wall and, since `/reset` is proxied in dev, the server-side session too.
- No env changes during the talk. Defaults all the way.

## Live demo 1 · The tool call, caught in the act

**Slide:** "Live demo 1 of 2 · The tool call, caught in the act" (end of Case 003,
right after "The model cannot write the file. It can only ask.").

**Setup:** empty wall, defaults in `.env`.

**Prompt** (paste it, do not improvise; verified 20 Sep 2026, three clean
turns every time):

> Create a file TODO.md with three sample items as a checkbox list, then verify it exists.

Why this one: the slide before says the model cannot write a file. This
prompt makes it *ask* for a write, shows the harness doing it, and ends with
a real file in the evidence locker. Read-only prompts ("what scripts are
defined") work too but land flat after that slide.

**Cards, in order** (about 30 seconds of wall time):

1. **USER** card. "That is the only thing a human typed."
2. **INSTRUCTIONS** card. Click it: the assembled system prompt, ~1,600
   chars. SYSTEM constant, any `AGENTS.md` / `CLAUDE.md` from the workspace
   root, the tool names. "Every turn re-sends this entire string."
3. **REQUEST SENT** (turn 1). Click it. `model`, `messages` (2 entries),
   `tools` (8 items, the menu). "We just `fetch`'d this. No SDK."
4. **RESPONSE**. Click it. `finish_reason: "tool_calls"`, `content: null`,
   `tool_calls[0].function.name = "write_file"` with the TODO content in
   `arguments` as a JSON string. "It did not write anything. It asked. In
   JSON."
5. 👮 **PERMISSION** stamp ("auto-approved"), then ✍️ **TOOL CALL** stamp and
   the **polaroid** with the bytes written. "The harness ran `fs.writeFile`.
   The model is still waiting for the reply."
6. **REQUEST SENT** (turn 2). Click it: `messageCount` 2 → 4. The array grew
   by the ask and the answer. Point at the IN counter on the token ticker: it
   went up, because the whole array went again.
7. **RESPONSE**: `tool_calls[0]` is `file_exists`. 🔍 **TOOL CALL** and a
   polaroid saying `yes 59`. "It is checking its own work. Also just a tool."
8. **REQUEST SENT** (turn 3), `messageCount` 6. **RESPONSE** with
   `finish_reason: "stop"`. **ASSISTANT** card: "The file TODO.md has been
   created… and it exists on disk."
9. 🗄️ `TODO.md` shows up in the **evidence locker**. Open it.

**Say:** "The model never touched the disk. It sent three JSON documents. The
harness did everything else."

**If it fails:** the model occasionally skips the verification and stops
after the write. No harm; you lose one turn. If it refuses or rambles, press
**new session** and paste again; gpt-4o-mini is consistent on this prompt.

**Time:** 2 to 3 minutes. This is the one demo that must land.

## Animated reconstructions (inside the slides)

Each of these is a mini crazy-wall drawn in the slide. Press → to land the
next card. Say the line, then press again. They degrade to a static picture in
the PDF/PPTX export, so only present from `SLIDES.html`.

### A · "What the room sees, every day" (Case 001, replaces the cold open)

A fake terminal. Each → types one more line: thinking, edited `App.tsx`,
created `theme.css`, `npm run build`, ✓ built, "Done". Do not narrate the
lines. After the last one, ask: *"What just happened?"* Wait for "the AI did
it".

### B · "The harness forgets on purpose" (Case 005)

Static: eight cards, the array growing 2 → 4 → 6 → 8.
→ 1: token ticker, IN 8,120 over the 8,000 threshold. *"The whole array,
every turn. Until it does not fit."*
→ 2: COMPACTED card slams in, every earlier card dims to 30 %. *"The harness
asked the model to summarise, then threw the array away. There is no
Compaction Service."*
→ 3: red string to a new REQUEST SENT with `messages: 3`. *"It never knew it
forgot, because it never knew it remembered."*

### C · "The harness guards the evidence" (Case 008)

Static: `read_file(".env")`, `read_file("app.config.json")`, and a polaroid
with the config's fake secrets in red.
→ 1: ACCESS DENIED stamp, tool result "blocked by policy". *"The bouncer. The
bytes never left the disk."*
→ 2: REDACTED stamp, the red secrets turn to black bars, REQUEST SENT shows
`█████`. *"The firewall. The model never saw it."*
→ 3: ASSISTANT card, "API key: (redacted)". *"It does not even know who
redacted it. You cannot leak what never entered the window."*

### D · "Send in Cato" (Case 007)

Static: USER, REQUEST SENT with 8 tools, `spawn_subagent`.
→ 1: a blue cluster hangs off the spawn: sub-1 REQUEST with a fresh array and
3 read-only tools, a TOOL card, a RESPONSE. *"Its own loop. Its own array. It
never sees the main thread."*
→ 2: one string comes back to the main wall. *"Six cards of work, one
sentence in the main thread. Compaction by construction."*
→ 3: stamp `write_file ∉ sub-1.tools[]`. *"Not asked nicely. Not in the
menu. No jailbreak."*

## Live demo 2 · The emoji police make an arrest

**Slide:** "Live demo 2 of 2 · The emoji police make an arrest" (Case 010).

This one also carries the skill envelope, the `write_file` permission stamp
and the evidence locker, so everything the animated walls showed lands once
for real.

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

## Appendix · extra live prompts, if the room wants more

All of these work on the wall with the default `.env` unless noted.

- **Compaction for real**: restart the server with `COMPACTION_THRESHOLD=1500`,
  then *"List the files in this repo, then read package.json, then read
  server/package.json, then read frontend/package.json, then summarize."*
  Thick-bordered 🗜️ COMPACTED card, old cards dim, next REQUEST SENT has a
  smaller `messageCount`. Restart back to 8000 afterwards.
- **Read guard and redaction for real**: *"Read the file .env, then read
  app.config.json, and summarize both."* ⛔ ACCESS DENIED for `.env`, 🕶️
  REDACTED on the config polaroid. If the model refuses `.env` on its own,
  that is alignment, not the harness; ask for just the config.
- **Subagent for real**: *"Use a subagent to find out what scripts
  package.json defines and summarize them in one sentence."* Blue cluster on
  the wall, ◀ SUBAGENT stamp when it returns. *"Spawn a subagent and ask it
  to write a file"* shows the tool restriction.

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
| Animated A (terminal) | 1 |
| Live demo 1 (tool call) | 3 |
| Animated B, C, D | 1.5 each |
| Live demo 2 (emoji police) | 2 |
| **Total** | **~10.5** |

That leaves about 25 minutes for the slides. If you are running long, skip
animated D; the subagent slides carry it.
