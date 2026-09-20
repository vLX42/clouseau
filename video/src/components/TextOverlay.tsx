import { CSSProperties, ReactNode } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { FONT_HEADING } from "../fonts";

// Big slab title that springs in from offscreen-bottom. Used for the headline
// callouts on top of each scene.
export const HeadlineOverlay: React.FC<{
  children: ReactNode;
  delay?: number;
  exitFrame?: number;
  style?: CSSProperties;
  size?: number;
  align?: "left" | "center" | "right";
}> = ({ children, delay = 0, exitFrame, style, size = 110, align = "center" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 220 },
  });
  const y = interpolate(s, [0, 1], [60, 0]);

  const exit =
    exitFrame !== undefined
      ? interpolate(frame, [exitFrame, exitFrame + 12], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  return (
    <div
      style={{
        fontFamily: FONT_HEADING,
        fontSize: size,
        fontWeight: 900,
        color: COLORS.ink,
        textAlign: align,
        lineHeight: 1.05,
        letterSpacing: -1.5,
        opacity: s * exit,
        transform: `translateY(${y}px)`,
        textShadow: "0 4px 12px rgba(0,0,0,0.18)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Hand-lettered support caption — like a tagline scrawled on a Post-It.
export const KickerOverlay: React.FC<{
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
}> = ({ children, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 200 },
  });
  return (
    <div
      style={{
        fontFamily: "Caveat, cursive",
        fontSize: 56,
        color: COLORS.inkSoft,
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
