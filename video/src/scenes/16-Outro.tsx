import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { Background } from "../components/Background";
import { FONT_HEADING, FONT_MONO } from "../fonts";

// Clouseau's signature gag: "Does your dog bite?" — "No." — bite —
// "That is not my dog." Outro mirrors that beat for beat — the innocent
// question rotates in slow, the killer line slams.
export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Beat 1: "Does your agent bite?" (the innocent question)
  const introS = spring({ frame, fps, config: { damping: 16, stiffness: 180 } });
  // Beat 2: The model? Easy part. (punch)
  const punchS = spring({
    frame: frame - 56,
    fps,
    config: { damping: 9, stiffness: 360, mass: 1.3 },
  });
  // Beat 3: The harness does the work. (the actual reveal)
  const harnessS = spring({
    frame: frame - 100,
    fps,
    config: { damping: 10, stiffness: 360, mass: 1.2 },
  });
  // Beat 4: Disguise sticker
  const tag = spring({
    frame: frame - 145,
    fps,
    config: { damping: 18, stiffness: 200 },
  });

  // Subtle scale punch on the harness reveal — adds drama
  const harnessScale = interpolate(harnessS, [0, 0.7, 1], [0.6, 1.06, 1]);

  return (
    <Background>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: "0 120px",
        }}
      >
        {/* "Does your agent bite?" — the innocent question */}
        <div
          style={{
            fontFamily: "Caveat, cursive",
            fontSize: 84,
            color: COLORS.inkSoft,
            opacity: introS,
            transform: `translateY(${interpolate(introS, [0, 1], [40, 0])}px) rotate(-1.5deg)`,
            textAlign: "center",
            lineHeight: 1.05,
          }}
        >
          "Does your agent bite?"
        </div>

        {/* Punch line 1: "The model? Easy part." */}
        <div
          style={{
            marginTop: 40,
            fontFamily: FONT_HEADING,
            fontSize: 78,
            fontWeight: 700,
            color: COLORS.ink,
            textAlign: "center",
            opacity: punchS,
            transform: `translateY(${interpolate(punchS, [0, 1], [40, 0])}px)`,
            letterSpacing: -1,
          }}
        >
          The model? <span style={{ opacity: 0.55 }}>Easy part.</span>
        </div>

        {/* Punch line 2: The harness does the work — slammed in */}
        <div
          style={{
            marginTop: 26,
            fontFamily: FONT_HEADING,
            fontSize: 120,
            fontWeight: 900,
            color: COLORS.ink,
            textAlign: "center",
            letterSpacing: -2,
            lineHeight: 1,
            opacity: harnessS,
            transform: `scale(${harnessScale})`,
          }}
        >
          The <span style={{ color: COLORS.string }}>harness</span> <br />
          does the work.
        </div>

        {/* Disguise callback */}
        <div
          style={{
            marginTop: 40,
            fontFamily: FONT_MONO,
            fontSize: 28,
            fontWeight: 700,
            color: COLORS.inkSoft,
            letterSpacing: 3,
            opacity: tag,
            transform: `translateY(${interpolate(tag, [0, 1], [20, 0])}px)`,
          }}
        >
          (that is not my model. it's a <span style={{ background: "#1a1a1a", color: "#e9e1cd", padding: "1px 12px" }}>while</span> loop. in a ridiculous disguise.)
        </div>
      </AbsoluteFill>
    </Background>
  );
};
