import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { Background } from "../components/Background";
import { StickyNote } from "../components/StickyNote";
import { HeadlineOverlay } from "../components/TextOverlay";
import { FONT_HEADING, FONT_MONO } from "../fonts";

export const TokensScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tokens = Math.floor(interpolate(frame, [10, 130], [0, 9420], { extrapolateRight: "clamp" }));
  const cost = (tokens / 1_000_000) * 0.6;
  const fillProg = interpolate(frame, [10, 140], [0, 0.85], { extrapolateRight: "clamp" });

  const limit = 8000;
  const warn = tokens > limit;

  return (
    <Background>
      <AbsoluteFill style={{ padding: "100px 130px 0", flexDirection: "column" }}>
        <HeadlineOverlay delay={0} size={86}>
          Every turn, the context gets <span style={{ color: COLORS.string }}>heavier</span>.
        </HeadlineOverlay>

        <div
          style={{
            marginTop: 70,
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: 80,
            alignItems: "center",
          }}
        >
          {/* Tank that fills as tokens accumulate */}
          <div
            style={{
              height: 360,
              background: "rgba(0,0,0,0.05)",
              border: `3px solid ${COLORS.accent}`,
              borderRadius: 14,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: `${fillProg * 100}%`,
                background: warn
                  ? `linear-gradient(180deg, #f4c34a 0%, ${COLORS.string} 100%)`
                  : `linear-gradient(180deg, #c8e0a3 0%, #7a8f4a 100%)`,
                transition: "background 0.4s",
              }}
            />
            {/* threshold line */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: "75%",
                borderTop: `3px dashed ${COLORS.string}`,
                opacity: 0.9,
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 16,
                bottom: "76%",
                fontFamily: FONT_MONO,
                color: COLORS.string,
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              COMPACTION_THRESHOLD
            </div>
            <div
              style={{
                position: "absolute",
                top: 22,
                left: 22,
                fontFamily: FONT_HEADING,
                color: COLORS.inkSoft,
                fontSize: 26,
                letterSpacing: 2.4,
              }}
            >
              CONTEXT WINDOW
            </div>
          </div>

          {/* Live usage sticky */}
          <div
            style={{
              transform: `scale(${spring({
                frame: frame - 18,
                fps,
                config: { damping: 14, stiffness: 200 },
              })})`,
            }}
          >
            <StickyNote width={320} height={300} title="USAGE" rotate={-4}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 26, lineHeight: 1.5 }}>
                in&nbsp;&nbsp;{tokens.toLocaleString()}
                <br />
                out&nbsp; 312
                <br />
                cost ${cost.toFixed(4)}
              </div>
            </StickyNote>
          </div>
        </div>
      </AbsoluteFill>
    </Background>
  );
};
