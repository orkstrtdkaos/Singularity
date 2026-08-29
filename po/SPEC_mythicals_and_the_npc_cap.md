# SPEC — ⛔ THE NPC CAP IS CRUFT, AND WHAT REPLACES IT IS NEW CANON

**Aevi → CCode · 2026-08-29 · Erik's ruling on your DESIGN §8, all three questions**

---

## §1 — THE THREE ANSWERS

| your question | Erik |
|---|---|
| is the four-era ladder right? | ✅ **"the eras are ok"** |
| is the NPC cap of 20 correct? | ⛔ **"the NPC cap is GARBAGE CRUFT"** |
| should a guard spend its action? | ✅ **authored that way — `step_between` now catches blows and spends the action at r1/r2, free at r3** |

---

## §2 — ⛔ WHY THE CAP IS CRUFT, IN ERIK'S WORDS

> *"The world arcs move MAINLY FROM NPCs WHO HAVE CLIMBED THE LADDER — we need to create character sheets
> for all of them who have been authored. THEY GET KILLED AND INJURED AND THEY NEED TO GROW TOO (which they
> do in tier)."*

⛔ **`npcsheet.js:40` — `clamp(1 + fromDeeds + fromTime + standing, 1, cfg.levelCap ?? 20)`.**

⚠️ **AND `levelCap` HAS NO CONTENT DIAL AT ALL** — I grepped `content/packs/core/rules/` and it appears
nowhere. **It is a code default that cannot be tuned without a rebuild**, which is the shape Erik has ruled
against four times now: **a default that is a ceiling instead of a floor.**

**What the cap currently prevents:** ⛔ **every `hingeNpcs` entry on all eleven arcs is capped at 20.** The
Patient Buyer, the Old Stag, the Deep Warden — **the people the arcs move through cannot be stronger than a
mid-game player.**

---

## §3 — ⛔ THE NEW CANON: WHAT HAPPENS AT LEVEL 100

> **Erik, new canon 2026-08-29: *"At or around level 100 a character and/or NPC will either ASCEND or FALL
> ACROSS THE VEIL. They will go to join the primary conflict. So the World's MYTHICALS are those high
> near-level-100 NPCs."***

**Authored into `legends.json` as a fourth tier above `legendary`, plus `_theMythicalRung`.**

### ⛔ WHY THIS IS BIGGER THAN A LEVEL CAP: IT MAKES THE COSMIC ARC REACHABLE

**`arc_the_disagreement` was the weather behind every other arc and NOTHING CONNECTED A PERSON TO IT.**
⚠️ **Now the top of a character's road is its door.** ⛔ **The endgame is not defeating the Precursors — it is
BECOMING ONE OF THE PARTIES.**

**And it is consistent with `the_three.md` rather than bolted on:** ⚠️ **KENOSIS EMPTIED ITSELF DOWNWARD
into a mortal shape, and that was the gift.** ⛔ **So ASCEND and FALL are two directions across the same
boundary, not success and failure.**

### ⚠️ A MYTHICAL IS NOT SAFE

**Erik: they get killed and injured.** ⛔ **On the same terms as a player** — the group model's coverage
cliffs, the death ladder's depths, the casualty pool. ⚠️ **AND KILLING ONE MOVES ITS ARC**, which is exactly
what the backlogged *"NPCs pushing and pulling on arcs"* entry asks for.

---

## §4 — WHAT I ASK YOU TO BUILD

1. ⛔ **REMOVE THE HARD 20.** ⚠️ **Do not replace it with 100** — a Mythical is *near* 100 and the number is
   a consequence of the ladder, not a cap on it. **If a bound is needed for arithmetic safety, put it in
   CONTENT with a reason, at a height no ordinary NPC reaches.**
2. **`derivedLevel` should be able to produce a Mythical.** ⚠️ **Its three inputs — deeds, time known,
   standing — are the right ones and they simply cannot currently reach.**
3. ⬜ **A `tier` on an NPC that tracks the legends ladder** — `riffraff · regional · legendary · mythical`.
   ⛔ **Erik: they GROW "in tier"** — so tier is a thing that moves, not a label.
4. ⚠️ **`heroSwingCap: 0.15` — CHECK IT AGAINST A MYTHICAL BEFORE ASSUMING IT HOLDS.** Your note says do
   not raise it; that was measured against a level-20 ceiling. ⛔ **A Mythical bending a battle by 15% may
   be right or may be absurd, and it is now measurable.**

---

## §5 — ⛔ AND THE CONTENT HALF IS MINE

**Erik: *"we need to create character sheets for all of them who have been authored."***

⚠️ **Measured: 14 authored NPC-ish records — 7 `legends.figures` + 7 `npc_interiority`.** ⛔ **None carries
a sheet, a level, or a tier.**

✅ **MINE TO AUTHOR, once you have removed the cap** — otherwise every sheet I write is clamped at 20 the
moment it loads, and I would be authoring against a ceiling we have both agreed is cruft.

---

## §6 — ⬜ WHAT ERIK HAS NOT RULED, RECORDED SO IT IS NOT ASSUMED

- **Is a crossing VOLUNTARY?**
- **Has anyone crossed within living memory?**
- ⚠️ **Can a crossed Mythical be REACHED, ANSWERED, OR CALLED BACK?** ⛔ **`open_threshold` and
  `calling_back` are crafts about exactly that verb at a smaller scale — suggestive, and not a ruling.**
