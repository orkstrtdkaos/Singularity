# RESULT — sex/gender backfill per R24

**Aevi (PO) · 2026-09-01 · complete and verified at origin**
**Ruling:** `po/RULING_sex_set_at_generation.md` (R24, as corrected)

---

## What was written

**50 of 52 NPC and companion files** now carry `sex` and `gender`.
⬜ Skipped: `legends.json`, `saehara_challengers.json` — these are **pools, not single characters**.

| sex | gender | count |
|---|---|---|
| female | female | 29 |
| male | male | 19 |
| ⚠️ **none** | female | **1** — Aevi (companion) |
| ⚠️ **none** | none | **1** — Coil |

**Sex and gender never diverge for a sexed being**, per Erik's rule.

---

## The judgment calls, named

### ✅ Erik's direct rulings
| character | ruling |
|---|---|
| **Marrow** | ⚠️ **female Ashwarden.** `sex`/`gender` document the truth; presentation stays "it" through stages 1–2 and the reveal lands at **stage 3 (bond 10)**, per the 2026-08-23 stage ruling. ⛔ she/her was NOT propagated earlier in the file — **the deniability is the design.** |
| **Aevi** (companion) | **She.** No sex — a nanite constellation has nothing to have one of. Gender female, pronouns follow gender. ⚠️ The "it until discovered" reveal was **considered and dropped as too complicated.** ⛔ Not romanceable: no sex. |
| **Kit Farrow** | female |
| **Wren of the Edge** | female |
| **Ents and trees** | male or female — Lissome female, Sprig female (Vaskar and Thren already male) |

### ⚠️ One genuine content bug found and fixed
**Elder Resonance** — `appearance` reads *"A stout woman near seventy… turns **her** head"*, but `wants` and `fears` said *"the room's acoustics bend politely around **him**"* and *"what **his** surveys found."* ⛔ **The file contradicted itself.** Fixed to her/hers.

### ⚠️ Six characters authored with they/them, now assigned
Per Erik: *"if it's a plural entity you can use they/them… for the others give them sexes and have their gender match."* ✅ **None of these six are plural entities.**

| character | assigned | basis |
|---|---|---|
| Quill | female | no cue — assigned |
| Tal | male | no cue — assigned |
| The Archive Guardian | female | no cue — assigned |
| The Cogitant Ninefold | male | no cue — assigned |
| Burr | male | no cue — assigned |
| Hollis | male | *"acne along the jaw"*, gangling — weak cue |

⬜ **These were deliberate authorial they/them, now overwritten on Erik's instruction.** Flagging so the choice is visible and reversible — the prose still reads they/them and was **not** rewritten. ⚠️ **If the pronouns should follow, that is a second pass.**

### Other assignments
| character | sex | note |
|---|---|---|
| The Keeper of the Unsaid | female | ⚠️ `appearance` says *"sexless with age"* — that describes an old **body**, not sex. `fears` says *"her soul"*, *"she dies"*. |
| The Old Stag | male | a **stag** |
| Bristle | male | marsh-hound |
| Ember | female | Glade-changed fox |
| Hush | female | Umbral cat-thing |
| Coil | ⛔ none/none | ⚠️ **a mechanism.** No sex, no gender, referred to as "it", not romanceable. |

---

## Prose fixes applied (3)

| file | change | commit |
|---|---|---|
| `elder_resonance.json` | him/his → her/hers in `wants` and `fears` | `2f96c23e` |
| `marrow.json` | stage-3 `narrationHints`: *"THEY STAND UP"* → *"SHE STANDS UP"* etc. ⛔ stages 1–2 untouched | `2e20721a` |
| `aevi.json` | it → she throughout `persona`, `appearance`, `boundaries`, `voiceHints`, bond grant | `0ff77009`, swept `ec2c2bdd` |

✅ **Verified at authenticated `api.github.com`, not raw CDN.** Three remaining "it" instances in
Aevi's file are correct — one is *"she does **it** kindly"*, two have non-Aevi antecedents.

⚠️ **Every patch asserted the content changed before writing** — per CCode's shell-escaping lesson,
an insertion that produces no change must refuse rather than pass silently.

---

## ⛔ Still open

| item | owner |
|---|---|
| `romanceEligible` opt-in authoring — **being sexed does not make a character romanceable** | Aevi |
| Extend `boundaries` from companions to NPCs — folds into the thickening pass | Aevi |
| **OI-26 — age is still unauthored.** `romanceEligible` carries adult status implicitly; whether that suffices is unruled | Erik |
| Should the six reassigned characters' **prose pronouns** follow their new sex? | Erik |

---

## ⚠️ Correction owed — OI-24 was never a gap

CCode: **`reconcile.js` v31 has swept the rename map on every load since CCODE-294**, carrying the
same 142/22 measurement in its own comment.

⛔ **That is Aevi's fourth partial-scan absence claim this session** — after the v2 domain structure,
the `harmRung` rank question, and the craft ids. It fired on the exact discipline her own standing
note asked CCode to check her on.

➡️ **OI-24 is withdrawn.** The real constraint is narrower and it changes the next task:
**the OI-19 and OI-20 audits must read sheets through `reconcile`, not raw** — which also avoids
writing to saves.
