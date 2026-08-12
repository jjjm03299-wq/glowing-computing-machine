/*
 * DESIGN: Terminal Relay — signal strength bars derived from latency.
 */
interface SignalBarsProps {
  latencyMs: number;
  color?: string;
}

export default function SignalBars({ latencyMs, color }: SignalBarsProps) {
  const level = latencyMs < 35 ? 4 : latencyMs < 60 ? 3 : latencyMs < 90 ? 2 : 1;
  const c = color ?? "currentColor";
  return (
    <span className="inline-flex items-end gap-[3px] h-3.5" aria-label={`signal level ${level} of 4`}>
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-[1px]"
          style={{
            height: `${i * 22}%`,
            background: i <= level ? c : "oklch(0.35 0.01 240)",
            transition: "background 200ms ease-out",
          }}
        />
      ))}
    </span>
  );
}
