export default function Pin() {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 12 12"
      style={{ position: "absolute", left: "50%", top: -6, marginLeft: -6, pointerEvents: "none" }}
    >
      <circle cx={6} cy={6} r={5} fill="#b04a3c" stroke="#5a1d15" strokeWidth={0.8} />
      <circle cx={4.5} cy={4.5} r={1.3} fill="#f4b6ad" opacity={0.85} />
    </svg>
  );
}
