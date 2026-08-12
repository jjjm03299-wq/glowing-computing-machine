/*
 * DESIGN: Terminal Relay — MSW browser client bootstrap.
 * Only registers in dev mode; in production (GitHub Pages) no worker is needed
 * because the same handlers are embedded in static mock mode (see mockClient).
 */
import { setupWorker } from "msw/browser";
import { vpnHandlers } from "./handlers";

export const mswWorker = setupWorker(...vpnHandlers);

export async function startMsw() {
  if (import.meta.env.DEV) {
    await mswWorker.start({
      onUnhandledRequest: "bypass",
      quiet: true,
    });
  }
}
