/*
 * DESIGN: Terminal Relay — all telemetry data lives here.
 * 10 countries with flags (emoji flags are cross-platform), country codes,
 * city gateways, and deterministic-feeling IP generation.
 */

export interface VpnCountry {
  code: string; // ISO country code
  name: string;
  flag: string;
  city: string;
  /** First three octets of the VPN exit IP pool for this country */
  ipPrefix: string;
  latencyMs: number; // typical ping
  servers: number;
}

export const VPN_COUNTRIES: VpnCountry[] = [
  { code: "US", name: "United States", flag: "🇺🇸", city: "New York", ipPrefix: "104.21.8", latencyMs: 18, servers: 1420 },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", city: "London", ipPrefix: "195.14.55", latencyMs: 34, servers: 864 },
  { code: "JP", name: "Japan", flag: "🇯🇵", city: "Tokyo", ipPrefix: "45.32.119", latencyMs: 52, servers: 512 },
  { code: "DE", name: "Germany", flag: "🇩🇪", city: "Frankfurt", ipPrefix: "185.220.101", latencyMs: 41, servers: 723 },
  { code: "CA", name: "Canada", flag: "🇨🇦", city: "Toronto", ipPrefix: "142.93.201", latencyMs: 29, servers: 388 },
  { code: "AU", name: "Australia", flag: "🇦🇺", city: "Sydney", ipPrefix: "13.238.44", latencyMs: 88, servers: 276 },
  { code: "FR", name: "France", flag: "🇫🇷", city: "Paris", ipPrefix: "51.15.77", latencyMs: 47, servers: 601 },
  { code: "SG", name: "Singapore", flag: "🇸🇬", city: "Singapore", ipPrefix: "165.22.156", latencyMs: 71, servers: 344 },
  { code: "BR", name: "Brazil", flag: "🇧🇷", city: "São Paulo", ipPrefix: "177.54.12", latencyMs: 96, servers: 198 },
  { code: "IN", name: "India", flag: "🇮🇳", city: "Mumbai", ipPrefix: "103.106.239", latencyMs: 82, servers: 312 },
];

/** Generate a plausible VPN exit IP for a country (deterministic-ish per session day). */
export function generateVpnIp(country: VpnCountry): string {
  const seed = new Date().getUTCDate() + country.code.charCodeAt(0);
  const lastOctet = 12 + ((seed * 7) % 238);
  const secondSeed = new Date().getUTCHours() + country.code.charCodeAt(1);
  const fourthMix = lastOctet + ((secondSeed * 13) % 6);
  return `${country.ipPrefix}.${Math.min(fourthMix, 254)}`;
}

export type ConnectionState = "IDLE" | "HANDSHAKE" | "ESTABLISHED";
