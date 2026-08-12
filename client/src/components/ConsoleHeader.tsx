/*
 * DESIGN: Terminal Relay — console header.
 * Relay·ONE wordmark (green centered dot), telemetry clock, mono micro-labels.
 */
import { useEffect, useState } from "react";
import { useVpn } from "@/contexts/VpnContext";

function RadarGlyph() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <circle cx="16" cy="16" r="13" fill="none" stroke="var(--signal)" strokeWidth="1.5" />
      <path
        d="M16 16 L28 7 A13 13 0 0 0 16 3 Z"
        fill="oklch(0.82 0.17 155 / 35%)"
      />
      <line x1="16" y1="16" x2="28" y2="7" stroke="var(--signal)" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="2" fill="var(--signal)" />
    </svg>
  );
}

export default function ConsoleHeader() {
  const { state } = useVpn();
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(
        `${d.getUTCHours().toString().padStart(2, "0")}:${d
          .getUTCMinutes()
          .toString()
          .padStart(2, "0")}:${d.getUTCSeconds().toString().padStart(2, "0")} UTC`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex items-center justify-between py-5">
      <div className="flex items-center gap-3">
        <RadarGlyph />
        <div className="leading-none">
          <span className="text-xl font-semibold tracking-tight">
            RELAY<span className="signal-text">·</span>ONE
          </span>
          <div className="telemetry-label mt-1">Global Tunnel Console</div>
        </div>
      </div>
      <div className="hidden sm:flex flex-col items-end">
        <span className="font-mono text-xs tabular-nums">{clock}</span>
        <span
          className="font-mono text-[10px] tracking-[0.2em] mt-1"
          style={{
            color:
              state === "ESTABLISHED"
                ? "var(--signal)"
                : state === "HANDSHAKE"
                  ? "var(--amber)"
                  : "oklch(0.5 0.02 220)",
          }}
        >
          {state === "ESTABLISHED"
            ? "● CIRCUIT ACTIVE"
            : state === "HANDSHAKE"
              ? "◐ NEGOTIATING"
              : "○ STANDBY"}
        </span>
      </div>
    </header>
  );
}
