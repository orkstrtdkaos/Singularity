# BATCH-13 — the handoff

**Aevi (PO) · 2026-07-18 · one batch, for CCode.** Erik has ratified the canon amendment (§C).
Build order is CCode's own recommendation, accepted without change.

---

# §A — BUILD ORDER

| # | item | why here |
|---|---|---|
| **1** | **Lore loader** (`state.js:130`) | Upstream of the most reports, smallest change in the batch. **Includes both caveats as part of the fix**: the five refs that stay dangling, and a **renderer** for `.json` — raw JSON at ~2,900 tokens mean trades a silent miss for a silent bloat, which is worse because it costs on every turn and looks like it works. |
| **2** | **SNG-171 §2 · reconcile history-credit** | Erik is level 16 and unknown to people he has actually worked with. v7/v8 are the precedent; this is the same shape over history rather than origin. ⚠️ blocked on §D ruling. |
| **3** | **SNG-169 §2c · one HTML attribute** | 12th built-never-reached. `entityHover`'s item branch + `itemDetail` fully written and unreached. Cheapest live win in the batch. |
| **4** | **BATCH-12 §3 · standing** | Read path complete, display live, **only** structured-quest effects write it. Origin seeding shipped (v8); company accrual + `standingOps` remain. |
| **5** | **SNG-173 · toolkit decay** (new, below) | One-line cause, and it is why Erik stopped seeing SNG-142. |
| **6** | **Substrate field** | `substrate_field_probe.mjs` is the reference. Content re-authored as ±deltas (§B). `carriedSubstrate` needs to accept negatives. |
| **7** | **SNG-171 §1 · arc anchors** | Stages cannot name a place; outcomes ship `effects: []`. |
| **8** | **SNG-166 / 167 rest, 168, 170** | Address derivation, NPC quest seeds, map viewport + pinch, stakes dial. |
| **9** | **SNG-172 · power sources** | Largest, ratified, and wants the substrate field landed first. |

---

# §B — WHAT CHANGED IN CONTENT SINCE YOUR ROUND 2

**Pools and sinks are now ±`delta` against the region background, not absolute `strength`.**
Erik's correction: *"they're basically big auras."* Consequences:

- **The 0.96-pool-in-a-0.98-region inversion is now unrepresentable** — `kind` derives from the sign.
  My bug class is gone structurally rather than by careful authoring.
- **The Gearlands headroom problem dissolves.** `the_great_engine` is `+0.22` above ambient wherever
  the regional mean sits. **The ruling I flagged for Erik is no longer needed.**
- **Geographic sources are now the same kind of object as `substrateCharge` / `substrateAura`** — a
  ±magnitude with a reach. One concept, three carriers. `substrate_field_probe.mjs` will need its
  input shape updated; the invariants are unchanged.

**Also authored:** `substrateCharge` on 8 items (Waystaff +0.18, Memory +0.12, and two **suppressors**
— Stillhold veil −0.10, truce token −0.05) and `substrateAura` on 6 companions (Aevi +0.20, Coil
+0.14, Sprig −0.08). ⚠️ **Negatives do nothing until `carriedSubstrate` accepts them** (`c > 0` today).

**Memory** — the Unfinished Spear's current name, with what "unfinished" means: *a living ending
witness, in the same kind as Huginn — a thing that attends endings and keeps them, and so can never
be completed while endings continue.* Its charge is the accumulated weight of kept endings, not fuel.

**40 NPC `appearance` fields** — live already via `npcPromptSeed`.

---

# §C — CANON AMENDMENT, RATIFIED BY ERIK (SNG-172)

> *"Every craft in this world is nanite-mediated. There is no magic."*

**No longer universal.** Some power is **natural** — not lattice-mediated. Ratified 2026-07-18.

Four sources: **lattice/nanite**, **wild nanites**, **natural**, and **combination as a first-class
case** (Erik's Cogitants: nanite to move matter with a mind, natural for the mind itself).

**The payoff:** every region becomes *someone's* good ground. The Quickwood stops being merely where
Continuous crafts starve and becomes where natural craft works best — the Rootkin did not just
survive the withdrawal, they moved to a source it uncovered. That makes the Returned equal rather
than compensated, which is what AMENDMENT_1 reached for and did not close.

⛔ **`powerSystem` is already taken and load-bearing.** 142 of 285 abilities use it as a *reach/access*
taxonomy and `progression.js:154` seeds domain access from it. **Power source needs its own axis.**
(36 abilities have no `powerSystem` at all — separate defect, worth closing in the same pass.)

---

# §D — RULINGS STILL OPEN FOR ERIK

1. ~~**Which people does a bond with an Ent credit?**~~ **✅ RULED 2026-07-18 — see `po/SPEC_SNG-174`.**
   Kind and disposition are **independent**: a people is a kind of being, a domain is what they
   practice. **41 NPCs now carry `people` + primary/secondary/tertiary `domains`**, derived from their
   own authored spectrums; Epic NPCs hold multiple primaries. A bond credits the NPC's **domains**,
   not their species. **§A item 2 is unblocked.**
2. **Region renames** (SNG-166 §2) — display-name migration, ids stable. Cost first.
3. **Stakes dial default** (SNG-170) — and whether I flip the boar and greatcat to lethal before the
   dial exists. I have not, because that imposes rather than offers.
4. **Falloff scales** — still untuned, `tuningNote` blocker unchanged.

---

# §E — SNG-173 (NEW) — THE TOOLKIT GOES QUIET AS THE CHARACTER GROWS

Erik: *"I haven't noticed the GM suggesting abilities and braids/items/companion skills as much as I
would have thought from the update we did a while ago."*

SNG-142 closed green. The mechanism, `engine/toolkit.js:58`:

```js
const forgotten = owned.filter(a => (uses[a.abilityId] || 0) === 0)
```

**`uses === 0` only.** An ability used *once* never returns to "crafts not yet leaned on" — ever. This
was logged as a tracked limitation (no recency stamp); its **consequence** is sharper than that:

**The feature works for a level-1 character who does not need it and empties permanently for a
level-16 character who does.** It decays precisely as the toolkit grows large enough to forget.

Compounding: rule 16B correctly caps offers at one per beat and says *never every beat*. A conservative
offer rate over a shrinking candidate pool reads as silence.

**Outcomes wanted:**
1. **Recency, not first-use.** An ability unused for N beats is available to surface again. A stamp on
   `recordUse` is the obvious route; the invariant is that the pool does not monotonically drain.
2. **All four categories keep contributing** — crafts, braids, items, companion skills. If braids and
   companion skills are also draining, the same fix covers them; if they never fired, that is separate.
3. **Offer rate stays honest.** Do not fix silence by loosening 16B — the nag it prevents is worse.
   Fix the pool.
4. **Measurable.** After the fix, a mature character should see a toolkit offer at a stable rate
   rather than a decaying one. Browser-leg is Erik's.

---

# §F — STANDING NOTES ON MY OWN PRACTICE

Recorded because they changed how these specs are written:

- **Audit for existence before speccing a build.** Six proposed builds already existed in whole or
  part — including the `tradition → region` map SNG-166 asked me to author, already authored on all
  24 traditions *including my own worked example*. Diagnosis has been reliable; does-this-already-exist
  has not.
- **Verify one layer down before naming a cause.** SNG-167 §1 read the symptom right and blamed the
  authoring layer; the cause was the loader. My pass would have improved nothing.
- **Ship the verification with the claim.** The retracted substrate numbers ran from an uncommitted
  `/tmp` script. `substrate_field_probe.mjs` is the standard.
