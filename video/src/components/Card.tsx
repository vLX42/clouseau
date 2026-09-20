import { CSSProperties, ReactNode } from "react";
import { COLORS } from "../constants";
import { FONT_HEADING, FONT_MONO } from "../fonts";
import { Pin } from "./Pin";

// One of the index-card / Polaroid-style artifacts pinned to the wall.
// `kind` chooses the color treatment: USER (blue), REQUEST (tan), RESPONSE
// (olive), ASSISTANT (gold), INSTRUCTIONS (brown thick bar), COMPACTED
// (yellow with black border).
type Kind = "user" | "request" | "response" | "assistant" | "instructions" | "compaction";

type Style = {
  title: string;
  bg: string;
  topBar: string;
  topBarThickness: number;
  accent: string;
};

const STYLES: Record<Kind, Style> = {
  user: {
    title: "USER",
    bg: COLORS.cardUser,
    topBar: COLORS.cardUserBar,
    topBarThickness: 14,
    accent: COLORS.cardUserBar,
  },
  request: {
    title: "REQUEST SENT",
    bg: COLORS.cardRequest,
    topBar: COLORS.cardRequestBar,
    topBarThickness: 10,
    accent: "#7a5d28",
  },
  response: {
    title: "RESPONSE",
    bg: COLORS.cardResponse,
    topBar: COLORS.cardResponseBar,
    topBarThickness: 10,
    accent: "#4a5a28",
  },
  assistant: {
    title: "ASSISTANT",
    bg: COLORS.cardAssistant,
    topBar: COLORS.cardAssistantBar,
    topBarThickness: 14,
    accent: "#6a4a18",
  },
  instructions: {
    title: "INSTRUCTIONS",
    bg: COLORS.cardInstructions,
    topBar: COLORS.cardInstructionsBar,
    topBarThickness: 22,
    accent: "#5a3f15",
  },
  compaction: {
    title: "COMPACTED",
    bg: COLORS.cardCompaction,
    topBar: COLORS.ink,
    topBarThickness: 0,
    accent: COLORS.ink,
  },
};

export const Card: React.FC<{
  kind: Kind;
  title?: string;
  body?: ReactNode;
  width?: number;
  height?: number;
  rotate?: number;
  pin?: boolean;
  style?: CSSProperties;
  children?: ReactNode;
}> = ({ kind, title, body, width = 380, height = 240, rotate = 0, pin = true, style, children }) => {
  const s = STYLES[kind];
  const isCompact = kind === "compaction";
  return (
    <div
      style={{
        width,
        minHeight: height,
        background: s.bg,
        border: isCompact ? `5px solid ${COLORS.ink}` : undefined,
        borderTop: isCompact
          ? `5px solid ${COLORS.ink}`
          : `${s.topBarThickness}px solid ${s.topBar}`,
        boxShadow: "0 16px 28px rgba(0,0,0,0.28)",
        padding: "26px 30px 22px",
        position: "relative",
        transform: `rotate(${rotate}deg)`,
        transformOrigin: "top center",
        fontFamily: FONT_MONO,
        color: COLORS.ink,
        ...style,
      }}
    >
      {pin && <Pin />}
      {isCompact && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 18,
            fontFamily: FONT_HEADING,
            fontSize: 30,
            fontWeight: 900,
            color: COLORS.ink,
          }}
        >
          [s]
        </div>
      )}
      <div
        style={{
          fontFamily: FONT_HEADING,
          fontSize: 20,
          letterSpacing: 3,
          color: s.accent,
          marginBottom: 14,
          fontWeight: 700,
        }}
      >
        {title || s.title}
      </div>
      {body && (
        <div
          style={{
            fontSize: 22,
            lineHeight: 1.45,
            whiteSpace: "pre-wrap",
          }}
        >
          {body}
        </div>
      )}
      {children}
    </div>
  );
};
