import { AbsoluteFill } from "remotion";
import { FONT_MONO } from "../fonts";
import { PlaybackWall } from "./Wall";
import { Headline } from "./Headline";

// One Remotion composition that plays back the recorded demo session 1:1,
// using the same physics + artifact components as the live app. Each
// recorded event gets its own dwell time and a bottom-of-frame headline.
export const DemoPlayback: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: FONT_MONO, background: "#ece4d3" }}>
      {/* CSS variables the copied frontend artifacts depend on. Defined once,
          inherited by everything inside DemoPlayback. */}
      <style>{`
        :root {
          --paper: #f4ede0;
          --paper-dim: #ece4d3;
          --ink: #1a1a1a;
          --ink-soft: #3b3531;
          --rule: #d8cdb6;
          --string: #a8201a;
          --string-dim: #6b5d4f;
          --accent: #5a4634;
        }
      `}</style>
      <PlaybackWall />
      <Headline />
    </AbsoluteFill>
  );
};
