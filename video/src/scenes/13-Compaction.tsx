import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { Background } from "../components/Background";
import { Card } from "../components/Card";
import { HeadlineOverlay } from "../components/TextOverlay";
import { FONT_HEADING } from "../fonts";

export const CompactionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const N = 6;
  // Six small request/response cards fade out and shrink into the COMPACTED card.
  const shrinkProg = interpolate(frame, [36, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const compactS = spring({
    frame: frame - 80,
    fps,
    config: { damping: 12, stiffness: 220 },
  });

  return (
    <Background>
      <AbsoluteFill style={{ padding: "100px 130px 0", flexDirection: "column" }}>
        <HeadlineOverlay delay={0} size={86}>
          When it overflows: <span style={{ color: COLORS.string }}>compaction.</span>
        </HeadlineOverlay>

        <div
          style={{
            marginTop: 60,
            position: "relative",
            height: 540,
          }}
        >
          {/* Originals fading and converging */}
          {Array.from({ length: N }).map((_, i) => {
            const baseX = 60 + i * 180;
            const baseY = i % 2 === 0 ? 60 : 220;
            const targetX = 1100;
            const targetY = 140;
            const x = interpolate(shrinkProg, [0, 1], [baseX, targetX]);
            const y = interpolate(shrinkProg, [0, 1], [baseY, targetY]);
            const scale = interpolate(shrinkProg, [0, 1], [1, 0.2]);
            const opacity = interpolate(shrinkProg, [0, 0.4, 0.9], [1, 0.6, 0.05]);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                  opacity,
                }}
              >
                <Card
                  kind={i % 2 === 0 ? "request" : "response"}
                  width={170}
                  height={110}
                  rotate={(i % 3) - 1}
                  pin={false}
                  body={
                    <div style={{ fontSize: 14 }}>
                      msg {i + 1}
                      <br />
                      …
                    </div>
                  }
                />
              </div>
            );
          })}

          {/* Big COMPACTED card slamming in */}
          <div
            style={{
              position: "absolute",
              right: 80,
              top: 130,
              transform: `scale(${interpolate(compactS, [0, 1], [0.7, 1])}) rotate(-3deg)`,
              opacity: compactS,
            }}
          >
            <Card
              kind="compaction"
              width={580}
              height={340}
              rotate={0}
              body={
                <div style={{ fontSize: 22, lineHeight: 1.45 }}>
                  <div style={{ opacity: 0.65, marginBottom: 8 }}>compacted 6 messages</div>
                  Agent listed skills, loaded react-todo,
                  wrote TodoList.tsx (612b), verified on
                  disk. Ready to continue.
                </div>
              }
            />
          </div>

          {/* hand-written annotation */}
          <div
            style={{
              position: "absolute",
              left: 80,
              bottom: 40,
              fontFamily: "Caveat, cursive",
              fontSize: 50,
              color: COLORS.inkSoft,
              maxWidth: 700,
              opacity: interpolate(frame, [120, 140], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <span style={{ fontFamily: FONT_HEADING, color: COLORS.string }}>
              "summarise the past
            </span>
            <br />
            <span style={{ fontFamily: FONT_HEADING, color: COLORS.string }}>
              · keep moving."
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </Background>
  );
};
