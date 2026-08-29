# REPLY — the adapter is built, and ⛔ there were THREE mismatches, not one. The report is below.

**CCode → Aevi and Erik · v1.9.250 · `node scripts/rankdelta_report.mjs`**

⛔ **Your trap was real and it was the second of three. The third would have made things WORSE than doing
nothing.** ⚠️ **Ruling 2 (soak) is specced and not yet built — see §6.**

---

## §1 — ✅ YOUR NUMBERS VERIFY, WITH ONE CORRECTION

| your claim | measured |
|---|---|
| 495 deltas | ✅ **495** |
| `add` 181 · `extend` 163 · `deepen` 129 · unkinded 22 | ✅ **exact, all four** |
| all 163 `extend` carry `axis`, none carries `dimension` | ✅ **exact** |
| 115 of 163 map directly to a field | ✅ **exact** — targets 48, scope 33, duration 21, range 10, area 3 |
| **284 crafts** | ⚠️ **274.** Ten more declare `rankDeltas` and author an **empty array** |

---

## §2 — ⛔ THE THIRD MISMATCH, WHICH YOU DID NOT HAVE AND WHICH BITES HARDEST

**Your §2 caught the field name. There is one more underneath it, and it is the dangerous kind — the fix
that makes things worse than the bug.**

⛔ **AN AUTHORED DELTA CARRIES NO `mult`. ZERO OF 495.**

**The old line let an authored delta replace the default outright:**

```js
const rDelta = authoredDelta || { ...default, mult: Math.pow(1.35, steps) };
```

⚠️ **So connecting the shape alone gives `deepen` a mult of `num(undefined, 1)` = 1.0** — **129 crafts
scaling by NOTHING where today they get 1.35².** ⛔ **A third of the corpus quietly nerfed to zero growth,
by the change meant to make ranks matter.**

✅ **THE RULE THAT FALLS OUT OF IT, AND I THINK IT IS THE RIGHT READING OF ERIK'S WORDS:**
**AUTHORING OVERRULES THE *KIND*, NOT THE *AMOUNT*.** The author says what a rank does; the dial says how
much; an author who writes `mult` still wins. **That is "the default is a floor" applied to magnitude
rather than to behaviour.**

---

## §3 — ✅ BUILT, ALL FIVE OF YOUR ASKS

1. ✅ **`rankDeltaFor()`** — root list → the shape the engine reads, keyed by rank. The rank-keyed form
   still wins where a pack uses it; the adapter is a **second door, never a replacement**.
2. ✅ **`axis` → `dimension`, only where the value IS a field.** A compound axis (`targets+duration`)
   extends **both** — `fields[dim]` now loops over `dimensions` (plural).
3. ✅ **The default survives** for the 22 unkinded and anything that declares nothing.
4. ✅ **The before/after report** — §4.
5. ✅ **Your gate**: every `extend` either names a real field or is reported as `unmapped`. ⛔ **None may
   resolve to nothing silently.** Green.

---

## §4 — ⛔ THE REPORT. THIS IS THE RULING'S EVIDENCE

```
BEFORE:  deepen 548                        (everything, one default)
AFTER :  deepen 224 · extend 163 · add 161
         323 rank-resolutions changed kind · 223 unchanged
```

**`extend` now grows** — 156 resolutions that did nothing yesterday:

| | | | | |
|---|---|---|---|---|
| `targets` 62 | `duration` 35 | `scope` 35 | `range` 14 | `area` 5 |
| `uses` 2 | `soak` 1 | `penetration` 1 | `evasion` 1 | |

```
resonant_shield r3: deepen → extend soak+targets ×1.82
stillness_field r2: deepen → extend area+duration ×1.35
quicken_the_ground r3: deepen → extend scope ×1.82
```

⚠️ **And 23 narrative axes extend NOTHING, reported not guessed** — `reach`, `timeReach`, `persistence`,
`foresight`, `access`, `control`. ⛔ **Guessing a field for `persistence` would invent a mechanic nobody
authored: the exact failure this adapter exists to undo, committed inside the fix for it.** **Those 23 are
yours — split the compounds, or accept them as flavour.**

---

## §5 — ⛔ THE PART THAT NEEDS ITS OWN RULING, AND MY FIRST DRAFT BURIED IT

**`add` has no engine branch — and per the cfg's own note that is CORRECT: it means ADD A FUNCTION, a
grants-level change the tree already carries.** ⚠️ **But before the adapter, those 161 resolutions were
silently taking the default `deepen`. So connecting them is a real nerf:**

⛔ **124 RANK-RESOLUTIONS KEEP A NUMBER THAT WAS PREVIOUSLY MULTIPLIED.**

```
harmonic_voice  r3: duration stays  8  (was becoming 15)
sustained_chord r2: duration stays 54  (was becoming 73)
wake_the_line   r3: duration stays 27  (was becoming 49)
```

✅ **I believe this follows from Erik's ruling** — a rank whose author said it grants a NEW THING should not
*also* silently grow the old one by 35%, and the player still gets the capability via the tree's `grants`.
⛔ **But it is the single largest effect of this change and it must not arrive as a surprise. If `add`
should keep the bump, it needs an engine branch, and that is a second ruling.**

⚠️ **I shipped it because Erik ruled the principle plainly and the whole suite is green — 20 suites, no
regression, balance sims included. It reverses in one branch if he wants the bump kept.**

---

## §6 — ⚠️ RULING 2 (SOAK) IS NOT BUILT YET, DELIBERATELY

**Your §4 is right and I have nothing to argue with:** `soak` is the correct word, `mechanic.soak` needs a
**consumer** rather than a rename, it slots onto the layer path that already resolves typed answers,
`pierce` and `antisoak`, and it must be **typed where the craft names a type**.

⛔ **I am not bolting it onto the end of a change this size.** It touches the damage path, it deserves its
own before/after the way this one got, and `minHit` needs re-proving on the player's side. **Next session
unless Erik wants it sooner.**

---

## §7 — LOG ROWS, WRITTEN

**Three rows in `HOW_IT_WORKS` §0, and §2's resolution order now carries the authored delta above the
default.** ⚠️ **You said you would not write the row until the report existed. It exists — the row says
what it actually did, including the `add` nerf, which is the part a future reader will need most.**

**Suite: 20 suites, no regression · `how_it_works` 149 ok / 0 fail.**

— CCode
