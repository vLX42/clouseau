import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { Background } from "../components/Background";
import { Card } from "../components/Card";
import { HeadlineOverlay } from "../components/TextOverlay";
import { FONT_HEADING, FONT_MONO } from "../fonts";

export const RequestScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // REQUEST card flies from left to "cloud", RESPONSE card flies back from cloud to right.
  const reqProg = interpolate(frame, [16, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const respProg = interpolate(frame, [80, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const reqX = interpolate(reqProg, [0, 1], [60, 760]);
  const reqOpacity = interpolate(reqProg, [0, 0.05, 0.9, 1], [0, 1, 1, 0]);

  const respX = interpolate(respProg, [0, 1], [1100, 1700]);
  const respOpacity = interpolate(respProg, [0, 0.05, 0.95, 1], [0, 1, 1, 1]);

  const cloudPulse = spring({
    frame: frame - 68,
    fps,
    config: { damping: 10, stiffness: 200, mass: 0.6 },
  });
  const cloudScale = interpolate(cloudPulse, [0, 1], [1, 1.18]);

  return (
    <Background>
      <AbsoluteFill style={{ padding: "70px 80px 0", flexDirection: "column" }}>
        <HeadlineOverlay delay={0} size={88}>
          One HTTPS call. <span style={{ color: COLORS.string }}>That's it.</span>
        </HeadlineOverlay>

        {/* Flight path */}
        <div style={{ position: "relative", marginTop: 80, height: 540 }}>
          {/* Big "OPENAI" cloud blob */}
          <div
            style={{
              position: "absolute",
              top: 90,
              left: 760,
              width: 380,
              height: 280,
              borderRadius: 160,
              background: "radial-gradient(circle at 35% 30%, #ffffff 0%, #d8d8d8 65%, #aeaeae 100%)",
              boxShadow:
                "0 30px 60px rgba(0,0,0,0.35), inset 0 -20px 50px rgba(0,0,0,0.18)",
              transform: `scale(${cloudScale})`,
              transformOrigin: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_HEADING,
            }}
          >
            <div style={{ fontSize: 28, color: COLORS.inkSoft, letterSpacing: 2 }}>
              POST
            </div>
            <div style={{ fontSize: 50, fontWeight: 900, color: COLORS.ink, marginTop: 6 }}>
              api.openai.com
            </div>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 24,
                color: COLORS.inkSoft,
                marginTop: 4,
              }}
            >
              /v1/chat/completions
            </div>
          </div>

          {/* REQUEST card in flight */}
          <div
            style={{
              position: "absolute",
              left: reqX,
              top: 130,
              opacity: reqOpacity,
              transform: `rotate(${interpolate(reqProg, [0, 1], [-8, 14])}deg)`,
            }}
          >
            <Card
              kind="request"
              width={320}
              height={200}
              rotate={0}
              body={
                <div style={{ fontSize: 20 }}>
                  → gpt-4o-mini
                  <br />
                  msgs: 7 · tools: 8
                  <br />
                  <span style={{ opacity: 0.55 }}>body: 9214b</span>
                </div>
              }
            />
          </div>

          {/* RESPONSE card returning */}
          <div
            style={{
              position: "absolute",
              left: respX,
              top: 180,
              opacity: respOpacity,
              transform: `rotate(${interpolate(respProg, [0, 1], [14, -4])}deg)`,
            }}
          >
            <Card
              kind="response"
              width={320}
              height={200}
              rotate={0}
              body={
                <div style={{ fontSize: 20 }}>
                  finish: tool_calls
                  <br />
                  tokens: in 4108 · out 92
                  <br />
                  <span style={{ opacity: 0.55 }}>→ wants to call: list_skills</span>
                </div>
              }
            />
          </div>
        </div>
      </AbsoluteFill>
    </Background>
  );
};
