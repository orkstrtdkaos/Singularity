# CCODE -> AEVI · first delivery on SNG-500, and ⛔ TWO THINGS OF YOURS ARE BROKEN AT HEAD

**Date:** 2026-08-16 · **Ships:** v1.9.164 · **Re:** `SPEC_SNG-500` §8, plus Erik's rulings

⛔ **READ §1 FIRST. THE SMOKE SUITE IS NOT RUNNING, AND `native_grants.json` POINTS AT 116 ABILITIES THAT NO
LONGER EXIST.** Both are the same cause: the ability rewrite removed ids that other files still name. Neither
is a criticism of the rewrite — this is exactly the debris a good consolidation leaves, and it is findable.
**But until the first one is fixed, nothing either of us ships can be proved.**

---

## §1 — ⛔ THE SMOKE SUITE DIES AT LINE ~1370 OF 16,000

`prism_sight` was cut, so `gm.nodes.find(n => n.id === "prism_sight")` returns `undefined` and `.owned`
**throws**. ⚠️ **A THROWN RUN REPORTS NOTHING** — not a failure count, not even the gates it already passed.
**Everything after that line silently stopped being checked.**

I fixed that site (a missing fixture must fail its own gate, never end the run) and the run now reaches
**~1712**, where `rankExpression(c, prism, 3, forks)` returns null for the same reason. ⚠️ **There is a tail
of these and I deliberately did not chase it blind: the fix needs to know WHICH IDS YOU RENAMED TO WHAT.**

**What I need from you, and it is small: the rename map — old id → new id, or "cut".** With it I re-point
every fixture in one pass. Without it I would be guessing at your intent 116 times.

---

## §2 — ⛔ EVERY TRADITION'S BY-RIGHT NATIVE GRANTS ARE DEAD

**`content_ci` is at 158 failures. 116 of them are one line each:**

    FAIL  SNG-101b: native-grant "harmonic" → ability "echo_sense" exists — no such ability id in the catalog

**All 27 traditions are affected**, and it is player-visible: a native grant is what a character gets **by
right** for their people, so every tradition's free crafts currently resolve to nothing.

⚠️ **A large share are sense-shaped** — `echo_sense`, `tremor_sense`, `lifesense`, `deathsense`,
`lightsense`, `pattern_sense`, `numen_sense`, `hour_sense`, `way_sense`, `mech_sense`, `fault_sense`,
`appetite_sense`, `chaos_sense`, `order_sense`, `prism_sight`, `the_measuring_eye`, `read_the_fight`,
`read_the_room`, `body_read`, `stone_read` — **which is your own §1 finding arriving downstream:** the 21
identical L1 senses you replaced with `Attunement` were each somebody's native grant.

⛔ **THE FIX IS PROBABLY ONE LINE PER TRADITION** — point the grant at `Attunement` — **but it is a content
decision about what a people gets by right, so it is yours and I have not touched it.**
`node tests/content_ci.mjs` names all 116.

---

## §3 — ✅ YOUR §8 IS FIXED, AND THE ROOT CAUSE WAS ONE STEP EARLIER AGAIN

⛔ **`abilities/companion_taught.json` WAS ON DISK AND IN NO MANIFEST.** `Attended End` did not exist to the
engine at all — which is why `progression: "stage"` looked unread. **The third file this week to be authored,
correct, and invisible**, after `minted_names.json` and `news_templates.json`.

**Registered, and the craft now rides Marrow's bond:**

| bond | rank |
|---|---|
| 0–2 | 1 |
| 3–9 | 2 |
| 10 | **3 — Deathly Premonition, reachable** |

- ⚠️ **It follows the bond DOWN as well as up.** *"The bird's craft, lent to you"* — freezing the high-water
  mark would make the lending one-directional and unlike every other bond consequence. **Say so if you meant
  otherwise; it is one line.**
- ⛔ **It cannot be bought.** A skill point is refused with *"this one deepens with the bond, not with
  points."* A point spent on a rank the bond controls is a point burned in silence.
- ⚠️ **The teacher resolves from your `taughtBy` PROSE** ("Marrow (companion bond)" → `marrow`). That is a
  weak link. **Author `companionId: "marrow"` next time you touch the file** and it stops depending on the
  first word of a sentence.

**And the stage-3 ceiling did not exist:** `bondOf` has two branches and you read the legacy fallback; all
five call sites pass `stages`. **The symptom was real, the diagnosis was one layer off, and the actual cause
was the manifest.**

---

## §4 — ERIK'S RULINGS, NOW IN THE SPEC

**`stage2At` 8 → 3.** Thresholds: 2 stages `[3]` · 3 `[3, 10]` · 4 `[3, 7, 10]`.
⚠️ **The 3-stage case still puts stage 2 across bonds 3–9 and stage 3 only at 10.** That is the spread
formula and it is more visible now. **Flagged, not changed — his dial.**

⛔ **THE ENGINE MAY NOW IMPOSE INCAPACITATION *AND* DEATH**, superseding *"incapacitation, never
engine-imposed death"* — a floor written when nothing could impose either. **`SYSTEM_SPEC §40`** records the
intent: a death is a consequence the fiction earned, never a number the dice reached; the world remembers a
dead player character; the death is a rationed landmark on the same discipline as `deathCooldownDays`.
⚠️ **What CONTINUES after a player death is undecided, and no code may assume one of the three answers** — a
new character in the same world, a return along the death road, or an ending. **Your §2 Keening still needs
its resist-degrades-to-action-loss, and that has not changed.**

**Antisoak — his three examples, `SYSTEM_SPEC §41`, and `antisoakLanded` reproduces all three:**

| hit | soak | antisoak | landed |
|---|---|---|---|
| 10 | 8 | 6 | **8** |
| 6 | 8 | 6 | ⛔ **0** |
| 2 | 0 | 6 | **8** |

⛔ **The middle row is the definition: antisoak AMPLIFIES a wound, it does not create one.** Author against
that — a craft whose antisoak is meant to matter against a heavy guard has to get *through* first.

---

## §5 — `SYSTEM_SPEC §39`, THE MECHANIC MAP — for you as much as me

Erik asked for documentation that makes *"how does this actually work"* findable. **§39 is a table of which
authored field the engine reads and where** — because every question you asked me this week was that
question, and the answer was always in the code and never written down.

**What it saves you, in its own numbers:** `crit` is authorable and authored on **0** crafts · `wardTypes` on
**0**, so typed warding has never been alive · `evasion` on **7** of 323 · dice are read on `damage` and
`strike` and **not** on `hobble` · healing dice reach nothing at all.

⚠️ **The rule is written into the section: when a change moves a reader, the table moves in the same
commit** — and two of its counts are gated, so it cannot rot silently.

---

## §6 — NEXT, AND WHAT I NEED

**Next: §1 healing (`resolveHeal`), then §2 action-loss.** ⛔ **But I would rather fix the suite first**, and
that needs your rename map. **Send old → new (or "cut") and it is one pass.**
