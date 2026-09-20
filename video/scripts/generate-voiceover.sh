#!/usr/bin/env bash
# Synthesize the Clouseau explainer voice-over with Piper, frame-aligned to
# the Remotion scene timeline, then assemble one MP3 in video/public/.
#
# Requires: piper (uv tool install piper-tts), ffmpeg.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VOICES="$ROOT/voices"
OUT_DIR="$ROOT/public"
TMP="$ROOT/tmp-tts"
MODEL="$VOICES/en_US-ryan-high.onnx"

mkdir -p "$TMP" "$OUT_DIR"

if ! command -v piper >/dev/null 2>&1; then
  export PATH="$HOME/.local/bin:$PATH"
fi

if [ ! -f "$MODEL" ]; then
  echo "missing voice model: $MODEL" >&2
  exit 1
fi

# Scene start times (seconds, derived from frame budget at 30 fps with 13-frame
# overlap transitions). VO is delayed slightly inside each scene window so the
# visual lands first.
declare -a STARTS=(
  "0.30"   # Scene  1 — TITLE        (start 0.00, scene ends 4.00)
  "3.85"   # Scene  2 — ILLUSION     (3.57 - 7.90)
  "7.75"   # Scene  3 — PLOT TWIST   (7.47 - 11.80)
  "11.65"  # Scene  4 — LOOP         (11.37 - 18.03)
  "17.90"  # Scene  5 — INSTRUCTIONS (17.60 - 23.27)
  "23.10"  # Scene  6 — REQUEST      (22.83 - 27.83)
  "27.70"  # Scene  7 — TOOL CALL    (27.40 - 33.07)
  "32.93"  # Scene  8 — PERMISSION   (32.63 - 36.30)
  "36.15"  # Scene  9 — ITERATE      (35.87 - 40.20)
  "40.05"  # Scene 10 — TOKENS       (39.77 - 44.77)
  "44.65"  # Scene 11 — COMPACTION   (44.33 - 50.00)
  "49.85"  # Scene 12 — SUBAGENT     (49.57 - 56.23)
  "56.05"  # Scene 13 — WALL REVEAL  (55.80 - 61.80)
  "61.65"  # Scene 14 — OUTRO        (61.37 - 66.03)
)

declare -a LINES=(
  "Your AI agent feels like wizardry. Let's open the case file."
  "You typed a prompt. Files appeared. Terminal ran. Magic?"
  "The model didn't touch any files. It just sent JSON."
  "Every agent is a while-loop. Send the prompt. Run the tools. Repeat."
  "Each turn, the harness stitches the system prompt, project files, and tools into one bundle."
  "Then, one HTTPS call. The model answers with what it wants to do."
  "Sometimes the model asks for a tool. The harness runs it. Result goes back."
  "For dangerous tools, writes, shell commands, we ask first."
  "And the loop keeps going. Turn after turn. Until the model stops asking."
  "But every turn, the context gets heavier. Tokens stack up. Cost ticks up."
  "When it overflows, the harness summarises the past and throws the originals away."
  "Need research without bloating the context? Spawn a subagent. Fresh context. Read-only tools."
  "And that's it. One run. Every event pinned to the wall. Red string between everything."
  "Next time it feels like magic, remember: it's just a while-loop."
)

# Total output runtime — slightly longer than the video so Remotion can trim.
TOTAL="66.5"

# 1. Synthesize each line to its own WAV with Piper.
for i in "${!LINES[@]}"; do
  n=$((i + 1))
  out="$TMP/scene-$(printf '%02d' "$n").wav"
  echo "[piper] scene $n -> $out"
  printf '%s\n' "${LINES[$i]}" | \
    piper --model "$MODEL" --output-file "$out" \
          --length-scale 0.95 --sentence-silence 0.30
done

# 2. Build an ffmpeg filter graph that places each scene wav at its start time
#    on a single 66.5-second canvas.
INPUT_ARGS=""
FILTER=""
MIX_INPUTS=""
for i in "${!LINES[@]}"; do
  n=$((i + 1))
  idx=$i
  pad=$(printf '%02d' "$n")
  INPUT_ARGS+=" -i $TMP/scene-$pad.wav"
  delay_ms=$(awk "BEGIN{printf \"%d\", ${STARTS[$i]} * 1000}")
  FILTER+="[${idx}:a]adelay=${delay_ms}|${delay_ms}[a${idx}];"
  MIX_INPUTS+="[a${idx}]"
done
FILTER+="${MIX_INPUTS}amix=inputs=${#LINES[@]}:duration=longest:normalize=0,apad=whole_dur=${TOTAL}[out]"

echo "[ffmpeg] mixing into $OUT_DIR/voiceover.mp3"
ffmpeg -hide_banner -loglevel error -y \
  $INPUT_ARGS \
  -filter_complex "$FILTER" \
  -map "[out]" \
  -t "$TOTAL" \
  -c:a libmp3lame -q:a 2 \
  "$OUT_DIR/voiceover.mp3"

echo "[ok] wrote $OUT_DIR/voiceover.mp3"
ls -lh "$OUT_DIR/voiceover.mp3"
