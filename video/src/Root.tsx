import { Composition } from "remotion";
import { ClouseauExplainer } from "./MyVideo";
import { DemoPlayback } from "./playback/DemoPlayback";
import { PLAYBACK_TOTAL_FRAMES } from "./playback/timeline";
import { TheoTalkthrough } from "./theo/TheoTalkthrough";
import { TOTAL_FRAMES as THEO_TOTAL_FRAMES } from "./theo/slides.generated";
import { DURATION_FRAMES, FPS, HEIGHT, WIDTH } from "./constants";

export const Root = () => (
  <>
    <Composition
      id="ClouseauExplainer"
      component={ClouseauExplainer}
      durationInFrames={DURATION_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
    <Composition
      id="DemoPlayback"
      component={DemoPlayback}
      durationInFrames={PLAYBACK_TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
    <Composition
      id="TheoTalkthrough"
      component={TheoTalkthrough}
      durationInFrames={THEO_TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </>
);
