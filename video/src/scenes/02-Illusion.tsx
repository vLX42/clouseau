import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { Background } from "../components/Background";
import { HeadlineOverlay, KickerOverlay } from "../components/TextOverlay";
import { FONT_MONO } from "../fonts";

const FAKE_OUT = [
  "$ claude-code",
  "> add dark mode to App.tsx and verify the build",
  "✓ editing App.tsx",
  "✓ editing index.css",
  "✓ npm run build",
  "✓ build passed — shipped.",
];

export const IllusionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Background>
      <AbsoluteFill
        style={{
          padding: "120px 120px 0",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <HeadlineOverlay delay={0} size={96}>
          You typed a prompt.
        </HeadlineOverlay>

        {/* Fake terminal box */}
        <div
          style={{
            marginTop: 60,
            width: 1100,
            background: "#0e0e0e",
            color: "#dfe9c8",
            borderRadius: 14,
            padding: "26px 30px",
            fontFamily: FONT_MONO,
            fontSize: 30,
            lineHeight: 1.55,
            boxShadow: "0 24px 50px rgba(0,0,0,0.55)",
            border: "1px solid #2a2a2a",
          }}
        >
          {FAKE_OUT.map((line, i) => {
            const reveal = spring({
              frame: frame - 30 - i * 10,
              fps,
              config: { damping: 24, stiffness: 220 },
            });
            const ok = line.startsWith("✓");
            return (
              <div
                key={i}
                style={{
                  opacity: reveal,
                  transform: `translateY(${interpolate(reveal, [0, 1], [10, 0])}px)`,
                  color: ok ? "#7eed8a" : i === 1 ? "#f5d272" : "#dfe9c8",
                }}
              >
                {line}
              </div>
            );
          })}
        </div>

        <KickerOverlay
          delay={104}
          style={{ marginTop: 36, color: COLORS.string }}
        >
          and… magic?
        </KickerOverlay>
      </AbsoluteFill>
    </Background>
  );
};
