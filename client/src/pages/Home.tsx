/*
 * DESIGN: Terminal Relay — main console page.
 * Asymmetric layout: left status rail (dial, telemetry, kill switch),
 * right relay matrix of 10 country flag cards with staggered entrance.
 */
import ConsoleHeader from "@/components/ConsoleHeader";
import StatusRail from "@/components/StatusRail";
import RelayCard from "@/components/RelayCard";
import { Spinner } from "@/components/ui/spinner";
import { useVpn } from "@/contexts/VpnContext";
import { toast } from "sonner";

export default function Home() {
  const { relays, relaysLoaded, activeCode, state, connect, disconnect, error } =
    useVpn();

  const handleToggle = (code: string) => {
    if (state === "IDLE") {
      toast.promise(connect(code), {
        loading: `Linking relay ${code}…`,
        success: `Circuit established — ${code}`,
        error: (e) => (e instanceof Error ? e.message : "Relay unavailable"),
      });
      return;
    }
    if (activeCode === code) {
      toast.promise(disconnect(), {
        loading: `Severing relay ${code}…`,
        success: `Circuit severed — tunnel closed`,
        error: () => "Sever failed",
      });
    }
  };

  return (
    <div className="scanlines grain min-h-screen">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <ConsoleHeader />

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 pb-16">
          {/* Left: status rail */}
          <StatusRail />

          {/* Right: relay matrix */}
          <main className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between mb-5">
              <h1 className="text-sm font-mono tracking-[0.25em] uppercase text-muted-foreground">
                Select Relay<span className="signal-text">.</span> Establish Circuit<span className="signal-text">.</span>
              </h1>
              <span className="telemetry-label">10 gateways</span>
            </div>

            {!relaysLoaded ? (
              <div className="rounded-lg border border-border bg-card/60 p-12 flex flex-col items-center gap-3">
                <Spinner className="h-5 w-5 text-[var(--signal)]" />
                <span className="font-mono text-xs text-muted-foreground tracking-widest">
                  SCANNING RELAYS…
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {relays.map((country, i) => (
                  <RelayCard
                    key={country.code}
                    country={country}
                    isActive={activeCode === country.code}
                    isConnecting={state === "HANDSHAKE" && activeCode === country.code}
                    state={state}
                    isOtherActive={
                      state !== "IDLE" && activeCode !== country.code
                    }
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2.5 font-mono text-xs text-destructive">
                ▸ {error}
              </div>
            )}

            <p className="mt-6 font-mono text-[10px] leading-relaxed tracking-wide text-muted-foreground/70 max-w-xl">
              ▸ MOCK SIMULATION — This console imitates a VPN client. No real
              traffic is routed; the displayed IP is a synthesized exit address
              served by the local mock API (MSW handlers in dev, inline mock in
              production).
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
