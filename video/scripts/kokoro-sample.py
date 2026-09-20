#!/usr/bin/env python3
# Synthesise the same Clouseau-style detective line across several Kokoro
# voices at deliberately slowed speed (0.85) — investigator pacing, not
# narrator pacing. Saves one WAV per voice in tmp-tts/voice-samples/.
import os
import sys
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[1]
MODEL = ROOT / "voices/kokoro/kokoro-v1.0.onnx"
VOICES = ROOT / "voices/kokoro/voices-v1.0.bin"
OUT = ROOT / "tmp-tts/voice-samples"
OUT.mkdir(parents=True, exist_ok=True)

# Detective-monologue line. Pauses are encoded with commas / ellipses so the
# phonemizer slows down at the right beats — same trick the live Clouseau
# scripts use ("Oh, and one more thing…").
LINE = (
    "Now, let me get this straight. "
    "Your AI agent... it feels like wizardry, right? "
    "Files appear. The terminal runs. "
    "But here's the thing I keep coming back to... "
    "the model never actually opened a single file. "
    "It just sent some JSON."
)

# Slower speed for a deliberate, contemplative delivery — matches Peter Falk's
# Clouseau cadence. 0.85 is "thinking out loud", 1.0 is "broadcasting news".
SPEED = 0.85

# Curated set: deeper / older / more deliberate voices, plus one or two
# brighter options for contrast.
VOICES_TO_TEST = [
    # American males — closest to a Clouseau-flavored detective
    "am_onyx",        # deep, slow, gravelly — top candidate
    "am_michael",     # clean middle-aged narrator
    "am_eric",        # warmer, friendlier
    "am_adam",        # solid middle of the road
    "am_puck",        # smoother, less gritty
    "am_echo",        # calm, deliberate
    "am_fenrir",      # darker timbre
    # British males — Sherlock-flavored variant of the same vibe
    "bm_george",      # mature, sonorous
    "bm_lewis",       # gritty narrator
]

print(f"loading kokoro ({MODEL.name})…")
kokoro = Kokoro(str(MODEL), str(VOICES))
print(f"ok — synthesising at speed={SPEED}\n")

for v in VOICES_TO_TEST:
    out_path = OUT / f"sample-{v}.wav"
    print(f"  → {v:18s} …", end=" ", flush=True)
    try:
        samples, sr = kokoro.create(LINE, voice=v, speed=SPEED, lang="en-us")
        sf.write(out_path, samples, sr)
        print(f"ok  ({out_path.stat().st_size//1024}KB)")
    except Exception as e:
        print(f"FAIL: {e}")
        continue

print(f"\nsamples in {OUT}")
