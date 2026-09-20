import { CSSProperties } from "react";
import { COLORS } from "../constants";
import { FONT_HEADING, FONT_MONO } from "../fonts";

// Rubber-stamp evidence marker. Used for TOOL CALL, PERMISSION, SUBAGENT
// spawn/return, STOP, etc. The double-border (solid + dashed outline) sells
// the "stamped on file" look.
export const Stamp: React.FC<{
  label: string;
  detail?: string;
  ink?: string;
  size?: "sm" | "md" | "lg";
  rotate?: number;
  style?: CSSProperties;
}> = ({ label, detail, ink = COLORS.stampToolCall, size = "md", rotate = -4, style }) => {
  const dims =
    size === "sm"
      ? { w: 220, h: 110, label: 22, detail: 18 }
      : size === "lg"
      ? { w: 360, h: 170, label: 36, detail: 26 }
      : { w: 280, h: 140, label: 28, detail: 22 };
  return (
    <div
      style={{
        width: dims.w,
        minHeight: dims.h,
        border: `5px solid ${ink}`,
        outline: `2px dashed ${ink}`,
        outlineOffset: 6,
        padding: "14px 20px",
        background: "rgba(244,237,224,0.55)",
        color: ink,
        fontFamily: FONT_HEADING,
        fontWeight: 900,
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 10px 20px rgba(0,0,0,0.18)",
        ...style,
      }}
    >
      <div
        style={{
          fontSize: dims.label,
          letterSpacing: 3.5,
          lineHeight: 1.1,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      {detail && (
        <div
          style={{
            fontSize: dims.detail,
            fontFamily: FONT_MONO,
            marginTop: 8,
            opacity: 0.9,
            fontWeight: 500,
          }}
        >
          {detail}
        </div>
      )}
    </div>
  );
};
