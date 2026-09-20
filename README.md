# Does Your Agent Bite?

*Your AI coding agent is a `while` loop in a ridiculous disguise.*

Everything in this repo exists for one conference talk (Tech Moves Us, 9 Oct 2026, 30 to 40 min). The whole point fits in one sentence:

> An AI coding agent is a `while` loop in normal code that calls a stateless HTTPS endpoint and runs the functions the response asks it to run. That's it.

Three things the audience should leave with:

1. The model is a stateless text-prediction endpoint. It remembers nothing between calls.
2. The harness is the program *you* write. Permissions, compaction, skills, subagents, step caps: a few lines each.
3. A tool call is a JSON request from model to harness. The model never touches the disk.

Detective framing throughout. The "crazy wall" is the crime scene, the model is the wrong suspect, the harness is the real culprit. *"That is not my model."*

## What is in here

| Path | What it is |
|---|---|
| [`TALK.md`](TALK.md) | Talk outline, act structure, vocabulary, the 11 live-demo prompts. Source of truth for content. |
| [`demo.md`](demo.md) | Runbook for the two live demos and the four in-slide animated reconstructions: prompts, cards in order, what to click, what to say, fallbacks. |
| [`SLIDES.md`](SLIDES.md) | Marp deck, ~115 slides, sepia case-file styling. `SLIDES.html` is a render of it. |
| `server/` | **The harness.** `agent.ts` is the `while` loop (~660 lines), `tools.ts` the tool schemas, executors and guards, `compaction.ts` the summarise-and-replace step, `index.ts` a Hono server streaming events over SSE. Talks to OpenAI chat completions with raw `fetch`. No SDK, on purpose. |
| `frontend/` | **The crazy wall.** React + Vite visualiser. Every harness event becomes a card, stamp, polaroid, sticky note or manila envelope pinned to a wall with red string between them. Live token/cost ticker. |
| `.clouseau-skills/` | The "skills" the demo agent can `list_skills` / `load_skill`. Plain markdown files. That is the point. |
| `video/` | Remotion explainer (~105 s) with a Kokoro TTS voice-over in a fake French accent, plus a composition that replays a recorded wall. See [`video/VOICEOVER.md`](video/VOICEOVER.md). |
| `slides-assets/` | Generated illustrations used as slide backgrounds. |
| `app.config.json` | Prop for the read-guard and redaction demo. The secrets in it are fake and get blacked out on the wall. |
| `examples/agent-output/` | Things the demo agent wrote in earlier runs, kept as specimens. |

## Running it

Needs Node 20+, pnpm, and an OpenAI key.

```sh
cp .env.example .env            # put your OPENAI_API_KEY in there
pnpm install
pnpm dev                        # harness on :3737, wall on :5173
```

Open http://localhost:5173, type a prompt, watch the loop run on the wall.

Other entry points:

```sh
pnpm agent "write a todo app"                                  # headless run, events to stdout
pnpm --filter clouseau-server capture "prompt" [out.jsonl]    # record a run for replay
cd video && npm install && npm run studio                      # Remotion studio
```

### Replay mode (no tokens, no key)

The wall decides on load whether it is live or replaying:

- `?demo=1` on the URL forces replay (the "API is down" escape hatch during the talk; there is also a small **📼 offline** link in the chat header).
- No harness reachable, or a harness whose `/health` reports `apiKey: false`, means replay only. So a public deploy of just the frontend, or a server started without `OPENAI_API_KEY`, lets people play with the recordings and nobody can spend your tokens.

Recordings live in `frontend/public/demos/` (`index.json` is the menu): the two live-demo prompts from the talk and one longer "full case" run. Record a new one with `pnpm --filter clouseau-server capture "prompt" frontend/public/demos/<name>.jsonl` and add it to `index.json`.

### Deploying a play-with-it version

`netlify.toml` and `vercel.json` build the frontend only (`npm run build:demo`, publish `frontend/dist`). `build:demo` bakes replay mode in so the page does not wait on the health probe; a plain `build` would also end up in replay mode once the probe finds no harness. Nothing else to configure.

### Env knobs

| Var | Default | Used for |
|---|---|---|
| `MODEL` | `gpt-4o-mini` | cheap enough to run live on stage |
| `COMPACTION_THRESHOLD` | `8000` | drop to ~1500 to trigger the compaction demo |
| `REQUIRE_PERMISSION` | `false` | `true` pops the permission gate |
| `MAX_TURNS` | `12` | `4` for the "wrap it up" demo |
| `PORT` | `3737` | server port |

## What the wall shows

Each of these is a few lines in `agent.ts` / `tools.ts` and has its own stamp on the wall:

INSTRUCTIONS (the assembled system prompt), REQUEST SENT / RESPONSE (raw JSON, clickable), TOOL CALL + polaroid, PERMISSION gate, COMPACTED (dims the prior cards), skill envelope, subagent sub-cluster (blue tint, read-only tools, one result wired back), ACCESS DENIED (read guard), REDACTED (secret scrubbing), DOOM LOOP (third identical tool call gets answered by the harness), WRAP IT UP (max-turns nudge injected as a user message), EMOJI POLICE, token and cost meter.

The recurring punchline for all of them: **it is a prompt, not infrastructure.**

## Rendering the slides

```sh
npx @marp-team/marp-cli SLIDES.md --html -o SLIDES.html
npx @marp-team/marp-cli SLIDES.md --pptx -o SLIDES.pptx
```

## Not in the repo

`.env` (real key), `SLIDES.pptx` (100 MB), `video/out/` renders and `video/voices/` model weights. Build them locally.
