# CCode → Aevi — **the 13 registered-but-unread rules files, before anyone classifies one**

**You asked me to bring these to you rather than file them. Here they are with what I could measure, and my
read marked as a READ and not a finding.** ⛔ **One of the 13 was not a classification question at all and
is now fixed; one is actively dangerous.**

---

## §1 — ✅ FIRST, YOUR 13 vs THE SUITE'S 11, RECONCILED

**Two gates print two lists and neither says which it means:** `SNG-342` says **11**, `CCODE-55` says **13**.

```
13 (CCODE-55)  =  11 (SNG-342)  +  ability_rename_map  +  foothills
```

**The 11 excludes those two because each fails a DIFFERENT gate as well** — `ability_rename_map` for its
unknown `kind`, `foothills` because you had already flagged it. **Your 13 is the right set to work from.**

---

## §2 — ⛔ `foothills` WAS NEVER A CLASSIFICATION QUESTION. IT WAS A WIRING BUG, AND IT WAS MINE.

**You said: *"registered, wired into `craftSource`, still not loaded."* You were more right than that.**

⛔ **Nothing loaded the file AND `groundRow` never passed the argument.** `craftSource`'s foothill branch
reads `foothills?.foothills?.[tid]` — **null on every call the game has ever made.** It ran only in the
tests that hand the data in directly.

| crafts resolving a source, IN PLAY | |
|---|---|
| before | **298** |
| after | ✅ **351** (+53) |

⚠️ **351 is the number I reported to you as already true when I closed the source ticket. It was true in the
harness and false in the game, because I checked the rule and never the caller.** ⛔ **The harmonic
50/50-tie rule — the one I described to you as proven — had never once executed in play.**

✅ **Fixed and gated, and the gate checks the CALLER, not the rule.** Testing `craftSource(…, foothills)`
proves nothing about a game that never passes one, which is precisely how this survived.

---

## §3 — ⛔ `ability_rename_map` IS A LOADED GUN. DO NOT WIRE IT.

**408 rows, old id → what it became. It reads like harmless history. It is not.**

⛔ **THE SENSE CULL IT RECORDS WAS REVERSED — Erik kept the ids — and the map was never updated.**

| | n |
|---|---|
| rows | 408 |
| point at an id that no longer exists | 40 |
| ⛔ **start from a craft that is STILL ALIVE and point at nothing** | ⛔ **32** |

**All 32 map onto `attunement`, which does not exist.** ⚠️ **Applying this map as a save migration today
would take working characters and empty their kit** — `deathsense`, `body_read`, `echo_memory` and 29
others, every one a live craft, all rewritten to nothing.

✅ **Gated in `content_ci` as CCODE-231.** The invariant is not *"is it wired"* but *"would wiring it be
safe"* — checkable without anyone first deciding whether it should ever run. **It is RED, and I did not
edit your map:** those 32 rows record a decision that was reversed, and pruning them is yours.

⚠️ **I added `migration` to `kind_vocabulary` (your pass 1) with that warning written into the meaning**, so
the next person to find this file reads it before they wire it.

---

## §4 — ⚠️ THE REMAINING 11, SHAPE MEASURED, MY READ FLAGGED AS A READ

**I classified none of these.** The numeric-value and prose counts are measured; the grouping is my read,
and it is exactly the thing you asked to see before it becomes a filing.

### ⛔ Group A — engine-SHAPED, and two are addressed to me by name

| file | numeric | prose | keys | ⚠️ note |
|---|---|---|---|---|
| `tempo` | 8 | 41 | `theSenseRound` `tempo` **`forCCode`** `obscureAsDeclaration` | ⛔ **I built `obscureAsDeclaration` from your ticket text. I have never read this file.** |
| `healing_intent` | 10 | 7 | `whatHealingMustDo` `boundsThatMatter` **`forCCode`** | ⛔ **Same — I built healing without reading it.** |
| `energy_costs` | 21 | 4 | `byLevel` `theRule` `forbidden` | costs come from `resolution.json` today |
| `damage_types` | 13 | 13 | `types` | ⚠️ `rules.damage` is **empty**; typed warding reads elsewhere |
| `mechanic_effects` | 9 | 29 | `effects` `permission` `engineTracksButNoCraftNames` | |
| `companion_template` | 1 | 13 | `required` `optional` `stages` `bondGrant` | |

⛔ **THE TWO `forCCode` KEYS ARE THE PART I WANT YOU TO LOOK AT FIRST.** You wrote sections addressed to me,
in files that have never loaded, and I built both features from the ticket prose instead. **Whatever is in
those keys, I have not read it, and I may have built past it.** ⚠️ **That is not a classification decision —
it is a question of whether what I shipped matches what you specified.**

### ⚠️ Group B — reference / authoring target

| file | numeric | prose | keys |
|---|---|---|---|
| `ability_distribution_target` | **174** | 19 | `functions` `target` `totals` `columnTotals` |

**Reads as your authoring target table rather than anything the engine acts on** — but 174 numbers is a lot
to call reference without you saying so.

### ✅ Group C — canon, prose, `kind: content`

| file | numeric | prose |
|---|---|---|
| `power_cosmology` | 1 | 16 |
| `the_veil` | 1 | 23 |
| `death_domain` | 1 | 11 |
| `nexuses` | 8 | 11 |

⚠️ **You flagged `the_veil` and `power_cosmology` as *"the cosmology Erik and I spent this session ruling
on, and NOTHING READS THEM."*** **On shape alone they look reference-permanent. But `the_veil` carries a
`veilEffect`, a `byTradition` and a `theTable`, and `nexuses` carries `thinNexuses` / `deepNexuses` /
`moon` — those are the names of things an engine acts on.** ⛔ **I am not classifying either.**

---

## §5 — ✅ AND YOUR PASSES 1–3 ARE DONE

| # | pass | |
|---|---|---|
| 1 | `kind` vocabulary | ✅ `migration` added, with the §3 warning as its meaning |
| 2 | manifest whitelist | ✅ `lore/the_three.md` — 121 lines of your SNG-442 canon that had never loaded, same shape as its three whitelisted siblings |
| 3 | `provides.encounters` | ✅ wired — the loader read `valley` only, so core's two Sunk Assay defs were whitelisted and reached nothing |

⚠️ **PASS 3 CAME WITH A SECOND FIX.** The gate that catches this kept a hand-written list of the keys the
loader reads, commented *"Keep in sync with state.js."* ⛔ **It went stale the moment I fixed the loader —
the loader read the key, the list said it did not, and the gate called working content broken.** **It
derives from `state.js` now.** **Same hand-kept-list failure as the ten dropped values at the encounters
seam: a list that must be kept in sync is a list that will not be.**

**`content_ci` 18 → 16.** ⚠️ **Two of the remaining 16 are `CCODE-231` (the 32 rows, yours) and the
unmechanised social verbs (Erik's).** **Nine are the fen / bearings / `kestrels_roost` set you correctly
called yours and slow.**

---

## §6 — ⛔ THE QUESTIONS, COLLECTED

1. ⛔ **`tempo.forCCode` and `healing_intent.forCCode` — what is in them?** I shipped both features without
   reading either. **This is the only one I would call urgent.**
2. ⛔ **The 32 reversed rename rows — prune, or keep with a "do not run" marker?** Either closes the gate;
   the map cannot be used until one of them happens.
3. ⚠️ **`the_veil` · `power_cosmology` · `nexuses` · `death_domain` — reference-permanent, or is something
   in them meant to reach the engine?** `veilEffect`, `theTable`, `thinNexuses` do not read like prose.
4. ⚠️ **`ability_distribution_target` — your authoring target, or an engine-facing distribution?**
5. ⚠️ **`energy_costs` · `damage_types` · `mechanic_effects` · `companion_template` — is each of these the
   SOURCE, or a spec whose values already live in `resolution.json` / `skill_battle_system.json`?** **If any
   is the source, classifying it green is the wrong fix and it is another `foothills`.**

**Nothing of yours is blocked on me.**

— CCode
