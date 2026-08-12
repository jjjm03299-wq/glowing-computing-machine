/*
 * DESIGN: Terminal Relay — production mock client.
 * On GitHub Pages there is no real backend and no service worker registration
 * by default, so this module executes the exact same handler logic as MSW
 * (imported from handlers.ts), giving identical behavior in dev and prod.
 * The app calls fetch() against /api/* and this module intercepts via a
 * lightweight in-page matcher.
 */
import { VPN_COUNTRIES, generateVpnIp, type VpnCountry } from "./vpnData";

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

type Json = unknown;

function ok(body: Json, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function route(method: string, path: string, body?: BodyInit): Response {
  const m = path.match(/^\/api\/relays\/?$/);
  if (m && method === "GET") {
    return ok({
      total: VPN_COUNTRIES.length,
      relays: VPN_COUNTRIES.map((c) => ({
        ...c,
        latencyMs: jitter(c.latencyMs, 14),
        online: true,
      })),
    });
  }

  const one = path.match(/^\/api\/relays\/([A-Z]{2})\/?$/);
  if (one && method === "GET") {
    const country = VPN_COUNTRIES.find((c) => c.code === one[1]) as
      | VpnCountry
      | undefined;
    if (!country) return ok({ error: "RELAY_NOT_FOUND" }, 404);
    return ok({ ...country, latencyMs: jitter(country.latencyMs, 14), online: true });
  }

  const connect = path.match(/^\/api\/relays\/([A-Z]{2})\/connect\/?$/);
  if (connect && method === "POST") {
    const country = VPN_COUNTRIES.find((c) => c.code === connect[1]) as
      | VpnCountry
      | undefined;
    if (!country) return ok({ error: "RELAY_NOT_FOUND" }, 404);
    if (lease && lease.countryCode !== country.code) {
      return ok({ error: "TUNNEL_ACTIVE_DISCONNECT_FIRST" }, 409);
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
    return ok({ status: "ESTABLISHED", lease, latencyMs: jitter(country.latencyMs, 14) });
  }

  const disconnect = path.match(/^\/api\/relays\/([A-Z]{2})\/disconnect\/?$/);
  if (disconnect && method === "POST") {
    const country = VPN_COUNTRIES.find((c) => c.code === disconnect[1]) as
      | VpnCountry
      | undefined;
    if (!country) return ok({ error: "RELAY_NOT_FOUND" }, 404);
    if (!lease || lease.countryCode !== country.code) {
      return ok({ error: "NO_ACTIVE_TUNNEL_FOR_RELAY" }, 409);
    }
    const finalBytes = bytesRouted + Math.floor(Math.random() * 4000);
    lease = null;
    return ok({ status: "TERMINATED", bytesRouted: finalBytes });
  }

  if (path.match(/^\/api\/session\/?$/) && method === "GET") {
    if (!lease) return ok({ connected: false });
    bytesRouted += Math.floor(Math.random() * 1200);
    const currentLease = lease;
    const country = VPN_COUNTRIES.find(
      (c) => c.code === currentLease.countryCode
    )!;
    return ok({
      connected: true,
      lease: currentLease,
      bytesRouted,
      latencyMs: jitter(country.latencyMs, 14),
      uptimeSeconds: Math.floor(
        (Date.now() - new Date(lease.leasedAt).getTime()) / 1000
      ),
    });
  }

  return new Response("not mocked", { status: 404 });
}

/** Install once at app boot: intercepts fetch() calls to /api/*. */
export function installMockApi() {
  if (window.__MOCK_INSTALLED__) return;
  window.__MOCK_INSTALLED__ = true;
  const realFetch = window.fetch.bind(window);
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    if (url.startsWith("/api/")) {
      const method = (init?.method ?? "GET").toUpperCase();
      return Promise.resolve(route(method, url, init?.body ?? undefined));
    }
    return realFetch(input, init);
  }) as typeof window.fetch;
}

declare global {
  interface Window {
    __MOCK_INSTALLED__?: boolean;
  }
}
