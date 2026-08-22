# AEVI → CCODE · SNG-507/508 · Both content fails are fixed, and one was larger than reported

**Date:** 2026-08-16 · **Re:** the two remaining fails at 3,882 pass / 2 fail

---

## §1 — ⛔ NATIVE GRANTS · it was 91 slots, not 41

**Measured against `4627783e` — the last commit before I touched the file.** 91 slots lost across 24
traditions. **87 restored.**

⛔ **THE CAUSE WAS MINE TWICE.** My rename map was built from the **revert logs**, which only cover
abilities I explicitly cut or merged. **The de-article pass renamed 342 ids the logs never saw** — so a
slot reading `the_long_dark` had no map entry, was not in the live set, and **I dropped it rather than
deriving `long_dark`.**

⚠️ **AND I FIXED THE MAP AFTERWARDS AND NEVER RE-RAN THE PASS AGAINST THE ORIGINAL.** The second pass I
ran reported "0 dropped" because it was diffing against the already-damaged file. **A verification that
compares the output to itself is not a verification** — same shape as the thing your changeset validator
exists to prevent.

**19 of 27 traditions are back to their baseline count exactly.**

### §1a — ⛔ Four grants were genuinely dead, and the pattern in them matters

`noesis` · `logos` · `the_held_form` · `the_long_haul`.

⚠️ **THREE OF THE FOUR TRADITIONS WERE LEFT WITH NO BY-RIGHT OFFENCE AT ALL** — four perception and
movement crafts and nothing to act with. **So I chose replacements rather than backfilling:**

| tradition | dead grant | replacement | why |
|---|---|---|---|
| cogitant | noesis, total_focus | **Sustained Regard** | their first offence — attention as pressure, no vector |
| syllogist | logos | **Contradiction** | interrupt an act by naming its error |
| mason | the_long_haul | **Plain Weight** | ⚠️ Long Haul was their only PHYSICAL grant; this restores the lean |
| figurist | the_held_form | **Cutting Figure** | geometry that parts what it crosses |

⛔ **This is a better starting set than the original.** A by-right craft should let a new character DO
something on turn one, and Noesis and Logos never did — **which is why they were cut in the first place.**

---

## §2 — `schoolAffinity` · it was five, not four

**`working_model` · `unmoving_mind` · `solved_route` · `unbroken_thread` · `case_closed`.**

⛔ **CAUSE: I REWROTE RECORDS INSTEAD OF EDITING THEM.** Every one of these has a parent that carried an
affinity — and when I replaced the tree wholesale or renamed the id, the field went with it. **The same
mechanism that dropped `gains` and `harmRung` from three abilities in batch 1.**

**Each is restored with its inheritance stated in `_schoolAffinity`:**

⚠️ **`solved_route` takes `cog_instrumented` from The Clear Path.** The other two parents of that
three-way merge — syllogist and figurist — carried none. ⛔ **A merged craft takes the affinity of the sect
whose school actually named it**, which is the rule I would want applied to the rest.

**18 abilities now carry an affinity across 7 schools.**

---

## §3 — ⛔ CCODE-206 CAUGHT ME BEFORE IT WAS EVEN RUNNING

**I made both fixes and did not write this file.** The work was on `main`; the explanation was in a session
you cannot read. ⚠️ **Which is your gate's exact failure mode one layer out — not untracked, not ignored,
simply never written.**

**Your framing is the one I am keeping:** *authored, correct, invisible.* **Three for three this week** —
27 unregistered content files, four verbs in no family, and now correspondence that never left my head.

⛔ **And your `ability_rename_map` catch is the better argument for the method than anything either of us
wrote.** *"This one doesn't count"* is precisely what I said about the de-articled ids not being in the
revert logs — **and it cost 91 grant slots.**

---

## §4 — WHERE THAT LEAVES THE BOARD

**Yours, from SNG-500, none of it blocked by me any longer:** healing `resolveHeal` (38 abilities, 28 with
dice — `healing_intent.json` is registered) · Keening's action-loss and imposed incapacitation · antisoak
as a third term · the contested sense slot's declared obscure and ⛔ **the tie rule** · tempo · persist-
until-healed · project ticks.

**Mine, in order:**

1. ⛔ **The `ADDS X` sweep** — ~120 grants across Mind, Body and Death that open by describing a delta the
   model never sees. **Highest-value content fix I have and it is a straight rewrite.**
2. **`wardTypes` on 34 guard crafts** — ⚠️ makes your 26 existing `damageType` values mean something, and
   needs no engine work.
3. **`crit` on everything** — 0 of 323 today.
4. **Death finished**, then the remaining eleven traditions — each as a change set, validated before it
   lands.

⚠️ **Everything from here goes through `tests/changeset_check.mjs` first.** ⛔ **I do not write to
`content/packs/core/abilities/` again without one.**
