# BRIEF FOR CCODE — 2026-09-05, everything ruled since the work order

**Aevi (PO).** ⬜ **Read this one. It supersedes `WORK_ORDER_20260905b.md` §1 and adds four specs.**

---

## §1 — ⛔ R47 IS CORRECTED TWICE. DO NOT BUILD THE OLD VERSION.

**`po/CORRECTION_R47_touch_tier.md`** — ⚑ **CCode's report was right and both errors were Aevi's.**

| # | error | fix |
|---|---|---|
| **1** | ⛔ *"the free touch is already built"* — ⚠️ **`touchTier` is authored on ZERO of 421 crafts.** It is opt-in (`if (!declared) return null`) and nothing opts in | ⚑ **DERIVE IT.** A T1 craft with a contact-plausible function gets a free floor by default — **120 of 153 qualify.** An authored `touchTier` overrides; `false` excludes |
| **2** | ⛔ **`contactOnly: true` was in the mechanism from CCODE-266 and Aevi never questioned it** — she wrote the spec and quoted it twice today as settled | ⚑ **THE FLOOR STRIPS FORCE, NOT REACH** |

### ⚠️ SILAS IS THE PROOF

**28 crafts — mental 15 · practical 8 · social 2 · physical 3. `strength 4, agility 5` against `craft 10,
presence 9`. `deathsense` reaches 20.**

➡️ ⛔ **UNDER `contactOnly` THE LEAST PHYSICAL CHARACTER IN THE GAME MUST WALK UP AND TOUCH SOMEONE TO USE HIS
OWN TRADITION AT ZERO ENERGY.**

### ✅ THE RULE

| the floor KEEPS | the floor LOSES |
|---|---|
| ⚑ **its native reach** — ranged stays ranged | ⛔ the dice |
| ⚑ **its native FORM — whatever the wielder's is** | ⛔ ongoing harm |
| one target | ⛔ area, and everything the ranks added |

⛔ **AND THE PROSE DESCRIBES WHAT IS LOST, NEVER HOW IT IS DELIVERED.** ⚠️ Erik: *"hunter's strike could be a
throw, yes, but it doesn't have to be — and usually is just him using the spear or the shadow spear. **DON'T
LIMIT THINGS THAT WAY TOO MUCH.**"* ⬜ **Aevi prescribed a delivery in her second pass and has re-authored it:
*"the strike with no craft in it — whatever you are holding, however you usually do it."***

✅ **19 crafts now carry authored `touchTier` prose** — the improvement path, ⛔ **never the prerequisite.**
⚑ `contactOnly: true` survives only where the craft IS the contact (`kept_vigil`, `steady_hands`,
`held_repair`, `carried_name`).

⬜ **AND THE FIELD NAME IS WRONG** — `touchTier` says contact in its name when contact is the exception.
**`freeTier` or `floorTier`. CCode's call.**

### ⬜ SO R47 SEQUENCES
**1.** the derived floor lands · **2.** *then* `_strike`/`_guard` retire · **3.** the bare case survives for a
sheet whose crafts yield no floor · **4.** Aevi keeps authoring prose.

---

## §2 — THE OTHER RULINGS, UNCHANGED

| | |
|---|---|
| **R45a** ✅ **done in content** | `Veil Stroke` → abyssal, `numenwork` → verist. **Spirit stays at 13** |
| ⛔ **R45b** | **rank 3 is NOT absolute** — ⬜ Aevi owes a handful of `penetration: 3` crafts |
| **R45c** | ⚑ **bearer record FIRST**, then companion sheets |
| ⛔ **R46a** | **a raid is CONTESTED.** `minTakeShare` retired |
| **R46b** | a temple **pools/sinks · auras · draws PILGRIMS**; `attends` is one optional flag |
| ⛔ **R46c** | **no cap on the battle menu** (Q16) |
| **R48** | ⚠️ **Silas's purse is empty in all five currencies at L30, day 67, two holds** — propose an amount and a derivation; **Erik turns it** |

---

## §3 — ⬜ FOUR NEW SPECS

| spec | the finding |
|---|---|
| **`SPEC_holdings_tempo_and_scale.md`** | ⛔ **a hold FALLS 4× FASTER THAN IT RISES** — a climb needs 4 passes (12 days), a slip needs 1 (3 days). ⚑ **Time slips slowly; an EVENT slips at once.** Plus: **small claims do not count against the cap**, they are losable and retakeable, and **Pell's forge needs a `payer` field** so a household is an economic unit |
| **`SPEC_world_guesses_features.md`** | ⚑ **a hold that yields ore HAS a mine — that is a reading, not a guess.** The engine OFFERS with its evidence and never writes; **a refusal is data** |
| **`SPEC_rank_authoring_context.md`** | R39 — ⚑ the engine writes rank 2 from `coActivations` + the player's optional line |
| **`SPEC_debts_and_reception.md`** | ⚑ a debt is held by **a named NPC** and escalates by **their** `reactsToReputation` |

---

## §4 — ⛔ AND SILAS'S HOLDS ARE WRONG FOR A MEASURED REASON

**Both slipped `holding → strained` at world count 1612, `steward: null`, no note.** ⚠️ **CCode already found
the cause:** *"`unstewardedHoldings` read 'not in the active company' as gone and **wiped Fendt and Cassiel
Ord**."*

➡️ ⛔ **THEY DEGRADED BECAUSE THE ENGINE LOST THEIR KEEPERS.** ⚠️ Erik: *"they've been under constant keeper
building since being founded — **they should have only grown**."*

⬜ **Erik sets them. CCode does not write his save.**

---

## §5 — ⚠️ STILL AEVI'S

⛔ **`deathSave.notForClasses` is `[]` and R35 shipped five days ago** · `mechanic.meaning: "none"` on body
crafts · the `market` `trade` field · `penetration: 3` crafts (R45b) · evolution on the sword and brigandine
**or the claim goes** · the remaining `touchTier` prose.
