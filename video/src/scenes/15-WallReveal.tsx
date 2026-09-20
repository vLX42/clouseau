import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { Background } from "../components/Background";
import { Card } from "../components/Card";
import { Polaroid } from "../components/Polaroid";
import { Stamp } from "../components/Stamp";
import { StickyNote } from "../components/StickyNote";
import { SkillEnvelope } from "../components/SkillEnvelope";
import { RedString } from "../components/RedString";
import { HeadlineOverlay } from "../components/TextOverlay";

// Everything we just walked through, on one wall, with red string connecting it all.
type Spec = {
  x: number;
  y: number;
  delay: number;
  rot?: number;
  el: React.ReactNode;
};

const ITEMS: Spec[] = [
  {
    x: 70,
    y: 70,
    delay: 0,
    rot: -2,
    el: <Card kind="user" width={300} height={180} rotate={0} body={<>build a TodoList</>} />,
  },
  {
    x: 420,
    y: 80,
    delay: 4,
    rot: -1.5,
    el: (
      <Card
        kind="instructions"
        width={360}
        height={220}
        rotate={0}
        body={<>SYSTEM + CLAUDE.md + 8 tools</>}
      />
    ),
  },
  {
    x: 840,
    y: 60,
    delay: 8,
    rot: 1,
    el: <Card kind="request" width={300} height={170} rotate={0} body={<>POST /chat</>} />,
  },
  {
    x: 1190,
    y: 70,
    delay: 12,
    rot: -1,
    el: (
      <Card
        kind="response"
        width={300}
        height={170}
        rotate={0}
        body={<>finish: tool_calls</>}
      />
    ),
  },
  {
    x: 1540,
    y: 80,
    delay: 16,
    rot: 2,
    el: (
      <Stamp
        label="TOOL CALL"
        detail="list_skills()"
        size="sm"
        rotate={0}
      />
    ),
  },

  {
    x: 70,
    y: 360,
    delay: 22,
    rot: -3,
    el: (
      <SkillEnvelope
        name="react-todo"
        description="how to ship a tiny React todo"
        width={340}
        height={180}
        rotate={0}
      />
    ),
  },
  {
    x: 460,
    y: 380,
    delay: 26,
    rot: 0,
    el: (
      <Stamp
        label="▶ SUBAGENT"
        detail="research UX"
        ink={COLORS.stampSubagent}
        size="sm"
        rotate={0}
      />
    ),
  },
  {
    x: 760,
    y: 360,
    delay: 30,
    rot: 1.5,
    el: (
      <Polaroid
        tone="subReturn"
        fromSubagent
        caption="subagent ◀ done"
        width={300}
        height={230}
        rotate={0}
        output={<>3 patterns to use</>}
      />
    ),
  },
  {
    x: 1120,
    y: 360,
    delay: 34,
    rot: -2,
    el: (
      <Polaroid
        tone="write"
        caption='write_file("TodoList.tsx")'
        width={300}
        height={230}
        rotate={0}
        output={<>wrote 612b ✓</>}
      />
    ),
  },
  {
    x: 1480,
    y: 380,
    delay: 38,
    rot: 4,
    el: (
      <StickyNote width={210} height={210} title="USAGE" rotate={0}>
        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 22 }}>
          in 6128
          <br />
          out 412
          <br />$ 0.004
        </div>
      </StickyNote>
    ),
  },

  {
    x: 70,
    y: 700,
    delay: 44,
    rot: -1.5,
    el: (
      <Card
        kind="compaction"
        width={360}
        height={200}
        rotate={0}
        body={<>compacted 8 messages → kept moving</>}
      />
    ),
  },
  {
    x: 510,
    y: 720,
    delay: 48,
    rot: 1,
    el: (
      <Card
        kind="assistant"
        width={420}
        height={180}
        rotate={0}
        body={<>Done. TodoList.tsx is on disk.</>}
      />
    ),
  },
  {
    x: 1020,
    y: 700,
    delay: 52,
    rot: 4,
    el: (
      <Stamp
        label="STOP"
        detail="reason: end_turn"
        ink={COLORS.stampStop}
        size="sm"
        rotate={0}
      />
    ),
  },
];

// Approximate pin coordinates (top-center of each card) for the string layer.
const pin = (s: Spec, w: number) => ({ x: s.x + w / 2, y: s.y });

const STRINGS: Array<[number, number, number, number]> = [
  [0, 1, 300, 360],
  [1, 2, 360, 300],
  [2, 3, 300, 300],
  [3, 4, 300, 220],
  [4, 6, 220, 220],
  [5, 6, 340, 220],
  [6, 7, 220, 300],
  [7, 8, 300, 300],
  [8, 9, 300, 210],
  [3, 10, 300, 360],
  [10, 11, 360, 420],
  [11, 12, 420, 220],
];

export const WallRevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Background>
      <AbsoluteFill style={{ padding: "30px 0 0" }}>
        <HeadlineOverlay delay={0} size={72} style={{ marginBottom: 0 }}>
          One run. Every event. <span style={{ color: COLORS.string }}>One wall.</span>
        </HeadlineOverlay>

        <AbsoluteFill style={{ top: 130 }}>
          {/* RED STRING layer (renders behind artifacts via natural order — */}
          {/* this layer is drawn first, then artifacts on top). */}
          {STRINGS.map(([a, b, wa, wb], i) => {
            const opacity = interpolate(
              frame,
              [Math.max(ITEMS[a].delay, ITEMS[b].delay) + 16, Math.max(ITEMS[a].delay, ITEMS[b].delay) + 36],
              [0, 0.85],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            return (
              <RedString
                key={i}
                from={pin(ITEMS[a], wa)}
                to={pin(ITEMS[b], wb)}
                opacity={opacity}
                strokeWidth={3.5}
                sag={30}
              />
            );
          })}

          {ITEMS.map((it, i) => {
            const s = spring({
              frame: frame - it.delay,
              fps,
              config: { damping: 13, stiffness: 220 },
            });
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: it.x,
                  top: it.y,
                  opacity: s,
                  transform: `translateY(${interpolate(s, [0, 1], [-30, 0])}px) rotate(${
                    it.rot ?? 0
                  }deg)`,
                  transformOrigin: "top center",
                }}
              >
                {it.el}
              </div>
            );
          })}
        </AbsoluteFill>
      </AbsoluteFill>
    </Background>
  );
};
