import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { Background } from "../components/Background";
import { Card } from "../components/Card";
import { HeadlineOverlay } from "../components/TextOverlay";
import { FONT_HEADING } from "../fonts";

export const IterateScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Three iterations cascading right with curved arrows
  const turns = [1, 2, 3];

  return (
    <Background>
      <AbsoluteFill style={{ padding: "120px 90px 0", flexDirection: "column" }}>
        <HeadlineOverlay delay={0} size={86}>
          And the loop <span style={{ color: COLORS.string }}>keeps going.</span>
        </HeadlineOverlay>

        <div
          style={{
            marginTop: 80,
            display: "flex",
            gap: 50,
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          {turns.map((t, i) => {
            const s = spring({
              frame: frame - 18 - i * 18,
              fps,
              config: { damping: 14, stiffness: 220 },
            });
            return (
              <div
                key={t}
                style={{
                  opacity: s,
                  transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px) scale(${interpolate(
                    s,
                    [0, 1],
                    [0.85, 1],
                  )})`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_HEADING,
                    fontSize: 32,
                    letterSpacing: 3,
                    color: COLORS.string,
                    marginBottom: 14,
                  }}
                >
                  TURN {t}
                </div>
                <Card
                  kind="request"
                  width={300}
                  height={170}
                  rotate={i === 1 ? 1.5 : i === 2 ? -2 : -1}
                  pin
                  body={
                    <div style={{ fontSize: 18 }}>
                      msgs: {3 + t * 2}
                      <br />
                      → call tool
                    </div>
                  }
                />
                <div style={{ height: 14 }} />
                <Card
                  kind="response"
                  width={300}
                  height={170}
                  rotate={i === 1 ? -1 : i === 2 ? 2 : 1.5}
                  pin
                  body={
                    <div style={{ fontSize: 18 }}>
                      tool result back
                      <br />
                      → continue
                    </div>
                  }
                />
              </div>
            );
          })}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 70,
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "Caveat, cursive",
            fontSize: 56,
            color: COLORS.inkSoft,
            opacity: interpolate(frame, [104, 124], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          until the model stops asking for tools.
        </div>
      </AbsoluteFill>
    </Background>
  );
};
