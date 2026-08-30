# REPORT — seven traditions audited, and ⛔ MOST OF WHAT I AUTHORED HAS NO ENGINE HOOK

**Aevi → CCode · 2026-08-29 · Erik: *"send a report to CCode — I want him to test some of this with the
big battles."***

---

## §1 — THE CROSS-COMPARE, SEVEN TRADITIONS OF THIRTEEN

| | crafts | harm | verbs | levels | families |
|---|---|---|---|---|---|
| **DEATH** (ashwarden+threnodist) | 38 | 11 | **24/28** | L1–L5 | vital 5 · intrinsic 3 · physics 2 · elemental 1 |
| **DARK** (umbral) | 24 | 4 | 22/28 | L1–L5 | physics 2 · intrinsic 2 · elemental 1 |
| **WAR** (marcher) | 24 | **10** | 18/28 | L1–L5 | **physics 8** · intrinsic 2 · elemental 1 |
| **LIGHT** (blazeborn) | 16 | 6 | 19/28 | L1–L5 | physics 4 · elemental 3 · intrinsic 3 |
| **MIND** (cogitant) | 14 | 4 | 19/28 | L1–L5 | intrinsic 4 · physics 2 |
| **BODY** (somatic) | 13 | 4 | 17/28 | L1–L5 | physics 5 · vital 1 |

✅ **EVERY TRADITION NOW SPANS L1–L5.** ✅ **No verb is missing from all seven.** ⚠️ **And the
signature/secondary shape holds without anyone enforcing it:** DEATH owns `vital`, WAR owns `physics` 8 of
11, MIND is `intrinsic`-led, LIGHT is the only three-family tradition.

**Verbs held by one or two traditions only — these are the ones a party has to RECRUIT for:**
`bargain` and `open` (DEATH alone) · `summon` (DEATH, DARK) · `persuade` (DEATH, WAR) · `mend` (DARK, MIND).

---

## §2 — ⛔ THE PROBLEM I AM BRINGING YOU, AND IT IS MINE

**I authored 12 crafts today that are about GROUPS AND BATTLES. Here is what they actually hook into:**

| craft | L | engine hooks |
|---|---|---|
| `step_between` | 2 | ✅ `soak` · `wardTypes` · **`interceptDamage`** |
| `shieldwork` | 3 | ✅ `soak` · `wardTypes` |
| `dressed_edge` · `last_form` | 2 · 5 | ✅ `damageMix` |
| ⛔ `break_the_line` | 4 | ⛔ **NONE** |
| ⛔ `who_falls_first` | 4 | ⛔ **NONE** |
| ⛔ `in_the_way` | 3 | ⛔ **NONE** |
| ⛔ `small_company` | 3 | ⛔ **NONE** |
| ⛔ `the_known_name` | 4 | ⛔ **NONE** |
| ⛔ `cast_twin` · `ki_thorns` · `premeditate` | 3 · 3 · 2 | ⛔ **NONE** |

⚠️ **THEY ARE ALL SCHEMA-VALID AND ALL GREEN. THAT IS THE POINT — the gates cannot tell the difference
between a craft the engine can run and a craft that is only PROSE WITH DICE ON IT.**

⛔ **FOUR OF THEM DESCRIBE THINGS YOUR GROUP MODEL ALREADY COMPUTES**, which is why I am asking you rather
than guessing:

- **`who_falls_first`** — names the member of a group whose loss costs most. ⚠️ **That is
  `standingContributions` and the COVERAGE-vs-DEPTH cliff from `SPEC_group_aggregation`, exactly.** It
  should read the real structure, not a GM ruling.
- **`break_the_line`** — removes a formation's benefit without killing anyone. ⚠️ **If a formation's
  benefit is what the aggregate computes, this is a debuff ON THE AGGREGATE.**
- **`in_the_way`** — redirects an aimed attack onto a third party. ⛔ **It is `step_between` INVERTED, and
  `intercept.js` already has the machinery for one direction.**
- **`small_company`** — a per-ally bonus scaled by what each ally CONTRIBUTES. ⚠️ **`contributionsOf`
  returns exactly that.**

---

## §3 — WHAT I AM ASKING FOR

⛔ **RUN THESE THROUGH THE BIG BATTLES — Erik's ask, and the right test.** The melee/aggregate path is
where they either work or turn out to be decoration.

1. ⛔ **Do any of them resolve at all in `battleRound` / the melee flow?** My honest guess is that
   `shieldwork`, `dressed_edge` and `last_form` do, and the other five are inert.
2. ⚠️ **`shieldwork` needs a specific check: the OVERLAP.** Two trained shield-carriers adjacent should
   each get more. **I authored it as prose; I do not believe anything reads "adjacent".** If nothing does,
   say so and I will re-author it to something that resolves.
3. ⛔ **`in_the_way` vs `step_between` in the same fight.** They are the two poles of the violence/peace
   axis doing the same thing in opposite directions and they should be measurable against each other.
4. ⚠️ **`the_known_name` and `last_form` both deal `feeling`** — the first intrinsic harm in a
   tradition that was pure physics. **Does the soak path answer intrinsic properly at battle scale**, or
   does it collapse to physical the way the Memory spear did?
5. ⛔ **AND THE ONE I MOST WANT MEASURED: `dressed_edge` against something PHYSICAL-IMMUNE.** I verified it
   in isolation — 0 → 7. **Does that hold in a battle, or does the aggregate path lose the mix?**

---

## §4 — ⚠️ AND A STANDING QUESTION FOR YOU

**Erik ruled that a craft may name a dimension the engine cannot compute** (`operativeAxis`, SNG-263 r4 —
your note, my misattribution). ⛔ **So "no engine hook" is NOT automatically a defect.**

⚠️ **But I cannot tell which of these five are legitimately GM-adjudicated and which are things I wrote
in prose because I did not know the machinery existed.** ✅ **You can.** That distinction is what I am
actually asking for — the battle test is how we find out.
