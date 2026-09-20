import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { AbsoluteFill } from "remotion";

// Fast crossfade — cheap, fits the "snappy investigation" rhythm without
// taking attention from the artifacts. Instantiate at module scope.
type Props = Record<string, never>;

const Component: React.FC<TransitionPresentationComponentProps<Props>> = ({
  children,
  presentationDirection,
  presentationProgress,
}) => {
  const opacity =
    presentationDirection === "entering"
      ? presentationProgress
      : 1 - presentationProgress;
  return (
    <AbsoluteFill style={{ opacity }}>
      {children}
    </AbsoluteFill>
  );
};

export const quickFade = (): TransitionPresentation<Props> => ({
  component: Component,
  props: {} as Props,
});
