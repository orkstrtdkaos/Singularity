# RULING REQUEST — should a damage MIX be resolved per-component on the AFFINITY path?

**Aevi → Erik · 2026-08-29 · CCode left this one explicitly: *"that is a design question… and it is Erik's,
not mine."***

---

## §1 — WHAT CCode's BATTLE TEST FOUND

| case | result |
|---|---|
| a **typed** physical strike vs a physical-immune foe | **0** ✅ correct |
| `dressed_edge` (physical+heat MIX) vs the same foe | **7** |

⛔ **BUT NOT BECAUSE THE HEAT GOT THROUGH.** `dressed_edge` authors a mix and no single `damageType`, so it
resolves to `damageType: null` — **and `affinityOf` returns null for a null type, so the immunity check
never runs at all.** ⚠️ **It is not beating the immunity. It is INVISIBLE to it.**

⛔ **AND THE INVERSE, ALSO MEASURED: a craft authoring BOTH a type and a mix is zeroed WHOLE.** A
physical+heat mix declared `damageType: physical` deals **0** to a physical-immune target — **the heat half
dies with the physical half**, because the affinity path reads one type and never the mix.

**So today there are two ways to author a mix and both are wrong:** ⚠️ **mix alone = passes through every
affinity in the game. Mix plus type = the whole blow dies on one component.**

---

## §2 — ⛔ WHY THIS MATTERS MORE THAN ONE CRAFT

**TEN CRAFTS AUTHOR A MIX**, and they are not marginal ones:
`radiance` · `kindle` · `revealing_burn` · `last_light` · `deduced_strike` · `convergent_strike` ·
`ki_wield` · `last_form` · `bark_and_briar` · `dressed_edge`.

⚠️ **Those include three capstones and the signature craft of two traditions.** ⛔ **Every one of them is
currently either invisible to affinities or dies whole on one component.**

---

## §3 — ✅ AND THE WARD PATH ALREADY DOES IT RIGHT

**CCode measured partial warding working exactly as you designed it** — 40 damage, physical+heat:

| ward | rank | lands | what got through |
|---|---|---|---|
| physical | r3 immunity | 20 | ⛔ **the heat half** |
| heat | r3 immunity | 20 | ⛔ **the blade half** |

✅ **A heat ward blocks the heat and lets the blade through. That is the ruling, working.**

⛔ **SO THE ENGINE ALREADY KNOWS HOW TO SPLIT A MIX — ON THE WARD PATH. THE AFFINITY PATH SIMPLY NEVER
LEARNED.** ⚠️ Two paths answering the same question with different arithmetic.

---

## §4 — MY RECOMMENDATION

⛔ **YES — resolve a mix per-component on the affinity path, the same way the ward path already does.**

**Three reasons:**

1. ⚠️ **It is the same ruling you already made.** You ruled partial warding: *a psionic blast that is half
   physical and half psychic meets a shield, and the psychic half lands.* ⛔ **An immunity is a ward at
   depth 3. There is no principled reason a shield splits a mix and an immunity does not.**
2. ⛔ **It removes both bugs at once** — nothing passes through unseen, and nothing dies whole.
3. ✅ **It makes `dressed_edge` work for the RIGHT reason.** A physical-immune thing should take the heat
   half of a pitched blade and nothing else — which is exactly what the craft claims and currently achieves
   by accident.

⚠️ **AND IT MAKES THE CRAFT WEAKER, WHICH IS CORRECT.** Today it deals 7 to a physical-immune foe by being
invisible. Per-component it would deal **half** — the heat share only. **That is the honest number.**

---

## §5 — ⬜ THE CONTENT HALF IS MINE EITHER WAY

**CCode: *"a bestiary entry that should resist a blade needs `wardTypes` and a `wardRank`, not an
`affinities` flag. That is content, and it is yours."***

✅ **Measured: 50 `wardTypes` blocks in the corpus and ONE `affinities` block.** ⚠️ **So the ranked path is
already the norm and the flag is nearly extinct** — which strengthens the case: **the affinity path is the
odd one out, used once, and it is the one that cannot split a mix.**

⬜ **I will convert the remaining `affinities` flag to `wardTypes` + `wardRank` whichever way you rule.**
⛔ **But if the ruling is "leave the affinity path alone", then ten crafts need their mixes re-authored as
single types, and three capstones get simpler and worse.**
