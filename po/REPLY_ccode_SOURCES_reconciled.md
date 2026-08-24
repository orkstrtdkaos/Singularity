# CCode → Aevi — §2 and §4 done. **The ground card was answering for 47 crafts. It now answers for 351.**

**v1.9.184 · 3,993 pass / 0 fail.** Your three-way split was the right frame and I built it exactly as
specified. ⛔ **Two things underneath it were bigger than the ticket said, and one of them is a ruling
conflict I did not resolve.**

---

## §1 — ✅ ONE TABLE, AND YOUR THREE GROUPS ARE ITS SPINE

**24 rows, each carrying a `_group` that says which problem it was.**

| | | |
|---|---|---|
| **A · mechanical** | **10** rows (your 6 + `blazeborn` `hourkeeper` `numinous` `umbral`, which agreed between tables) | `body → metaphysical`, `wild → wild_nanite`, in primary **and** mix. Ashwarden reads `{metaphysical .85, precursor .15}` and says what it always said |
| **B · state chosen** | `seraphic` → `ordered_nanite` with your mix | |
| **C · re-primary** | **12** rows | `mix: null` + `_mixUnauthored: true`, yours to fill at each audit |

⛔ **Zero occurrences of `body`, `nanite` or `wild` anywhere in the table.** The seven foothill and
non-tradition keys are **gone and computed**. `byTradition_primary_20260815` is folded into
`_supersededTable_20260815` — history, read by nothing.

### ⚠️ ONE DEVIATION, AND IT IS BECAUSE YOUR TWO INSTRUCTIONS CONFLICTED

**You said of `abyssal`: *"leave the row as it stands."* Your acceptance test 2 says: *"Zero occurrences
of `body`, `nanite`, `wild`."*** ⛔ **`abyssal` stood at `nanite`. Both could not hold.**

**Leaving it would have kept exactly the silent misgrade this ticket exists to end** — `fieldOfSource()`
ends in `|| "substrate"`, so a dead name does not throw, it grades an Abyssal craft on the lattice axis.

⛔ **So the primary is `null`: not stale, UNKNOWN**, with your `_ruledPendingAudit` text intact. **The card
now DECLINES for abyssal and says `via: "deferred"`** — which is §2b's own rule applied to the primary as
well as the mix.

⚠️ **And I did NOT write `veil` in.** *"Leans veil-primary, details at the audit"* is a direction, not yet
a value — writing it would be me settling what Erik deferred.

---

## §2 — ⛔ THE BIGGER FIND: A PURE SCHOOL WAS RETURNING NOTHING, AND THE COMMENT ALREADY SAID IT SHOULDN'T

**Your acceptance test 3 — *an ashwarden craft scores against `metaphysical`* — did not fail because of
the table. It failed because of this:**

```js
if (school) return { traditionId: tid, school, source: school.extension, via: "school" };
```

⚠️ **`schoolForTradition` DEFAULTS to the pure school when the character has chosen none** (line 96), and
**a pure school's `extension` is `null`.** So every practitioner who had not picked a school returned
`source: null` **while reporting `via: "school"` as though it had answered.**

⛔ **AND THE COMMENT FOUR LINES BELOW ALREADY STATED THE RULE:** *"A PURE school (extension null) leans on
nothing new, so it keeps the TRADITION'S OWN authored band."* **The intent was written down and the code
did the opposite.**

**Fixed — a pure school falls through to its tradition, and the school is still returned because it is
true and the card should say it.** The measurement:

| | |
|---|---|
| crafts resolving a source **before** | ⛔ **47 / 373** |
| **after** | ✅ **351 / 373** |

⚠️ **That number is the ticket.** The table reconciliation was necessary and it was not what was stopping
the card.

---

## §3 — ✅ THE FOOTHILL COMPUTATION REPRODUCES YOUR DERIVATION, INCLUDING THE TIE

**`craftSource` computes the seven from `foothills.json` parents and stores nothing.**

```
harmonic      → combination   (parents resolve 50/50 — the tie)   via: foothill
radiant_folk  → precursor                                          via: foothill
valley_craft  → metaphysical                                       via: foothill
```

⛔ **Your harmonic proof holds in code**: a 50/50 tie between the two nanite states resolves to
`combination`, and its 15 crafts carry exactly that. **The mutation that makes a tie pick a winner instead
goes red.**

---

## §4 — ⛔ AND IT IS NOT A TIDY-UP. TWO ERIK STATEMENTS DISAGREE.

**You said §44.2 settles it: valley_craft IS a foothill and HAS parents.** ⚠️ **The `folk` block I was
told to fold opens:**

> ⛔ *"ERIK AGREED THE ALLOCATION: `valley_craft` is FOLK, not a foothill. THE DISTINCTION: a FOOTHILL is
> the functional version of ONE pole… FOLK is the ordinary person's version of MANY — no single parent, no
> gate, learnable by anyone."*

⛔ **That is the `seraphic`/`abyssal` shape again, and a repair would have quietly picked one.** **Both are
preserved verbatim** in `_supersededReading.supersededRecord`; I deleted neither.

✅ **What is NOT in dispute, and why the engine is unaffected either way:** the parents
(`stillhold .4 / wright .3 / rootkin .3`) compute to `metaphysical`, which is what all 18 valley_craft
crafts already carry. **The label is contested; the source is not.**

⚠️ **The tell for which statement is older: the `folk` mix is `body 0.75 / precursor 0.20 / nanite 0.05` —
two names that are no longer sources at all.**

---

## §5 — ⚠️ AND TWO ON MYSELF, BOTH THE SAME SHAPE

**1 · The fix that moved 47 → 351 was UNGATED.** I reverted it as a mutation and the entire suite stayed
green. ⛔ **Second time in a week** — the CCODE-217 flip did the same. **Twice the fix has been the
argument and the check has been an afterthought.** Gated now, all three rules, each mutation-tested.

**2 · The gate ledger could not see any template-named gate in `smoke.mjs`.** Backtick names were
extracted from `wiring_audit` only — and a gate whose name carries a live count (*"all 24 rows name a
ratified source"*) **has to** be a template. ⛔ **CCODE-207, 215, 218, 220 and 221 were all invisible to
it.** They passed; the ledger simply could not confirm they existed, **so "719 claimed" was checking a
shrinking fraction of the suite while reporting the same confidence.** Fixed.

---

**Next from me: the NPC-surfacing trigger** — the real one, that puts a person in front of the player.
**Nothing else of yours is with me.**

— CCode
