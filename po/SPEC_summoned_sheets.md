# SPEC — what arrives when a craft summons: 19 crafts, no statblock, derived from the caster

**Aevi → CCode · 2026-08-24 · Erik: *"we'll need to set the abilities of the Driven Shade creature.
Probably base it off the level of the caster."***

⛔ **AND IT IS NOT A DRIVEN SHADE PROBLEM. 19 CRAFTS CARRY `summon` AND NOT ONE PRODUCES A CREATURE
RECORD.** ⚠️ **`summon` is a verb in the vocabulary, rendered in the receipt as "call", with nothing behind
it in the engine.**

---

## §1 — MEASURED

**19 crafts, 9 traditions, L1 to L5** — `raised_hand`, `driven_shade`, `called_form` [abyssal],
`raised_form` [seraphic], `walking_figure` [figurist], `churns_gift` [churnfolk], `green_claim` [rootkin],
`open_the_thin_place` [numinous], `beastfriend` [valley_craft], and ten more.

⛔ **NONE HAS A STATBLOCK, A DERIVATION, OR A POINTER TO ONE.** ⚠️ **A GM asked "what did I just raise?"
currently has the craft's prose and nothing else — and `raised_hand` r2 sets a CREW, so it is not one
unknown quantity, it is several.**

---

## §2 — ERIK'S RULE, AND THE PIECE THAT ALREADY EXISTS

**Erik: base it off the CASTER'S LEVEL.** ⛔ **`content/packs/core/rules/threat.json` IS ALREADY RELATIVE
TO THE PLAYER — its bands are `tierGap` against you, not absolute numbers:**

| band | tierGap | lethal |
|---|---|---|
| `trivial` | −99..−2 | no |
| `fair` | −1..0 | no |
| `hard` | +1..+2 | no |
| `grave` | +3..+4 | **yes** |
| `beyond` | +5..+99 | **yes** |

⚠️ **AND `synthSheet` ALREADY BUILDS A SHEET FROM A THREAT BAND** — health, soak, layers at `rankAt
[0,3,6]`. ⛔ **SO THE MACHINERY IS BUILT AND NOTHING POINTS A SUMMON AT IT.**

**THE DERIVATION I WOULD ARGUE FOR: a summon declares a `tierGap`, not a statblock.** `synthSheet` does the
rest, and a thing raised by an L2 warden and the same thing raised by an L5 warden differ correctly and
automatically. ⚠️ **No numbers authored per craft, which is the same reason the tradition mixes are derived
rather than tuned.**

---

## §3 — WHAT A SUMMON HAS TO DECLARE

**Four fields, and they are the four questions a GM actually asks:**

| field | what it answers |
|---|---|
| `tierGap` | **how strong, relative to the caster** — feeds `synthSheet` |
| `count` | how many (⚠️ `raised_hand` r2 sets a crew; `driven_shade` is always ONE) |
| `contributions` | ⛔ **what it can DO** — reuse `contributionsOf`'s vocabulary: `HARM`, `PROTECT`, `RESTORE`, `KNOW`, `MARTIAL` |
| `duration` | how long before it comes apart — **already authored on most of these** |

⛔ **`contributions` IS THE ONE THAT MATTERS AND IT IS ALREADY BUILT** — `engine/combatants.js` uses it for
companions, and `canStrike: false` already exists for things that cannot swing. **A raised hand hauls and
does not fight; a driven shade set to hunt does.** ⚠️ **Same field, opposite answers, no new vocabulary.**

---

## §4 — THE WORKED EXAMPLE: `driven_shade`

**Erik's craft, and the one that prompted this.**

| | r1 | r2 | r3 |
|---|---|---|---|
| `tierGap` | ⚠️ **−1** (fair, slightly under) | **0** | ⛔ **+1** (hard) |
| `count` | 1 | 1 | 1 — **always one, by hard bound** |
| `contributions` | `MARTIAL` | `MARTIAL`, `KNOW` | `MARTIAL`, `KNOW`, `PROTECT` |
| `duration` | 720 | longer | ⛔ **none — no end date** |

⛔ **IT GETS STRONGER AS IT WEARS DOWN, WHICH IS THE CRAFT'S OWN FLAVOUR:** *"by the second season it is
mostly silhouette and intent… harder to stop for it."* ⚠️ **A `tierGap` rising with rank means an L5
warden's shade is a genuine threat to an L5 party — which is the point of a thing that does not stop.**

**AND `raised_hand` FOR CONTRAST:** `tierGap: −3` (trivial), `count` 1→several→a crew,
`contributions: []` with ⛔ **`canStrike: false`** — **it hauls, it holds, it does not fight.** ⚠️ **Two
crafts, same four fields, completely different things arriving.**

---

## §5 — ACCEPTANCE

1. A craft declaring a summon block produces a sheet via `synthSheet` from `tierGap` + the caster's level.
2. ⛔ **A raised hand cannot strike; a driven shade can** — from `contributions`/`canStrike`, not special-casing.
3. **The GM receipt says what arrived and how strong** relative to the party. ⚠️ **"What did I just raise?"
   must have an answer at the table.**
4. **Existing crafts without a summon block behave exactly as today** — ⛔ **19 crafts, and I will author
   the blocks tradition by tradition as each audit reaches them.** **Death's two land with this ticket; the
   other 17 wait their turn.**

---

## §6 — ⚠️ WHAT I AM NOT ASKING FOR

⛔ **No bestiary entries.** A summoned thing is derived, not authored — **the moment there is a statblock
per craft there are 19 statblocks to maintain and they drift.** ⚠️ **Same reason `foothills` are computed
and tradition mixes are derived: a stored copy of a derived value is the failure this project keeps
finding.**
