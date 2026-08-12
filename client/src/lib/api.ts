/*
 * DESIGN: Terminal Relay — typed API client consumed by the dashboard.
 * All calls go to /api/* and are served by MSW (dev) or the inline mock
 * (production on GitHub Pages).
 */
import { VPN_COUNTRIES, type VpnCountry } from "./vpnData";

export interface RelayInfo extends VpnCountry {
  online: boolean;
}

export interface ConnectResult {
  status: "ESTABLISHED";
  lease: {
    countryCode: string;
    assignedIp: string;
    protocol: string;
    cipher: string;
    leasedAt: string;
    ttlSeconds: number;
  };
  latencyMs: number;
}

export interface DisconnectResult {
  status: "TERMINATED";
  bytesRouted: number;
}

export interface SessionInfo {
  connected: boolean;
  lease?: ConnectResult["lease"];
  bytesRouted?: number;
  latencyMs?: number;
  uptimeSeconds?: number;
}

async function check(res: Response) {
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error ?? `HTTP ${res.status}`);
  }
  return json;
}

export const api = {
  listRelays: () =>
    fetch("/api/relays").then(check) as Promise<{ total: number; relays: RelayInfo[] }>,

  getRelay: (code: string) =>
    fetch(`/api/relays/${code}`).then(check) as Promise<RelayInfo>,

  connect: (code: string) =>
    fetch(`/api/relays/${code}/connect`, { method: "POST" }).then(check) as Promise<ConnectResult>,

  disconnect: (code: string) =>
    fetch(`/api/relays/${code}/disconnect`, { method: "POST" }).then(check) as Promise<DisconnectResult>,

  session: () =>
    fetch("/api/session").then(check) as Promise<SessionInfo>,
};

export { VPN_COUNTRIES };
export type { VpnCountry };
