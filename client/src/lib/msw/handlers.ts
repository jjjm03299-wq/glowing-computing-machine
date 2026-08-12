/*
 * DESIGN: Terminal Relay — MSW mock VPN API.
 * Simulates a real VPN provider's endpoints:
 *   GET  /api/relays            → list of 10 country gateways
 *   POST /api/relays/:code/connect    → request a tunnel (returns lease info)
 *   POST /api/relays/:code/disconnect → close the tunnel
 *   GET  /api/session                 → current session telemetry
 * All data is generated in-memory with realistic latency jitter.
 */
import { http, HttpResponse, delay } from "msw";
import { VPN_COUNTRIES, generateVpnIp, type VpnCountry } from "../vpnData";

interface Lease {
  countryCode: string;
  assignedIp: string;
  protocol: "WireGuard" | "OpenVPN";
  cipher: "AES-256-GCM";
  leasedAt: string;
  ttlSeconds: number;
}

let lease: Lease | null = null;
let bytesRouted = 0;

function jitter(base: number, range: number) {
  return base + Math.round((Math.random() - 0.5) * range);
}

export const vpnHandlers = [
  http.get("/api/relays", async () => {
    await delay(250);
    return HttpResponse.json({
      total: VPN_COUNTRIES.length,
      relays: VPN_COUNTRIES.map((c) => ({
        ...c,
        latencyMs: jitter(c.latencyMs, 14),
        online: true,
      })),
    });
  }),

  http.get("/api/relays/:code", async ({ params }) => {
    await delay(200);
    const country = VPN_COUNTRIES.find(
      (c) => c.code === params.code
    ) as VpnCountry | undefined;
    if (!country) {
      return HttpResponse.json({ error: "RELAY_NOT_FOUND" }, { status: 404 });
    }
    return HttpResponse.json({
      ...country,
      latencyMs: jitter(country.latencyMs, 14),
      online: true,
    });
  }),

  http.post("/api/relays/:code/connect", async ({ params }) => {
    await delay(900); // simulate handshake
    const country = VPN_COUNTRIES.find(
      (c) => c.code === params.code
    ) as VpnCountry | undefined;
    if (!country) {
      return HttpResponse.json({ error: "RELAY_NOT_FOUND" }, { status: 404 });
    }
    if (lease && lease.countryCode !== country.code) {
      return HttpResponse.json(
        { error: "TUNNEL_ACTIVE_DISCONNECT_FIRST" },
        { status: 409 }
      );
    }
    const protocol = Math.random() > 0.5 ? "WireGuard" : "OpenVPN";
    lease = {
      countryCode: country.code,
      assignedIp: generateVpnIp(country),
      protocol,
      cipher: "AES-256-GCM",
      leasedAt: new Date().toISOString(),
      ttlSeconds: 600,
    };
    bytesRouted = 0;
    return HttpResponse.json({
      status: "ESTABLISHED",
      lease,
      latencyMs: jitter(country.latencyMs, 14),
    });
  }),

  http.post("/api/relays/:code/disconnect", async ({ params }) => {
    await delay(400);
    const country = VPN_COUNTRIES.find(
      (c) => c.code === params.code
    ) as VpnCountry | undefined;
    if (!country) {
      return HttpResponse.json({ error: "RELAY_NOT_FOUND" }, { status: 404 });
    }
    if (!lease || lease.countryCode !== country.code) {
      return HttpResponse.json(
        { error: "NO_ACTIVE_TUNNEL_FOR_RELAY" },
        { status: 409 }
      );
    }
    const finalBytes = bytesRouted + Math.floor(Math.random() * 4000);
    lease = null;
    return HttpResponse.json({
      status: "TERMINATED",
      bytesRouted: finalBytes,
    });
  }),

  http.get("/api/session", async () => {
    await delay(120);
    if (!lease) {
      return HttpResponse.json({ connected: false });
    }
    bytesRouted += Math.floor(Math.random() * 1200);
    const currentLease = lease;
    const country = VPN_COUNTRIES.find(
      (c) => c.code === currentLease.countryCode
    )!;
    return HttpResponse.json({
      connected: true,
      lease: currentLease,
      bytesRouted,
      latencyMs: jitter(country.latencyMs, 14),
      uptimeSeconds: Math.floor(
        (Date.now() - new Date(lease.leasedAt).getTime()) / 1000
      ),
    });
  }),
];
