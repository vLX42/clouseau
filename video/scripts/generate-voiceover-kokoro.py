#!/usr/bin/env python3
"""Synthesise the Clouseau explainer voice-over with Kokoro-82M, in character.

This script:
 1. Renders each scene's detective line as its own WAV with `am_onyx` at
    speed 0.85 (the "thinking out loud" pacing).
 2. Lays the WAVs onto a 90-second canvas at the exact frame offsets that
    match the Remotion scene timeline, leaving 0.40s of silence at the top
    of each scene so the visual lands first.
 3. Encodes the final mix to public/voiceover.mp3.
"""
from __future__ import annotations

import shutil
import subprocess
from pathlib import Path
from typing import List

import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[1]
MODEL = ROOT / "voices/kokoro/kokoro-v1.0.onnx"
VOICES = ROOT / "voices/kokoro/voices-v1.0.bin"
TMP = ROOT / "tmp-tts"
OUT = ROOT / "public/voiceover.mp3"

VOICE = "ff_siwis"         # Kokoro's only French voice — real accent, female…
SPEED = 0.95
LANG = "en-us"

# …so the final mix is pitch-shifted down to a male register. 5 semitones,
# tempo restored, picked by ear from tmp-tts/clouseau-male-samples/.
PITCH_SEMITONES_DOWN = 5
PITCH_FACTOR = 2 ** (-PITCH_SEMITONES_DOWN / 12)   # ≈ 0.74915

# Total runtime — matches DURATION_FRAMES (3125 frames @ 30 fps = 104.17s)
# plus a small tail so the last word doesn't clip.
TOTAL_S = 104.8

# Scene starts in seconds. 16 scenes now (added BOUNCER + FIREWALL from the
# harness-responsibilities section of the slides). Each scene start = sum of
# prior scene durations − transition overlaps (13 frames = 0.433s per gap).
SCENE_STARTS = [
    0.000,    # 1  TITLE         130f
    3.900,    # 2  ILLUSION      180f
    9.467,    # 3  PLOT TWIST    180f
    15.033,   # 4  LOOP          270f
    23.600,   # 5  INSTRUCTIONS  220f
    30.500,   # 6  REQUEST       200f
    36.733,   # 7  TOOL CALL     230f
    43.967,   # 8  PERMISSION    160f
    48.867,   # 9  BOUNCER       240f  ← new
    56.433,   # 10 FIREWALL      210f  ← new
    63.000,   # 11 ITERATE       190f
    68.900,   # 12 TOKENS        210f
    75.467,   # 13 COMPACTION    220f
    82.367,   # 14 SUBAGENT      250f
    90.267,   # 15 WALL REVEAL   250f
    98.167,   # 16 OUTRO         180f
]

# VO delay inside each scene — visual lands first.
BUFFER = 0.40

# Clouseau voice notes (Peter Sellers, supremely confident, always wrong):
#   • Fake French accent is SPELLED OUT for the TTS: "zee/zat/zis" for
#     the/that/this, "somesing", "beeg", "leetle", "vwala" (voilà),
#     "beumb" (bomb). Kokoro reads the spelling, so the accent survives.
#   • Ellipses = pauses where he inspects the wrong clue
#   • "I suspect everyone… and no one" lands on the PERMISSION scene
#   • "Does your agent bite?" is the signature gag — saved for the outro
#   • Misplaced confidence, never adversarial — he thinks he's winning
LINES: List[str] = [
    # 1 TITLE  (window 4.33s)
    "Bonjour. My leetle case: zee coding agents.",
    # 2 ILLUSION  (window 6.00s)
    "You type a prompt. Files appear! Magic, non? Zat… is zee trick.",
    # 3 PLOT TWIST  (window 6.00s)
    # "JSON" stays out of the VO — visually the stamp still says "IT SENT JSON".
    "But somesing 'as been bozzering me. Zee model? It never touched a single file.",
    # 4 LOOP  (window 9.00s)
    "Zen who is doing all of zis, hmm? Aha! Look at zis. It is a while-loop. Fifteen lines. Zat is zee entire agent.",
    # 5 INSTRUCTIONS  (window 7.33s)
    "Every turn begins zee same. Zee harness stitches zee rules, zee docs, zee tools into one beeg bundle.",
    # 6 REQUEST  (window 6.67s)
    # "HTTPS" → "web request" — Kokoro butchers the acronym.
    "Zen, one web request. Zee model answers, and tells zee harness what it wants done next.",
    # 7 TOOL CALL  (window 7.67s)
    "Sometimes zee model asks for a tool. Zee harness runs it. Zee result goes right back in for zee next round.",
    # 8 PERMISSION  (window 5.33s)
    "Zee dangerous tools? We ask first. I suspect everyone… and no one.",
    # 9 BOUNCER  (window 8.00s)
    "Zis is where zee harness earns its salary. You wish to peek at zee secret files? Not on my watch.",
    # 10 FIREWALL  (window 7.00s)
    "Beeg tool output? Trimmed. A password? Poof, it is 'idden. Zee harness… is zee firewall.",
    # 11 ITERATE  (window 6.33s)
    "And zee loop keeps going. Turn after turn. Until zee model says: I am finished.",
    # 12 TOKENS  (window 7.00s)
    "But attention! Every turn, zee context grows heavier. Zee tokens pile up. Zee cost ticks up.",
    # 13 COMPACTION  (window 7.33s)
    "When it overflows? It is not a beumb. Zee harness summarises zee past and throws zee originals away.",
    # 14 SUBAGENT  (window 8.33s)
    "Sometimes zee agent needs research. So it spawns a subagent. Fresh context. Read-only tools. My leetle Cato.",
    # 15 WALL REVEAL  (window 8.33s)
    "And vwala! Zee whole case. One run. Every event, pinned to zee wall. I have solved it… flawlessly, as always.",
    # 16 OUTRO  (window 6.00s)
    "So, does your agent bite? Zat is not your model… it is a while-loop in a ridiculous disguise.",
]

assert len(LINES) == len(SCENE_STARTS), "scene/line count mismatch"


def main() -> None:
    if not MODEL.exists() or not VOICES.exists():
        raise SystemExit(
            "Kokoro model files missing. Expected at:\n"
            f"  {MODEL}\n  {VOICES}\n"
            "Download from https://github.com/thewh1teagle/kokoro-onnx/releases"
        )
    if shutil.which("ffmpeg") is None:
        raise SystemExit("ffmpeg required on PATH")

    TMP.mkdir(parents=True, exist_ok=True)
    OUT.parent.mkdir(parents=True, exist_ok=True)

    print(f"loading kokoro · voice={VOICE} · speed={SPEED}")
    kokoro = Kokoro(str(MODEL), str(VOICES))
    print(f"ok\n")

    durations = []
    for i, line in enumerate(LINES, start=1):
        wav_path = TMP / f"scene-{i:02d}.wav"
        print(f"  → scene {i:02d} …", end=" ", flush=True)
        samples, sr = kokoro.create(line, voice=VOICE, speed=SPEED, lang=LANG)
        sf.write(wav_path, samples, sr)
        dur = len(samples) / sr
        durations.append(dur)
        print(f"{dur:5.2f}s  ({wav_path.stat().st_size//1024}KB)")

    print()
    # ffmpeg filter graph: delay each clip to its scene start, then mix.
    input_args: list[str] = []
    filter_parts: list[str] = []
    mix_inputs = ""
    for i, (line, start) in enumerate(zip(LINES, SCENE_STARTS)):
        delay_ms = int((start + BUFFER) * 1000)
        wav_path = TMP / f"scene-{i+1:02d}.wav"
        input_args += ["-i", str(wav_path)]
        filter_parts.append(f"[{i}:a]adelay={delay_ms}|{delay_ms}[a{i}]")
        mix_inputs += f"[a{i}]"

    # sample rate of the kokoro WAVs — needed for the pitch-shift chain
    sr = sf.info(TMP / "scene-01.wav").samplerate
    filter_complex = ";".join(filter_parts) + (
        f";{mix_inputs}amix=inputs={len(LINES)}:duration=longest:normalize=0,"
        f"apad=whole_dur={TOTAL_S},"
        # male register: pitch down, then atempo restores the duration so the
        # scene fit-check numbers stay truthful
        f"asetrate={sr}*{PITCH_FACTOR:.6f},aresample={sr},atempo={1/PITCH_FACTOR:.6f}[out]"
    )

    print(f"mixing → {OUT}")
    subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            *input_args,
            "-filter_complex", filter_complex,
            "-map", "[out]",
            "-t", str(TOTAL_S),
            "-c:a", "libmp3lame", "-q:a", "2",
            str(OUT),
        ],
        check=True,
    )
    print(f"ok — wrote {OUT} ({OUT.stat().st_size/1024:.0f} KB)")

    # Report any line that would step on the next scene's start.
    print()
    print("scene fit check:")
    for i, (start, dur) in enumerate(zip(SCENE_STARTS, durations), start=1):
        if i < len(SCENE_STARTS):
            next_start = SCENE_STARTS[i]
        else:
            next_start = TOTAL_S
        slot = next_start - start
        end = BUFFER + dur
        marker = "✓" if end <= slot + 0.30 else "⚠"
        print(f"  {marker} scene {i:02d}  slot {slot:5.2f}s  vo {end:5.2f}s")


if __name__ == "__main__":
    main()
