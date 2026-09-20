// Bright red pushpin that anchors every artifact to the wall.
export const Pin: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: "radial-gradient(circle at 32% 32%, #ff7166 0%, #c61f1a 60%, #6e0d09 100%)",
      boxShadow: "0 4px 6px rgba(0,0,0,0.35), inset 0 -2px 4px rgba(0,0,0,0.4)",
      position: "absolute",
      top: -size / 2,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 5,
    }}
  />
);
