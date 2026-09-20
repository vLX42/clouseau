import { useEffect, useState } from "react";

const STORAGE_KEY = "clouseau:intro-seen";

export default function Loading({ onDismiss }: { onDismiss: () => void }) {
  const [leaving, setLeaving] = useState(false);

  const dismiss = () => {
    if (leaving) return;
    setLeaving(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    window.setTimeout(onDismiss, 380);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      onClick={dismiss}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        cursor: "pointer",
        background: "#1a1410",
        opacity: leaving ? 0 : 1,
        transition: "opacity 380ms ease",
        display: "grid",
        gridTemplateRows: "1fr auto",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          backgroundImage: "url(/cover.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          imageRendering: "auto",
          minHeight: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 28,
            fontFamily: "Roboto Slab, serif",
            fontSize: 13,
            letterSpacing: 4,
            color: "#f4ede0",
            textShadow: "0 2px 6px rgba(0,0,0,0.7)",
          }}
        >
          CLOUSEAU
        </div>
        <div
          style={{
            position: "absolute",
            top: 46,
            left: 28,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            color: "rgba(244,237,224,0.78)",
            textShadow: "0 1px 4px rgba(0,0,0,0.65)",
          }}
        >
          agent visualizer
        </div>
      </div>
      <div
        style={{
          padding: "14px 22px 16px",
          background: "rgba(20,15,11,0.9)",
          color: "#f4ede0",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid rgba(168,32,26,0.45)",
        }}
      >
        <span style={{ fontFamily: "Caveat, cursive", fontSize: 22, color: "#d9b97a" }}>
          “Does your agent bite?”
        </span>
        <span style={{ opacity: 0.7 }}>
          click anywhere · or press <kbd style={kbd}>enter</kbd> · <kbd style={kbd}>space</kbd> · <kbd style={kbd}>esc</kbd>
        </span>
      </div>
    </div>
  );
}

const kbd: React.CSSProperties = {
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 10,
  padding: "1px 5px",
  border: "1px solid rgba(244,237,224,0.35)",
  borderRadius: 2,
  margin: "0 2px",
};

export function hasSeenIntro(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
