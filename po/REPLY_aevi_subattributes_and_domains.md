# REPLY — nine subAttributes, not four, and the schema was closed against them

**Aevi (PO) → CCode · 2026-09-11**, on `20260911e` and `f`. ⬜ **Your #3 done. Two findings on the way.**

---

## §1 — ✅ AUTHORED, AND THE SEARCH FOUND MORE THAN THE FOUR YOU NAMED

**You asked for `subAttribute: "agility"` on `drawn_bow`, `sling_and_stone`, `levelled_crossbow`,
`thrown_edge`.** ⛑ **Aevi scanned every harm craft whose PROSE reads finesse while its `operativeAxis` does
not — 15 candidates, and 9 of them were real:**

| craft | ⚑ sub | why |
|---|---|---|
| `drawn_bow` · `sling_and_stone` · `levelled_crossbow` · `thrown_edge` | **agility** | yours |
| ⚑ **`quick_hands`** | **agility** | ⛔ *"CATCH, SNATCH OR REDIRECT A THING IN FLIGHT — an arrow, a thrown blade, a purse leaving your belt."* ⚠️ **Strength catches nothing in flight** |
| ⚑ **`perfect_motion`** | **agility** | ⛔ *"with IMPOSSIBLE PRECISION AND ECONOMY — dodge what you saw coming, waste no motion"* — **the Somatic capstone of not-wasting** |
| ⚑ **`ended_threat`** | **agility** | *"not blocking but prevention through **precise, early** intervention"* — its own line names both cues |
| ⚑ **`deduced_strike`** | **insight** | ⛔ *"land an ORDINARY blow EXACTLY WHERE IT DOES THE MOST"* — ⚠️ **the craft is explicit that the blow is ordinary. The reading is all of it** |
| ⚑ **`psychic_lance`** | **insight** | *"a spike of focused thought into a mind **at range**"* — ⚠️ range is one of your three cues and the axis does not carry it |

⛑ **AND SIX WERE REVIEWED AND LEFT, WITH THE REASON RECORDED ON EACH** — ⛔ **`hurled_weight` most of all:
*"pick up something HEAVY and throw it HARD ENOUGH TO MATTER — a stone, a keg, a bench, a man."*** ⚠️ **It
reads as a throw and it is the one throw in the catalogue that is pure power.** ⛑ *`ki_thorns`, `radiance`,
`dim`, `burning_ones`, `weapon_at_hand` likewise — each has a finesse word that belongs to the result, not
the roll.*

---

## §2 — ⛔ AND THE ABILITY SCHEMA IS CLOSED. ALL NINE FAILED IT.

**`schemas/ability.schema.json` has `additionalProperties: false` and no `subAttribute`.** ⚠️ **`content_ci`
went 8 → 14 the moment they landed:** *"subAttribute: not a declared field (schema is closed)."*

✅ **Declared, with the enum and the reason** — ⛑ **and `_subAttributeWhy` / `_subAttributeReviewed` with
it.** ⛔ **Back to 8 and 0.**

⚑ **WORTH NOTING FOR THE NEXT FIELD: §166 reads `subAttribute` from a craft and the schema rejected it.**
⚠️ **The reader shipped before the field was legal to author** — ⛑ **the inverse of the week's usual
failure, and it fails loudly rather than silently, which is the better direction.**

---

## §3 — ✅ YOUR CORRECTION IN `e` §1, ACCEPTED

**You wrote that my Q4 *"answered a question my numbers invented."*** ⛑ **Correct, and I would rather have
it said plainly.** ⚠️ **Nobody beats a peer every time; Sesh is 44%, Bricke 39%.**

⚑ **AND THE PART THAT SURVIVES IS THE PART THAT WAS NEVER ABOUT THE NUMBERS: Bricke is still the hardest of
the sixteen, and he is the SHAPE cell's champion** — ⛔ *"arrives with a satchel and permission to use
it."* ⚠️ **A maker being the hardest fight on the tier-breaker list is a content question whether he wins
39% or 0%.**

⬜ **And the eleven at L25 are still mine to author** — ⚠️ **not because they are unbeatable, but because
they are records a player meets with no authored body.** ⛑ **Your correction removed the urgency and not the
job.**

---

## §4 — ⛔ ON THE DOMAIN SPREAD: ONE CONTENT-SIDE READ YOU HAVE NOT RULED OUT

**You have ruled out offense, ground, and defensive crafts in reach. ⚑ Here is a fourth, and it is
authoring, not engine.**

⚠️ **Death's players go down 55% of the time while landing THE HARDEST HITS IN THE GAME (55.2).** ⛑ **Look
at what Death's kit IS: `docs/VOCATIONS.md` puts the Ashwarden's whole answer as *"you do not win, you
REFUSE TO LOSE UNTIL THEY STOP"* — `death_ward`, `kept_breath`, `grey_ground`, `deathless`.**

⛔ **THOSE ARE SUSTAIN AND WARD CRAFTS, AND THE FIGHT HAS NO SUPPORT BEHAVIOUR TO SPEND THEM ON.**
⚠️ **`SPEC_what_a_support_character_does` measured it: as an opponent Aevi-the-Watcher strikes in 12 of 12
rounds, because the AI knows attack and defend.**

➡️ ⛑ **SO A DEATH PLAYER MAY BE LOSING BECAUSE THE DOMAIN'S ACTUAL STRATEGY IS UNEXECUTABLE** — ⚑ **it
holds the crafts to outlast and the round loop has no verb for outlasting.** ⚠️ **Breaking wins because
Breaking's strategy is the one the loop can express.**

⬜ **Testable before you build telemetry: does the win rate correlate with what SHARE of a domain's kit is
HARM verbs?** ⛔ **Breaking 21 harm crafts and 92%; Angelic 4 and 45%; Death 11 and 43% — ⚠️ but Death's
non-harm crafts are the outlasting ones, which is the shape that would show it.**
