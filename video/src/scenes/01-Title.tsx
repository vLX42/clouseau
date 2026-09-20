import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { FONT_HEADING } from "../fonts";

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slow ken-burns push on the cover. The image already has all the
  // vocabulary the audience needs (TOOL CALL, COMPACTION, etc).
  const zoom = interpolate(frame, [0, 120], [1.0, 1.08]);

  const titleS = spring({
    frame: frame - 24,
    fps,
    config: { damping: 16, stiffness: 200 },
  });
  const subS = spring({
    frame: frame - 60,
    fps,
    config: { damping: 18, stiffness: 200 },
  });

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
        <Img
          src={staticFile("cover.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.62) 65%, rgba(0,0,0,0.85) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 110px 130px",
        }}
      >
        <div
          style={{
            color: COLORS.paper,
            fontFamily: FONT_HEADING,
            fontSize: 130,
            lineHeight: 0.96,
            fontWeight: 900,
            letterSpacing: -2,
            opacity: titleS,
            transform: `translateY(${interpolate(titleS, [0, 1], [80, 0])}px)`,
            textShadow: "0 8px 30px rgba(0,0,0,0.85)",
          }}
        >
          Does Your<br />
          Agent{" "}
          <span style={{ fontStyle: "italic", color: "#ff5d4f" }}>Bite?</span>
        </div>
        <div
          style={{
            marginTop: 30,
            color: "#e7dec8",
            fontFamily: "Caveat, cursive",
            fontSize: 52,
            opacity: subS,
            textShadow: "0 4px 12px rgba(0,0,0,0.9)",
          }}
        >
          your AI agent is a while loop in a ridiculous disguise
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
