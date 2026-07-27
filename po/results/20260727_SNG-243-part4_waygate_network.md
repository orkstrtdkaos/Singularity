# SNG-243 §4 — The waygate-to-waygate network (SNG-148 realized)

**CCode · 2026-07-27 · v1.8.289 (`90076f91`) · npm test exit 0 (10 network checks, both seams green, rawProseCaps 63, wiring audit all-pass).**

Erik: *"we talked about waygates being able to help you travel directly to other gates."* The Made Gate (§3) is
`networkCapable` — this ticket makes the network the real, general travel mechanic it was always meant to be.

## What I built
### The engine (`engine/waygate.js`, pure)
- **`isNetworkGate(loc)`** — membership. An **authored** gate is a network node by default; a **made/runtime** gate
  (has `_gen`) joins only if it declared `networkCapable`. The hub is always in. So a private made door stays
  private; Silas's gate, marked networkCapable in its quest, joins the circulatory system.
- **`networkGatesFrom(character, locations, {walkingDays})`** — the gates reachable FROM where you stand (which
  must itself be a network gate): every OTHER network gate you have **DISCOVERED** (`knownPlaces` — the attunement
  half) **and can aim at** (`wayfaringTier ≥ the gate's tier` — the skill half), **plus the hub** (always findable).
  Each entry carries the overland distance + a priced hop. The made gate's **default endpoint sorts first**, tagged.
- **`gateHopCost(overlandDays)` + the `GATE_HOP` dials** — a hop costs a **fraction of the overland time**
  (timeFraction 0.04 — a season becomes an afternoon) **+ a flat energy toll** (10), capped both ends
  (min 2h, max 72h). **Never free** — the cost keeps the network *infrastructure*, not a teleport cheat.
- **`waygateBlockForGM`** now frames the network + names the committed **default** when standing at a network gate,
  so the GM routes gate travel from committed data instead of improvising.

### The app (`app.js`)
- **`travelTo(locId, {cost})`** applies the hop `hours` + `energy` toll; ordinary travel (no cost) is unchanged.
- **The map "◈ The gate network" panel** — appears when you stand at a network gate: the reachable gates, each
  priced, each a tap-to-fold hop (paying the gate-hop cost). The infrastructure is *legible* — not buried in
  per-place routing. (`style.css`: `.net-panel`/`.net-hop`, blue-weighted — distinct from the gold decision strip
  and red encounter frame.)

### Gates
- **10 smoke checks** — membership (authored vs opt-in vs non-gate), attunement reach (unknown gate excluded),
  skill gate (low wayfaring drops a high-tier gate), cost caps + energy toll, default-first sort, empty when not at
  a network gate.
- **New SNG-232 seam `network-hop-costs`** — `travelTo` must apply `cost?.hours` + `cost?.energy`, so a network hop
  can never regress into a free teleport.

## Live verification (fresh port 8363, char standing at the made gate)
- The map's **"◈ The gate network"** panel rendered with three hops: **The Crossing (hub · default, sorted first)**,
  **The Axis Gate**, **The Bargain Gate** — each priced **+2h · 10⚡**.
- Tapping **The Axis Gate** folded there: `currentLocationId` → `the_axis_gate`, **energy 100 → 90** (the 10-toll),
  clock advanced 2h. The hop travels AND pays its cost.

## Erik's dials (flagged — your call)
- **`GATE_HOP` in `engine/waygate.js`:** `timeFraction` (how much of the road a hop saves), `minHours`/`maxHours`
  (the floor/ceiling), `energy` (the toll). Currently a hop is cheap-but-not-free; tune to taste.
- **The made gate prices at the 2h floor** because a runtime gate has no `worldPos` — distance is unknown, so the
  cost falls to the minimum. Authored gates carry `worldPos`, so hops between them price by real geodesic distance.
  If you want made gates to price by distance too, they need a worldPos at mint (a small follow-on).
- **The existing short-range "◈ Step through the waygate"** (SNG-148 named/hub routing) still uses the flat travel
  cost, unchanged. The new network hop is the long-range, priced mechanic. Unify them under the hop cost later if
  you'd rather all gate transit be priced the same.

*— CCode. The Made Gate was Silas's first personal spoke; now the whole network turns — cheap-but-not-free, gated
by where you've been and how far you can aim. SNG-148, realized. status: complete_pending_review.*
