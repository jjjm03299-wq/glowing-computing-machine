/*
 * DESIGN: Terminal Relay — signature radar dial.
 * A glowing ring with a rotating sweep arc; green only when a tunnel is live,
 * grey-blue when idle, amber while handshaking.
 */
interface RadarDialProps {
  /** "IDLE" | "HANDSHAKE" | "ESTABLISHED" */
  state: string;
  countryCode: string | null;
}

export default function RadarDial({ state, countryCode }: RadarDialProps) {
  const live = state === "ESTABLISHED";
  const handshake = state === "HANDSHAKE";
  const color = live ? "var(--signal)" : handshake ? "var(--amber)" : "oklch(0.5 0.02 220)";
  const ringClass = live ? "glow-ring" : handshake ? "glow-ring-amber" : "";

  return (
    <div className="relative w-44 h-44 select-none">
      {/* outer ticks */}
      <svg viewBox="0 0 176 176" className="absolute inset-0">
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i * 10 * Math.PI) / 180;
          const x1 = 88 + 80 * Math.cos(angle);
          const y1 = 88 + 80 * Math.sin(angle);
          const x2 = 88 + (i % 3 === 0 ? 72 : 76) * Math.cos(angle);
          const y2 = 88 + (i % 3 === 0 ? 72 : 76) * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth={i % 3 === 0 ? 1.5 : 0.75}
              opacity={i % 3 === 0 ? 0.7 : 0.3}
            />
          );
        })}
      </svg>

      {/* ring */}
      <div
        className={`absolute inset-3 rounded-full border ${ringClass}`}
        style={{ borderColor: live || handshake ? color : undefined, borderWidth: 1.5 }}
      />

      {/* sweep */}
      {(live || handshake) && (
        <svg
          viewBox="0 0 152 152"
          className="absolute inset-3 radar-sweep"
          style={{ transformOrigin: "76px 76px" }}
        >
          <defs>
            <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={color} stopOpacity="0.35" />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M76 76 L148 40 A76 76 0 0 0 76 4 Z" fill="url(#sweep)" />
          <line x1="76" y1="76" x2="148" y2="40" stroke={color} strokeWidth="1.2" />
        </svg>
      )}

      {/* center readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="telemetry-label">Relay</span>
        <span
          className="font-mono text-2xl font-semibold mt-0.5"
          style={{ color }}
        >
          {countryCode ?? "----"}
        </span>
        <span
          className="font-mono text-[10px] tracking-widest mt-1 flex items-center gap-1.5"
          style={{ color }}
        >
          {live && <span className="live-pulse inline-block w-1.5 h-1.5 rounded-full" style={{ background: color }} />}
          {live ? "LIVE" : handshake ? "HANDSHAKE" : "OFFLINE"}
        </span>
      </div>
    </div>
  );
}
