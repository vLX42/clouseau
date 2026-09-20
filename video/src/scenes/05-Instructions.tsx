import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { Background } from "../components/Background";
import { Card } from "../components/Card";
import { HeadlineOverlay } from "../components/TextOverlay";
import { FONT_HEADING, FONT_MONO } from "../fonts";

const SOURCES = [
  { name: "SYSTEM (hardcoded)", chars: "1.5k", color: "#2f4a6d" },
  { name: "CLAUDE.md", chars: "3.2k", color: "#7a5a2e" },
  { name: "AGENTS.md", chars: "1.1k", color: "#7a5a2e" },
  { name: "tools schemas (×8)", chars: "2.4k", color: "#7a1d14" },
];

export const InstructionsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Background>
      <AbsoluteFill style={{ padding: "100px 130px 0", flexDirection: "column" }}>
        <HeadlineOverlay delay={0} size={88} align="left">
          Every turn starts with <span style={{ color: COLORS.string }}>instructions</span>.
        </HeadlineOverlay>

        <div
          style={{
            marginTop: 60,
            display: "grid",
            gridTemplateColumns: "1fr 110px 1fr",
            alignItems: "center",
            gap: 30,
          }}
        >
          {/* LEFT: source folders / files stacking up */}
          <div>
            {SOURCES.map((src, i) => {
              const s = spring({
                frame: frame - 20 - i * 12,
                fps,
                config: { damping: 18, stiffness: 220 },
              });
              return (
                <div
                  key={src.name}
                  style={{
                    background: COLORS.paper,
                    border: `1px solid ${COLORS.rule}`,
                    borderLeft: `12px solid ${src.color}`,
                    padding: "18px 24px",
                    marginBottom: 16,
                    fontFamily: FONT_MONO,
                    fontSize: 30,
                    boxShadow: "0 8px 16px rgba(0,0,0,0.18)",
                    opacity: s,
                    transform: `translateX(${interpolate(s, [0, 1], [-60, 0])}px)`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{src.name}</span>
                  <span style={{ opacity: 0.55, fontSize: 24 }}>{src.chars}</span>
                </div>
              );
            })}
          </div>

          {/* arrow */}
          <div
            style={{
              fontFamily: FONT_HEADING,
              fontSize: 100,
              color: COLORS.string,
              textAlign: "center",
              opacity: interpolate(frame, [80, 100], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            →
          </div>

          {/* RIGHT: single INSTRUCTIONS card the harness stitches together */}
          <div
            style={{
              transform: `scale(${spring({
                frame: frame - 100,
                fps,
                config: { damping: 14, stiffness: 220 },
              })})`,
              transformOrigin: "center",
            }}
          >
            <Card
              kind="instructions"
              width={560}
              height={360}
              rotate={-2}
              body={
                <div style={{ fontSize: 24, lineHeight: 1.4 }}>
                  <div style={{ opacity: 0.65, fontSize: 18, marginBottom: 8 }}>
                    total: 8.2k chars · 8 tools
                  </div>
                  · SYSTEM (hardcoded)
                  <br />
                  · CLAUDE.md
                  <br />
                  · AGENTS.md
                  <br />· tools: read_file, write_file,
                  <br />
                  &nbsp;&nbsp;run_bash, list_skills, …
                </div>
              }
            />
          </div>
        </div>
      </AbsoluteFill>
    </Background>
  );
};
