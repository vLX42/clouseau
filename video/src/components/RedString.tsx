import { COLORS } from "../constants";

// Red string that runs from one pin to another. Pure SVG, slight downward
// catenary sag baked into the control point so it looks like physical string,
// not a CAD line.
export const RedString: React.FC<{
  from: { x: number; y: number };
  to: { x: number; y: number };
  strokeWidth?: number;
  opacity?: number;
  sag?: number;
}> = ({ from, to, strokeWidth = 4, opacity = 0.9, sag = 80 }) => {
  const minX = Math.min(from.x, to.x) - 20;
  const minY = Math.min(from.y, to.y) - 20;
  const maxX = Math.max(from.x, to.x) + 20;
  const maxY = Math.max(from.y, to.y) + sag + 20;
  const w = maxX - minX;
  const h = maxY - minY;

  const ax = from.x - minX;
  const ay = from.y - minY;
  const bx = to.x - minX;
  const by = to.y - minY;
  const cx = (ax + bx) / 2;
  const cy = Math.max(ay, by) + sag;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{
        position: "absolute",
        left: minX,
        top: minY,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <defs>
        <filter id="jute" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" />
        </filter>
      </defs>
      <path
        d={`M ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}`}
        stroke={COLORS.string}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        opacity={opacity}
        filter="url(#jute)"
      />
    </svg>
  );
};
