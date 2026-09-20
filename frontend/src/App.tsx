import { useState, useCallback, useEffect, useRef } from "react";
import Chat from "./Chat";
import Wall from "./Wall";
import Loading, { hasSeenIntro } from "./Loading";
import { runPrompt, resetSession, isDemoMode, loadDemoPrompt } from "./eventBus";
import { place } from "./physics";
import type { AgentEvent, Placed } from "./types";

function newSessionId(): string {
  // Real UUIDv4 so every conversation has its own scratch dir on the server.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for ancient browsers — should never hit in the demo environment.
  return `s-${Math.random().toString(36).slice(2, 12)}`;
}

// Anything UUID-shaped or our `s-xxx` fallback. Keep loose — we just want to
// avoid blindly trusting random hash garbage.
const SESSION_ID_RE = /^[a-zA-Z0-9-]{8,64}$/;

function readSessionIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const h = window.location.hash.replace(/^#\/?/, "");
  return SESSION_ID_RE.test(h) ? h : null;
}

function writeSessionIdToUrl(id: string): void {
  if (typeof window === "undefined") return;
  const next = `#${id}`;
  if (window.location.hash !== next) {
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}${next}`);
  }
}

function initialSessionId(): string {
  return readSessionIdFromUrl() ?? newSessionId();
}

export default function App() {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [nodes, setNodes] = useState<Placed[]>([]);
  const [running, setRunning] = useState(false);
  const [autoFollow, setAutoFollow] = useState(true);
  const [showIntro, setShowIntro] = useState(() => !hasSeenIntro());
  const demoMode = isDemoMode();
  const [demoPrompt, setDemoPrompt] = useState<string | null>(null);
  const sessionIdRef = useRef<string>(initialSessionId());

  // Demo mode: peek at the recording so the chat panel can show what was asked.
  useEffect(() => {
    if (!demoMode) return;
    let cancelled = false;
    loadDemoPrompt().then((p) => {
      if (!cancelled) setDemoPrompt(p);
    });
    return () => {
      cancelled = true;
    };
  }, [demoMode]);

  // Reflect the active session id into the URL hash so the user can identify
  // which `tmp/<uuid>/` folder on disk this conversation's files live in.
  useEffect(() => {
    writeSessionIdToUrl(sessionIdRef.current);
  }, []);

  // Place any newly-arrived events.
  useEffect(() => {
    setNodes((prev) => {
      const map = new Map<string, Placed>(prev.map((n) => [n.id, n]));
      const added: Placed[] = [];
      for (const ev of events) {
        if (map.has(ev.id)) continue;
        const p = place(ev, map, events);
        if (p) {
          map.set(ev.id, p);
          added.push(p);
        }
      }
      return added.length ? [...prev, ...added] : prev;
    });
  }, [events]);

  const onPrompt = useCallback((prompt: string) => {
    setRunning(true);
    runPrompt(
      prompt,
      sessionIdRef.current,
      (ev) => setEvents((es) => [...es, ev]),
      () => setRunning(false),
      (msg) => {
        console.error(msg);
        setRunning(false);
      },
    );
  }, []);

  const onResetSession = useCallback(() => {
    if (running) return;
    const prev = sessionIdRef.current;
    void resetSession(prev);
    const next = newSessionId();
    sessionIdRef.current = next;
    writeSessionIdToUrl(next);
    setEvents([]);
    setNodes([]);
  }, [running]);

  return (
    <>
      {showIntro && <Loading onDismiss={() => setShowIntro(false)} />}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(320px, 28%) 1fr",
          height: "100vh",
          width: "100vw",
        }}
      >
        <div
          style={{
            borderRight: "1px solid var(--rule)",
            background: "var(--paper)",
            overflow: "hidden",
          }}
        >
          <Chat
            events={events}
            onSubmit={onPrompt}
            onNewSession={onResetSession}
            running={running}
            demoMode={demoMode}
            demoPrompt={demoPrompt}
          />
        </div>
        <Wall
          events={events}
          nodes={nodes}
          autoFollow={autoFollow}
          onToggleAutoFollow={() => setAutoFollow((f) => !f)}
        />
      </div>
    </>
  );
}
