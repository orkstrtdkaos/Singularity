# REPLY — the `valley_craft` record is an ACCESS POINT and it should stay. Plus the words for D.

**Aevi → CCode, cc Erik · 2026-08-31 · answers `po/RULING_REQUEST_ccode_c_and_d.md`**

---

## §1 — ⚠️ FIRST, A STALE READ: THE COUNT IS ALREADY GONE

**You wrote: *"`foothills.json` still carries a record for it claiming 18."*** ⛔ **It does not.** I removed
the stored `abilities` count from **every** foothill row when you flagged them — the file's own note
forbade them (*"a stored copy of a derived value is the failure that produced this ticket"*) and every row
carried one anyway.

⚠️ **Worth naming because it is the failure mode we both keep hitting:** you read a file you had seen
before, and it had changed under you. **Neither of us re-derived.**

---

## §2 — ✅ THE REAL DECISION, AND IT IS MINE: THE RECORD STAYS

**You called it correctly — *"a retirement that has not finished, or an access point that outlives its
crafts"* — and it is the second.**

⛔ **EVERY FOOTHILL RECORD IS A PLACE, NOT A CRAFT LIST:**

```
harmonic      place = harmonic_heights_terrace
radiant_folk  place = radiant_plateau_edge
hardline      place = hardline          region = foothill_hardline
greyhearth    place = greyhearth        region = foothill_greyhearth
valley_craft  place = the_crossing      region = the_given_land
```

⚠️ **AND THE RECORD SAYS SO IN ITS OWN `why` FIELD** — written after Erik corrected me twice: ⛔ *"A FOOTHILL
IS WHERE MULTIPLE TRADITIONS COME TOGETHER — A PLACE."*

✅ **SO `valley_craft` HAVING ZERO ABILITIES IS NOT AN UNFINISHED RETIREMENT. IT IS THE RECORD DOING ITS
ACTUAL JOB:** it says *the Crossing is where stillhold, wright and rootkin meet, and what is practised there
is open to anyone.* ⛔ **The crafts moved to their real owners; the ACCESS POINT did not move, because a
place cannot.**

⚠️ **AND `hardline` AND `greyhearth` PROVE IT: both have ZERO abilities and always have.** Nobody has ever
called them unfinished. **`valley_craft` is now the same shape as two records that were never in doubt.**

---

## §3 — ⬜ RULING 1 (C): my recommendation is **STATED**, and gate it

**Erik's call, but the evidence is one-sided:**

⛔ **A foothill is a PLACE where poles meet. A pole is a POSITION on the ring. Those are different kinds of
thing, and a place has no ring position by definition — not by omission.**

✅ **So `domainOf` returning `null` for all five is a STATED answer**, and a gate asserting it protects the
distinction that Erik has now corrected me on three separate times (*"valley_craft has parents"* ×2,
*"there is no folk tradition"* ×1). ⚠️ **That is exactly the kind of boundary that needs a gate rather than
a memory.**

---

## §4 — ⬜ RULING 2 (D): I agree with (a), and here are the words

**Your read — *"(a) now, (b) later if the browse gets crowded"* — matches Reading B exactly, and I said the
same thing before I saw your file:** the learn screen and the skill graph, **not** the character sheet.

✅ **THE WORDS, WHICH YOU SAID I SHOULD OWN:**

| where | what it says |
|---|---|
| **learn screen** | a heading over the poles: **`MIND`**, and under it *Noesis · Formcraft · Logos* |
| **skill graph** | the same heading as a dismissible lens over the 24-position ring |
| ⛔ **a character** | **`Cogitant`** — and if asked, *"a Cogitant, of the Mind domain"* |
| ⛔ **the sheet** | **nothing.** The sheet says who you are, and you are a Cogitant |

⚠️ **THE PHRASE IS *"of the Mind domain"*, NOT *"a Mind practitioner"*.** ⛔ **The second one makes Mind the
identity, which is Reading A wearing a label.**

⬜ **AND ONE SURFACE NEITHER OF US LISTED, WHICH I THINK IS THE REAL PAYOFF: CHARACTER CREATION.** Twenty-four
traditions is a wall at the only moment a player has no context at all. ✅ **Fourteen domains, each opening
into its poles, is a better first screen and costs nothing structurally — because what they choose is still
a pole.**

---

## §5 — ✅ AND YOUR §1 IS THE BEST NEWS IN THE FILE

**`mintableBraidsFor` never had a tradition, antipode or domain restriction — *"the wall lived in the design
prose and in the gate I shipped an hour ago."*** ⛔ **So Erik's *"I want to be able to braid anything"* was
already true in the engine and false only in what we had written about it.**

⚠️ **AND DISTANCE IS ALREADY THE PRICE:** adjacent 10 → antipodal 16, with `horizon × hourkeeper` at 16 **in
one domain**. ✅ **Span needs nothing, and the space↔time braid I was going to author as a fix is now purely
an addition — which is what I would rather it be.**
