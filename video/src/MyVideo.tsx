import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { SCENE_FRAMES, TRANSITION_FRAMES } from "./constants";
import { FONT_MONO } from "./fonts";
import { quickFade } from "./transitions/QuickFade";

import { TitleScene } from "./scenes/01-Title";
import { IllusionScene } from "./scenes/02-Illusion";
import { PlotTwistScene } from "./scenes/03-PlotTwist";
import { LoopScene } from "./scenes/04-Loop";
import { InstructionsScene } from "./scenes/05-Instructions";
import { RequestScene } from "./scenes/06-Request";
import { ToolCallScene } from "./scenes/07-ToolCall";
import { PermissionScene } from "./scenes/08-Permission";
import { BouncerScene } from "./scenes/09-Bouncer";
import { FirewallScene } from "./scenes/10-Firewall";
import { IterateScene } from "./scenes/11-Iterate";
import { TokensScene } from "./scenes/12-Tokens";
import { CompactionScene } from "./scenes/13-Compaction";
import { SubagentScene } from "./scenes/14-Subagent";
import { WallRevealScene } from "./scenes/15-WallReveal";
import { OutroScene } from "./scenes/16-Outro";

// Module-level transition instance — required, see remotion-transitions notes.
const FADE = quickFade();

const SCENES: { id: keyof typeof SCENE_FRAMES; Component: React.FC }[] = [
  { id: "title", Component: TitleScene },
  { id: "illusion", Component: IllusionScene },
  { id: "twist", Component: PlotTwistScene },
  { id: "loop", Component: LoopScene },
  { id: "instructions", Component: InstructionsScene },
  { id: "request", Component: RequestScene },
  { id: "toolCall", Component: ToolCallScene },
  { id: "permission", Component: PermissionScene },
  { id: "bouncer", Component: BouncerScene },
  { id: "firewall", Component: FirewallScene },
  { id: "iterate", Component: IterateScene },
  { id: "tokens", Component: TokensScene },
  { id: "compaction", Component: CompactionScene },
  { id: "subagent", Component: SubagentScene },
  { id: "wallReveal", Component: WallRevealScene },
  { id: "outro", Component: OutroScene },
];

// If a voiceover audio file is present, play it. Skip silently in dev when
// the TTS step hasn't been run yet.
const VO_FILE = "voiceover.mp3";

// Build a flat array of Sequence and Transition children for TransitionSeries.
// TransitionSeries inspects direct children to compute timing, so flattening
// (instead of using fragments inside .map) avoids any chance of misalignment.
const children: React.ReactNode[] = [];
SCENES.forEach(({ id, Component }, i) => {
  children.push(
    <TransitionSeries.Sequence key={id} durationInFrames={SCENE_FRAMES[id]}>
      <Component />
    </TransitionSeries.Sequence>,
  );
  if (i < SCENES.length - 1) {
    children.push(
      <TransitionSeries.Transition
        key={`${id}-t`}
        presentation={FADE}
        timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
      />,
    );
  }
});

export const ClouseauExplainer: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: FONT_MONO }}>
      <Audio src={staticFile(VO_FILE)} />
      <TransitionSeries>{children}</TransitionSeries>
    </AbsoluteFill>
  );
};
