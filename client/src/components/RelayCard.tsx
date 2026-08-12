/*
 * DESIGN: Terminal Relay — country relay card in the matrix.
 * Hover "inspects" the server (border lights up, latency telemetry appears).
 * Click = toggle: engages relay when idle, severs when active.
 * One tunnel at a time — cards of other countries show SEVER FIRST hint.
 */
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignalBars from "./SignalBars";
import type { VpnCountry } from "@/lib/vpnData";

interface RelayCardProps {
  country: VpnCountry;
  isActive: boolean;
  isConnecting: boolean;
  state: "IDLE" | "HANDSHAKE" | "ESTABLISHED";
  isOtherActive: boolean;
  onToggle: (code: string) => void;
}

export default function RelayCard({
  country,
  isActive,
  isConnecting,
  state,
  isOtherActive,
  onToggle,
}: RelayCardProps) {
  const live = isActive && state === "ESTABLISHED";
  const handshaking = isActive && state === "HANDSHAKE";

  const borderColor = live
    ? "oklch(0.82 0.17 155 / 55%)"
    : handshaking
      ? "oklch(0.8 0.15 75 / 55%)"
      : "transparent";

  return (
    <div
      className="relay-enter relative rounded-lg border bg-card p-4 transition-colors duration-200 hover:border-border"
      style={live || handshaking ? { borderColor, boxShadow: live ? `0 0 20px -6px oklch(0.82 0.17 155 / 30%)` : `0 0 20px -6px oklch(0.8 0.15 75 / 30%)` } : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none" role="img" aria-label={`${country.name} flag`}>
            {country.flag}
          </span>
          <div>
            <div className="font-mono text-sm font-semibold tracking-wide">
              {country.code}
            </div>
            <div className="telemetry-label mt-0.5">{country.city}</div>
          </div>
        </div>
        <span
          className="font-mono text-[10px] tracking-widest flex items-center gap-1"
          style={{ color: live ? "var(--signal)" : handshaking ? "var(--amber)" : "oklch(0.5 0.02 220)" }}
        >
          {live && <span className="live-pulse inline-block w-1.5 h-1.5 rounded-full" style={{ background: "var(--signal)" }} />}
          {live ? "LIVE" : handshaking ? "LINKING" : "STANDBY"}
        </span>
      </div>

      {/* telemetry row */}
      <div className="mt-4 flex items-center justify-between font-mono text-[11px]">
        <span className="text-muted-foreground flex items-center gap-2">
          <SignalBars latencyMs={country.latencyMs} />
          {country.latencyMs}ms
        </span>
        <span className="text-muted-foreground">{country.servers} nodes</span>
      </div>

      <div className="mt-4">
        {handshaking ? (
          <Button
            variant="outline"
            disabled
            className="w-full font-mono text-xs tracking-widest justify-center gap-2 border-amber-500/40 text-amber-500 hover:bg-transparent"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            HANDSHAKE…
          </Button>
        ) : live ? (
          <Button
            onClick={() => onToggle(country.code)}
            className="w-full font-mono text-xs tracking-widest justify-center gap-2 bg-transparent hover:bg-destructive/20 text-destructive border border-destructive/50 active:scale-[0.97] transition-transform duration-150"
          >
            <X className="h-3.5 w-3.5" />
            SEVER CONNECTION
          </Button>
        ) : isOtherActive ? (
          <Button
            variant="outline"
            disabled
            className="w-full font-mono text-xs tracking-widest justify-center text-muted-foreground opacity-60"
          >
            SEVER {state === "HANDSHAKE" ? "LINKING RELAY" : "ACTIVE RELAY"} FIRST
          </Button>
        ) : (
          <Button
            onClick={() => onToggle(country.code)}
            variant="outline"
            className="w-full font-mono text-xs tracking-widest justify-center border-border/60 hover:border-[var(--signal)]/60 hover:text-[var(--signal)] active:scale-[0.97] transition-all duration-150"
          >
            ENGAGE RELAY
          </Button>
        )}
      </div>
    </div>
  );
}
