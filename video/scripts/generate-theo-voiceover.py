#!/usr/bin/env python3
"""Generate the Theo-style voice-over for the full slide deck.

Synthesises one line per slide with Kokoro `am_michael` at speed 1.15
(brisk YouTuber energy). Measures each WAV's duration, then assembles a
single MP3 with small gaps. Also emits `video/src/theo/slides.generated.ts`
so the Remotion composition knows how long to dwell on each slide.

Voice notes — modelled on Theo Browne / t3.gg:
  • Hot-take openers: "Okay so", "Right so", "Yo"
  • Strong opinions, casual contractions, "literally" / "genuinely"
  • Builds to a beat: "And THIS is the wild part"
  • Rhetorical questions ("Right?") + brief asides
  • No detective folksiness — direct, tech-bro casual, fast-moving
"""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path
from typing import List

import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[1]
MODEL = ROOT / "voices/kokoro/kokoro-v1.0.onnx"
VOICES = ROOT / "voices/kokoro/voices-v1.0.bin"
TMP = ROOT / "tmp-theo"
OUT_MP3 = ROOT / "public/voiceover-theo.mp3"
OUT_DURATIONS_TS = ROOT / "src/theo/slides.generated.ts"

VOICE = "am_michael"   # clean American male, closest of the Kokoro set to Theo's energy
SPEED = 1.15           # Theo speaks fast — brisk YouTuber pacing
LANG = "en-us"

# Gap between slides (seconds). Long enough to feel like a breath, short
# enough that the talk doesn't feel padded.
GAP_S = 0.45

# One line per slide. Slide indices line up with marp's slide.001.png …
# slide.040.png output. Tone: Theo Browne reacting to his own talk.
LINES: List[str] = [
    # 1 · TITLE
    "Yo. So today we're talking about AI agents. Specifically: what is actually happening when Claude Code or Cursor writes code for you. And spoiler — it's a whole lot less magical than you think. Let's go.",
    # 2 · Hi. I'm going to ruin some magic.
    "Okay so here's the thing. When Claude Code edits five files, runs the tests, and tells you it shipped — that magic feeling? It has a name. And the name is fetch. That's it. It's just fetch in a while-loop. I'm not joking.",
    # 3 · Three things, then we drink
    "Right so three takeaways. If you remember nothing else, remember these. One: the model is a stateless web endpoint. Two: the harness is a program someone wrote, like two hundred lines. Three: every clever thing the agent does is the harness deciding what to send next.",
    # 4 · Vocabulary, fast
    "Quick vocab. Model — web endpoint. Harness — a while-loop calling that endpoint. Context window — the messages array. Tool — a function the harness lets the model ask for. Compaction — summarise and forget. Subagent — the harness calling itself, recursively. Memorize these.",
    # 5 · P.S. you don't have to take my word for it (leak reference)
    "Real quick. March 2026 — Claude Code shipped an npm package with a source map. Half a million lines of TypeScript, suddenly public. The query engine alone is forty-six thousand lines. Everything I'm about to show you, you can verify in real source now.",
    # 6 · Meet your detective
    "Okay so I built this thing called Clouseau. It's a tiny throwaway agent — like two hundred lines of TypeScript, raw fetch calls, zero SDK. The frontend is a corkboard. Every internal event gets pinned to it with red string. Genuinely my favorite thing I've shipped.",
    # 6 · The cold open
    "Picture this. You open Claude Code. You type: add dark mode and verify the build. Files appear. Terminal runs. You smile. What just happened? Stay with me — we'll know in eight slides.",
    # 7 · Plot twist
    "And here's the wild part. The model didn't open any files. The model didn't run any commands. The model doesn't have a filesystem. It sent some data. Something else ran your commands. That something is the harness.",
    # 8 · The agentic loop, in twelve lines
    "Right so let me show you the entire agent. Twelve lines. Set up your messages, while-true, call fetch, push the message, if there are tool calls run them, otherwise break. That's it. That's the whole loop. I'm being completely serious.",
    # 9 · The model: a brilliant amnesiac
    "Here's the thing about the model. It has no memory. None. Every single turn you send the entire conversation history. Every time. Imagine being incredibly smart but waking up with no idea who you are. That's the model.",
    # 10 · Your brain on context
    "Think of context like working memory. You can hold maybe seven things at once. The model can hold over a hundred thousand tokens. But after that? It starts forgetting. Just like us.",
    # 11 · Tool calls: the magic trick
    "Okay this is the wild bit. The model can't run code. It cannot edit files. What it can do is say — please run this function with these arguments. And the harness goes, cool, here you go, here's the result. Trick.",
    # 12 · What the harness does next
    "So the harness gets the tool call, dispatches the function, takes the output, stuffs it back in the messages array, and calls the model again. Result goes right back into the next turn. That's the entire control flow.",
    # 13 · Demo break #1
    "Alright let's see this live. Watch what happens when I prompt the agent to do something simple.",
    # 14 · Memory? What memory?
    "Okay so the model is technically stateless but you don't get a fresh model per turn. You get the same one. You're sending it the same chat history. So functionally? It has memory. But the memory lives in your messages array.",
    # 15 · Compaction: forgetting on purpose
    "When the context gets full, the harness does this thing called compaction. It takes everything between user messages and summarises it. The originals get dropped. The model wakes up with a Cliff Notes version of what happened. Wild.",
    # 16 · Brain analogy: your hippocampus is doing this
    "Quick brain analogy. Your hippocampus literally does compaction. Short-term memory consolidates into long-term during sleep. That's the same operation. The harness sleeps for the model. We are speedrunning twenty years of neuroscience here.",
    # 17 · Demo break #2
    "Lemme show you compaction firing in the demo. Watch the context fill up and then collapse.",
    # 18 · Instructions: who's giving the orders?
    "Here's something people miss. The model doesn't have a system prompt. The harness builds one. Every turn. It stitches together your CLAUDE.md, your AGENTS.md, your tool schemas, into one big bundle. That bundle is the instructions.",
    # 19 · Skills: instructions in a ridiculous disguise
    "Skills are basically just markdown files in a folder. The agent calls list-skills, picks one, calls load-skill, and now the skill body is in the prompt. That's the entire mechanism. It's just instructions you can load on demand. Genius and stupid simultaneously.",
    # 20 · Demo break #3
    "Demo time. Watch the agent pick up a skill and follow its instructions.",
    # 21 · Subagents: send the rookie
    "Subagents. When the agent needs to do research without bloating its own context — like reading three files just to summarise them — it spawns a subagent. Fresh context window. Read-only tools. Returns one paragraph back. Exactly like delegating to an intern.",
    # 22 · Why subagents are the secret sauce
    "This is genuinely one of the smartest patterns in modern agents. The main agent doesn't waste tokens reading huge files. The subagent does the dirty work. Returns a summary. Main agent keeps its context clean. This is how you scale agents past one task.",
    # 23 · Permissions: the harness is the bouncer
    "Right so when the model wants to write a file or run a shell command — the harness pauses. Asks for permission. Or checks a settings file. If denied, the model just sees permission denied in the tool result. The model doesn't even know permissions exist.",
    # 24 · Permissions are just one of the jobs
    "And honestly, permissions are just one thing the harness does. There's like six different jobs going on. Let me walk through them — every single one is something the model has zero clue about.",
    # 25 · Six things a real harness owns
    "Six things. Permission gates. Path scoping. Output sanitization. System prompt assembly. Context management. State, hooks, U-X. The model only sees clean data in, clean data out. Everything else? Harness. Every line of it.",
    # 26 · Permission gates · the bouncer in detail
    "Permission gates in detail. Claude Code has four modes. Default — ask every time. Accept-edits — auto-OK edits. Bypass-permissions — yolo. And dangerously-skip-permissions — the flag literally warns you in its own name. Plus a settings file with allow and deny lists.",
    # 27 · Path & scope enforcement
    "Path safety. The harness refuses things outside the workspace. Refuses dot-env. Refuses S-S-H keys. Refuses path traversal. The model doesn't enforce any of this — it just gets back error permission denied and shrugs. Bouncer. At. The. Door.",
    # 28 · Output sanitization · the firewall
    "Output sanitization. Tool returned four megabytes of stdout? Harness trims it. Looks like a secret? Redacts it. Binary? Refuses to inline. The harness is the firewall between the outside world and the model's context. It has to be — tool output is attacker-controlled.",
    # 29 · System-prompt assembly
    "System prompt assembly. The model doesn't have a system prompt. The harness builds one every turn. OS info. Working directory. Git branch. CLAUDE.md. AGENTS.md. Tool schemas. Skill bodies. Claude Code's base prompt is twelve kilobytes before tools.",
    # 30 · State, hooks & the boring middle
    "State, hooks, and the boring middle. Streaming. Diff rendering. Undo. Session resume. Hooks — pre tool use, post tool use. M-C-P. Slash commands. Cost meter. This is where the engineering days go. The model is the easy part. This is the actual product.",
    # 31 · #6 · Parallel reads, sequential writes (NEW)
    "Here's a wild one. Real harnesses run read-only tools in parallel — Glob, Grep, read-file all dispatch at the same time. But mutating tools like write-file or run-bash run sequentially, so two edits to the same file don't collide. Our Clouseau loop runs everything serially. A real harness would not.",
    # 32 · What our Clouseau demo skips
    "What our demo skips, honestly? A lot. We have permission stamps, truncation, compaction, subagents, usage meter. We don't have hooks, M-C-P, secret detection, prompt-injection defense, diff rendering. That's the gap between six hundred lines and a real harness.",
    # 32 · Clouseau vs Claude Code · feature by feature
    "Side by side. Clouseau has the loop, the basic tools, sequential dispatch. Claude Code has streaming, Edit and Multi-Edit, Glob and Grep, parallel tool calls, settings inheritance, hooks, M-C-P, web fetch, multimodal. Same shape — way more depth.",
    # 33 · Where the other 49,400 lines go
    "So where do the other forty-nine thousand four hundred lines go? Tool design. Safety surface. Streaming everything. Diff rendering. State persistence. Extensibility. Six hundred lines gets you the shape. Fifty thousand lines gets you trust. That's the actual difference.",
    # 34 · If you wanted Clouseau to look like Claude Code
    "If you wanted to upgrade Clouseau to feel like Claude Code, three changes. One: stream the response, biggest perceptual win. Two: Edit tool with diff rendering. Three: real settings file permissions. Six hundred to eight hundred lines. Demo feels ten times more real.",
    # 35 · The handoff between turns
    "Let me show you what a single turn looks like end to end. User message in. Instructions assembled. Request sent. Response. Tool call decided. Permission check if it's a side effect. Tool result. Loop. Then next turn.",
    # 36 · Where the real engineering is
    "And so where's the real engineering? Not in the model. Not in the loop. It's in tool design. Prompt scaffolding. Context management. Sandboxing. U-X. If you wanted to build the next Claude Code — the model is not your bottleneck. The harness is.",
    # 37 · Things to skip in this talk
    "Things I'm not gonna cover. RAG. Embeddings. Fine-tuning. Multimodal. Voice agents. Those are different topics. This talk is just the harness. Just the plumbing. Just the while-loop.",
    # 38 · What I want you to leave with
    "What I want you to leave with. One: agents aren't magic, they're code somebody wrote. Two: the model is just one component. Three: the harness is where the engineering lives. Four: you can build this. Six hundred lines, you can build this.",
    # 39 · Questions?
    "Alright. Questions? Hit me. Hot takes welcome. Compaction critics, come at me. I have opinions about subagents, ask me about subagents.",
    # 40 · Thank you
    "Thanks for sticking around. Find me online, Clouseau's open source, code's linked below. Catch you in the next one.",
]


def main() -> None:
    if not MODEL.exists() or not VOICES.exists():
        raise SystemExit(f"Kokoro model files missing in {MODEL.parent}")
    if shutil.which("ffmpeg") is None:
        raise SystemExit("ffmpeg required on PATH")

    TMP.mkdir(parents=True, exist_ok=True)
    OUT_MP3.parent.mkdir(parents=True, exist_ok=True)
    OUT_DURATIONS_TS.parent.mkdir(parents=True, exist_ok=True)

    print(f"loading kokoro · voice={VOICE} · speed={SPEED}")
    kokoro = Kokoro(str(MODEL), str(VOICES))
    print("ok\n")

    per_slide_durations: list[float] = []
    for i, line in enumerate(LINES, start=1):
        wav_path = TMP / f"slide-{i:03d}.wav"
        samples, sr = kokoro.create(line, voice=VOICE, speed=SPEED, lang=LANG)
        sf.write(wav_path, samples, sr)
        dur = len(samples) / sr
        per_slide_durations.append(dur)
        print(f"  → slide {i:03d}  {dur:5.2f}s  ({len(line)} chars)")

    # Build the per-slide layout the Remotion comp will consume.
    # Each slide's video duration = audio duration + gap, so the slide change
    # lands cleanly between sentences.
    layout = []
    for i, audio_s in enumerate(per_slide_durations, start=1):
        layout.append({
            "image": f"slides/slide.{i:03d}.png",
            "audio_s": round(audio_s, 4),
            "video_s": round(audio_s + GAP_S, 4),
        })

    total_s = sum(item["video_s"] for item in layout)
    print(f"\ntotal: {total_s:.2f}s  ≈  {total_s/60:.1f} min")

    # Write the TS module the comp imports.
    ts_body = f"""// AUTO-GENERATED — regenerate via scripts/generate-theo-voiceover.py.
export type TheoSlide = {{ image: string; audioS: number; videoS: number }};

export const SLIDES: TheoSlide[] = {json.dumps([
        {"image": s["image"], "audioS": s["audio_s"], "videoS": s["video_s"]}
        for s in layout
    ], indent=2)};

export const GAP_S = {GAP_S};
export const FPS = 30;
export const TOTAL_FRAMES = Math.round({total_s} * 30);
"""
    OUT_DURATIONS_TS.write_text(ts_body)
    print(f"wrote {OUT_DURATIONS_TS}")

    # Assemble one MP3 with per-slide audio at the right offsets.
    # We delay each clip to start at the cumulative video offset.
    input_args: list[str] = []
    filter_parts: list[str] = []
    mix_inputs = ""
    offset_s = 0.0
    for i, item in enumerate(layout):
        wav_path = TMP / f"slide-{i+1:03d}.wav"
        input_args += ["-i", str(wav_path)]
        delay_ms = int(offset_s * 1000)
        filter_parts.append(f"[{i}:a]adelay={delay_ms}|{delay_ms}[a{i}]")
        mix_inputs += f"[a{i}]"
        offset_s += item["video_s"]

    filter_complex = ";".join(filter_parts) + (
        f";{mix_inputs}amix=inputs={len(layout)}:duration=longest:normalize=0,"
        f"apad=whole_dur={total_s + 0.4}[out]"
    )

    print(f"\nmixing → {OUT_MP3}")
    subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            *input_args,
            "-filter_complex", filter_complex,
            "-map", "[out]",
            "-t", str(total_s + 0.4),
            "-c:a", "libmp3lame", "-q:a", "2",
            str(OUT_MP3),
        ],
        check=True,
    )
    print(f"ok — wrote {OUT_MP3} ({OUT_MP3.stat().st_size/1024:.0f} KB)")


if __name__ == "__main__":
    main()
