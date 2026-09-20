# Clouseau: "Does Your Agent Bite?"

Everything in this folder exists for one conference talk. Peter presents
**"Does Your Agent Bite?"** (subtitle: *your AI agent is a `while` loop in a
ridiculous disguise*) at the T&I conference **Tech Moves Us on 9 October 2026**,
30 to 40 minutes. The folder is still named `columbo` on disk; the project was
renamed to the Inspector Clouseau theme in August 2026 and nothing should say
Columbo any more (except `video/out/columbo.mp4`, an old render).

Not a git repo. There is no remote and nothing to push.

## The one-sentence thesis

> An AI coding agent is a `while` loop in normal code that calls a stateless
> HTTPS endpoint and runs the functions the response asks it to run. That's it.

Three takeaways the audience must leave with: the model is a stateless
text-prediction endpoint; the harness is the program you write; a tool call is
a JSON request from model to harness, the model never touches the disk.
Detective framing throughout: the wall is the crime scene, the model is the
witness everyone mistakes for the mastermind, the harness is the detective
doing all the legwork and getting no credit (never call it the culprit). Signature gags: "That is not
my model", "I suspect everyone... and no one" (permissions), "It is not a
beumb" (compaction), Cato = subagent.

## Why this CLAUDE.md lives in `.claude/` and not the repo root

`server/src/agent.ts` (`loadProjectInstructions`) reads `CLAUDE.md` and
`AGENTS.md` from the repo root and **appends them to the demo agent's system
prompt**, then shows them on the INSTRUCTIONS card on the projector. A root
`CLAUDE.md` would be sent to gpt-4o-mini on every turn, bloat the context (and
skew the compaction demo), and confuse the demo agent with talk logistics.
Keep the root free of `CLAUDE.md`/`AGENTS.md` unless it is a tiny, deliberate
"look, project rules get stitched in" prop for demo prompt 6 in `TALK.md`.

## What is in here

| Path | What it is |
|---|---|
| `demo.md` | Runbook for the two live demos and the four animated reconstructions (`_class: anim` slides, fragments step the animation). Keep in sync with the `_class: demo` / `_class: anim` slides in `SLIDES.md`. |
| `TALK.md` | Talk outline, act structure, vocabulary table, the 11 live-demo prompts, analogies, what to skip. The source of truth for content. |
| `SLIDES.md` | Marp deck (~90 slides), sepia case-file styling, 2 live break-outs to the app plus 4 animated mini-wall reconstructions inside the deck (`_class: anim`, stepped by fragments). `SLIDES.html` / `SLIDES.pptx` are renders of it, regenerate rather than edit. |
| `slides-assets/` | Generated illustrations used as slide backgrounds (dog-bite, beumb, doom-loop, skill-cabinet, ...). |
| `server/` | The **harness**: `agent.ts` (~660 lines) is the `while` loop, `tools.ts` the tool schemas + executors + guards, `compaction.ts` the summarise-and-replace step, `index.ts` a Hono server streaming events over SSE on `POST /run`. Talks to OpenAI chat completions with raw `fetch`, no SDK, on purpose. |
| `frontend/` | The **crazy wall** visualiser (React + Vite). Every harness event becomes a card, stamp, polaroid, sticky note or manila envelope pinned to a wall with wires between them. `TokenTicker` shows live IN/OUT token totals with comic hurt-word bursts. `GridView`, `Minimap`, `FileCabinet`, `Chat` are the side panels. |
| `.clouseau-skills/` | The "skills" the demo agent can `list_skills` / `load_skill`. Plain markdown files; that is the point. |
| `video/` | Remotion explainer (~105 s, `ClouseauExplainer`) plus a `DemoPlayback` composition that replays a recorded wall. Voice-over is Kokoro TTS `ff_siwis` pitched down 5 semitones, fake-French spelled phonetically ("zee", "zat", "beumb"). See `video/VOICEOVER.md`. The `theo` track is a deliberate Theo Browne persona, leave it. |
| `app.config.json`, `.env` | Props for demo 9 (read guard + redaction). `app.config.json` holds fake secrets that get blacked out; `.env` is blocked entirely. `.env` also holds the real `OPENAI_API_KEY`. |
| `README.md`, `backend.js` | Leftovers written *by the demo agent* in earlier runs (todo-app README, express backend). Harmless, ignorable. |
| `tmp/` | Per-session scratch dirs where the demo agent's `write_file` lands. Wiped on `/reset`. |

## Running it

```sh
pnpm dev                       # server on :3737 (PORT in .env) + vite on :5173
pnpm agent "prompt"            # headless run, events printed to stdout
pnpm --filter clouseau-server capture "prompt" [out.jsonl]   # record a run to frontend/public/demo.jsonl
cd video && npm run studio     # Remotion studio; npm run build renders out/clouseau.mp4
```

Env knobs (`.env`, read by `server/src/env.ts`): `MODEL` (gpt-4o-mini),
`COMPACTION_THRESHOLD` (8000; drop to ~1500 for the compaction demo),
`REQUIRE_PERMISSION` (false; true pops the permission gate), `MAX_TURNS`
(12; set 4 for the WRAP IT UP demo), `PORT` (3737).

Demo replay without burning tokens: `?demo=1` on the frontend URL, or
`npm run build:demo` (this is what Netlify/Vercel deploy, see `netlify.toml`).
The app also drops into replay-only on its own when `/health` is unreachable
or reports `apiKey: false` (`detectMode` in `frontend/src/eventBus.ts`).
Recordings are `frontend/public/demos/*.jsonl`, listed in `demos/index.json`;
`1-todo` and `2-hate-list` are the two live-demo prompts, `3-full-case` the
older long run.

## Harness features the wall visualises

Each is a few lines in `agent.ts`/`tools.ts` and has its own stamp on the wall:
INSTRUCTIONS card (assembled system prompt), REQUEST SENT / RESPONSE (raw JSON,
clickable), TOOL CALL + polaroid, PERMISSION gate, COMPACTED (dims prior cards),
skill envelope, subagent sub-cluster (blue tint, read-only tools, one result
wired back), ACCESS DENIED (read guard), REDACTED (secret scrubbing), DOOM LOOP
(third identical tool call is answered by the harness), WRAP IT UP (max-turns
nudge injected as a user message), EMOJI POLICE, token/cost meter.

The recurring punchline for all of these: **it is a prompt, not infrastructure**.

## Working on this project

- Content changes go in `TALK.md` and `SLIDES.md`; the app and video should
  match them, not the other way round.
- Keep the demo harness tiny and readable. It is shown on the projector line by
  line ("that's the whole secret"). No SDKs, no abstractions, no cleverness.
- Anything new on the wall needs both an `EventType` in `server/src/events.ts`
  and a renderer in `frontend/src/Wall.tsx` / `Card.tsx`.
- Do not touch the French VO spelling or the Theo track without asking.
- Verify demos against the real app (`pnpm dev`, then Playwright or the
  browser), not just by reading code; the talk depends on cards landing in
  the right order.

## Known gaps (as of 20 Sep 2026)

- `frontend/public/cover.png` still shows Columbo per `TALK.md`; needs
  regenerating for Clouseau.
- Folder rename `columbo` → `clouseau` never happened.
