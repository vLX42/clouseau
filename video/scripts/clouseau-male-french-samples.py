#!/usr/bin/env python3
# Make ff_siwis (Kokoro's only French voice) sound male, two ways:
#  A. Style-vector blends: mix the siwis style with a male voice's style.
#     The French accent partly lives in the style vector, so heavier siwis
#     weight = more accent, heavier male weight = deeper register.
#  B. Pitch-shift: synthesise pure ff_siwis, then drop it 3-5 semitones
#     with ffmpeg (accent fully preserved, register lowered).
# Samples land in tmp-tts/clouseau-male-samples/.
import subprocess
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[1]
MODEL = ROOT / "voices/kokoro/kokoro-v1.0.onnx"
VOICES = ROOT / "voices/kokoro/voices-v1.0.bin"
OUT = ROOT / "tmp-tts/clouseau-male-samples"
OUT.mkdir(parents=True, exist_ok=True)

LINE = (
    "But somesing 'as been bozzering me. Zee model? "
    "It never touched a single file. ... "
    "So, does your agent bite? Zat is not your model... "
    "it is a while-loop, in a ridiculous disguise!"
)
SPEED = 0.95

kokoro = Kokoro(str(MODEL), str(VOICES))
siwis = kokoro.get_voice_style("ff_siwis")

# A — blends: (label, male voice, siwis weight)
BLENDS = [
    ("blend-fenrir-60-40", "am_fenrir", 0.60),
    ("blend-fenrir-50-50", "am_fenrir", 0.50),
    ("blend-george-60-40", "bm_george", 0.60),
    ("blend-onyx-70-30",   "am_onyx",   0.70),
]
for label, male, w in BLENDS:
    style = w * siwis + (1.0 - w) * kokoro.get_voice_style(male)
    samples, sr = kokoro.create(LINE, voice=style, speed=SPEED, lang="en-us")
    p = OUT / f"{label}.wav"
    sf.write(p, samples, sr)
    print(f"  → {label:22s} ok ({p.stat().st_size//1024}KB)")

# B — pitch-shifted pure siwis: n semitones down, tempo restored
samples, sr = kokoro.create(LINE, voice="ff_siwis", speed=SPEED, lang="en-us")
base = OUT / "siwis-base.wav"
sf.write(base, samples, sr)
for n in (3, 4, 5):
    factor = 2 ** (-n / 12)
    p = OUT / f"pitch-down-{n}st.wav"
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(base),
         "-af", f"asetrate={sr}*{factor},aresample={sr},atempo={1/factor:.6f}",
         str(p)],
        check=True,
    )
    print(f"  → pitch-down-{n}st        ok ({p.stat().st_size//1024}KB)")

print(f"\nsamples in {OUT}")
print("listen:  for f in tmp-tts/clouseau-male-samples/*.wav; do echo $f; afplay $f; done")
