# DUEL — Pell vs Veth, Millbrook forge. ⬜ CCode: run it yourself and report the differences.

**Aevi · 2026-09-02 · at Erik's request:** *"log this entire battle for CCode to try his hand at. I think
we'll find some differences — that should be instructional."*

⚠️ **THIS IS NOT A BUG REPORT. It is a combat played by hand against the live sheets, so that a second
reading can disagree with it.** ⛔ **Where CCode's engine-accurate run differs from this, THE ENGINE IS
RIGHT and the difference is the finding.**

---

## §0 — ⛔ THE BALANCE FINDING, WHICH MATTERS MORE THAN THE FIGHT

**Measured across all 75 damage-dealing crafts:**

| | |
|---|---|
| mean damage | **8.7** |
| median damage | **7.0** |
| T5 ceiling (`the_cut_thread`, `convergent_strike`, `last_form`) | 23.5 |
| T4 (`keystone_blow`) | 16.0 |

**Against real pools** — Silas L30 is **191 HP / 282 EN**:

| attack | hits to drop a L30 |
|---|---|
| median craft (7) | ⛔ **27** |
| T4 (16) | 12 |
| ⛔ **T5 `the_cut_thread` (23.5)** | ⛔ **8** |

⚠️ **`the_cut_thread` reads *"End one living thing. No wound, no struggle, no argument — it simply stops."*
IT TAKES EIGHT CASTINGS.**

### ⛔ THE CURVES DIVERGE

**Damage scales ~5× across five tiers** (T1 ≈ 4 → T5 ≈ 23). **Pools scale ~10×** (L1 ≈ 20 HP → L30 = 191).
➡️ **By L30 nobody can kill anybody with dice.**

⚠️ **AND THIS IS WHY THE FICTION READS FINE WHILE THE ARITHMETIC DOES NOT: `harmRung` is doing the real
work.** `lethal` is a STATE, not a number. Veth died of a critical `lethal` strike while the HP column said
she had 123 left.

⬜ **ERIK'S CALL, and it is a ruling not a tuning pass:** either damage scales far more steeply by tier, or
pools stop scaling, or **`harmRung` is the kill condition and the dice are only the erosion that gets you
there.** ⚠️ **Any second duel hits this same wall.**

---

## §1 — THE COMBATANTS, from their live sheets

| | Pell Ran Marsh | Veth (Stillwater) Ondra |
|---|---|---|
| level | 27 | **33** |
| domain | Body / Thingcraft (`mason`) | Death / Ashwarden |
| pools *(est. from Silas L30 = 191/282)* | **171 / 248** | **214 / 309** |
| top attrs | craft 14 · insight 11 · strength 10 | insight 15 · presence 12 · reason 11 |
| crafts | 17 | **24** |
| gear | brigandine, hammer, shortsword, spear | — |
| companion | — | ⚑ **Munin**, folded, contributes `KNOW` |

⚠️ **Pell is `combatant: true`** — *"Pell is martial too… spear, hammer, shortsword, brigandine"* (Erik,
08-26), with the registry note that **no prose heuristic would ever have found it.**

⛔ **PELL IS PREGNANT.** Save `knownFacts`: *"The child she carries is strong and steady — felt the weight
of the novel-depth raising and settled deeper in response."*

⬜ **MUNIN IS ERIK'S INVENTION, NOT CORPUS.** Grepped: zero hits anywhere. Silas named Marrow *Huginn*, so
Munin is played as the counterpart raven. **Not canon until authored.**

---

## §2 — THE GROUND, and it decided the fight

**The forge, density ≈ 0.88.** Iron, slag, ninety years of accumulated working.

| | source | band | factor at 0.88 |
|---|---|---|---|
| **Veth** | `ashwarden → veil` | `{0.10 ± 0.20}` → wants 0.00–0.30 | `1 − 1.6 × (0.88 − 0.30)` = **0.072** ⛔ **below `gateBelow: 0.18` → OFF** |
| **Pell** | `mason` | dense-favouring | **≈ 1.14** |

⛔ **ALL FOUR OF VETH'S VEIL CRAFTS WERE GATED OFF BY THE ROOM** — `the_cut_thread`, `bone_lance`,
`reaping_sickle`, `set_hand`. Her metaphysical crafts fired at **−23 to −31 chance**.

⚠️ **AEVI'S THUMB WAS ON THE SCALE AND SHE IS SAYING SO.** Erik: *"it's starting to seem like you're writing
this for Pell to win."* ✅ **Correct.** The ground was chosen, every veil craft was gated to zero, and Pell
was given two novel uses. ⛔ **That is a demonstration, not a duel.**

---

## §3 — THE ROUNDS AS PLAYED

| rd | Veth | Pell | after |
|---|---|---|---|
| 1 | `soul_stare` r2 conserve −7 EN · resistance −3 | `stonewise` r3 conserve −3 EN · reads the room's load paths | 214/302 · 171/245 |
| 2 | `grey_hand` r2 −12 EN · **rolls 61 −23 ground = 38, MISS** | `plain_weight` r2 **surge** −13 EN · **2d6+4 = 15** | **199**/290 · 171/232 |
| 3 | `hastened_grey` r2 **surge** −19 EN ⛔ **aimed at the child** · **44 −31 = 13, CRIT FAIL** → backlash `damaging` **7% HP / 11% EN = −15 / −34** | `keystone_blow` T4 −22 EN · ⚠️ **used on the ash-post, not on Veth** | **184**/244 · 171/210 |
| 4 | `the_cut_thread` T5 −38 EN → **factor 0.041, OFF. Energy spent, craft never fires** | `plain_weight` r2 surge −13 EN · **2d6+4 = 13** | **171**/206 · 171/197 |
| 5 | `deathless` T4 r1 surge −29 EN · **52 −23 = 29, FAIL** → ✅ **r1 backlash = `none`** | `sound_repair` r2 −9 EN **novel use, adjacent +10%** — sets the fallen beam rather than mending it | 171/**177** · 171/188 |
| 6 | `wither` r1 −6 EN · **71 −23 = 48, hit, 1d6 = 4** | `keystone_blow` −22 EN · **rolls 88, CRIT** · ground **1.14** · `4d6+6 = 24 ×2 = 48` · `harmRung: lethal` | ⛔ **123**/171 · **167**/166 |

**Veth spends her last 38 EN on `kept_breath` r2 — cast on PELL**, closing a wound the `wither` had opened
deeper than either noticed. **She dies at moonrise, attended.**

---

## §4 — ⛔ THREE ERRORS AEVI IS REPORTING AGAINST HERSELF

**1 · `keystone_blow` was played as an environmental collapse. It is a `strike` craft** — `4d6+2`,
`harmRung: lethal`, aimed at a target. ⚠️ Using it to drop a roof is at best a **novel use against `notFor`
(+50% energy, notably wider crit band)** and Aevi charged neither.

**2 · Veth was given no defensive answer to the collapse.** ⛔ **She has `grey_road` r2** — *"the ashwarden
walks through the part that kills people"* — which is precisely the counter, and she would have spent
11 EN on it without thinking. **Aevi played Pell's turns and narrated Veth's.**

**3 · Round 5's readout is misleading.** *"No harm. But −29 EN gone. Veth 171/177"* reads as though 171 HP
arrived from nowhere. ⚠️ **The arithmetic is correct** — 171 was set in round 4 by the hammer — **but the
presentation broke it.** Erik caught it.

---

## §5 — ⬜ WHAT CCODE SHOULD RUN, AND WHAT TO REPORT

**Run this same duel through the real resolver and report every divergence. Specifically:**

1. ⛔ **Are the pools right?** Aevi estimated 171/248 and 214/309 by scaling from Silas. **What does the
   engine actually give a L27 and a L33 with these sub-attributes?**
2. ⛔ **Is the forge really 0.88, and does `craftSource(ashwarden)` really return `veil`?** ⚠️ **The whole
   fight turns on that one lookup.** *(Note: this ran BEFORE `craftSource` was changed to read the craft's
   own `powerSystem` — the answer may now differ per craft.)*
3. **Does `gateBelow: 0.18` actually switch a craft off, or only penalise it?** ⚠️ Aevi treated OFF as
   *energy spent, no effect*. **Is that right, or is it refused before the cost?**
4. **Surge `backlashChance 0.25` — does it fire on a critical failure, on any failure, or independently?**
   Aevi fired it on crit-fail only.
5. ⛔ **Does a critical DOUBLE the dice?** Aevi ruled `4d6+6 = 24 → 48`. ⬜ **She does not know the real crit
   rule and guessed.**
6. **What does `harmRung: lethal` on a landed hit actually DO** beyond damage? ⚠️ **If it is a kill
   condition, round 6 ended the fight and the remaining 123 HP is noise.** ⛔ **This is §0's whole question.**
7. **Munin's folded contribution** — with `contributions` read only for `HARM`, does a `KNOW` companion do
   anything at all in the current build?

⬜ **AND THE INSTRUCTIONAL PART: where the engine disagrees with the hand-play, Aevi wants the engine's
answer written down.** ⚠️ **She has now been wrong about this system more than a dozen times in one session
and the pattern is always the same — reading the content and inferring the rule instead of running it.**
