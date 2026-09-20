import type { Placed } from "./types";

type Props = {
  nodes: Placed[];
  viewport: { x: number; y: number; w: number; h: number };
  onJump: (x: number, y: number) => void;
};

const MAP_W = 180;
const MAP_H = 120;

export default function Minimap({ nodes, viewport, onJump }: Props) {
  if (!nodes.length) return null;
  const minX = Math.min(...nodes.map((n) => n.x), viewport.x) - 50;
  const minY = Math.min(...nodes.map((n) => n.y), viewport.y) - 50;
  const maxX = Math.max(...nodes.map((n) => n.x + n.w), viewport.x + viewport.w) + 50;
  const maxY = Math.max(...nodes.map((n) => n.y + n.h), viewport.y + viewport.h) + 50;
  const spanX = Math.max(maxX - minX, 1);
  const spanY = Math.max(maxY - minY, 1);
  const sx = MAP_W / spanX;
  const sy = MAP_H / spanY;
  const s = Math.min(sx, sy);

  const handle: React.MouseEventHandler<SVGSVGElement> = (e) => {
    const r = (e.target as SVGSVGElement).getBoundingClientRect();
    const px = (e.clientX - r.left) / s + minX;
    const py = (e.clientY - r.top) / s + minY;
    onJump(px, py);
  };

  return (
    <svg
      width={MAP_W}
      height={MAP_H}
      onClick={handle}
      style={{
        position: "absolute",
        right: 12,
        bottom: 12,
        background: "rgba(244,237,224,0.92)",
        border: "1px solid var(--rule)",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        cursor: "crosshair",
      }}
    >
      {nodes.map((n) => (
        <rect
          key={n.id}
          x={(n.x - minX) * s}
          y={(n.y - minY) * s}
          width={Math.max(n.w * s, 2)}
          height={Math.max(n.h * s, 2)}
          fill="#3b3531"
          opacity={0.6}
        />
      ))}
      <rect
        x={(viewport.x - minX) * s}
        y={(viewport.y - minY) * s}
        width={viewport.w * s}
        height={viewport.h * s}
        fill="none"
        stroke="var(--string)"
        strokeWidth={1.4}
      />
    </svg>
  );
}
