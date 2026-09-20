import { AbsoluteFill } from "remotion";
import { COLORS } from "../constants";

// The "corkboard" — paper-grain background that the artifacts pin to. Same
// diagonal repeating gradient the live demo's Wall.tsx uses.
export const Background: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      background: `repeating-linear-gradient(45deg, transparent 0 24px, rgba(120,90,60,0.05) 24px 26px), ${COLORS.paperDim}`,
    }}
  >
    {children}
  </AbsoluteFill>
);
