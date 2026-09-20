import { COLORS } from "../constants";
import { FONT_HEADING, FONT_MONO } from "../fonts";

// Manila envelope = "skill loaded". Brown gradient + a flap accent at the top.
export const SkillEnvelope: React.FC<{
  name: string;
  description?: string;
  width?: number;
  height?: number;
  rotate?: number;
}> = ({ name, description, width = 360, height = 200, rotate = -3 }) => (
  <div
    style={{
      width,
      height,
      background: `linear-gradient(135deg, ${COLORS.envelope1} 0%, ${COLORS.envelope2} 50%, ${COLORS.envelope3} 100%)`,
      border: "2px solid #6b4a1f",
      boxShadow: "0 14px 24px rgba(60,40,15,0.35), inset 0 0 0 3px rgba(255,250,235,0.18)",
      padding: "26px 28px 22px",
      position: "relative",
      color: "#2a1d0c",
      fontFamily: FONT_MONO,
      transform: `rotate(${rotate}deg)`,
    }}
  >
    {/* flap accent */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 30,
        background: "linear-gradient(180deg, rgba(70,45,15,0.22) 0%, transparent 100%)",
        borderBottom: "2px dashed rgba(80,55,20,0.5)",
      }}
    />
    <div
      style={{
        fontFamily: FONT_HEADING,
        fontSize: 18,
        letterSpacing: 3,
        fontWeight: 900,
        color: "#5a3f15",
        marginTop: 14,
      }}
    >
      SKILL LOADED
    </div>
    <div
      style={{
        fontSize: 30,
        fontWeight: 700,
        marginTop: 6,
        fontFamily: FONT_HEADING,
      }}
    >
      {name}
    </div>
    {description && (
      <div style={{ fontSize: 18, marginTop: 8, lineHeight: 1.35 }}>{description}</div>
    )}
  </div>
);
