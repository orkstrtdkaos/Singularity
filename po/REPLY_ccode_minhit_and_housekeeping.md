# REPLY — minimum damage is 0, `add` splits on C, and ⛔ the housekeeping found an UNAPPLIED repair

**CCode → Erik and Aevi · v1.9.252 · 153 doc assertions green · 20 suites, no regression**

---

## §1 — ✅ MINIMUM DAMAGE IS 0

**`skill_battle_system.engine.damage.minHit: 1 → 0`.** ⛔ **One number, because the readers were already
dials** — every one coalesces nullishly, so nothing needed a code change to honour it.

**What it means now:** a blow whose every part is soaked or warded lands **nothing**. ⚠️ **The ward
ladder's top rung, IMMUNITY, can finally mean immune** — it never could while the floor stood.

⛔ **AND THE THING THE FLOOR EXISTED TO PREVENT, RECORDED SO IT IS NOT REDISCOVERED:** a craft reduced to
nothing reads as *broken* rather than as *answered* — which is exactly how `antisoakLanded` returning 0 got
reported as a defect. ✅ **The receipt carries the reason instead:** `soaked`, `guardedBy`, and the ward's
`stopped` list.

### ⚠️ AND THE MEASUREMENT THAT SHOULD SHAPE YOUR EXPECTATION

**I checked what soak the game actually produces before assuming this was a big change:**

| | |
|---|---|
| `soakBase` | **0** |
| `threatToSoak` | 0.02 — a **threat-120** foe synthesises to soak **2** |
| authored foes carrying a `soak` field | ⛔ **none** |
| a player's authored guard | **4–5** |

⛔ **SO THIS LANDS ALMOST ENTIRELY ON THE PLAYER'S SIDE** — felt when you raise a ward, not when you hit a
boss. **Which is where you said the 1 bothered you.**

---

## §2 — ⛔ THE GATE THAT SHOULD HAVE CAUGHT THE DOC, AND DIDN'T

**`how_it_works` §4 asserted *"a blow whose every part is warded still lands its floor"* — and after the
ruling it stayed GREEN while the doc went false.**

⛔ **Because the assertion passed a LITERAL `minHit: 1` instead of reading the dial.** ⚠️ **That is the rule
I wrote into `FIELD_REFERENCE` §4 after the `rankReachSurcharge` near-miss — *a harness that builds its own
config tests its own config* — broken in the file that asserts it.**

✅ **Fixed: §4 now reads `skill_battle_system.engine.damage.minHit` and asserts the DOC states whatever the
dial holds.** **Move the dial back and the expectation moves with it.**

---

## §3 — ✅ RULING C, BUILT: `add` SPLITS ON THE VERB

**Your 92 / 89 verifies exactly** — 72 with-verb + 20 at r1 = 92, 89 without, and the per-rank breakdown
matches to the number (r1 20 · with r2 12, r3 60 · without r2 14, r3 75).

```
BEFORE the split:  deepen 224 · extend 163 · add 161      §4 nerf: 124 kept-numbers
AFTER  the split:  deepen 313 · extend 163 · add  72      §4 nerf:  60 kept-numbers
```

✅ **124 → 60, inside the 72 with-verb share you predicted. The branch reads the right thing.**

⛔ **AND YOUR SECOND-ORDER RISK IS IN THE CODE AND IN A GATE.** The comment says it plainly: *this makes a
craft's mechanical scaling depend on its `functions` array, so an author tidying a rank's verbs — or a lint
normalising them — silently removes a 35% bump.* ✅ **The gate pins the split at 92/89 ±4**, so such an edit
announces itself instead of moving balance in silence.

---

## §4 — ⛔ THE HOUSEKEEPING FOUND SOMETHING, AND IT IS NOT WHAT I EXPECTED

**You asked me to archive or remove what is no longer valid, if safe. ⚠️ SEVEN SCRIPTS ARE REFERENCED BY
NOTHING, AND NOT ONE IS SAFE TO ARCHIVE.**

| script | diagnosis |
|---|---|
| `turn_flow` · `silas_battle` · `run_warden` · `encounter_types` · `prompt_grid` | ✅ **runnable demos** answering questions you asked. Evidence, not cruft. |
| `repair_minted_transit` | takes a save-file argument — a **per-save tool**, not a one-shot |
| ⛔ **`repair_self_variants`** | ⛔ **STILL REPORTS 7 RECORDS NEEDING REPAIR. IT WAS NEVER APPLIED.** |

⛔ **ARCHIVING IT WOULD HAVE BURIED AN UNFINISHED REPAIR**, and I only know because I ran it instead of
reading its name. ⚠️ **"Unreferenced is not useless" — my own rule, and it earned itself back today.**

### THE SEVEN RECORDS

**Each is recorded as a rumour of ITSELF** (`_canon.rivalId === _canon.entityId`) — corruption from a
non-idempotent retry, not a contest outcome:

```
The Low Lamp Inn · Siol · Tessvel Cairn · Warden Coll · Deni Cors · Ossivyn Tallow · Stillwater's Trouble
```

⛔ **I HAVE NOT APPLIED IT.** It writes shared world canon and touches seven named entities — that is a
repair, not housekeeping, and it wants a yes from one of you. ✅ **The script repairs only that exact
signature and leaves genuine rivalries untouched; the dry run above is the whole change.**

---

## §5 — WHAT ELSE MOVED

- ✅ **`FIELD_REFERENCE` §10** — `mechanic.soak` marked FIXED, kept as a worked example that *"the consumer
  existed and the WRITER was missing"* is a different diagnosis from *"unread"*.
- ⚠️ **`minHit` added to the collision list** — it floors both the ROLLED magnitude and the LANDED damage.
  **One name, two meanings.** At 0 the first is inert rather than wrong, and that is now written down.
- ✅ **`HOW_IT_WORKS` §4 rewritten**, three log rows, atlas re-injected.
- ⚠️ **`damage_sensitivity`'s EDGE test inverted** — it asserted *"no immune foe"*, the old rule. ⛔ **And
  my first replacement asserted a tier-9 craft must punch through soak 40 — a value the game cannot
  generate.** Re-measured against soak 5, the heaviest authored guard.

**Nothing was deleted. Nothing was archived. The honest housekeeping answer was that none of it was safe.**

— CCode
