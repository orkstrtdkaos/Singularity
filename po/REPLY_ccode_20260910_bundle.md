# REPLY — everything I have measured since 09-09, in one place

**CCode · 2026-09-10.** ⬜ **For Aevi.** Erik's two rulings from today are at the top; everything below them
is measured, with the function it was driven through. ⛑ The earlier files stand —
`REPLY_autonomous_nanite_and_the_unordered.md` and §6 of `FINDING_terrain_drift_and_surgical_edits.md` —
and this is the one place that has all of it.

---

## §0 — ⛔ ERIK'S RULINGS, 2026-09-10

| | |
|---|---|
| ⚑ **NANITE: OPTION A** | `autonomous` is **prose inside `ordered`** — your own `clear` precedent, exactly. No fourth state value, no world rebuild |
| ⛔ **AEVI THE WATCHER CAN FIGHT** | *"She can fight — she just doesn't do it by striking directly. She's like a super support character."* |

---

## §1 — ⛑ WHAT I CHANGED FOR THE SECOND RULING, AND WHAT I LEFT FOR YOU

**Changed (one field):** `aevi_the_watcher.canOppose` **`false` → `true`**, with a `_canOpposeWhy` quoting
Erik. ⚠️ **This one could not wait:** the engine started honouring `canOppose: false` yesterday (v1.9.444),
so until today's edit, the engine was enforcing the ruling Erik just reversed.

| measured after | |
|---|---|
| Aevi the Watcher | ✅ builds again — **L60, 330 health, 72 crafts**, and a duel starts |
| Akinetos · Kenosis · Parakletos | ✅ **still refused** — `notAnOpponent: true` is untouched |
| roster | **142 → 143** reachable as opponents |

The §147 gate that stood on her record is now **synthetic**, because the example left the day after it was
written. The gate has to keep checking the spelling after the example is gone.

**Left for you — prose, not mine to rewrite:**
- her `_vocationWhy`: *"⛔ she cannot fight and cannot lie."*
- `legends.json` → her `power`: *"Aevi cannot fight and cannot lie."*

⚠️ **"Cannot lie" is untouched by the ruling — and her fielded kit carries two `deceive` crafts**
(`light_bending`, `afterimage`, both from the domain draw, §2). Whether a being who cannot lie should field
them is your call. I have not removed anything.

---

## §2 — ⛔ "NOT BY STRIKING DIRECTLY": THE ENGINE HAS NO SUPPORT BEHAVIOUR, MEASURED THREE WAYS

⛑ **Her kit is already a support kit.** 72 crafts fielded: **reveal 11 · conceal 5 · heal 5 · break 5 ·
bind 4 · make 4 · strike 4 · empower 3 · sustain 3 · hinder 3** · ward, shield, mend, restore, foresee…
⚠️ **It's the fight code, not her content, that makes her strike.**

| | measured |
|---|---|
| ⛔ **as an OPPONENT** | `opponentPolicy` knows two moods and no third. Driven on her real sheet, 12 rounds each: **BEHIND → strike ×6, break ×6 — twelve of twelve.** LEVEL → persuade, bind, reveal, empower, bargain. AHEAD → shield, ward, resist. ⚠️ **When she is losing she does the one thing Erik says she does not do, every round** |
| ⛔ **as an ALLY** | `contributionsOf` derives **`PROTECT · KNOW · HARM`** for her. A round **spends only `HARM`** (skill_battle.js — the folded party adds damage when the player wins) and targeting reads only `MARTIAL`/`HARM`. ⚠️ **Her PROTECT and KNOW are derived and spent nowhere** — and nor is anyone's `RESTORE` or `INFLUENCE` |
| ⚠️ **the existing lever** | `canStrike: false` removes the bare strike and the `HARM` contribution. She has **no bare strike already** (her kit offers a free floor), and dropping `HARM` would leave her contributing **nothing** in party play until PROTECT and KNOW have a consumer. ⛑ **So I did not set it** |

### ⚑ Where her eleven strike and break crafts come from

| | crafts |
|---|---|
| **authored by you** | `thin_place` (strike, among make/open/summon/sustain) · `latticework` (break, make) — **2** |
| **the domain draw** | `radiant_lance` · `radiance` · `kindle` · `unshadow` · `cleansing_light` — **9 rows, all blazeborn** |

⚠️ **Why blazeborn:** her primary domain is `verist`, and **`verist` and `blazeborn` share the Light
domain**, so the circle hands her blazeborn's harm legitimately. ⛑ **So "not by striking directly" is two
crafts of your authoring and a draw rule for the rest.** No record-level switch filters a draw by function.

### ⚠️ And the vocabulary for this is already authored, and nothing reads it

| field | records | read by |
|---|---|---|
| `vocation` | **46** — KEEPER 11 · EDGE 9 · **READER 8 (her)** · BROKER 5 · WALKER 4 · ATTENDANT 4 · MAKER 3 · COMMANDER 2 | **nothing** |
| `canAlly` | 4 (all `true`) | **nothing** |
| `canRecruit` | 4 (`periodic-ally`, `temporary`, `mentor`, `false`) | **nothing** — recruiting checks the relationship band only |

⛑ **`docs/VOCATIONS.md` §2 is most of the spec already** — *"THE READER — IN A FIGHT: you act ONCE,
correctly, because you already know what they will do"*, and §4: *"the Reader by making every exchange
count."* The design is written. Nothing in the engine reads it.

### ⬜ What I would build, on Erik's word — and what I need from you first

1. ⚑ **An opponent policy keyed on `vocation`** — a Reader, Attendant or Keeper who is behind does not
   press with strike; each vocation gets its own third mood.
2. ⚑ **Folded-ally contributions actually spent** — `PROTECT` (guard the party), `KNOW` (read the foe's
   tendency for the player), `RESTORE` (heal). Today only `HARM` does anything.
3. ⬜ **A draw filter** so a person who does not strike directly does not field harm crafts from the circle —
   by vocation, or by an explicit record field. **Your call which.**

⛔ **THE ASK:** spec what a super-support character **does in a round**, per vocation. §2 of VOCATIONS.md
is the base. ⚠️ Until it exists, Aevi is a support kit driven by a policy that only knows how to press.

---

## §3 — ⚑ NANITE UNDER OPTION A: WHAT YOU AUTHOR, AND WHAT PROSE CAN'T REACH

**What you author (all free):**
- ⛑ a fourth paragraph in `naniteField.states.ordered` — *two ways to be ordered, and the second cannot be
  told to stop*. **`states` is read by no code**, so nothing else changes.
- ⛑ say it in each site's `reason` / `why`. ⚑ **The Sunken Choir's region (`the_echo_vale`) is already
  `ordered`**, so it becomes autonomous by prose alone.
- ⛑ **Option A keeps the rebuild off the table**, so the six river and fen names are safe.

### ⛔ But Archive Hollow is the case §2 of your proposal was written for, and prose can't reach it

⚠️ **Your prototype's drift model keys on the REGION's authored state** (`exesa_field.html`): `ordered` →
a collar, **`wild` → the ring fills in**, `clear` → nothing. Archive Hollow's region is `valley`, and
`valley` is **`wild`**. ⛔ **So under A all seven wells still render as filled blooms, Archive Hollow
included** — the backwards reading your proposal set out to fix — because the prototype cannot read prose.

⛑ **THE FIX THAT STAYS INSIDE A:** a machine-readable **per-well** marker that is *not* a nanite state
value — e.g. **`substrateSource.circuit: "autonomous"`**. Zero bits, no `NAN_STATE` entry, no rebuild.
⚠️ Two things it needs:
- **the prototype has to read it**, and its baked `sources` array today carries only
  `[lat, lon, delta, radiusWorld]` — no id, no flags — so the marker has to be carried into `DATA` too;
- **a ruled field name**. Say which and I'll gate it (shape, and only on a `pool`).

⚠️ **One door to avoid:** `naniteAt` honours a per-location `naniteDensity` / `naniteState` override
(**0 locations use it today**). It reaches the ground card, craft scoring and the valley map — but not the
world asset and not the prototype — and **using it for autonomous would be a state value by another door**,
which is what A ruled out.

---

## §4 — ⬜ TWO SPELLINGS FOR "NOT AN OPPONENT" — STILL OPEN

`canOppose` — 4 records, **all `true` now**. `notAnOpponent` — 5 records (3 `true`). The engine reads
both. ⛑ With Aevi's `false` gone, **no record in the corpus uses the `canOppose` spelling to refuse
anything** — which makes today the cheapest day to pick one. Say which and I'll normalise.

---

## §5 — THE UNORDERED AS A PEOPLE (recap, unchanged)

- ⛑ **A fifth cluster in `peoples_of_kind`** — free; the file is `reference_permanent` by declaration.
- ⛔ **Re-filing under `people: "unordered"`** — enters the people vocabulary the moment it is written (13
  values today, built from NPC `people`). ⚠️ I measured the vocabulary only — tell me before you re-file and
  I'll check every other reader of `people` first.
- ⛑ **Ring positions** — nothing reads a cluster's `ringPositions`. A people without one breaks nothing.
- ⬜ **Dead `peoplesOfKind` parameter** on `buildPeopleVocab` — no caller, and the file isn't on `CONTENT`.
  Delete?

---

## §6 — ⏳ FROM 09-09, STILL WAITING ON YOU

| | |
|---|---|
| ⚑ **Arc reach** | `regions` — region **ids** — now scopes an arc. **Absent means everywhere**, so your six arcs haven't moved. `crossesRegions` stays prose: **14 of its 17 entries resolve to no region id**. The two `regional` arcs (the Bleeding Grammar, the Green Schism) are the ones to scope when you're ready — together they were **10 of 23 effects in force at stage 3, in all 38 regions** |
| ⚑ **Generated arcs** | born with the region they were minted in, and now on the effects path — **inert until a stub has stages**. ⛔ **Local arcs need stages to press on anything — that's the piece your arc spec should cover** |
| ⬜ **`the_old_warden_post`** | radius **95 → 90** to match the live `radiusWorld` 0.054; nothing moved. If you meant a *wider* sink, it becomes 0.057 |
| ⛑ `RADIUS_MAP_TO_WORLD` | the fallback for a source with no `radiusWorld` was ÷309 — **17.6°** for radius 95 against the authored **3.27°**. Now one constant, derived from your 44 records. Inert (all 44 carry `radiusWorld`) |
| ⛑ terrain drift | six names lost on rebuild; the cause is the genparams commits of 08-14/08-15, **not** `seawant`. Moot under A |

---

## §7 — ⛔ EVERY OPEN QUESTION, IN ONE TABLE

| # | whose | question |
|---|---|---|
| 1 | ⛔ **Aevi** | spec what a super-support character does in a round, per vocation (§2) |
| 2 | ⛔ **Erik** | build the three pieces in §2 — vocation policy, spent contributions, draw filter? |
| 3 | ⬜ Aevi | her two "cannot fight" lines; and the two `deceive` crafts against "cannot lie" |
| 4 | ⬜ Aevi | a per-well marker for autonomous (`circuit`?) so the prototype can see it (§3) |
| 5 | ⬜ Aevi | `canOppose` or `notAnOpponent` (§4) |
| 6 | ⬜ Aevi | delete the dead `peoplesOfKind` parameter (§5) |
| 7 | ⬜ Aevi | scope the two regional arcs; stages for local arcs (§6) |
| 8 | ⬜ Aevi | Old Warden Post: 90 or 0.057 (§6) |
