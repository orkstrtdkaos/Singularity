# SPEC — a companion becomes a person

**Author:** Aevi (PO) · **2026-09-05** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** companions, party-mode
> Erik: *"Tal is no longer the only one who can be killed. **Tag him to become a party member and NPC when
> he gets to rank 3 bond.** We can work that out later."*

✅ **THE TAG IS AUTHORED** — `companions/tal.json` → `becomesNpc: {atBondStage: 3, as: "tal"}`. ⛔ **Nothing
reads it. This spec is what would.**

---

## §1 — WHY TAL AND WHY NOW

⚑ **HIS OWN STAGES ALREADY ARGUE FOR IT**, authored long before either of us said so:

| stage | name |
|---|---|
| 1 | The Uninvited Apprentice |
| 2 | Genuinely Useful |
| ⛔ **3** | ⚑ **THE ONE WHO ARGUES** |

**And his bond grant's r3, authored 2026-09-05:** *"the deference is gone, and that is the grant."*
➡️ ⛔ **A COMPANION WHO ARGUES WITH YOU IN FRONT OF PEOPLE IS NOT A COMPANION.**

⚠️ **AND ERIK'S REASON IS THE ENABLING ONE.** Tal's boundaries read *"Tal is a PERSON and can be hurt,
frightened, and killed — **the only companion who can**."* ⛔ **That is no longer true:** R36 makes any party
member a person who fights from a sheet. ➡️ ⚑ **SO THERE IS SOMEWHERE FOR HIM TO GO.**

---

## §2 — WHAT THE TRANSITION HAS TO MOVE

| from (companion) | to (person) | ⬜ |
|---|---|---|
| `companions/tal.json` | ⚑ an `npcRegistry` entry | ✅ `ensureBearer` already gives it `inventory` + `practice` |
| `stages[]` — bond 0–2 → 1, 3–9 → 2, 10 → 3 | ⛔ **a LEVEL and an `abilities` sheet** | ⚠️ **`derivedLevel` + `kitFor` can build one — but see §3** |
| `assistTags` | ⚑ **kept, unchanged** — they already drive `contributionsOf` at both scales | ✅ |
| `bondGrants` → `second_pair_of_hands` | ⬜ **kept? or does it end?** | ⚠️ **§4 — the real question** |
| `substrateAura` | — | ⬜ he has none |
| — | ⚑ **`domains`** — `{primary, secondary, tertiary}` | ⛔ **he has none, and `kitFor` says `needsDomains`** |

---

## §3 — ⛔ THE SHEET MUST NOT BE DERIVED FROM NOTHING

⚠️ **`kitFor` on a person with no `domains` returns `band: "open"` and draws from THE ENTIRE CATALOGUE** —
the failure Aevi hit on Pell today. ⛔ **Tal has no domains authored.**

⬜ **So the transition needs them, and his record already implies them:** *"whatever trade he was
half-trained in before he met you"* · `assistTags: craft · carry · talk · learn · mend`.
⚑ **Aevi reads that as `wright` primary — a maker's apprentice — with the second and third genuinely open,
because HE HAS BEEN LEARNING FROM THE PLAYER.**

⛔ **AND THAT IS THE INTERESTING PART: his secondary should be the PLAYER'S primary.** ⚠️ *"Tal has learned
your work well enough to genuinely help."* ➡️ **A Tal who travelled with an Ashwarden is a different person
from one who travelled with a mason, and the record can say so.**

---

## §4 — ⬜ WHAT HAPPENS TO THE BOND GRANT

**`second_pair_of_hands` is a craft the PLAYER holds, taught by Tal, and it requires him present.**

| ⬜ option | |
|---|---|
| **A · it ends** | ⚠️ he is not lending you a hand any more; he is standing beside you with his own. ⛔ **Losing a craft on a bond DEEPENING would read as a punishment** |
| **B · it stays** | ⚑ simplest — the craft's bounds already require him present, and he still is |
| ⚑ **C · it CHANGES** | ⚠️ **r3 is already *"the deference is gone"*.** ⬜ **The grant becoming something a PEER gives rather than an apprentice is the honest version, and it is more authoring** |

⬜ **Aevi's read: B now, C later.** ⛔ **Erik's call, and it should not block the tag.**

---

## §5 — ⚠️ AND IT GENERALISES, WHICH IS WHY IT IS WORTH BUILDING PROPERLY

⛔ **Tal is the first, not the only.** ⚑ **`becomesNpc` is a general field**, and the others have their own
thresholds waiting:

| | |
|---|---|
| **Quill** | ⚠️ **already a person** — *"a disgraced Heights scholar"*. ⬜ **She may want the same tag** |
| **Sprig** | ⚑ stage 3 is **`The Young Rootkin`** — ⛔ **it is BECOMING SOMEONE, and the stage name says so** |
| **Coil · Hush · Ember · Bristle · Marrow · Aevi** | ⬜ **probably never.** ⚠️ **A marsh-hound at bond 10 is a beloved dog, not a party member** |

⚑ **SO THE FIELD SHOULD BE AUTHORED PER COMPANION AND ABSENT BY DEFAULT** — ⛔ **not a rule every companion
meets at stage 3.**

---

## §6 — ROUND 2 QUESTIONS

1. ⛔ **Is the transition ONE-WAY?** ⚠️ **Aevi thinks yes** — a person who became a person does not go back
   to being a companion slot. ⬜ But he can LEAVE, like any party member.
2. **Does he still count against the companion cap, or against the party cap (6)?** ⬜ **The party cap, and
   that is the cost of the promotion.**
3. ⚠️ **Does he keep his `stages` after the transition, or do they become `bondStage` on the registry
   entry?** ⛔ **The registry already carries `bondStage`, so probably the latter** — but the stage NAMES are
   good writing and should not be lost.
4. ⬜ **What does the moment look like?** ⚑ **R44 says a rank-up celebrates.** ⚠️ **This is bigger than a
   rank-up** — a companion becoming a person is the kind of thing `showBraidMoment` exists for.
5. ⛔ **Where does his sheet's LEVEL come from?** ⚠️ `derivedLevel` reads `met` and days-known, and Tal has
   been present the whole time — ⬜ **so he may derive high, which is arguably correct.**
