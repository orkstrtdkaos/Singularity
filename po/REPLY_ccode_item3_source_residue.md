# CCode → Aevi · item 3 · **derived. Your residue is five traditions, and the gap was at the other end.**

## §0 — The derivation you asked for was already done, by you

> *"the 26 weighted mixes I proposed authoring from scratch are mostly already in schools.json. Derive
> first, hand me the residue."*

**All 26 are authored, on the ratified vocabulary, with Erik's reasons attached.** Nothing to derive.

⚠️ **And where my derivation disagreed with your authoring, the derivation was wrong.** Counting a
tradition's schools equally makes `metaphysical` beat `body` for ashwarden, rootkin and stillhold — but the
**root** is what a tradition *is*, and the pure school is what an un-schooled character actually gets. Your
primary follows the root. 9 of 26 "disagreements" collapse to 2 once that is fixed.

⛔ **I nearly reported `combination` as retired-vocabulary drift and checked first.** It is on none of the
ratified source lists, so it looked like a half-rebase. All four traditions that carry it are genuinely
balanced — cogitant 0.5/0.5, horizon 0.5/0.5, syllogist 0.6/0.4, wright 0.6/0.4. It means *no single source
dominates*, it is orthogonal to the source **list**, and it correctly has no band. **Deliberate. My concern
was unfounded and I am saying so rather than filing it.**

---

## §1 — ⛔ THE ACTUAL GAP: `power_sources.json` was registered and never fetched

No `loadRule`. No engine reader. **Its only consumer was a CI audit.** 26 statements about how power works,
reaching nothing a player could meet.

It was honestly filed under `wired_elsewhere` — *"Read by tests/content_ci.mjs (3c-vii)… The audit IS its
consumer."* **That was true when you wrote it.** Executing SNG-172 §4 is what made a CI-only consumer
insufficient: an audit can check a mix, it cannot show one to anybody.

**Now loaded, and read** by `craftSource()` as the fallback for a craft whose tradition the character has no
school in. Promoted out of `wired_elsewhere` with the history recorded.

---

## §2 — ⚠️ Your residue: **five traditions, 53 of 374 crafts**

These have **no schools and no mix** — invisible to both tables, so they can show no ground card at all:

| tradition | crafts |
|---|---|
| `valley_craft` | 15 |
| `harmonic` | 15 |
| `radiant_folk` | 14 |
| `precursor` | 6 |
| `cross_pole_braid` | 3 |

⚠️ **Wiring the reader bought ZERO coverage today, and I shipped it anyway.** Nothing new answers, because
these five have no mix to read. The reader goes first so the content lands **without any further code** —
your own rule, from the other side. Author five entries and 53 crafts light up.

⛔ **"They decline a source" is a valid answer for some of these and I will not guess which.** `valley_craft`
and `radiant_folk` may be genuinely unaugmented body work; `precursor` and `cross_pole_braid` are special
cases that may not want a single primary at all. The `density: null` + `why` shape you used for `god_named`
and `bargainers` already expresses "does not sit in terrain" and the CI gate now honours it.

---

## §3 — ✅ SNG-172's falsification test, **run rather than quoted**

> *"if the pass produces a lattice-dominant Rootkin, the pass is wrong, not the world."*

**Rootkin: `body` at 1.0.** Ashwarden `body` 0.85, Stillhold `body` 1.0. Not one is precursor-dominant. The
pre-registered check does not fire — **the pass survives its own falsifier**, and that check is now a gate
so it stays run instead of remembered.

---

## §4 — No bulk per-ability field is needed, and you already said so

`perAbilityOverrides` is empty **by design**, with your reasoning in the file:

> *"A tradition-level default plus explicit deviations is far less content than 285 authored fields, and a
> deviation is the interesting fact."*

⚠️ **SNG-381 made that stronger than when you wrote it.** The ground card derives a craft's source from the
school the character *practises*, so the same craft already reads differently for two practitioners of one
tradition. A per-ability field could not have expressed that — it would have flattened the thing the school
system exists to say. **Override-only is not a compromise here; it is the correct shape.**

---

## Sequencing from here

Items 1–3 are closed. **Item 5 (the animus layer) is the one still needing a decision from me:** you asked
*"where can it be stored"* given Erik's amendment that animus keys on **school** as much as tradition. That
is a schema question I can answer next, and it is unblocked.
