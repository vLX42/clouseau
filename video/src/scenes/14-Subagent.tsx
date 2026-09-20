import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { Background } from "../components/Background";
import { Stamp } from "../components/Stamp";
import { Polaroid } from "../components/Polaroid";
import { HeadlineOverlay } from "../components/TextOverlay";
import { FONT_HEADING, FONT_MONO } from "../fonts";

export const SubagentScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: spawn stamp arrives left (0–50)
  const spawnS = spring({ frame: frame - 18, fps, config: { damping: 10, stiffness: 280 } });
  // Phase 2: subagent's mini-events appear in the lane below (40–120)
  const subEvProg = interpolate(frame, [50, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Phase 3: return polaroid arrives right (120–170)
  const returnS = spring({ frame: frame - 130, fps, config: { damping: 14, stiffness: 220 } });

  return (
    <Background>
      <AbsoluteFill style={{ padding: "60px 100px 0", flexDirection: "column" }}>
        <HeadlineOverlay delay={0} size={82}>
          Sometimes the main loop <span style={{ color: COLORS.string }}>spawns another loop</span>.
        </HeadlineOverlay>

        {/* MAIN LANE */}
        <div style={{ marginTop: 70, position: "relative", height: 220 }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 100,
              transform: `scale(${interpolate(spawnS, [0, 1], [0.6, 1])}) rotate(-5deg)`,
              opacity: spawnS,
            }}
          >
            <Stamp
              label="▶ SUBAGENT"
              detail="research: best React todo UX"
              ink={COLORS.stampSubagent}
              size="md"
              rotate={0}
            />
          </div>

          <div
            style={{
              position: "absolute",
              right: 100,
              top: 0,
              transform: `scale(${interpolate(returnS, [0, 1], [0.6, 1])}) rotate(4deg)`,
              opacity: returnS,
            }}
          >
            <Polaroid
              tone="subReturn"
              fromSubagent
              caption="spawn_subagent(...) · 318b"
              width={360}
              height={300}
              rotate={0}
              output={
                <div style={{ fontSize: 16 }}>
                  Three patterns matter:
                  <br />
                  · inline-add then escape-clear
                  <br />
                  · keyboard-first toggling
                  <br />· optimistic delete with undo
                </div>
              }
            />
          </div>
        </div>

        {/* SUBAGENT LANE (below, blue-tinted, with its own mini events) */}
        <div
          style={{
            marginTop: 30,
            position: "relative",
            background: "rgba(31,61,110,0.06)",
            border: `2px dashed ${COLORS.stampSubagent}`,
            padding: "26px 40px",
            minHeight: 220,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -14,
              left: 30,
              background: COLORS.paperDim,
              padding: "0 12px",
              fontFamily: FONT_HEADING,
              fontSize: 18,
              letterSpacing: 3,
              color: COLORS.stampSubagent,
              fontWeight: 900,
            }}
          >
            SUBAGENT LANE · fresh context · read-only tools
          </div>

          <div
            style={{
              display: "flex",
              gap: 26,
              alignItems: "center",
              filter: "hue-rotate(180deg) saturate(0.6)",
            }}
          >
            {["list_files", "read_file", "read_file", "summarise"].map((tool, i) => {
              const s = interpolate(subEvProg, [i / 5, (i + 1) / 5], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <div
                  key={i}
                  style={{
                    opacity: s,
                    transform: `translateY(${interpolate(s, [0, 1], [16, 0])}px)`,
                    border: `3px solid ${COLORS.stampSubagent}`,
                    background: COLORS.paper,
                    padding: "12px 18px",
                    fontFamily: FONT_MONO,
                    fontSize: 22,
                    color: COLORS.stampSubagent,
                    fontWeight: 700,
                    boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  sub · {tool}()
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </Background>
  );
};
