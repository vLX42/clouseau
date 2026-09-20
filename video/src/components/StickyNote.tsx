import { ReactNode } from "react";
import { COLORS } from "../constants";
import { FONT_HAND } from "../fonts";

// Bright yellow post-it for tokens / cost / quick callouts.
export const StickyNote: React.FC<{
  title?: string;
  children: ReactNode;
  bg?: string;
  width?: number;
  height?: number;
  rotate?: number;
}> = ({ title, children, bg = COLORS.stickyYellow, width = 220, height = 220, rotate = 4 }) => (
  <div
    style={{
      width,
      height,
      background: bg,
      padding: "18px 20px",
      fontFamily: FONT_HAND,
      fontSize: 30,
      color: "#2a201a",
      lineHeight: 1.15,
      boxShadow: "0 10px 22px rgba(0,0,0,0.22)",
      transform: `rotate(${rotate}deg)`,
      transformOrigin: "top center",
      position: "relative",
      whiteSpace: "pre-wrap",
    }}
  >
    {title && (
      <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 8, opacity: 0.85 }}>{title}</div>
    )}
    {children}
  </div>
);
