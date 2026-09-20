import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { Background } from "../components/Background";
import { Polaroid } from "../components/Polaroid";
import { Stamp } from "../components/Stamp";
import { HeadlineOverlay } from "../components/TextOverlay";

export const ToolCallScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Stamp slams in, polaroid develops from "developing…" to terminal output
  const stampS = spring({
    frame: frame - 18,
    fps,
    config: { damping: 8, stiffness: 380, mass: 1.2 },
  });
  const stampScale = interpolate(stampS, [0, 1], [3.5, 1]);

  const polS = spring({
    frame: frame - 64,
    fps,
    config: { damping: 16, stiffness: 200 },
  });
  const polOpacity = polS;

  // Develop: black → terminal text appears over 30 frames after spawn
  const developProg = interpolate(frame, [88, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Background>
      <AbsoluteFill style={{ padding: "100px 130px", flexDirection: "column" }}>
        <HeadlineOverlay delay={0} size={84}>
          The model asks. <span style={{ color: COLORS.string }}>The harness runs it.</span>
        </HeadlineOverlay>

        <div
          style={{
            marginTop: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 100,
          }}
        >
          <div
            style={{
              transform: `scale(${stampScale}) rotate(-6deg)`,
              opacity: stampS > 0 ? 1 : 0,
              transformOrigin: "center",
            }}
          >
            <Stamp
              label="TOOL CALL"
              detail='write_file("TodoList.tsx", "…")'
              size="lg"
              rotate={0}
            />
          </div>

          <div
            style={{
              fontSize: 100,
              fontFamily: "Caveat, cursive",
              color: COLORS.string,
              opacity: interpolate(stampS, [0.6, 1], [0, 1]),
            }}
          >
            →
          </div>

          <div
            style={{
              transform: `scale(${interpolate(polS, [0, 1], [0.7, 1])}) rotate(3deg)`,
              opacity: polOpacity,
              transformOrigin: "center",
            }}
          >
            <Polaroid
              tone="write"
              caption='write_file("TodoList.tsx") · 612b'
              width={440}
              height={400}
              rotate={0}
              output={
                developProg < 0.4 ? (
                  <span style={{ opacity: 0.5 }}>developing…</span>
                ) : (
                  <div style={{ opacity: developProg }}>
                    wrote TodoList.tsx
                    <br />
                    · 612 bytes
                    <br />
                    · path: tmp/&lt;uuid&gt;/
                    <br />
                    <span style={{ color: "#7eed8a" }}>✓ verified on disk</span>
                  </div>
                )
              }
            />
          </div>
        </div>
      </AbsoluteFill>
    </Background>
  );
};
