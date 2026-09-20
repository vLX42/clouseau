import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { Background } from "../components/Background";
import { Stamp } from "../components/Stamp";
import { FONT_HEADING, FONT_MONO } from "../fonts";

export const PlotTwistScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const denialLines = [
    "didn't open any files.",
    "didn't run any commands.",
    "doesn't have a filesystem.",
  ];

  const stampS = spring({
    frame: frame - 90,
    fps,
    config: { damping: 8, stiffness: 320, mass: 1.6 },
  });
  const stampScale = interpolate(stampS, [0, 1], [3.2, 1]);
  const stampRot = interpolate(stampS, [0, 1], [-22, -6]);
  const shake = Math.sin(frame * 0.6) * (frame > 92 && frame < 105 ? 4 : 0);

  return (
    <Background>
      <AbsoluteFill style={{ padding: "120px 140px", justifyContent: "center" }}>
        <div
          style={{
            fontFamily: FONT_HEADING,
            fontSize: 92,
            fontWeight: 900,
            color: COLORS.ink,
            letterSpacing: -1,
            lineHeight: 1.05,
            opacity: spring({ frame, fps, config: { damping: 18, stiffness: 200 } }),
          }}
        >
          The model
        </div>
        <div style={{ marginTop: 30 }}>
          {denialLines.map((line, i) => {
            const s = spring({
              frame: frame - 18 - i * 14,
              fps,
              config: { damping: 16, stiffness: 220 },
            });
            return (
              <div
                key={i}
                style={{
                  opacity: s,
                  transform: `translateX(${interpolate(s, [0, 1], [-40, 0])}px)`,
                  fontFamily: FONT_MONO,
                  fontSize: 52,
                  marginTop: 14,
                  color: COLORS.inkSoft,
                }}
              >
                <span style={{ color: COLORS.string, fontWeight: 700 }}>✗</span>{" "}
                It {line}
              </div>
            );
          })}
        </div>

        {/* Meme caption — Clouseau "wait a minute..." energy */}
        <div
          style={{
            position: "absolute",
            left: 140,
            bottom: 130,
            fontFamily: "Caveat, cursive",
            fontSize: 46,
            color: COLORS.string,
            opacity: interpolate(frame, [62, 90], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: "rotate(-3deg)",
          }}
        >
          *the model has left the chat*
        </div>

        {/* Big "IT SENT JSON" stamp slamming down */}
        <div
          style={{
            position: "absolute",
            right: 140,
            bottom: 150,
            transform: `translate(${shake}px, 0) scale(${stampScale}) rotate(${stampRot}deg)`,
            transformOrigin: "center",
            opacity: stampS > 0 ? 1 : 0,
          }}
        >
          <Stamp
            label="IT SENT JSON"
            detail="something else ran your commands"
            size="lg"
            ink={COLORS.string}
            rotate={0}
          />
        </div>
      </AbsoluteFill>
    </Background>
  );
};
