# Voice-over script — Clouseau explainer video

**Total runtime:** ~105 seconds @ 30 fps (3125 frames).
**Voice:** Kokoro-82M, `ff_siwis` (French) at `speed=0.95`, pitch-shifted 5 semitones down to a male register in the generator's ffmpeg mix (tempo restored, so scene timings are unaffected).
**Voice direction (for a human VO artist):** picture Peter Sellers as Inspector Clouseau — supremely confident, always inspecting the wrong clue, fake French accent. Every "th" becomes a "z". Pauses before each reveal, as if the conclusion surprises even him.
**Accent note for TTS:** the accent is spelled phonetically in the lines ("zee", "zat", "somesing", "beeg", "leetle", "vwala", "beumb") so Kokoro pronounces it. Keep the spellings when editing.

Lines are timed to fit their scene window — the generator prints a fit-check table.

---

### Scene 1 · TITLE  (0.00 – 3.90s)
> Bonjour. My leetle case: zee coding agents.

### Scene 2 · ILLUSION  (3.90 – 9.47s)
> You type a prompt. Files appear! Magic, non? Zat… is zee trick.

### Scene 3 · PLOT TWIST  (9.47 – 15.03s)
> But somesing 'as been bozzering me. Zee model? It never touched a single file.

### Scene 4 · THE LOOP  (15.03 – 23.60s)
> Zen who is doing all of zis, hmm? Aha! Look at zis. It is a while-loop. Fifteen lines. Zat is zee entire agent.

### Scene 5 · INSTRUCTIONS  (23.60 – 30.50s)
> Every turn begins zee same. Zee harness stitches zee rules, zee docs, zee tools into one beeg bundle.

### Scene 6 · REQUEST  (30.50 – 36.73s)
> Zen, one web request. Zee model answers, and tells zee harness what it wants done next.

### Scene 7 · TOOL CALL  (36.73 – 43.97s)
> Sometimes zee model asks for a tool. Zee harness runs it. Zee result goes right back in for zee next round.

### Scene 8 · PERMISSION  (43.97 – 48.87s)
> Zee dangerous tools? We ask first. I suspect everyone… and no one.

### Scene 9 · BOUNCER  (48.87 – 56.43s)
> Zis is where zee harness earns its salary. You wish to peek at zee secret files? Not on my watch.

### Scene 10 · FIREWALL  (56.43 – 63.00s)
> Beeg tool output? Trimmed. A password? Poof, it is 'idden. Zee harness… is zee firewall.

### Scene 11 · ITERATE  (63.00 – 68.90s)
> And zee loop keeps going. Turn after turn. Until zee model says: I am finished.

### Scene 12 · TOKENS  (68.90 – 75.47s)
> But attention! Every turn, zee context grows heavier. Zee tokens pile up. Zee cost ticks up.

### Scene 13 · COMPACTION  (75.47 – 82.37s)
> When it overflows? It is not a beumb. Zee harness summarises zee past and throws zee originals away.

### Scene 14 · SUBAGENT  (82.37 – 90.27s)
> Sometimes zee agent needs research. So it spawns a subagent. Fresh context. Read-only tools. My leetle Cato.

### Scene 15 · WALL REVEAL  (90.27 – 98.17s)
> And vwala! Zee whole case. One run. Every event, pinned to zee wall. I have solved it… flawlessly, as always.

### Scene 16 · OUTRO  (98.17 – 104.80s)
> So, does your agent bite? Zat is not your model… it is a while-loop in a ridiculous disguise.

---

## Regenerating the audio

```bash
cd video
source .venv-tts/bin/activate
python3 scripts/generate-voiceover-kokoro.py
```

Writes `public/voiceover.mp3` (~850 KB) which is what Remotion bundles. The script prints a fit-check table — any `⚠` rows are scenes where the VO overflows its window. <0.5s of overflow lands inside the fade transition and is fine; more than that, shorten the line.

## Trying a different voice

Edit `VOICE` in `scripts/generate-voiceover-kokoro.py`. Useful alternates:
- `am_michael` — clean middle-aged narrator (less gritty, more documentary)
- `am_fenrir` — even darker timbre than onyx
- `am_eric` — warmer, friendlier
- `bm_george` — mature British male (Sherlock vibe)
- `bm_lewis` — gritty British male

To regenerate side-by-side samples for comparison: `python3 scripts/kokoro-sample.py`.
