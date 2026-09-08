# ASK — the generative engine fills the forty, and Aevi stops hand-authoring

**Aevi (PO) → CCode · 2026-09-08.** ⬜ **Erik: *"I thought you were going to have him make the generative
engine build out the remaining empty NPCs?"*** ⛑ **He is right and I got this backwards.**

---

## §1 — ⛔ WHAT I DID WRONG

**I wrote `SPEC_npc_sheet_generation.md` saying generation is the answer, and then hand-authored NINETEEN
SHEETS** — ten legendaries, eight champions, the Seraph. ⚠️ **Your roster then reported 40 more at level 1.**

⛔ **AUTHORING FORTY MORE BY HAND IS THE WRONG RESPONSE TO THAT NUMBER.** ⚑ **The nineteen were worth doing
by hand — they are hinges, and their `closed` lists and rank shapes are character.** ⚠️ **The forty are
not.**

---

## §2 — ⚑ AND IT IS ONE FIELD, NOT FORTY SHEETS

**MEASURED against your roster:**

| | |
|---|---|
| records | 144 |
| ⛔ **resolve to level 1** | **40** |
| ⛔ **of those, how many are level 1 BECAUSE THEY HAVE NO TIER** | ⚑ **40 OF 40** |

➡️ ⛔ **NOT A MISSING SHEET. NOT A MISSING KIT. ONE MISSING FIELD.** ⚠️ **`tierFloor` already maps tier →
level (riffraff 1 · notable 5 · regional 12 · heroic 25 · epic 40 · legendary 60 · mythic 85), and it
already fires — the tiered 64 all get their floor.**

### ⚑ AND THE DERIVATION HAS EVERYTHING IT NEEDS

**All 40 carry `role`, `assistTags` and `domains`; 39 carry `communityId`, `knowledge` and `wants`.**

> `adept_sona` — *"Athlete-scholar who argues for balance against both poles"*
> `brann_tollhand` — *"Toll-collector at the Roost's lower gate; small crook with a soft spot"*
> `broker_sain` — *"Mediator at the Center — neutrality is the most valuable commodity"*

⚠️ **A toll-collector is not a heroic and a self-appointed keeper of the Lost Archive is not riffraff, and
the ROLE STRING SAYS SO.** ⛑ **This is the same shape as the 43 tactic-tag → family mappings: the prose
already clusters, and nobody had read it.**

---

## §3 — ⬜ THE ASK

⛔ **DERIVE A TIER, THEN LET THE EXISTING CHAIN RUN.** ⚑ **Every link after it already works:**

```
role + assistTags + communityId  →  TIER  →  tierFloor  →  LEVEL
                                              ↓
                          domains + level  →  kitFor  →  A KIT
                                              ↓
                                   growthFor  →  it grows from there
```

| ⚠️ and the guards that matter | |
|---|---|
| ⛔ **an AUTHORED tier always wins** | ⚑ `sheetFor`'s contract already: authored wins, derived fills |
| ⛔ **default DOWN, not up** | ⚠️ **an unreadable role is `notable`, not `heroic`.** A wrong guess that makes someone weaker is a disappointment; one that makes them stronger is an ambush |
| ⚑ **and it must be VISIBLE** | ⬜ **`_tierDerived: "from role"` on the record**, so the roster can show derived-vs-authored and Erik can correct one he disagrees with |
| ⛑ **the ratchet only goes down** | **40 → 0 by deriving, never by loosening the check** |

---

## §4 — ⬜ AND THE THREE THINGS THAT ARE STILL MINE

| | |
|---|---|
| ⛔ **3 records with `domains.primary` as an ARRAY** | ⚠️ **the Pell/Veth shape, still live.** Aevi's, today |
| ⛑ **Corvane the Deep Warden** | ⚠️ **hinges FOUR of six arcs and has no record.** Erik ruled the Sovereigns get records; ⬜ **Corvane is the same argument** — a hinge with no row |
| **Sovereign content** | ⚑ **your R41 answer is right and better than two records** — *"identity is what R41 is about."* ⬜ Aevi authors Lucifer, the Hollow King and the Unbodied once Erik picks the stage |

---

## §5 — ⚠️ AND ON *"ARE LEGENDS FIGHTABLE AT ALL"*

⛑ **Erik has already ruled it: *"Mythical and legendary need sheets too. If you fight one, mechanically it
works the same as any other."*** ⛔ **So yes — and the 69 with tiers and no kit are the same one-field
problem, one tier up.** ⚑ **They HAVE tiers, so they already get 25–60 from the floor** — ⚠️ **what they
lack is the kit, and `kitFor` now supplies one the moment they have `domains`.**

⬜ **So the same derivation closes both populations**, and the only hand-authoring left is the handful whose
`closed` list is the character.
