import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { Background } from "../components/Background";
import { Stamp } from "../components/Stamp";
import { HeadlineOverlay } from "../components/TextOverlay";
import { FONT_HAND, FONT_HEADING, FONT_MONO } from "../fonts";

// "The harness is the bouncer" — a rapid-fire sequence where the agent
// tries to read off-limits files (.env, ~/.ssh, /etc/passwd, ../escape)
// and the harness slams a DENIED stamp on each one. Builds dramatically
// over ~8 seconds.

type Attempt = {
  path: string;
  label: string;
  reason: string;
  delay: number;
};

const ATTEMPTS: Attempt[] = [
  { path: ".env",                        label: "DENIED", reason: "secret file",        delay: 18 },
  { path: "~/.ssh/id_rsa",               label: "DENIED", reason: "ssh keys",           delay: 50 },
  { path: "/etc/passwd",                 label: "DENIED", reason: "outside workspace",  delay: 80 },
  { path: "../../etc/shadow",            label: "DENIED", reason: "path traversal",     delay: 108 },
];

export const BouncerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle red flash on each stamp slam — adds drama
  const flashOpacity = ATTEMPTS.reduce((acc, a) => {
    const f = interpolate(frame, [a.delay, a.delay + 4, a.delay + 14], [0, 0.18, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return acc + f;
  }, 0);

  return (
    <Background>
      {/* Brief red flash washes the screen when each stamp lands */}
      <AbsoluteFill style={{ background: COLORS.string, opacity: Math.min(flashOpacity, 0.22) }} />

      <AbsoluteFill style={{ padding: "70px 100px 0", flexDirection: "column" }}>
        <HeadlineOverlay delay={0} size={86}>
          The harness is the <span style={{ color: COLORS.string }}>bouncer</span>.
        </HeadlineOverlay>

        {/* Sub-headline: filename + reason rows. Each row reveals, then a
            DENIED stamp slams over the row. */}
        <div
          style={{
            marginTop: 40,
            display: "flex",
            flexDirection: "column",
            gap: 28,
            paddingLeft: 80,
          }}
        >
          {ATTEMPTS.map((a, i) => {
            // Row reveal
            const rowS = spring({
              frame: frame - (a.delay - 8),
              fps,
              config: { damping: 18, stiffness: 240 },
            });
            // Stamp slam (bigger initial scale, harder spring, then shake)
            const stampS = spring({
              frame: frame - a.delay,
              fps,
              config: { damping: 7, stiffness: 380, mass: 1.3 },
            });
            const stampScale = interpolate(stampS, [0, 1], [3.4, 1]);
            const stampRot = interpolate(stampS, [0, 1], [-18, -4 + i * 2]);
            const shakeF = frame > a.delay + 2 && frame < a.delay + 14
              ? Math.sin((frame - a.delay) * 1.8) * 6
              : 0;
            return (
              <div
                key={a.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 36,
                  opacity: rowS,
                  transform: `translateX(${interpolate(rowS, [0, 1], [-40, 0])}px)`,
                }}
              >
                {/* Attempted path "ticket" */}
                <div
                  style={{
                    background: "#1a1a1a",
                    color: "#e9e1cd",
                    fontFamily: FONT_MONO,
                    fontSize: 32,
                    padding: "12px 22px",
                    minWidth: 460,
                  }}
                >
                  read_file({"\""}
                  <span style={{ color: "#ffb38a" }}>{a.path}</span>
                  {"\""})
                </div>

                {/* The DENIED stamp slamming over it */}
                <div
                  style={{
                    transform: `translate(${shakeF}px, 0) scale(${stampScale}) rotate(${stampRot}deg)`,
                    opacity: stampS > 0 ? 1 : 0,
                    transformOrigin: "center",
                  }}
                >
                  <Stamp
                    label={a.label}
                    detail={a.reason}
                    ink={COLORS.string}
                    size="sm"
                    rotate={0}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Meme caption — landing late so the reveal punches first */}
        <div
          style={{
            position: "absolute",
            bottom: 70,
            right: 100,
            fontFamily: FONT_HEADING,
            fontSize: 56,
            color: COLORS.ink,
            fontStyle: "italic",
            opacity: interpolate(frame, [148, 180], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: `rotate(-3deg)`,
            textShadow: "0 4px 8px rgba(0,0,0,0.18)",
          }}
        >
          "you shall not pass."
          <div
            style={{
              fontFamily: FONT_HAND,
              fontSize: 26,
              color: COLORS.inkSoft,
              textAlign: "right",
              opacity: 0.75,
              marginTop: 4,
              fontStyle: "normal",
            }}
          >
            — your harness, every time
          </div>
        </div>
      </AbsoluteFill>
    </Background>
  );
};
