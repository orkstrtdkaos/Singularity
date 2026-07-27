# SPEC — SNG-243: The Made Gate is a real travel node + waygate-to-waygate network
## Aevi (PO) · 2026-07-25 · Erik-directed (from the "where does my gate go?" continuity question)

## §1 — The gap this closes
The Second Thread produces "the first waygate made since the Transition" — but the quest NEVER AUTHORED WHERE IT
GOES. So when Erik asked the GM "does it go to the Crossing?", the GM had to IMPROVISE (it described a local
warded threshold), because no committed destination exists. A keystone gate the player MADE should be a real
travel NODE with a canonical destination, not prose the GM reinvents each time. Erik's design call, now authored.

## §2 — The Made Gate's destinations (Aevi, DONE — authored into the finished outcome)
The `finished` outcome now carries a `waygate` effect that makes the gate a real node:
- **→ the_crossing (DEFAULT, long_passage):** the passage the father's lineage was always FOR. The Crossing is
  the hub at world-origin (r=0.00); the prototype notes "a tier-1 gate at the Crossing is the difference between
  a season and an afternoon." Reaching it by default is the father's work, realized.
- **→ Stillwater's Trouble site (BY INTENT, direct_fold):** a direct fold to the Pale March site of Stillwater's
  Trouble. **CANON CARE: "Stillwater" is VETH's Raven name** (established live-play canon — Stillwater's Trouble
  is her thread, not a settlement). So this destination ties Silas's father's work to his BOND WITH VETH — the
  gate reaches the place of her trouble by his intent. This is the "default vs. intent" behavior Erik remembered,
  now made real: Crossing by default, Stillwater by intent.
- **networkCapable: true** — as the gate network grows (§4), this gate can reach OTHER gates gate-to-gate.

## §3 — Make the destinations TRAVELABLE (CCode)
The authored `waygate` effect is content; the engine must consume it so the gate WORKS on completion:
- When the Second Thread completes `finished`, register `the_made_gate` as a travel node at its location
  (the Left Branch approach) with its `connects[]`.
- **Default vs. intent travel:** using the gate with no destination named → the `default:true` connection (the
  Crossing). Naming a destination (intent) → the matching connection (Stillwater's Trouble site). This is a real,
  small travel mechanic — a gate with a default endpoint and intent-selectable others.
- **The Stillwater site may need a location anchor:** it's canon (world/canon/valley.json) but may not be a
  formal location id. If travel needs a resolvable target, CCode/Aevi create/point at the Pale March site
  location (tie to Veth's Stillwater's Trouble thread). Flag if the target doesn't resolve (a SNG-232 seam:
  a gate connection to a location id that must exist).

## §4 — Waygate-to-waygate network (the general mechanic we discussed — SNG-148 realized)
Erik: "we talked about waygates being able to help you travel directly to other gates." The world-geometry
prototype already frames this: "waygates stop being convenience and become INFRASTRUCTURE... SNG-148's 25-gate
network becomes the circulatory system." The mechanic:
- **A gate marked `networkCapable` can reach any OTHER network gate** the player knows/has-attuned, gate-to-gate,
  skipping the overland journey. The Crossing is the hub (r=0.00); made/found gates are spokes.
- **Attunement/knowledge gate:** you can travel TO a gate you've been to or that's publicly known — not
  everywhere instantly. The network grows as the player discovers/makes gates (the Made Gate is the player's
  FIRST personal spoke — thematically huge: Silas made the first new gate, and it's his entry into the network).
- **Cost/danger:** gate travel isn't free — a cost (energy/time/a toll like brann_tollhand, or the ambient
  danger the Made Gate's local threshold specifically AVOIDS). Erik's dial: how cheap is gate travel vs. overland.
- **This is net-new travel infrastructure** — bigger than the Made Gate alone. The Made Gate is the first
  concrete instance; the network is the system it plugs into. Sequence: the Made Gate's two destinations (§3)
  first (small, concrete, ships with the quest); the general network (§4) as its own build.

## OWNERSHIP
- Aevi: §2 the gate's destinations — DONE (authored into finished, CI green), with the Stillwater=Veth's-name
  canon care. Will author more gate destinations/lore as the network grows.
- CCode: §3 consume the waygate effect → register a travelable node with default/intent connections; §4 the
  gate-to-gate network mechanic (attunement, hub-and-spoke, cost). Engine.
- Erik: the network dials — how cheap/dangerous gate travel is; whether the Stillwater fold is always-available
  or unlocks with Veth's thread; how the network grows (every gate, or only attuned).

## GUARDS
- **Stillwater is Veth's name, not a place-by-default** — the destination is the Pale March SITE of her trouble;
  never render "Stillwater" as a settlement. Canon care (this was a documented live-play correction).
- **The gate's destination is now CANON — the GM stops improvising it** — once §3 ships, the GM reads the
  committed connections, so "where does it go?" has ONE answer (Crossing default / Stillwater by intent), not a
  fresh invention each ask. This closes the continuity gap that prompted the ticket.
- **Default vs. intent is the authored behavior** — Erik's memory ("Crossing by default, another by intent") is
  now REAL, not a misremembered mechanic. Honor it.
- **Network travel has a cost** — gate-to-gate isn't free teleport; a toll/energy/time keeps it infrastructure,
  not a cheat. The Made Gate's LOCAL virtue (avoids the dangerous ambient crossing) is distinct from long network hops.
- **Connection targets must resolve** (SNG-232) — a gate connection to a location id is a seam; the target must
  exist or the travel breaks. Flag/create the Stillwater site anchor.

## OPEN QUESTIONS
1. (Erik) Is the Stillwater fold available immediately on gate completion, or does it unlock as Veth's
   Stillwater's Trouble thread advances? (Thematically the latter is richer — the gate reaches her trouble as
   you engage with it.)
2. (CCode/Aevi) Does the Pale March / Stillwater site have a resolvable location id, or must one be authored?
3. (Erik) Network scope now vs. later: ship the Made Gate's 2 destinations with the quest (small), and build the
   general gate-to-gate network (§4) as a follow-on? Lean: yes — concrete gate first, network second.
