import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { Background } from "../components/Background";
import { HeadlineOverlay } from "../components/TextOverlay";
import { FONT_HAND, FONT_HEADING, FONT_MONO } from "../fonts";

// "Output sanitization" — a tool just ran, here's what came back. The
// harness redacts secret-looking bits and truncates the rest. We render
// a terminal-style "tool result" block with REDACTED / TRUNCATED stamps
// slamming over the sensitive lines.

type Line = {
  text: string;
  highlight?: { stamp: "REDACTED" | "TRUNCATED"; delay: number; reason: string };
};

const LINES: Line[] = [
  { text: "$ run_bash('env')" },
  { text: "" },
  { text: "USER=peter" },
  { text: "HOME=/Users/peter" },
  {
    text: "AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE",
    highlight: { stamp: "REDACTED", delay: 18, reason: "looks like a secret" },
  },
  {
    text: 'OPENAI_API_KEY=sk-proj-Aa9F2…rT9p4',
    highlight: { stamp: "REDACTED", delay: 52, reason: "looks like a secret" },
  },
  { text: "PATH=/usr/local/bin:/usr/bin:/bin" },
  { text: "…" },
  {
    text: "[…stdout cut, +94,000 chars elided…]",
    highlight: { stamp: "TRUNCATED", delay: 90, reason: "30k char cap" },
  },
];

export const FirewallScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Background>
      <AbsoluteFill style={{ padding: "60px 100px 0", flexDirection: "column" }}>
        <HeadlineOverlay delay={0} size={80}>
          The harness is the <span style={{ color: COLORS.string }}>firewall</span>.
        </HeadlineOverlay>

        {/* Subhead: contextual line */}
        <div
          style={{
            marginTop: 18,
            fontFamily: FONT_HAND,
            fontSize: 38,
            color: COLORS.inkSoft,
            opacity: interpolate(frame, [16, 36], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          tool output goes through this gate, every single time.
        </div>

        {/* Terminal-style block with REDACTED / TRUNCATED stamps slamming over sensitive lines */}
        <div
          style={{
            marginTop: 36,
            background: "#0e0e0e",
            color: "#dfe9c8",
            fontFamily: FONT_MONO,
            fontSize: 28,
            lineHeight: 1.5,
            padding: "28px 36px",
            border: "1px solid #2a2a2a",
            borderRadius: 10,
            position: "relative",
            boxShadow: "0 24px 50px rgba(0,0,0,0.55)",
          }}
        >
          {LINES.map((line, i) => {
            const reveal = spring({
              frame: frame - 30 - i * 5,
              fps,
              config: { damping: 22, stiffness: 220 },
            });
            const lineColor = line.text.startsWith("$")
              ? "#f5d272"
              : line.text.startsWith("[")
              ? "#888"
              : line.text === ""
              ? "transparent"
              : "#dfe9c8";

            return (
              <div
                key={i}
                style={{
                  position: "relative",
                  opacity: reveal,
                  color: lineColor,
                  minHeight: line.text === "" ? 12 : "auto",
                  whiteSpace: "pre",
                }}
              >
                {line.text || " "}

                {/* If this line gets stamped, the stamp slams over it */}
                {line.highlight && frame > line.highlight.delay && (
                  <StampSlam
                    label={line.highlight.stamp}
                    reason={line.highlight.reason}
                    delay={line.highlight.delay}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Meme-style caption at the bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 100,
            fontFamily: FONT_HEADING,
            fontSize: 44,
            color: COLORS.ink,
            fontStyle: "italic",
            opacity: interpolate(frame, [140, 175], [0, 1], { extrapolateRight: "clamp" }),
            transform: "rotate(-2deg)",
          }}
        >
          POV: you're 4 MB of stdout
        </div>
      </AbsoluteFill>
    </Background>
  );
};

const StampSlam: React.FC<{ label: string; reason: string; delay: number }> = ({
  label,
  reason,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 7, stiffness: 380, mass: 1.4 },
  });
  const scale = interpolate(s, [0, 1], [3.2, 1]);
  const rot = interpolate(s, [0, 1], [-12, -3]);

  return (
    <div
      style={{
        position: "absolute",
        left: -12,
        top: -6,
        right: -12,
        opacity: s > 0 ? 1 : 0,
        transform: `scale(${scale}) rotate(${rot}deg)`,
        transformOrigin: "left center",
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        gap: 18,
      }}
    >
      <div
        style={{
          padding: "6px 18px",
          border: `4px solid ${COLORS.string}`,
          outline: `2px dashed ${COLORS.string}`,
          outlineOffset: 4,
          background: "rgba(244,237,224,0.92)",
          color: COLORS.string,
          fontFamily: "Roboto Slab, serif",
          fontWeight: 900,
          fontSize: 30,
          letterSpacing: 3,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "Caveat, cursive",
          fontSize: 28,
          color: COLORS.string,
          opacity: 0.85,
        }}
      >
        ← {reason}
      </div>
    </div>
  );
};
