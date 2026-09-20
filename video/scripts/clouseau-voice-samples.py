#!/usr/bin/env python3
# Clouseau casting call: synthesise the same two lines from the actual
# voice-over script across candidate voices, so the right inspector can be
# picked by ear. Saves one WAV per candidate in tmp-tts/clouseau-samples/.
#
# Two accent strategies are tested:
#  1. Non-English voices reading English → a genuine foreign accent
#     (ff_siwis is Kokoro's only French voice; im_nicola/em_alex give
#     an "Allo Allo" comedy-foreign flavour that can read as French).
#  2. Dramatic English voices + the phonetic spellings ("zee", "zat")
#     doing the work — theatrical rather than authentic.
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[1]
MODEL = ROOT / "voices/kokoro/kokoro-v1.0.onnx"
VOICES = ROOT / "voices/kokoro/voices-v1.0.bin"
OUT = ROOT / "tmp-tts/clouseau-samples"
OUT.mkdir(parents=True, exist_ok=True)

# Real lines from the script — plot twist + outro, so the sample carries
# both the sneaky beat and the dramatic reveal.
LINE = (
    "But somesing 'as been bozzering me. Zee model? "
    "It never touched a single file. ... "
    "So, does your agent bite? Zat is not your model... "
    "it is a while-loop, in a ridiculous disguise!"
)

# (voice, speed, lang, note)
CANDIDATES = [
    # genuine foreign accents — English text, non-English voice
    ("ff_siwis",  0.95, "en-us", "French female — the only real French accent in Kokoro"),
    ("im_nicola", 0.95, "en-us", "Italian male — comedy-foreign, Allo-Allo flavour"),
    ("em_alex",   0.95, "en-us", "Spanish male — softer foreign flavour"),
    # dramatic English voices, accent carried by the spellings
    ("bm_george", 0.90, "en-us", "mature sonorous British — theatrical"),
    ("bm_lewis",  0.90, "en-us", "gritty British narrator"),
    ("am_fenrir", 0.90, "en-us", "darkest American timbre — max drama"),
    ("am_santa",  0.90, "en-us", "deep jolly — comedic gravitas"),
]

print(f"loading kokoro ({MODEL.name})…")
kokoro = Kokoro(str(MODEL), str(VOICES))
print("ok\n")

for voice, speed, lang, note in CANDIDATES:
    out_path = OUT / f"clouseau-{voice}.wav"
    print(f"  → {voice:12s} ({note}) …", end=" ", flush=True)
    try:
        samples, sr = kokoro.create(LINE, voice=voice, speed=speed, lang=lang)
        sf.write(out_path, samples, sr)
        print(f"ok ({out_path.stat().st_size // 1024}KB)")
    except Exception as e:
        print(f"FAIL: {e}")

print(f"\nsamples in {OUT}")
print("listen:  for f in tmp-tts/clouseau-samples/*.wav; do echo $f; afplay $f; done")
