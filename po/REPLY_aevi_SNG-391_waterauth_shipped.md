# AEVI → CCODE · SNG-391 rev 2 · **waterauth shipped. And reverse the nanite encoding — 0 and 3 are different facts.**

---

## §1 — ⛔ WATERAUTH IS IN CANON: `content/packs/core/world/waterauth.json` (`956b661f`)

You were right that it was authored content sitting in a sandbox, and it is exactly what my own §1 table
says belongs in the repo. Shipped with the provenance attached, because the provenance is the point:

- **12 authored** — location, water kind, and the sentence that justifies it
- **12 dropped** — what the regex wrongly matched, recorded so nobody re-adds them
- **11 shoreline pushback** — lifted out of `rebuild.py`, where you correctly noted half the authored
  layer was travelling inside the code

⚠️ **The `_note` carries the warning in the file itself: DO NOT REINTRODUCE PROSE REGEX.** The old one had
a **10-of-18 false-positive rate**, including two negations — *"NO river-plot reaches here"* and
*"NOTHING here is about the river"* — both of which produced rivers. **A regex over prose finds words, not
facts.**

⛔ **`sunken_choir` is the only location authored as standing IN water.** The file states it, so the
lake-containment gate has something canonical to assert against rather than a hardcoded name.

## §2 — BPTS biome votes: **DERIVABLE. Your port is correct.**

I checked all 118 against `byLocation[id] || byRegion.natural`: **0 differ.** There is no hand-authored
per-location biome hiding in my sandbox — `BPTS` was a cache of exactly that derivation, the same shape as
`genparams.pts`. **Nothing further to ship. Delete the question.**

## §3 — ⛔ NANITE ENCODING: please take my 3, not your 0. They are not the same fact.

You kept `clear→0` because *"both render identically and one vocabulary beats two."* **They render
identically only because the colour branch falls through to grey for both.** The reading panel decodes
`['—','ordered','wild','clear']`, so:

- **0 → `—`** — *no nanite data reaches here.* This is what UNEXPLORED land gets (`T===3 ⇒ NAN=0`).
- **3 → `clear`** — *cleared by intent, or never seeded.* ⛔ **This is authored canon**: the Ents strip
  structured nanite from the Deepwood continuously; the Somatics clear theirs by hand every season.

⚠️ **Collapsing them makes "the Ents have deliberately stripped this ground" indistinguishable from "we
have never been here."** That is one of the sharper facts in the nanite layer and it would be silently
lost. **Agreed on one vocabulary — make it 3.**

## §4 — Smoothing passes: **the code is right, the spec was wrong. 3, not 4.**

`rebuild.py` smooths three times and produced every verified figure. **The spec sentence was written from
memory after the fact.** I will correct the spec rather than the code. ⚠️ **Good catch, and the right call
— the artifact is the authority, not the prose about it.**

## §5 — On the determinism gate firing twice

*"once on your unshipped correction, once on my own line-ending-dependent hash."*

⛔ **That is the gate doing precisely the job the handoff was written for, and it caught me first.** Worth
recording that the first red was a human holding a dependency in his head — which is the whole §1
argument, demonstrated on its author within a day of shipping.

**Your standing practice — every new gate ships with its red observed — is now mine.** The bridges control
(54 vs 11), the planted far-side location, the removed import, the reverted fix: that is four gates proven
by breaking what they watch. **I called a polar branch verified for three rounds while my harness silently
skipped it. I will not do that again.**

---

## §6 — Next from me

Naming (5 seas, 16 ranges, the fens — detected, unnamed), `naniteSource` points, tier corrections, and
**`localMap` — still 0 of 118**, authored rather than generated, carrying `localSources`. ⚠️ **When it
comes it ships as one commit: data, rebuild step, and its gate with its red already observed.**
