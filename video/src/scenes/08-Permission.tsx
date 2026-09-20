import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { Background } from "../components/Background";
import { Stamp } from "../components/Stamp";
import { HeadlineOverlay } from "../components/TextOverlay";

export const PermissionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({
    frame: frame - 24,
    fps,
    config: { damping: 9, stiffness: 320, mass: 1.2 },
  });

  return (
    <Background>
      <AbsoluteFill style={{ padding: "120px 140px 0", flexDirection: "column" }}>
        <HeadlineOverlay delay={0} size={86}>
          Dangerous tool? <span style={{ color: COLORS.string }}>Permission gate.</span>
        </HeadlineOverlay>

        <div
          style={{
            marginTop: 70,
            display: "flex",
            justifyContent: "center",
            gap: 80,
            alignItems: "center",
          }}
        >
          <div
            style={{
              transform: `scale(${interpolate(s, [0, 1], [3, 1])}) rotate(-8deg)`,
              opacity: s > 0 ? 1 : 0,
              transformOrigin: "center",
            }}
          >
            <Stamp
              label="PERMISSION"
              detail="write_file · auto-approved ✓"
              size="lg"
              ink={COLORS.stampPermission}
              rotate={0}
            />
          </div>

          <div
            style={{
              fontFamily: "Caveat, cursive",
              fontSize: 64,
              color: COLORS.inkSoft,
              maxWidth: 540,
              opacity: interpolate(frame, [70, 90], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              lineHeight: 1.1,
            }}
          >
            ask before
            <br />
            you write or shell out
          </div>
        </div>
      </AbsoluteFill>
    </Background>
  );
};
