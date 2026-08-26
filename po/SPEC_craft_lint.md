# SPEC — `po/craft_lint.mjs`: the mechanical half of the audit, run corpus-wide

**Aevi → CCode for review · 2026-08-24 · Erik: *"YES on the corpus-wide craft-lint… just be aware that
you shouldn't BREAK things by doing this. Check before assuming."***

⛔ **NOT BUILT. Spec only, for your review before I write a line — Erik's sequencing.**

---

## §1 — WHY, AND THE NUMBER THAT JUSTIFIES IT

**Thirteen Death crafts reviewed one at a time with Erik produced 33 MECHANICAL findings — `harmRung`
inversions, off-band energy, empty `notFor`, `gains: deepen` on a base rank, stale generated `plainly` —
⛔ AND NOT ONE OF THEM NEEDED HIM.** ⚠️ **What needed him was six design decisions: is this craft worth
having, what does it bolster, what is the colour, is it duplicative.**

**Twenty Death crafts remain and twelve traditions after that.** ⛔ **The mechanical half must stop
reaching Erik at all.**

---

## §2 — ⛔ THE DISASTER I ALMOST SHIPPED, WHICH IS WHY THIS IS A SPEC AND NOT A COMMIT

**I ran a first draft read-only. It reported 1,198 findings. ⛔ 663 OF THEM WERE MY OWN BUGS.**

| what I did | why it was wrong |
|---|---|
| linted `operativeAxis` against the NINE GAIN AXES | ⛔ **different vocabulary entirely** — `craft_mechanics.operativeAxis.mechanical` is 19 values (`soak`, `penetration`, `variance`, `evasionRank`…) |
| treated it as a CLOSED list | ⛔ **it is DELIBERATELY OPEN.** Its own note records that MY blazeborn pilot broke a closed version and the ruling was that NAMED axes are real |
| iterated it assuming `list` | ⚠️ **it is a STRING on 29 crafts** — findings came back as `e`, `o`, `a`, `_` |

⛔ **AND I HAD ALREADY SHIPPED THREE OF THESE AS "FIXES" HOURS EARLIER.** `dread` lost `variance` — which
IS in the mechanical list — **on a craft that carries `variance: 4`.** Reverted.

⚠️ **THE RULE THIS SPEC IS BUILT AROUND: EVERY CHECK CITES THE SCHEMA IT MEASURES AGAINST, IN THE OUTPUT.**
**A finding that cannot name its authority is not a finding.**

---

## §3 — THE CHECKS, WITH THEIR AUTHORITY AND MY CONFIDENCE

**Counts are from the corrected read-only pass over 374 crafts.**

| # | check | authority | n | fixable? |
|---|---|---|---|---|
| 1 | `harmRung` not in the four rungs | `IMPOSABLE`/rung vocabulary | 0 | — |
| 2 | ⛔ **ability `harmRung` non-`none` over all-`none` ranks** | structural | **36** | ⚠️ **flag only** — the right value is the max rank, but which rank is right is judgement |
| 3 | `gainAxes` value not among the nine | §34.3, fixed list | 0 | ✅ auto |
| 4 | ⛔ **r1 declares `gains: deepen`** | r1 is the base; §46.11 | **42** | ✅ **auto → `broaden`** |
| 5 | energy outside the level band | ⛔ **`energy_costs.byLevel[].band`, AUTHORED from 342 abilities** | **76** | ⚠️ **flag** — §32.15 says a low price is often an apologetic craft, which is a design tell |
| 6 | lowercase `challengeTypes` | canonical 15 are uppercase | **74** | ⚠️ **flag + list** — the values are a DIFFERENT vocabulary, not a case error |
| 7 | empty `notFor` | §32.6 required | **67** | ⛔ **flag only — authoring** |
| 8 | `intensity` is a bare string | 345 crafts use `{conserve, surge}` | **29** | ⚠️ **flag** |
| 9 | `[cost]` bound whose text never says energy | Erik ×5: **energy is the cost** | **211** | ⛔ **FLAG ONLY — heuristic, see §4** |
| 10 | `plainly` disagrees with the tree | generated field | 2 | ⚠️ flag |

**~324 real findings. ⛔ AUTO-FIXABLE: ONE CHECK, 42 CRAFTS.**

---

## §4 — ⚠️ THE 211 IS THE ONE I AM LEAST SURE OF AND WANT YOU TO PUSH ON

**Check 9 flags any `class: "cost"` bound whose text does not mention energy. ⛔ THAT IS A PROXY, NOT THE
RULE.** The real rule is Erik's: *a `cannot` is a scope limit, not a bill; energy is the cost.*

**In Death it was 6 for 6 — every one was a genuine narrative debt** (*"later is still owed"*, *"you pay it
in yourself"*, *"you carry some of it"*). ⚠️ **BUT 211 CORPUS-WIDE IS 56% OF EVERY CRAFT, and I do not
believe 56% of the game is wrong.**

**Two possibilities and I cannot tell them apart from here:**
1. the `cost` bound class legitimately carries non-energy costs I have not thought about, or
2. ⛔ **this really is a corpus-wide authoring habit** — the same one I demonstrated five times in one day.

**MY ASK: your read on which.** ⚠️ **If it is (1), check 9 becomes a report I read by hand and never a
fixer. If it is (2), it is the largest single finding in the corpus and wants Erik.**

---

## §5 — SAFETY, AND IT IS THE POINT OF THE SPEC

1. ⛔ **REPORT MODE IS THE DEFAULT AND THE ONLY MODE THAT SHIPS FIRST.** `--fix` does not exist in v1.
2. ⛔ **LOADER PARITY** — merges `first_gift_template` as `engine/state.js` does (§46.4), or 25 crafts
   report phantom defects.
3. ⛔ **EVERY FINDING PRINTS ITS AUTHORITY** — file and key. ⚠️ **A check whose authority I cannot name does
   not go in.**
4. **Field-shape tolerant:** `notFor` is `str` on 301 and `list` on 73; `intensity` is `dict` on 345 and
   `str` on 29; `operativeAxis` is `str` on 29. ⛔ **Every accessor handles all forms.**
5. ⛔ **NO CHECK AGAINST A VOCABULARY I INFERRED.** Only lists that exist in a rules file and are read by
   the engine or a gate.
6. **Output is per-craft and per-tradition**, so a tradition can be swept before its audit rather than one
   craft at a time.
7. ⚠️ **When `--fix` eventually lands: one check at a time, one commit per check, full suite between.**
   **Never a batch.**

---

## §6 — WHAT I DELIBERATELY LEFT OUT

- ⛔ **`operativeAxis` entirely.** Open vocabulary. **There is no defect to find and I have already proved I
  will invent one.**
- **Prose quality, colour, duplication, "would a player want this".** ⚠️ **Erik's, and the lint exists to
  give him more time for exactly these.**
- ⛔ **Cross-craft convergence** — three crafts sharing a win condition. **Real, and a separate tool: it is a
  tradition-level analysis, not a per-craft check.**

---

## §7 — WHAT I WANT FROM YOUR REVIEW

1. **§4 — is the 211 real, or is `cost` broader than I think?**
2. **Check 2 (36 rung inversions): auto-fix to max-of-ranks, or flag?** ⚠️ **I said flag. If the max rule
   holds corpus-wide it could be auto and that is 36 crafts I never bring to Erik.**
3. ⛔ **Any check whose authority you think I have got wrong** — that is the failure mode this spec exists
   to prevent, and I got it wrong on my first attempt with a file that recorded my own earlier correction.
4. **Is `po/` the right home, or should it live in `tests/` and go red?** ⚠️ **My instinct is `po/` and
   report-only, because most of these are authoring debt rather than breakage.**
