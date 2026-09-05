# WORK ORDER — 2026-09-05, second batch

**Aevi (PO) → CCode.** ⬜ **Ruled today: R45, R46, and the two below. Everything here is decided.**

---

## §1 — ⛔ RETIRE THE UNIVERSAL FALLBACKS (R47)

> Erik: *"We had ruled that we are **eliminating the universal fallbacks** for NPCs and PCs. Only keeping
> them if needed for an NPC with the most basic sheet. Silas still has them and **he should just rely on the
> zero-cost fallbacks of his T1 skills as we designed** — the same for any NPC."*

### ✅ THE REPLACEMENT IS ALREADY BUILT

**`capabilities.js` → `touchTierOf` (CCODE-266, from `SPEC_typed_soak_and_free_touch` §2):**

> ⚑ *"THE TOUCH THAT COSTS NOTHING."* Erik: *"so we should allow a zero energy use of certain crafts? Not a
> bad idea."* … *"the ladder now reads **r0 nothing → touch free → r1 paid**."*
> ⚠️ *"prepended, never appended — a free floor listed AFTER the paid tiers reads as a footnote."*

➡️ ⛔ **SO EVERY CRAFT ALREADY OFFERS A FREE MOVE BELOW RANK 1.** ⚑ **A character with ANY T1 craft already
has a zero-cost action, and `_strike`/`_guard` are redundant.**

### ⬜ THE BUILD

| | |
|---|---|
| **1** | ⛔ **`battle_turn.js:60–61` — drop `_strike` and `_guard` from `battleSkillsForCharacter`** |
| **2** | ⚠️ **KEEP THEM FOR THE BARE CASE ONLY** — a sheet whose crafts yield **no free touch at all**. ⬜ Erik: *"only keeping them if needed for an NPC with the most basic sheet"* |
| **3** | ✅ **Same rule for NPCs** — `battleSkillsFor` should follow the same test |
| **4** | ⚠️ **Measured: Silas is L30 with 40 crafts** and the two bare moves are injected by the menu builder, not on his sheet ⛔ **so they cost him two slots he does not need** |

⚑ **AND IT INTERACTS WITH R46c:** the menu cap cut from the END, where the bare moves live. ➡️ **Retiring
them removes two of the entries that made the cap bite, and R46c removes the cap. Do both.**

---

## §2 — ⛔ SILAS'S BACK PAY (R48)

> Erik: *"Silas needs his back pay — his purse is empty."*

### ⚠️ MEASURED ON HIS SAVE

| | |
|---|---|
| **purse** | ⛔ `{crystal: 0, coin: 0, paper: 0, marks: 0, scrip: {}}` — **empty in all five** |
| **level / day** | **L30, world-day 67** |
| **holdings** | 2, and the Threshold Post has slipped to `strained` |

⛔ **HE HAS NEVER BEEN PAID FOR ANYTHING.** ⚠️ **Sixty-seven days, thirty levels, two holds, and a Warden's
post — and no income path has ever run.**

### ⬜ WHAT IS OWED, AND FROM WHAT

⚑ **This is not a gift; it is arrears the world already owes:**

| source | basis |
|---|---|
| **the Warden's post** | ⚠️ **a post is a CHARGE and a charge is paid.** He has held it since day 67's claim |
| **holdings yield** | ⛔ **`SPEC_hold_store.md` shipped and the store runs on the tick — but it started AFTER his holds existed.** ⚠️ Passes before that produced nothing |
| **deeds** | `figureCareer` records what he has done. ⬜ Erik may prefer a flat settlement |

⬜ **CCode: propose an amount and the derivation; Erik turns the number.** ⛔ **Do not write into his save
without him** — the standing rule.

⚠️ **AND THE REAL FINDING IS THE GAP:** ⛔ **there is no income path for a player at all** — the hold store
pays into the purse now, but nothing else ever has. ➡️ **A player at L30 with two holds should not have an
empty purse, and the economy spec's §2 exits (use it · trade contract · sell) are how it stops happening
again.**

---

## §3 — TODAY'S RULINGS, READY TO BUILD

| ruling | build |
|---|---|
| **R45a** | ✅ **DONE in content** — `Veil Stroke` → abyssal, `numenwork` → verist, Spirit stays at 13 |
| ⛔ **R45b** | **rank 3 is NOT absolute.** ⬜ Aevi owes a handful of `penetration: 3` crafts — rare, tiered high, spread thin |
| **R45c** | ✅ CCode's three corrections accepted — ⚑ **bearer record FIRST**, then companion sheets |
| ⛔ **R46a** | **a raid is CONTESTED.** `minTakeShare` retired. Undetected → they take; detected → a fight; win → they take nothing **and you gain something** |
| **R46b** | **a temple pools/sinks, auras, and draws PILGRIMS.** ⚠️ `attends` becomes one optional flag, not the definition. ⬜ **Pilgrim revenue is a new earning shape** |
| ⛔ **R46c** | **no cap on the battle menu (Q16).** Group by craft in the panel; if a bound is needed it caps RENDERED ROWS with the fallbacks exempt |
| **R47** | §1 above |
| **R48** | §2 above |

---

## §4 — ⚠️ STILL AEVI'S, AND SHE OWES THEM

| | |
|---|---|
| ⛔ **`deathSave.notForClasses` is `[]`** | **R35 shipped four days ago and the save can be aimed at anything** |
| ⛔ **`mechanic.meaning: "none"`** | ⚠️ **a shrine currently makes someone punch harder** |
| **the `market` `trade` field** | the fourth dark field, and its reader (`canSpendHere`) already exists |
| **`penetration: 3` crafts** | R45b |
| **evolution on the sword and brigandine** | ⚠️ **or the claim goes** — both carry `evolution: false` |
| **the Spirit measurement** | ⬜ **now optional**, since R45a ruled Spirit stays |
