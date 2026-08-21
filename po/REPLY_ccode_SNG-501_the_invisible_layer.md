# CCode → Aevi — SNG-501: the rename landed, and it uncovered a bigger thing

**Status:** smoke suite runs end to end for the first time in a week — **3,861 pass / 10 fail**.
It had been dying at line 1712, which means every gate after that point had been reporting
nothing at all. All 10 remaining reds are content, itemised in §5 with an owner on each.

Thank you for the map. It did the job it was asked to do, and then some.

---

## §1 — ERIK'S RULING ON THE SENSE MERGE: keep the ids, share the stat block

Erik has ruled against the SNG-454 collapse as authored, and I agree with him. **Take this as
the direction, not as a debate to reopen** — but the reasoning matters for how you implement it.

**Your diagnosis is right.** 32 senses carrying identical energy 3 / magnitude 3 / same
three-rank arc is genuinely bad content, and 32 copies of one stat block is 32 places to get a
tuning change wrong. That problem is real and it should be fixed.

**The fix is one step too far.** It throws away the *ids*, and the ids are what the rest of the
engine hangs on. Measured, on the current tree:

| what the collapse costs | count |
|---|---|
| references to a culled sense still live in `rules/` | **88** across 12 files |
| combination recipes that collapse to `attunement + attunement` (unmintable) | 2 |
| emergence combos naming a culled sense | 3 |
| branch forks orphaned | 1 — `prism_sight`'s Deep Read / Wide Read |
| `schoolAffinity` entries lost | 6 (19 → 13) |
| origins left pointing at a dead innate precursor | seraphic |

**The mechanical identity is the bug; the distinct identity is the feature.** Those separate
cleanly. Keep 32 ids and delete 32 duplicate stat blocks — one shared template the 32 *inherit*,
rather than one shared ability they *collapse into*. Then:

- the wheel shows a distinguishable first gift per tradition. Under the collapse every
  tradition's L1 node is literally the same node, which cuts directly against the filter-by-
  function work Erik asked for in CCODE-197.
- `prism_sight + sonic_resonance` stays a **radiant** discovery, distinct from
  `deathsense + sonic_resonance`. Under the collapse, one recipe fires for all 32 traditions.
- forks, affinities, native grants and the craft a player earned **by name** all survive.

There is a seventh cost worth calling out on its own, because it is the cleanest illustration:

> `attunement` currently carries `tradition: "*"`, and **resolves no palette at all** — it is one
> of the two abilities holding the §C3 art ratchet red. A craft that belongs to everyone can be
> painted as no one. Restore the 32 ids and each one inherits its own tradition's palette for free.

**Your `sectFlavour` work is not wasted.** It is exactly the per-tradition layer the 32 inherited
entries need; it just attaches to 32 real entries instead of to one wildcard.

⚠️ Nine of the ten red gates go green when the ids come back. I have deliberately **not** papered
over them in the fixtures — a red gate naming a missing craft is the correct state until you
author the restore. The one fixture I did move (the branch-fork block) now *derives* its subject
from `branch_forks.json` rather than hardcoding one, so the next cull moves it instead of killing
the run.

---

## §2 — ⛔ TWENTY-SEVEN FILES WERE ON DISK AND IN NO MANIFEST

This is the larger find, and it is why your "0 dead ids remaining" verification and mine
disagreed. **Twelve ability files — 27 abilities — did not exist to the engine:**

```
attunement.json  body_capstone.json  body_gaps.json  body_movement.json  death_obscure.json
mind_bargain.json  mind_batch2.json  mind_conceal.json  mind_merged.json  mind_social.json
mind_strikes.json  physical_ranged.json
```

The entire Mind rewrite, the Body work, the ranged crafts, and `attunement.json` itself — the
keystone of the sense consolidation. `native_grants.json` has been pointing 21 traditions at an
`attunement` **the engine could not load**. I registered all twelve; Content CI went 76 → 34 and
the loaded catalogue went 324 → 351.

**Fifteen more are still unregistered, and I have not touched them because several are yours to
place rather than mine:**

```
[core]   rules/ability_distribution_target.json   rules/ability_rename_map.json
         rules/body_schools.json                  rules/death_domain.json
         rules/energy_costs.json                  rules/foothills.json
         rules/healing_intent.json                rules/mechanic_effects.json
         rules/mind_schools.json                  rules/nexuses.json
         rules/power_cosmology.json               rules/tempo.json
         rules/the_veil.json                      rules/traditions_v2.json
[valley] lore/the_three.md
```

⛔ **`mechanic_effects.json`, `healing_intent.json` and `tempo.json` are the SNG-499/500 content
layer.** I was one step from writing `resolveHeal` against `healing_intent.json` — a file the
engine cannot open. Nothing in SNG-500 can be built until these are registered.

**The lesson for both of us, and it is now SYSTEM_SPEC §42:** *verifying content against the
files on disk is not verification.* I made the same mistake an hour before I found yours — I
built a "live ability" set from the ability files and got a false result. The only honest check
is against the **loaded catalogue**, which is what `tests/headless_content.mjs` exists for.

---

## §3 — AND THE LOADER WAS THROWING AN AUTHORED FIELD AWAY (mine, fixed)

Registering the twelve surfaced an engine bug that had been eating your data silently.

`engine/state.js` merged every ability as `{ ...a, powerSystem: pack.powerSystem }` —
**unconditionally**. Thirteen registered packs declare no pack-level `powerSystem`, so **28
abilities loaded with their own authored `powerSystem` overwritten to `undefined`.** Nothing
threw. They simply resolved no palette, no physics phrase, and no substrate gate — and every
file-level check passed, because the *files* were correct.

This includes `companion_taught.json`, which is the real tail of the §8 bond bug I traced for you
earlier: the file was invisible, and once visible its crafts loaded without a power system.

Fixed to `powerSystem: pack.powerSystem || a.powerSystem` — the pack still wins where it declares
one, the ability's own value now only fills the gap. Gated as **CCODE-200** and mutation-tested
(revert the fix → gate goes red; restore → green). 0 abilities now load without one.

---

## §4 — THE RENAME NEVER REACHED `rules/` — 146 ids swept

Your map re-pointed the abilities and the native grants. It did not reach the rules layer.
I swept it: **146 stale ids across 14 rules files**, every target verified live before writing.

The one that mattered most: `encounter_frame_content.json` still said `the_kept_breath`, so
**your ward silently stopped denying finishes**. That gate is green again.

⚠️ **One thing for you to know about, because it will bite the next sweep too.** Ability ids and
region ids share one flat string space. `the_ascent` and `the_descent` are *both* a renamed craft
and a live region. `traditions.json` carries both meanings **in the same file** — `"region":
"the_ascent"` next to `"abilities": [... "ascent" ...]`.

My sweep crossed them in **six** files. The nanite-field gate caught the first within the minute;
the other five I only found because Erik asked whether I had pushed yet, and I had not. **The
reliable signal is the KEY, never the value** — `region` / `regionId` / `homeRegion` /
`startingRegion` always name a place. All 15 sites reverted, ability sites left fixed, and gated
as **CCODE-201** (mutation-tested: reintroduce one collision → 11 becomes 12 → red). SYSTEM_SPEC
§43.2.

⛔ **And that gate opened red on debt that predates it — four region ids nothing defines.** Not
mine and not the sweep's; they resolve by neither the map nor the de-article rule:

| region named | referenced by |
|---|---|
| `the_stillhold` | `economy.json`, `origins.json`, `traditions.json` |
| `the_cogitarium` | `economy.json`, `origins.json`, `traditions.json` |
| `the_unspooling` | `economy.json`, `origins.json`, `traditions.json` |
| `the_crossing` | `economy.json` |
| `the_foothills` | `traditions.json` |

⚠️ `regions.json` defines `unspooling` — so `the_unspooling` is the de-article pass landing on the
**region** side and only half-finishing. The other four have no live counterpart under either
spelling. **A people whose `homeRegion` does not resolve has no home.** Ratcheted at 11 so it can
only shrink.

I deliberately did **not** sweep the sense-cull references (the 88 in the table above). Re-pointing
a fork or a recipe at `attunement` is a design decision, not a mechanical fix — and per §1 they
are about to be unnecessary.

---

## §5 — THE TEN RED GATES

**Yours — the sense cull (7). All go green when the 32 ids return per §1.**

1. `every branch_forks key names an ability that exists` — orphan: `prism_sight`. *(New gate. A
   fork naming a craft nobody can learn is unreachable data, and nothing was checking for it.)*
2. `SNG-101b` ×3 — the ashwarden spine names `deathsense`.
3. `SNG-131 e2e` ×2 — `seraphic.innatePrecursor = ["address_sense"]`, which is not a precursor
   craft any more. `abyssal`'s `latticespeak` is fine.
4. `chronicle mentions boosted use counts` — the chronicle names a craft the catalogue can no
   longer resolve, so no use-boost is applied.

**Yours — independent of the cull (3).**

5. ⛔ **Four orphan function verbs** in the newly-visible Mind/Body content. They render as **grey
   badges on the wheel and cannot be filtered by function**, which is the feature Erik asked for:

   | verb | uses | e.g. |
   |---|---|---|
   | `bargain` | 11 | `mind_bargain.json:known_price`, `reach_demonic_angelic.json:offered_price` |
   | `soothe` | 3 | `mind_social.json:quiet_the_room`, `reach_death_life.json:palework` |
   | `persuade` | 3 | `mind_merged.json:case_closed`, `mind_batch2.json:names_of_power` |
   | `provoke` | 1 | `mind_social.json:force_the_move` |

   Families available: `HARM RESTORE PROTECT KNOW SHAPE INFLUENCE MOVE SUSTAIN`.

6. `193b §2: the authored affinity set is 19 abilities` — now 13. Six `schoolAffinity` entries
   were lost in the cull. I have **not** re-baselined the census, because per §1 the number
   should return. If you decide otherwise, tell me and I will move the ratchet to the true count
   with a note naming why.

7. `435 §C3` palette ratchet, red at 11 uncovered (allows 9). Two abilities, both one-line fixes:
   - `attunement` — `tradition: "*"`. Resolves with §1.
   - `sling_and_stone` — `tradition: "valley_craft"`, but `valley_craft` is a **power system**,
     not a people. This is the exact §C3 error you swept; one ability was missed. Its five
     siblings in `physical_ranged.json` carry `marcher`/`somatic` and resolve fine.

---

## §6 — WHAT I NEED, IN ORDER

1. **Register the 15 files in §2** — or move the design docs out of `rules/` if they are not
   rules. `mechanic_effects.json`, `healing_intent.json` and `tempo.json` are blocking SNG-500.
2. **The 32 sense ids back, sharing one stat block** (§1). `sectFlavour` carries what each
   tradition perceives, attached to 32 entries rather than one wildcard.
3. **Four verbs into `function_vocabulary.json`** with a family each (§5.5).
4. **`sling_and_stone`'s tradition field** (§5.7).

Items 3 and 4 are small enough that I will take them if you would rather I did — say the word and
name the families. Items 1 and 2 are yours.

---

## §7 — YOUR TWO §10 QUESTIONS, MEASURED

You asked why `EVASION` and `CRIT` are authorable but appear nowhere, and whether typed warding
is effectively dead. Both now have numbers.

**CRIT is authored on nothing. EVASION on seven.** Across 351 loaded abilities (342 with a
`mechanic` block) and **961 rank entries**:

| field | on the `mechanic` block | on a rank entry |
|---|---|---|
| `crit` | **0** / 342 | 0 / 961 |
| `evasion` | 7 / 342 | 0 / 961 |
| `damageType` | 26 / 342 | 0 / 961 |
| `wardTypes` | **0** / 342 | 0 / 961 |

`critFor` (`craftmechanics.js:333`) and `evasionOf` (`skill_battle.js:259`) are **readers with
almost no writer** — the mirror image of the class we have been chasing all week. Not broken;
never fed.

**⛔ On typed warding — yes, it is dead, and not for the reason you named.** Your question assumed
the gap is crafts not declaring a `damageType`. It is not: 26 do. **Typed warding is an ITEM
system, not a craft one** — `gm.js` instructs the model to emit `damageType` on a bound weapon and
`wardTypes` on a ward. Measured on both sides:

- **37 authored items: 0 carry `damageType`, 0 carry `wardTypes`.**
- **88 items across the 15 real saves — 1,788 turns of play: 0 and 0.**

So the comparison has never had two sides to compare. The model has been told it may emit these
and has not once done so, and no authored item seeds the pattern for it to imitate. **Seeding two
or three authored items with a `damageType` and one ward with a `wardTypes` is probably the whole
fix** — the model copies what it sees in the catalogue far more reliably than what it is told in
a schema. If that lands, I will gate it so the count can only go up.

⚠️ Note this is exactly the shape of your §5 lesson seen from the third side: not *content at an
address nothing reads*, and not *an address changed out from under its readers*, but **a reader
wired to an address no one was ever asked to write.**

---

I am picking SNG-500 §1 (`resolveHeal`) back up as soon as `healing_intent.json` loads.

— CCode
