import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { Background } from "../components/Background";
import { HeadlineOverlay } from "../components/TextOverlay";
import { FONT_MONO } from "../fonts";

const CODE: { text: string; color?: string }[] = [
  { text: "let messages = [systemPrompt, userPrompt];" },
  { text: "while (true) {" },
  { text: "  const res = await fetch(API, { messages, tools });" },
  { text: "  const msg = res.choices[0].message;" },
  { text: "  messages.push(msg);" },
  { text: "" },
  { text: "  if (msg.tool_calls) {", color: "#ff8a7a" },
  { text: "    for (const call of msg.tool_calls) {", color: "#ff8a7a" },
  { text: "      const out = runTool(call.name, call.args);", color: "#ff8a7a" },
  { text: "      messages.push({ role: 'tool', content: out });", color: "#ff8a7a" },
  { text: "    }", color: "#ff8a7a" },
  { text: "    continue;", color: "#ff8a7a" },
  { text: "  }" },
  { text: "  break;" },
  { text: "}" },
];

export const LoopScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Background>
      <AbsoluteFill
        style={{
          flexDirection: "column",
          alignItems: "center",
          padding: "70px 100px 0",
        }}
      >
        <HeadlineOverlay delay={0} size={88}>
          The whole agent. <span style={{ color: COLORS.string }}>~15 lines.</span>
        </HeadlineOverlay>

        <div
          style={{
            marginTop: 50,
            width: 1300,
            background: "#0e0e0e",
            border: "1px solid #2a2a2a",
            borderRadius: 16,
            padding: "32px 38px",
            fontFamily: FONT_MONO,
            fontSize: 30,
            lineHeight: 1.45,
            color: "#e9e1cd",
            boxShadow: "0 24px 50px rgba(0,0,0,0.55)",
            position: "relative",
          }}
        >
          {CODE.map((line, i) => {
            const reveal = spring({
              frame: frame - 36 - i * 7,
              fps,
              config: { damping: 26, stiffness: 240 },
            });
            return (
              <div
                key={i}
                style={{
                  opacity: reveal,
                  transform: `translateX(${interpolate(reveal, [0, 1], [-12, 0])}px)`,
                  color: line.color || "#e9e1cd",
                  minHeight: line.text === "" ? 18 : "auto",
                  whiteSpace: "pre",
                }}
              >
                {line.text || " "}
              </div>
            );
          })}

          {/* Meme caption — "tell me you're a while loop..." */}
          <div
            style={{
              position: "absolute",
              left: 20,
              bottom: -100,
              fontFamily: "Caveat, cursive",
              fontSize: 38,
              color: COLORS.inkSoft,
              opacity: interpolate(frame, [200, 240], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              transform: "rotate(-1.5deg)",
            }}
          >
            tell me you're a while-loop without telling me you're a while-loop.
          </div>

          {/* Circling annotation arrow pointing at the loop core */}
          <div
            style={{
              position: "absolute",
              right: -150,
              top: 200,
              fontFamily: "Caveat, cursive",
              fontSize: 46,
              color: COLORS.string,
              transform: "rotate(-4deg)",
              opacity: interpolate(frame, [150, 170], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            ↩ that's it.
            <br />
            <span style={{ fontSize: 36, opacity: 0.7 }}>that's the agent.</span>
          </div>
        </div>
      </AbsoluteFill>
    </Background>
  );
};
