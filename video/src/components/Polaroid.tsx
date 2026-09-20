import { ReactNode } from "react";
import { COLORS } from "../constants";
import { FONT_HAND } from "../fonts";
import { Pin } from "./Pin";

// A polaroid: dark screen of tool output / terminal, captioned in handwritten
// font on a colored strip. Caption color encodes intent (write tools = red,
// skill tools = tan, subagent return = blue).
type CaptionTone = "default" | "write" | "skill" | "subReturn";

const TONE: Record<CaptionTone, { bg: string; fg: string; border: string; tag: string }> = {
  default: { bg: "#f7f2e4", fg: COLORS.inkSoft, border: "#d8cdb6", tag: "" },
  write: { bg: "#f3d5cf", fg: "#6a1b14", border: "#a8201a", tag: "✎ " },
  skill: { bg: "#e7d8b8", fg: "#5a3f15", border: "#a78a4f", tag: "✦ " },
  subReturn: { bg: "#d6e2f0", fg: "#1f3d6e", border: "#1f3d6e", tag: "◀ " },
};

export const Polaroid: React.FC<{
  caption: string;
  output: ReactNode;
  tone?: CaptionTone;
  width?: number;
  height?: number;
  rotate?: number;
  pin?: boolean;
  fromSubagent?: boolean;
}> = ({
  caption,
  output,
  tone = "default",
  width = 360,
  height = 380,
  rotate = 0,
  pin = true,
  fromSubagent = false,
}) => {
  const t = TONE[tone];
  return (
    <div
      style={{
        width,
        height,
        background: COLORS.polaroidPaper,
        border: `1px solid ${t.border}`,
        boxShadow: "0 16px 26px rgba(0,0,0,0.32)",
        padding: 18,
        paddingBottom: 70,
        position: "relative",
        transform: `rotate(${rotate}deg)`,
        transformOrigin: "top center",
      }}
    >
      {pin && <Pin />}
      {fromSubagent && (
        <div
          style={{
            position: "absolute",
            top: -22,
            left: 18,
            background: COLORS.stampSubagent,
            color: COLORS.paper,
            fontFamily: FONT_HAND,
            fontSize: 22,
            letterSpacing: 2.5,
            padding: "4px 14px",
            fontWeight: 700,
            transform: "rotate(-3deg)",
            boxShadow: "0 4px 8px rgba(0,0,0,0.25)",
          }}
        >
          FROM SUBAGENT
        </div>
      )}
      <div
        style={{
          background: COLORS.polaroidScreen,
          color: "#e9e1cd",
          fontFamily: "JetBrains Mono, ui-monospace, monospace",
          fontSize: 16,
          padding: 14,
          height: height - 90,
          overflow: "hidden",
          whiteSpace: "pre-wrap",
        }}
      >
        {output}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: t.bg,
          padding: "14px 18px",
          fontFamily: FONT_HAND,
          fontSize: 30,
          color: t.fg,
          textAlign: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          borderTop: `1px solid ${t.border}`,
        }}
      >
        {t.tag}
        {caption}
      </div>
    </div>
  );
};
