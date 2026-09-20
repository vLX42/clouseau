import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_HEADING, FONT_MONO } from "../fonts";
import { SLIDES, FPS } from "./slides.generated";

// Full slide deck walked through with the Theo-style voice-over.
// Each slide gets its own Sequence sized to (audio + 0.45s gap).
// Inside each Sequence: slide PNG full-frame + a subtle slow zoom
// (ken-burns) so the frame never feels static.

const PROGRESS_BAR_HEIGHT = 5;
const HUD_FONT = "JetBrains Mono, ui-monospace, monospace";

function SlideFrame({ image, durationS, index }: { image: string; durationS: number; index: number }) {
  const frame = useCurrentFrame();
  const durFrames = Math.round(durationS * FPS);

  // Subtle slow zoom — 1.0 → 1.04 over the slide's lifetime, with a tiny
  // entrance scale-up so it doesn't feel cut.
  const enter = spring({
    frame,
    fps: FPS,
    config: { damping: 22, stiffness: 80 },
    durationInFrames: 18,
  });
  const baseZoom = interpolate(frame, [0, durFrames], [1.0, 1.04]);
  const zoom = interpolate(enter, [0, 1], [1.03, baseZoom]);

  // Fade-in over the first 8 frames (the previous slide is still painting
  // for those frames — crossfade).
  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#0e0e0e", opacity }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
        <Img
          src={staticFile(image)}
          style={{ width: "100%", height: "100%", objectFit: "contain", background: "#f4ede0" }}
        />
      </AbsoluteFill>

      {/* Small HUD bottom-right showing slide N/total */}
      <div
        style={{
          position: "absolute",
          right: 28,
          bottom: 24,
          background: "rgba(28,20,12,0.85)",
          color: "#f4ede0",
          fontFamily: HUD_FONT,
          fontSize: 16,
          padding: "5px 12px",
          letterSpacing: 1.2,
          opacity,
        }}
      >
        {String(index + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
      </div>
    </AbsoluteFill>
  );
}

export const TheoTalkthrough: React.FC = () => {
  const totalDurationS = SLIDES.reduce((s, x) => s + x.videoS, 0);
  const totalFrames = Math.round(totalDurationS * FPS);
  const frame = useCurrentFrame();

  // Build per-slide frame ranges for the Sequence offsets.
  let offset = 0;
  const positioned = SLIDES.map((s, i) => {
    const durFrames = Math.round(s.videoS * FPS);
    const from = offset;
    offset += durFrames;
    return { ...s, from, durFrames, i };
  });

  return (
    <AbsoluteFill style={{ background: "#0e0e0e", fontFamily: FONT_MONO }}>
      <Audio src={staticFile("voiceover-theo.mp3")} />

      {positioned.map((s) => (
        <Sequence key={s.i} from={s.from} durationInFrames={s.durFrames + 8 /* small overlap for crossfade */}>
          <SlideFrame image={s.image} durationS={s.videoS} index={s.i} />
        </Sequence>
      ))}

      {/* Always-on progress bar across the top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: PROGRESS_BAR_HEIGHT,
          background: "rgba(168,32,26,0.18)",
        }}
      >
        <div
          style={{
            width: `${(frame / Math.max(1, totalFrames)) * 100}%`,
            height: "100%",
            background: "#a8201a",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
