# CCode → Aevi & Erik — R25 and R27 are built · 2026-09-02

**Built:** R27 (conditioned migration), R25a/b/c (three capacity scales). 27 suites, 24 green / 3 red —
the same three as baseline. 514 assertions in `how_it_works`, §47 is 26 new gates.

---

## §1 — ✅ R27 · `soma` migrates by rank, and the `+` form is gone

`to` now takes three forms. `"string"` (371 entries, untouched), `{byRank: …}`, `{bySect: …, default: …}`.

| held at | receives | measured |
|---|---|---|
| rank 1 | `second_wind` r1 | ✅ |
| rank 2 | `second_wind` r2 | ✅ |
| rank 3 | `second_wind` r2 **+** `perfect_motion` r1 | ✅ |

⚠️ **The resulting RANKS are an inference and I put them in the content, not the engine** — a soma-3
holder finished second_wind's two ranks and is beginning perfect_motion. That is a reading of the split
axis, not a ruling. **It is in `ability_rename_map.json` where you can see and change it**; the engine
reads it and does not decide it.

⛔ **All-or-nothing:** if any named target is missing from the catalogue the whole entry is skipped. A
half-migrated split is worse than an unmigrated one because it looks finished.

✅ **The original entry survives** — `uses`, provenance and every other accumulated field ride along —
and both halves are stamped `migratedFrom: "soma"`, so nobody has to guess later whether the player chose
it or inherited it.

⬜ **`bySect` is built and unused** (zero entries today). One decision is mine and I want it seen: a
holder has THREE sects, so I resolve **primary → secondary → tertiary → `default`**. Nearest-to-the-player
wins. **Not ruled — say the word if it is wrong.**

---

## §2 — ✅ R25a/b/c · the three scales

| scale | rule | built |
|---|---|---|
| party | rapport 1·4·7·10 → 1–4; **presence 10 → 5th, presence 14 → 6th**; cap 6 | ✅ |
| delegation | `floor(level/10)` **+1 at rapport 14** | ✅ |
| rapport 18 / 20 | **states**, never counts | ✅ `serviceStates()` |

⛔ **The three `standingOrService` BLOCKED placeholders are gone** — no milestone in the ladder is still
a written-down promise waiting on holdings.

**Enforcement follows the company precedent exactly:** refuse a NEW delegate, never drop an existing one,
and say why. **Capacity counts PEOPLE, not charges** — Edvar Crane holds two and is one delegate.

**Where 18 and 20 land:** into `assignmentsForGM`, as prose, beside the work they govern. ⛔ **They add
nothing to any number** and the gate proves it — rapport 20 gives exactly the same two counts as rapport
14. The module comment stands.

---

## §3 — ⛔ R25a EXPOSED A LATENT DEFECT, AND IT WAS ONE KEY-ORDER AWAY FROM BITING

`milestoneEffects` broke ties with `Number(at) > prev.at` — the RANK. That was faithful while exactly one
sub owned each effect kind. **R25a made presence a second writer of `companyCapacity`, and rapport 10 and
presence 10 tie at 10.**

⚠️ **Measured, not suspected: reversing the order of `subs` in the ladder file turned a rapport-10 /
presence-10 character from 5 places into 4.** The winner was falling out of JSON key order.

✅ **Fixed to compare the effect's own magnitude**, which is what "the highest reached wins" always meant.
`harmRung` is unchanged (1 at agility 7, 2 at 14) — same answer, now for the stated reason instead of by
coincidence. **The gate asserts order-independence across six rank pairs.**

⚠️ **And a second shape change:** a rank may now carry an ARRAY of effects. presence 14 needed it —
it already held `unstewardedFloor` and R25a gave it the sixth place. The old shape would have silently
replaced the first, and a milestone the player had already earned would have stopped working.

---

## §4 — ⚠️ THE SILAS VALIDATION IS OFF BY ONE, AND THE DESIGN IS BETTER THAN THE CLAIM

> R25a: *"Validated against Silas: L30, rapport 7, presence 9, 4 in company — **exactly at the rapport
> ceiling** with the 5th just out of reach."*

**Measured.** rapport 7 grants **3** places — the authored ladder puts the fourth at rapport 10. His four
are Pell, Calvar, Siol and Veth Ondra, and none of them is Silas.

⛔ **He is ONE OVER his rapport ceiling, not at it.** He has been over since he recruited the fourth;
nothing enforced the cap, which is exactly the SNG-390 finding.

✅ **The other half of the sentence is exactly right, and it is the stronger argument:** at presence 9 the
fifth place is ONE presence rank away. **And R25a legitimises the fourth companion he already has** —
presence 10 takes his capacity 3 → 5. The ruling does not merely fit him, it *repairs* him. That is a
better case for the design than the one the ruling makes, and it survives the correction.

---

## §5 — ✅ R25 STEP 5, THE QUESTION YOU PUT TO ME: the folded layer EXISTS. Half of what Erik named does not.

> *"Does the folded-member layer already carry the intimate-scale bolster/area effects?"*

**It is live and wired end to end** — `encounters.js:186` feeds `bringForward`'s `folded` into
`battleRound`, and two mechanics read it:

| | |
|---|---|
| ✅ folded allies **add damage** | `perFoldedAlly`, √K-compressed, **multiplied by cohesion** |
| ✅ folded allies **absorb losses** | a pool proportional to their own health |

➡️ **So a fifth and sixth place are NOT hollow.** The milestone can ship.

⛔ **BUT THE TWO THINGS ERIK NAMED BY NAME ARE THE TWO THAT ARE MISSING.** Comment-stripped scan of
`skill_battle.js`:

| | |
|---|---|
| `contributions` read | ⚠️ **exactly once** — and only for `"HARM"` |
| `PROTECT` | ⛔ **0 occurrences** |
| area / splash | ⛔ **0 occurrences** |

➡️ **A warder folded into slot 5 contributes exactly what a bystander does.** Protection coverage exists
only at BAND scale (`bandGaps` → `lossMultiplier`) — **which is the scale Erik said was too coarse.**

⬜ **This does not block R25a and I have shipped it.** But *"a use for the area effects and
bolster/protection that is a bit more intimate than band or unit level"* is unbuilt, and the honest
version of the gap is narrower and more fixable than "none of that exists": **one filter reads one
function family, and the second family is already in the vocabulary.**

---

## §6 — ⬜ NEXT: holdings, which your celebrations doc unblocked

§5 of `DESIGN_celebrations.md` answers the placement question I refused to guess at — **both surfaces, and
the offer is a question while the acceptance is the celebration.** That is the whole thing I was waiting
on. Building it next.
