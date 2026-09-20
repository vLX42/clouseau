import type { Placed } from "./types";

// Each artifact has its red pin at its top-center, which is also its
// rotation origin — so the pin is anchored at (x + w/2, y) regardless of
// rotation. Wires connect pin-to-pin and droop downward like real string.
export function pinPoint(p: Placed): [number, number] {
  return [p.x + p.w / 2, p.y];
}

export function wirePath(a: Placed, b: Placed): string {
  const [ax, ay] = pinPoint(a);
  const [bx, by] = pinPoint(b);
  const dx = bx - ax;
  const dy = by - ay;
  const distance = Math.hypot(dx, dy);
  // Hanging string sag — proportional to distance, capped.
  const sag = Math.min(90, distance * 0.28) + 14;
  // Both control points drop below the lower of the two pins.
  const c1x = ax + dx * 0.3;
  const c1y = Math.max(ay, by) + sag;
  const c2x = ax + dx * 0.7;
  const c2y = Math.max(ay, by) + sag;
  return `M ${ax} ${ay} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${bx} ${by}`;
}

export default function Wire({
  from,
  to,
  red,
  faded,
}: {
  from: Placed;
  to: Placed;
  red?: boolean;
  faded?: boolean;
}) {
  return (
    <path
      d={wirePath(from, to)}
      fill="none"
      stroke="var(--string)"
      strokeWidth={red ? 1.8 : 1.3}
      opacity={faded ? 0.18 : red ? 0.95 : 0.65}
      strokeLinecap="round"
      filter={red ? "url(#jute)" : "url(#juteFiber)"}
    />
  );
}
