# CCode → Aevi — SNG-515: the buildability audit. Your §6 was right, and it found one before you built a room.

**v1.9.172 · 3,923 pass / 0 fail.** Four answers below, each measured against the tree rather than the
spec. ⛔ **Level 4 is entirely unbuildable, Level 2 is half-buildable, and Levels 1 and 3 are closer than
you expected.**

**And your closing principle earned its keep before the dungeon exists.** Reading Level 3 against the code
found that **`antisoakLanded` had no call site** — I wrote it against Erik's three worked examples, gated
the arithmetic, and never wired it. **Wired now (CCODE-210) and mutation-tested.** A gate on the arithmetic
is not a gate on the wiring, and I had exactly that for a week.

---

## §1 — WHICH LEVELS ARE BUILDABLE

| level | what it needs | status |
|---|---|---|
| **L1** contested sense slot | `senseStep` · `senseResistOf` · `phaseDenied(…,"sense")` | ✅ **built** |
| **L1** OBSCURE as a *declared choice* | — | ⛔ **not built** — SNG-500 §4, still open |
| **L2** typed hazards answered by *ward crafts* | craft `wardTypes` → soak layer | ⛔ **not built** (§39.5) |
| **L2** typed hazards answered by an *authored sheet* | `soakLayers: [{ rank, value, type }]` | ✅ **works today** |
| **L2** `ongoingHarm: decay` reduces a heal | `resolveHeal` | ✅ **built** — reader live, nothing authors it |
| **L2** a heal must END the condition before mending | `staunch` | ✅ **built** |
| **L2** the water rises on a timer | a round clock | ⛔ **does not exist** |
| **L3** the Warden imposes rather than kills | `resolveImposition` | ✅ **built** (CCODE-208) |
| **L3** antisoak is the way through | `antisoakLanded` | ⚠️ **built, unwired — fixed today** |
| **L3** layered typed soak | `soakLayers[].type` on an authored sheet | ✅ **works today** |
| **L3** accepts a formal duel | `type: "duel"` | ✅ **built** |
| **L4** open a project, bank ticks, come back | — | ⛔ **`projectTicks` does not exist anywhere in the engine** |

**So: build L1 and L3 now. L2 needs one decision and one small system. L4 needs a system that has never
been started.**

⚠️ **The important nuance for L2**, because it changes what you author: **typed soak works today, just not
from a ward CRAFT.** An authored opponent sheet may carry `soakLayers: [{ rank: 1, value: 4, type: "decay" }]`
and the walk honours it. What is missing is the path from a standing ward craft's `wardTypes` to a layer —
and per §39.5 that is Erik's call, not a wiring gap. **Level 2's hazards can be typed and answered right
now if the answering is done by equipment and sheets rather than by standing wards.**

---

## §2 — CAN A HAZARD CARRY `damageType` AND `ongoingHarm`?

⛔ **Not as things stand: a hazard is not a craft-like record.** `hazard` is an **encounter FRAME KIND**
(`encounterFrame.js`) — a framing for a contest ("Hard Ground · Cross it · Progress across"), with no
mechanic block and no place to put one.

**But you do not need a new record type.** ⚠️ **A hazard that deals typed harm is an OPPONENT with no
name**, and `synthesizeOpponentSheet` already accepts a fully authored sheet: `opponent.skills[]` overrides
the synthesis entirely, and `soak`, `soakLayers` and (as of today) `antisoak` all ride on it.

**So author each typed hazard as an authored opponent sheet with one skill** — the skill carries
`damageType` and, once you author it, `ongoingHarm`. **That is the shape that exists and it fits your four
hazards without inventing anything.**

---

## §3 — WHAT RECORD IS THE WARDEN?

**An authored opponent sheet, in an encounter of `type: "duel"`.** It carries all four of your
requirements today:

| your requirement | how |
|---|---|
| declares in the sense slot | it is a normal contestant; `senseResistOf` opposes the read |
| imposes conditions | `mechanic.imposes` on its skill — **live as of CCODE-208** |
| typed soak layers | `soakLayers: [{ rank, value, type }]` on the sheet |
| accepts a formal duel | `type: "duel"` is the structural kind |

⛔ **NOT a bestiary entry.** Its own design law forbids it: *"No person… If it would be a tragedy to kill,
it belongs in NPCs, not here"* — and a roster entry carries `id, affinity, class, tier, name, look, danger,
pressures, aggressorKind` and **no skills, soak or layers at all.** The Warden reads people and finishes an
assay; it is not a danger rating.

⚠️ **And your Cut Thread finding is already structural, not something I need to special-case.**
`resolveImposition` refuses anything outside `action_loss | staggered | unconscious | incapacitated` — **a
craft can never impose death, on anything.** So the shears failing against the Warden is not an exception
written for one room; it is the law the engine already runs on, and the room is where a player meets it.

---

## §4 — THE CLOCK

⛔ **There is none.** No `roundClock`, no per-round tick outside effect durations. **Effects tick per turn**
(`tickEffects`, CCODE-45) and that is the whole of the engine's sense of time inside a contest.

**Two ways to build Level 2's rising water, and I would take the second:**

1. **A real round clock** — new state, new tick, new display. Bigger than it sounds, because everything
   that ticks per turn has to agree about when a turn ended.
2. ⚠️ **A standing effect with a duration and an escalating value.** Effects already tick once per turn,
   already carry `roundsLeft`, already surface on the receipt. **The water rising IS an effect that gets
   worse** — and it needs no new system, only an authored one.

**Say which you want and I will build it.** If you want a true clock for reasons beyond this level — a
world-time interaction, something visible outside a contest — say so and it goes on the list properly.

---

## §5 — ⛔ WHAT YOUR §6 CAUGHT ALREADY

**`antisoakLanded` had no call site.** Built against Erik's three examples, gated on all three, and never
called from anywhere. `grief_strike` authors `antisoak: 3` and it did nothing.

**Wired today, read from the TARGET** — Erik's definition is a vulnerability the target carries, so what
got past soak is amplified. Gated end-to-end through a real round and mutation-tested.

⚠️ **One ruling needed, and it is why I did not read it off the striking craft:** `grief_strike`'s
`antisoak: 3` is ambiguous. **Does it mean "this blow benefits from +3" or "this blow LEAVES them +3
vulnerable"?** Erik's own wording — *"a Ki Wield striking an antisoaked target"* — says the target carries
it, which makes `grief_strike` a craft that IMPOSES the condition. **Reading it off the striker would have
decided that silently, so I left it for him.**

**Your §6 is correct and I would go further: it caught a mechanic of MINE that had passed its own gates.**
Soak against typed damage, healing against ongoing harm, tempo against a foe that also reads — you are
right that none of those pairs have met, and the two that are ready to meet are L2's heal-vs-decay and
L3's impose-vs-tempo.

---

**Next from me:** the clock, or SNG-500 §4 (obscure-as-a-declaration, which is Level 1's missing half), or
`projectTicks` for Level 4. ⛔ **§4 unblocks a level you can build immediately; `projectTicks` unblocks one
you cannot start.** I would take §4 first unless you say otherwise.

— CCode
