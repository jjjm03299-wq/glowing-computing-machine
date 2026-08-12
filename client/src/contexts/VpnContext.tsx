/*
 * DESIGN: Terminal Relay — global connection state.
 * Mirrors a real VPN client: one active tunnel at a time, a state machine
 * (IDLE → HANDSHAKE → ESTABLISHED → IDLE), plus periodic session telemetry.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api, type SessionInfo, type VpnCountry } from "@/lib/api";
import { VPN_COUNTRIES } from "@/lib/vpnData";

export type ConnectionState = "IDLE" | "HANDSHAKE" | "ESTABLISHED";

interface VpnState {
  relays: VpnCountry[];
  relaysLoaded: boolean;
  activeCode: string | null;
  activeCountry: VpnCountry | null;
  state: ConnectionState;
  session: SessionInfo | null;
  connect: (code: string) => Promise<void>;
  disconnect: () => Promise<void>;
  error: string | null;
}

const VpnContext = createContext<VpnState | null>(null);

export function VpnProvider({ children }: { children: ReactNode }) {
  const [relays, setRelays] = useState<VpnCountry[]>([]);
  const [relaysLoaded, setRelaysLoaded] = useState(false);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [state, setState] = useState<ConnectionState>("IDLE");
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeCodeRef = useRef<string | null>(null);
  activeCodeRef.current = activeCode;

  // Load the relay matrix once
  useEffect(() => {
    api
      .listRelays()
      .then((data) => {
        setRelays(data.relays);
        setRelaysLoaded(true);
      })
      .catch(() => setRelaysLoaded(true));
  }, []);

  // Poll session telemetry while connected
  useEffect(() => {
    if (state !== "ESTABLISHED" || !activeCode) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    timerRef.current = setInterval(() => {
      api
        .session()
        .then(setSession)
        .catch(() => {
          // Session vanished → treat as severed
          setState("IDLE");
          setActiveCode(null);
          setSession(null);
        });
    }, 2000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state, activeCode]);

  const connect = useCallback(async (code: string) => {
    setError(null);
    setState("HANDSHAKE");
    try {
      const result = await api.connect(code);
      setActiveCode(code);
      setState("ESTABLISHED");
      setSession({
        connected: true,
        lease: result.lease,
        latencyMs: result.latencyMs,
        bytesRouted: 0,
        uptimeSeconds: 0,
      });
    } catch (e) {
      setState("IDLE");
      setError(e instanceof Error ? e.message : "Connection failed");
    }
  }, []);

  const disconnect = useCallback(async () => {
    const code = activeCodeRef.current;
    setError(null);
    if (!code) {
      setState("IDLE");
      setActiveCode(null);
      setSession(null);
      return;
    }
    try {
      await api.disconnect(code);
    } catch {
      // ignore — server side already terminated
    }
    setState("IDLE");
    setActiveCode(null);
    setSession(null);
  }, []);

  const activeCountry = useMemo(
    () => VPN_COUNTRIES.find((c) => c.code === activeCode) ?? null,
    [activeCode]
  );

  const value = useMemo(
    () => ({
      relays,
      relaysLoaded,
      activeCode,
      activeCountry,
      state,
      session,
      connect,
      disconnect,
      error,
    }),
    [relays, relaysLoaded, activeCode, activeCountry, state, session, connect, disconnect, error]
  );

  return <VpnContext.Provider value={value}>{children}</VpnContext.Provider>;
}

export function useVpn() {
  const ctx = useContext(VpnContext);
  if (!ctx) throw new Error("useVpn must be used within VpnProvider");
  return ctx;
}
