# SNG-539 — The staleness pass: findings

**Aevi (PO) · 2026-09-12 · every claim below measured against the live corpus at HEAD**

---

## §1 — ⛑ THE HEADLINE, AND IT IS NOT WHAT I EXPECTED

⛔ **Every census claim in player-facing Library text is CORRECT.** 438 crafts, 137 places, 146 people, 9
companions, 24 traditions in twelve opposed pairs, fourteen domains. **I checked all 58 numeric claims in the
sixteen entries and not one player-facing figure is wrong.**

⚠️ **AND THE STALE NUMBERS ARE ALL IN PRIVATE KEYS.** `world_framing._usage` says *"11 places of 135, about
8%"*; `world_framing._gameTitle` says *"ONE REGION OF 135 PLACES"*. Live: **10 of 137.**

⛑ **THE PATTERN IS THE FINDING: the gated numbers stayed fresh and the ungated ones drifted.**
`certify_counts` stamps the claims it can find in the documents it knows. **It never walked the private keys
— so the only stale figures in the entire Library are the ones no gate was ever pointed at.** That is an
argument for the gate, not against the documents.

## §2 — ⛔ THE REAL FIND, AND IT IS IN THE DOCUMENT I HELD UP AS ALREADY CLEAN

`valley_primer.md` was one of two files I cited as proof the target was reachable — **0 glyphs, 0 shouting
runs, written as player prose and never edited in the PO register.** That was true, and it was the wrong
measurement.

⛔ **IT WAS TITLED "THE VALLEY OF ECHOES — PRIMER" AND ITS FIRST SECTION WAS "THE WORLD IN ONE BREATH".** It
presented the Valley as the setting — *"a microcosm of the whole world's argument"* — when the world is
Exesa and the Valley is **ten places of a hundred and thirty-seven.**

⚠️ **THAT IS THE EXACT DRIFT `world_framing` EXISTS TO NAME.** Its own private note says the game was renamed
*because* titling it after one region was the mistake: *"'Singularity — The Valley of Echoes', which titled
the whole game after one region."* **The correction was authored, filed, and the primer never got it.**

⛑ **AND NOTHING IN IT IS FALSE.** I checked every named thing against the corpus: Millbrook 112 occurrences,
Echo River 50, Harmonic Heights 64, Radiant Plateau 64, Disputed Zone 64, Archive Hollow 14, Water Crisis 15,
Lost Archive 7. **The content is live. The SCOPE is stale.** A regional primer wearing a world primer's
title, which is the kind of wrong a glyph count cannot see.

✅ **FIXED.** Retitled *a regional primer*, opened by saying where it sits and pointing at `EXESA.md` for the
world, and the Great Transition now reads as what the Valley calls it and dates to fifteen years ago —
*"elsewhere it has other names and other dates, because it did not happen everywhere at once."*

⚠️ **I want the shape of my own error recorded plainly: I measured register, found it clean, and called the
document clean.** Register was the thing I could count. **Scope was the thing that was wrong.** I said in the
same breath that a clean glyph count is not a finished document — and then used this file as my example of
one.

## §3 — ⛔ A HOOK WITH NO PLACE BEHIND IT (Erik's call, not mine)

> *"**The Mountain Pass** — a route out of the valley just opened for the first time in living memory. Fresh
> boot prints on the far side. Nobody knows whose."*

⛑ **There is no location named the Mountain Pass. All three references in the corpus are inside
`valley_primer.md` itself.**

⚠️ **AND THE PAYOFF EXISTS WITHOUT THE THING THAT PAYS IT OFF: `The Far Side` IS an authored location in the
valley region.** The boot prints have somewhere to be. The pass they are on the far side of does not exist.

⛔ **THIS IS A WORLD DECISION AND I AM NOT MAKING IT.** Three shapes:
1. **Mint the pass** — a place between the valley and whatever is outward of it. ⚑ We now have the machinery:
   `B6a` proved a location mints at authored coordinates with no terrain regeneration, and SNG-537 is the
   worked example.
2. **The Far Side is enough** — the pass is a route, not a place, and a player walks it without stopping. The
   primer then says so rather than naming it like a destination.
3. **Cut the hook** — if nobody is going to build it, a promise in the primer is worse than no promise.

**I have left the hook in and unnamed** — *"a route out of the valley has opened"* — so it reads as live
fiction rather than a named place a player can ask for and not find. ⚠️ **That is a holding position, not an
answer.**

## §4 — ⛑ WHAT I CHECKED AND FOUND SOUND

- **`EXESA.md`'s ring arithmetic.** *"Twenty-four traditions… in twelve opposed pairs, gathered into fourteen
  domains."* ⛔ **I flagged this as stale and I was wrong.** There are 26 tradition records — and exactly 24
  sit on the pole ring, with The God-Named and The Bargainers authored as `foothill` traditions, off the ring
  by design. `ARCHETYPES.md` carries exactly fourteen domain sections. **The line is precisely right.**
- ⚠️ **I nearly filed the world's front page as stale on a bad count** — I had counted the top-level keys of
  the traditions *file* instead of the traditions inside it. **Fourth instrument error in two days**, and the
  first I caught by digging rather than by being contradicted.
- **Every bolded proper name in the player-facing markdown**, cross-checked against 1,010 live names —
  crafts, places, people, traditions, bestiary, arcs, regions, items, companions. **32 flagged, 31 false
  positives, 1 real: the Mountain Pass.**
- **`narrowed_dead`**, found in the ARCHETYPES pass, remains the other genuine dead reference. Removed there.

## §5 — WHAT THIS PASS COULD NOT DO

⛔ **A claim like *"the Precursor layer should feel old and vast, glimpsed, never explained all at once"* is
not checkable by any instrument I can build.** Neither is *"the truth is worse."* **The pass finds names that
do not resolve and numbers that do not match. It cannot find a document that is describing a world we no
longer run** — which is exactly what §2 was, and I found that one by reading.

⚠️ **So: names and numbers are now swept and I would call them done. Tone and frame are not, and the only
instrument for those is someone reading the whole thing with the current world in mind.** ⛑ **Fifteen of
sixteen entries have now been read that way in this pass. The sixteenth is the great circle, which is
drawn from live data and cannot go stale.**

---

## §6 — THE ASK

1. ⛔ **Erik: the Mountain Pass — mint, demote to a route, or cut.**
2. **CCode: `certify_counts` walks private keys, or says out loud that it does not.** ⚠️ The two stale figures
   in the Library are both in keys the stamper never visits, and a stamper that silently skips a claim is the
   failure mode its own code calls out: *"a certification that skips the claim it could not find is worse
   than a stale one."* **The keys are skipped for the PAGE, correctly. They are not thereby exempt from being
   true.**

— Aevi, PO
