/*
 * DESIGN: Terminal Relay — left status rail.
 * Live session telemetry: radar dial, assigned VPN IP, protocol/cipher strip,
 * uptime counter, bytes routed, kill switch. Amber during handshake.
 */
import { useEffect, useState } from "react";
import { Power, Activity, Shield, Gauge, Timer, Zap } from "lucide-react";
import RadarDial from "./RadarDial";
import SignalBars from "./SignalBars";
import { useVpn } from "@/contexts/VpnContext";

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export default function StatusRail() {
  const { activeCode, activeCountry, state, session, disconnect } = useVpn();
  const [now, setNow] = useState(() => Date.now());

  // Local uptime tick while telemetry is fresh
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const live = state === "ESTABLISHED";
  const handshake = state === "HANDSHAKE";
  const amber = handshake;
  const accent = live ? "var(--signal)" : amber ? "var(--amber)" : "oklch(0.5 0.02 220)";

  const uptime =
    live && session?.lease
      ? Math.floor((now - new Date(session.lease.leasedAt).getTime()) / 1000)
      : 0;

  return (
    <aside className="w-full lg:w-80 shrink-0">
      <div className="rounded-lg border border-border bg-card/60 backdrop-blur-sm p-6 flex flex-col items-center">
        <RadarDial state={state} countryCode={activeCode} />

        {/* VPN IP readout */}
        <div className="w-full mt-5 rounded-md border border-border bg-background/60 px-4 py-3">
          <div className="telemetry-label">Assigned Tunnel IP</div>
          <div
            className="font-mono text-base font-semibold mt-1 tracking-wide"
            style={{ color: accent }}
          >
            {live && session?.lease ? session.lease.assignedIp : handshake ? "0.0.0.0" : "— — —"}
          </div>
          {live && session?.lease && (
            <div className="font-mono text-[10px] text-muted-foreground mt-1.5 flex items-center gap-2">
              <span>{session.lease.protocol}</span>
              <span className="text-border">·</span>
              <span>{session.lease.cipher}</span>
            </div>
          )}
        </div>

        {/* telemetry list */}
        <div className="w-full mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="telemetry-label flex items-center gap-1.5">
              <Gauge className="h-3 w-3" /> Latency
            </span>
            <span className="font-mono text-xs flex items-center gap-2" style={{ color: live ? accent : undefined }}>
              {live && session?.latencyMs && (
                <SignalBars latencyMs={session.latencyMs} color={accent} />
              )}
              {live ? `${session?.latencyMs ?? "-"} ms` : handshake ? "measuring…" : "— ms"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="telemetry-label flex items-center gap-1.5">
              <Timer className="h-3 w-3" /> Uptime
            </span>
            <span className="font-mono text-xs" style={{ color: live ? accent : undefined }}>
              {live ? formatUptime(uptime) : "00:00:00"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="telemetry-label flex items-center gap-1.5">
              <Activity className="h-3 w-3" /> Routed
            </span>
            <span className="font-mono text-xs" style={{ color: live ? accent : undefined }}>
              {live ? formatBytes(session?.bytesRouted ?? 0) : "0 B"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="telemetry-label flex items-center gap-1.5">
              <Shield className="h-3 w-3" /> Encryption
            </span>
            <span className="font-mono text-xs" style={{ color: live ? accent : undefined }}>
              {live ? "AES-256-GCM" : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="telemetry-label flex items-center gap-1.5">
              <Zap className="h-3 w-3" /> Gateway
            </span>
            <span className="font-mono text-xs">
              {activeCountry ? `${activeCountry.city}, ${activeCode}` : "—"}
            </span>
          </div>
        </div>

        {/* kill switch */}
        <button
          onClick={() => disconnect()}
          disabled={state === "IDLE"}
          aria-label="Kill switch — sever the active tunnel"
          className="mt-5 w-full rounded-md border px-4 py-2.5 font-mono text-xs tracking-[0.15em] flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.97] disabled:opacity-35 disabled:cursor-not-allowed"
          style={{
            borderColor: live ? "oklch(0.6 0.2 25 / 60%)" : "var(--border)",
            color: live ? "oklch(0.65 0.2 25)" : "var(--muted-foreground)",
          }}
        >
          <Power className="h-3.5 w-3.5" />
          KILL SWITCH
        </button>
      </div>

      <p className="mt-4 text-center font-mono text-[10px] tracking-widest text-muted-foreground/70">
        RELAY·ONE SIMULATION — NO REAL TRAFFIC ROUTED
      </p>
    </aside>
  );
}
