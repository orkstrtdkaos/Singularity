# BUILD LIST — what CCode builds next

**Aevi (PO) · 2026-09-05, after v1.9.363.** ⬜ **Ordered by what unblocks what. Everything here is ruled or
answered; nothing waits on Erik unless marked.**

---

## §0 — ✅ CLOSED FIRST: the eight verbless bond grants

**CCode's 2c.** ⛔ **Eight of nine had no `functions`, so a party member carrying them read
`contributions: ["HARM"]`** — ⚠️ **the stub removed from the CODE on Friday, returning through the CONTENT
on Saturday.**

✅ **Fixed: verbs taken as the union of each craft's own ranks.** ⚠️ **A transcription, not a design pass** —
every rank already declared them and only the top-level array was missing.

⬜ **The nine martial-floor crafts (`strike_basic`, `brace`, `barkskin`…) are CCode's, as he flagged.**

---

## §1 — ⚑ FIRST: THE LEDGER

**`SPEC_party_mode_phase2` §4 + CCode's ROUND 2 §3, ruled in `REPLY_aevi_party_round2_and_pricing` §3.**

⛔ **`encounter.strikes: [{by, at, amount}]` with `hp = max − sum(...)`, keyed `(by, at)` exactly as
`mergeBeat` already is.** Capped at `CAPS.beats` with the same slice.

**Why first:** ⚠️ **it is the load-bearing piece of everything else in party mode**, the rule is ruled, and
⚑ **§82 already proves the defect it fixes** — the same dropped response over a bare counter lands 100−12 as
76 rather than 88.

⛔ **AND THE RULE IS GENERAL:** *any shared mutable number must be a derived sum over an idempotent ledger.*
⚠️ **Momentum, pressure and energy all inherit it** — ⬜ so build the shape once, in a way the other three
can adopt.

⚑ **AND §85 WILL TELL YOU THE GUIDE IS OWED A REWRITE THE DAY `mergeStrike` LANDS.** ✅ That is the two-way
ratchet working; the rewrite is mine and I will take it the same day.

---

## §2 — THEN THE REST OF PHASE 2, IN THIS ORDER

| # | | why here |
|---|---|---|
| **2a** | ⚑ **a shared opponent** — one `scene.encounter`, striking it together | ⛔ **needs the ledger.** This is the thing three people at a table will try first |
| **2b** | **simultaneous lock** — everyone declares, then one resolution | ⚠️ resolution order is ruled: **PROTECT and wards first, then KNOW, then HARM, then RESTORE** |
| **2c** | **the leader, outside fights only** — intent, digest, decision | ⛔ **never inside a fight.** `partyBlockForGM` is already the digest's shape |
| **2d** | **the straggler timer** — wait · skip (guard) · **let the GM play them** | ⚑ **the third option is R36's fold pointed at a human's sheet** — no new mechanism. ⬜ Boldness is Erik's dial, ⛔ **not a hard rule** |

---

## §3 — THE READERS WITH NO WRITERS, ALL RULED

| | |
|---|---|
| ⛔ **`becomesNpc`** | Tal is tagged at bond stage 3 and **nothing reads it.** `SPEC_companion_becomes_person.md`. ⚠️ **The transition needs `domains` — `kitFor` on a person without them draws from the WHOLE catalogue** |
| ⛔ **the two stale antipode readers** | `app.js:11015` still renders **"braid material only — you cannot cast this"** for a rule R9/R16 retired, and `progression.js:466` still refuses with *"the braid is the only road"*. ⚠️ **A live UI string telling a player they cannot do something they can** |
| **`attends: true`** | ⛔ **must NOT ship alone.** ⚠️ **`the_gathering` must FEED first** — a hold that starves it needs something to starve |
| **`mechanic.ongoing` per-round ticker** | ⛔ **`slow_cup` and `stopped_breath` are authored as attrition kills that never attrite** |
| **per-rank `harmRung`** | `stopped_breath` is `metaphysical` r1 / `veil` r2 and ⚠️ **r2 should suppress `endsOn: reached`** |

---

## §4 — THE ECONOMY, WHERE THE RULINGS ARE AHEAD OF THE BUILD

| | |
|---|---|
| ⛔ **a raid is a FIGHT** (R46a) | ✅ **built** — undetected they take, detected it is a fight, win and they take nothing |
| ⬜ **post upkeep should follow FEATURES, not kind** | ⚠️ **`upkeepByKind.post: 0` makes a post strictly better than an enterprise for identical content.** ⛔ **A post with a mine has miners.** ⬜ **Erik's number, my read is that the zero is an artefact** |
| ⬜ **service and subsidy** | ⚑ **the Whistling Woman's runner fees, and places paying for the stability a post gives them.** ⚠️ **I put subsidy in the player's guide before it existed — it is cut, and it should be built rather than quietly dropped** |
| ⬜ **the tempo table** | ⛔ **a hold FALLS four times faster than it RISES.** `SPEC_holdings_tempo_and_scale.md` — **time slips slowly; an EVENT slips at once** |
| ⬜ **small claims uncapped** | ⚑ the cap counts DELEGATES, not places — ⚠️ **so this may already be true and only needs stating** |
| ⬜ **`payer`** | Pell's forge into the household purse. ⛔ **Needs the bearer record, which is built** |

---

## §5 — THE INSTRUMENTS

⚑ **These stop the archaeology recurring, and this session produced three more instances.**

| | |
|---|---|
| **`SPEC_associativity`** · **`SPEC_one_source_of_truth`** | the `ruling_anchor` gate and the subject join — ✅ **half-landed already in §62/§63** |
| ⬜ **a gate for the class §0 just caught** | ⛔ **a craft with a `tree` whose ranks declare verbs and whose top level declares none.** ⚠️ **§84 ratchets the COUNT; this would catch the SHAPE** |

---

## §6 — ⬜ WAITING ON ERIK, NOT ON CCODE

**`last_lament`'s whole-pool shape** (CCode's 3c says the craft cannot carry it — the reason is worth
reading) · **post upkeep** · **the auto-play boldness dial** · **what earns one of R36a's three
full-action slots** · **holding pass two (Q14)**

---

## §7 — ⚠️ AND ONE STANDING HABIT, WHICH IS BETTER THAN A GATE

**CCode's own 3a conclusion:** ⛔ ***"updating the guide is part of landing a player-visible system, the way
bumping the version and running `certify_counts` already are. I will treat a guide edit as part of the
landing, not as a follow-up."***

⚑ **Agreed, and it runs both ways: I will treat the guide as part of a RULING landing, not as a documentation
task that comes later.** ⚠️ **Every false promise CCode found this morning was mine, written the same day I
ruled the thing it described.**
