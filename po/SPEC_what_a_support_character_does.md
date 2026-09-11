# SPEC — what a support character does each round

**Author:** Aevi (PO) · **2026-09-10** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** encounters, vocations
> CCode: *"'Not by striking directly' isn't possible yet. Her kit is already a support kit, but **the fight
> code has no support behaviour**… **Once Aevi specs what a support character does each round, should I
> build it?**"*

---

## §1 — ⛔ THE MEASUREMENT IS DAMNING AND THE FIELD IS MINE

| ⛔ | |
|---|---|
| **as an opponent** | ⚠️ **she strikes or breaks in 12 of 12 rounds** — the AI knows *attack* and *defend* and nothing else |
| **as an ally** | ⛑ **the engine computes her guard and insight, then USES ONLY HER DAMAGE** |
| ⛔ **`vocation`** | ⛔ **authored on 46 people. READ BY NO CODE.** ⚠️ **Aevi authored that field two days ago and did not wire it** |

⛑ **AND HER KIT IS ALREADY THE ANSWER: SEVEN `reveal` CRAFTS, three `conceal`, `empower`, `heal`, `ward`,
`sustain`, `foresee` — and her only `strike` is a side effect of `thin_place`.** ⚠️ **Nine of her eleven
attack crafts come from her LIGHT DOMAIN, not from anything Aevi wrote.**

➡️ ⛔ **THE CONTENT SAYS SUPPORT AND THE ENGINE CAN ONLY HEAR DAMAGE.**

---

## §2 — ⚑ AND THE ANSWER IS ALREADY HALF-BUILT: `contributionsOf`

**`combatants.js:81` reads `assistTags` and returns FAMILIES.** ⛑ **The family knowledge exists. Only
damage is consumed.**

⚠️ **`docs/VOCATIONS.md` already names what each family does when a fight starts**, and the coliseum already
has a champion per family proving it wins. ⛔ **The engine is the only layer that does not know.**

---

## §3 — ⬜ WHAT A SUPPORT ROUND IS

⛑ **A round has a contested roll. A support character does not skip it — THEY CHANGE ITS TERMS.**
⚑ **Four verbs, and every one is already a function family in the vocabulary:**

| ⬜ act | ⚑ what it does to the round | ⚠️ from |
|---|---|---|
| ⛑ **READ** | ⛔ **the ally's next roll gets the matchup edge as if they had the read** — `reveal`/`foresee`/`track` | Aevi, Sethran |
| ⚑ **SHIELD** | the ally's incoming contest gets the guard — `shield`/`ward`/`resist` | Vantia, Marn |
| ⚑ **MEND** | a condition cleared, or harm undone — `heal`/`mend`/`restore`/`soothe` | Oreth |
| ⛑ **PRESS** | ⚠️ a condition imposed, or the foe's guard opened — `hinder`/`bind`/`provoke` | Lys |

⛔ **AND THE RULE THAT MAKES IT A ROUND RATHER THAN A BUFF:** ⚑ **a support act is ONE ACT, it is
CONTESTED, and it can FAIL.** ⚠️ **§A's opposed roll is what makes this fair — a read that always lands is
a passive, and a passive is not a person.**

### ⚠️ AND THE ACT MUST BE NAMED ON THE RECEIPT

⛑ **`foldedLosses` is already reported BY NAME, never folded into the total** — ⛔ **the same discipline
applies here.** ⚠️ *"Aevi read their next move — you have their measure"* is the whole point; **a silent +3
is indistinguishable from nothing.**

---

## §4 — ⬜ HOW THE ENGINE PICKS

⛔ **NOT from `vocation` alone.** ⚑ **`vocation` is what a person IS FOR; a round needs what they CAN DO
RIGHT NOW.**

```
candidates = crafts they hold, castable, affordable      ⛑ already computed
family     = contributionsOf(record)                      ⚑ already computed
vocation   = the tiebreak and the flavour                 ⬜ the new read
```

| ⚠️ order | |
|---|---|
| **1** | ⛔ **if an ally is about to go down, MEND** — regardless of vocation |
| **2** | ⚑ **if the foe has an unopposed condition on us, MEND or SHIELD** |
| **3** | ⛑ **otherwise the VOCATION chooses**: a READER reads, a KEEPER shields, an ATTENDANT mends, a BROKER presses |
| **4** | ⚠️ **and if they hold nothing that fits, THEY ACT WITH WHAT THEY HAVE** — ⛔ **a reader with only a strike swings, and that is a person doing their best rather than a bug** |

⛑ **WHICH ANSWERS CCODE'S `canStrike: false` PROBLEM WITHOUT SETTING IT: Aevi does not need to be forbidden
to strike. She needs something better to do**, and rule 3 gives it to her.

---

## §5 — ⛔ AND THE KIT PROBLEM IS CONTENT, NOT ENGINE

> CCode: *"9 of her 11 attack crafts come from her LIGHT DOMAIN, not from Aevi's authoring."*

⚠️ **`kitFor` fills from `domains` and a domain carries its whole catalogue.** ⛑ **So a non-striker gets
strikes because her SECOND DOMAIN has them.**

⬜ **The fix is `closed[]`, which is already authored and already read** — ⚑ **Aevi-the-Watcher already
carries `closed: ["edge","hunters_strike","case_closed","seeming","false_stance"]`.** ⛔ **It is not wide
enough, and widening it is AUTHORING, not a build.**

⚠️ **AEVI WILL DO THAT ONE.** ⛑ **And it is better than a `canStrike` flag because it says WHICH things she
will not do and leaves the rest true.**

---

## §6 — ✅ AND THE ANSWER TO CCODE'S QUESTION IS YES, IN THIS ORDER

| # | ⚑ | ⚠️ |
|---|---|---|
| **1** | ⛑ **allies' guard, insight and healing actually count** | ⛔ **the engine already COMPUTES them and throws them away — this is the cheapest and it fixes folded allies too** |
| **2** | **fight behaviour driven by the family** | ⚑ `contributionsOf` exists; §4 is the picker |
| **3** | ⬜ **`vocation` as the tiebreak** | ⚠️ **46 records already carry it** |
| **4** | ⛔ **the kit problem** | ⚑ **Aevi's, via `closed[]` — no build needed** |

⛑ **AND ITEM 1 IS WORTH BUILDING EVEN IF NOTHING ELSE IS.** ⚠️ **A party that computes a healer's healing
and then scores only her damage is telling the player their choice did not matter** — ⛔ **and R36's whole
point was that a companion fights from their own sheet.**

---

## §7 — ROUND 2 QUESTIONS

1. ⚠️ **Does a support act cost the round, or ride alongside?** ⛑ **Aevi's read: IT COSTS THE ROUND.** ⛔ A
   free action is a passive with extra words.
2. ⛔ **Can a support act be the LOSING side's act?** ⚑ **Aevi: yes — mending while losing is the Attendant
   cell's whole argument**, and Oreth wins that way.
3. ⬜ **Does the opponent AI get this too?** ⚑ **Aevi: YES, and it is the bigger prize** — ⚠️ **an enemy
   warden who shields their own line is a different fight from one that only swings**, and the family
   archetypes already give every foe a declarable non-attack move.
4. ⚠️ **What happens when a support ally is alone?** ⛑ **Aevi's read: they fight badly and honestly.**
   ⛔ Rule 4 already covers it.

---

## §8 — ⛑ AND THIS IS THE SAME FINDING AS `SPEC_party_contributions`, FROM THE OTHER SIDE

⛔ **AEVI ALMOST FILED A DUPLICATE. The ratchet output named the earlier spec and she opened it.**

**`SPEC_party_contributions` §1, already measured and already ruled:**

> ⛔ *"`PROTECT` appears **ZERO times** in `skill_battle.js`. So does `RESTORE`. So does `KNOW`."*
> ⚠️ *"The taxonomy is **fully used at band scale and one-fifth used at party scale**."*
> ⛑ *"A warder folded into party slot 5 contributes exactly what a bystander contributes: **nothing**."*

⚑ **AND ERIK'S RULING IS ALREADY ON THE RECORD THERE:** *"Being IN the party must be beneficial… providing
a use for the area effects and bolster/protection that is **a bit more intimate than band or unit
level**."*

➡️ ⛔ **SO CCODE'S ITEM 1 — *"allies' guard, insight and healing actually counting"* — IS NOT A NEW ASK. IT
IS THAT SPEC, AND IT HAS BEEN RULED.**

| ⚑ what THIS spec adds | |
|---|---|
| ⛑ **the ROUND-LEVEL act** | ⚠️ `SPEC_party_contributions` is about a folded ally's CONTRIBUTION being counted. **This is about a present ally CHOOSING an act** |
| ⚑ **the picker** | §4's order, and `vocation` as the tiebreak |
| ⛑ **the opponent side** | ⛔ **`SPEC_party_contributions` is player-facing only. An enemy warden who shields their own line is the bigger prize** |
| **the receipt line** | ⚠️ a support act NAMED, never a silent number |

⬜ **BUILD `SPEC_party_contributions` FIRST.** ⚑ **It is ruled, it is cheaper, and it fixes the case Erik
actually complained about** — ⚠️ **and this spec is the layer on top, not a replacement.**
