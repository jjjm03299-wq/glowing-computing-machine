# VPN Dashboard — Design Brainstorm

## Three Stylistic Approaches

1. **Theme Name:** Terminal Relay
   **Intro:** A dark, radar-screen aesthetic inspired by mission-control consoles — phosphor-green signal lines on deep charcoal, monospace data readouts, and glowing status indicators. Feels like operating a piece of critical network infrastructure.
   **Probability:** 0.06

2. **Theme Name:** Passport Editorial
   **Intro:** A warm, light, editorial style inspired by travel magazines and passport stamps — cream paper textures, serif display type, flag cards like travel postcards, muted earthy palette with one vivid stamp-red accent.
   **Probability:** 0.03

3. **Theme Name:** Nordic Utility
   **Intro:** Clean Scandinavian functionalism — bright off-white surfaces, sharp grid lines, high-contrast blue, utilitarian typography and honest data presentation, like a Finnish telecom operator's public status page.
   **Probability:** 0.08

## CHOSEN: Terminal Relay

**Design Movement:** Analog instrument-panel / CRT mission-control aesthetics (think early NASA flight consoles crossed with modern radar UIs), executed with modern minimalism.

**Core Principles:**
1. Data-first legibility: every number, code, and status is monospaced and crisply aligned, like a flight instrument.
2. One living accent: a single phosphor-green "signal" color carries all connection states; everything else is quiet charcoal.
3. Layered depth through glow and grain, never through gradients-for-gradient's-sake.
4. Motion as telemetry: animations mimic signals (pulse, sweep, blink) rather than UI eye-candy.

**Color Philosophy:** Deep ink-charcoal base (oklch ~0.16) evokes a powered-down console waking up. Phosphor green (oklch ~0.8 0.17 155) is the "live circuit" color — it only appears where something is active or connected, so green always means *signal flowing*. Amber is reserved for warnings/connecting states, cool grey-blue for idle/offline. Emotional intent: calm authority of a control room.

**Layout Paradigm:** Asymmetric control-room layout — a left "status rail" (connection telemetry, live session IP, uptime counter, kill-switch) and a right "relay matrix" (10 country flag cards in a non-centered grid with staggered offsets). No hero banner; the page opens like a console booting.

**Signature Elements:**
1. Radar-sweep animated ring around the global connection dial in the status rail.
2. "Signal bars" + country code telemetry strip (e.g., `US ▸ 104.21.8.14 ▸ AES-256 ▸ ● LIVE`).
3. Scanline grain overlay on the console background, subtle and fixed.

**Interaction Philosophy:** Controls behave like physical switches — toggle (not button) for connect/disconnect, immediate state change with a short relay-click animation. Hovering a flag card "inspects" the server (border lights up, latency telemetry appears).

**Animation:** 150–250ms ease-out transitions; radar sweep is a continuous 4s linear rotation gated by prefers-reduced-motion; connect sequence runs a 900ms state machine (IDLE → HANDSHAKE amber → ESTABLISHED green) with staggered telemetry rows appearing; pulse on the live indicator every 1.6s.

**Typography System:** Display/headlines in "Space Grotesk" (technical grotesque), all data/telemetry in "JetBrains Mono", body in "Inter"-free zone → body uses Space Grotesk light. Hierarchy: mono uppercase micro-labels (tracking-widest, size 11px) above every data block.

**Brand Essence:** RelayOne — a mock VPN control console for experimenting with global routing; for tinkerers who like the feel of network tools; different because it treats a demo app like real mission hardware. Personality: precise, calm, electrified.

**Brand Voice:** Terse telemetry speak, verbs first, no marketing fluff. Examples:
- "SELECT RELAY. ESTABLISH CIRCUIT."
- "Tunnel closed. 0 bytes routed."
CTAs: "ENGAGE RELAY", "SEVER CONNECTION".

**Wordmark & Logo:** "RELAY·ONE" wordmark set in Space Grotesk with a centered dot (●) in phosphor green; logo mark is a circular radar glyph with three arc segments (no text), green on transparent.

**Signature Brand Color:** Phosphor signal green — oklch(0.82 0.17 155) — used exclusively for live/active states.
