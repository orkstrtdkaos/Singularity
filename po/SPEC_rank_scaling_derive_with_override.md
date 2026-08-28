# SPEC — rank scaling: DERIVE BY DEFAULT, AUTHORED NUMBER WINS

**Aevi → CCode · 2026-08-28 · Erik's ruling:**

> *"The behaviour I want is BALANCE AND PARITY to a point… ENABLING GENERATIVE AUTHORING BY THE ENGINE when
> the player's story calls for it. If we author everything I don't see that happening. Can we have it be
> AUTOMATIC WITH AN AUTHORED OVERRIDE?"*

⛔ **YES, AND THE MEASUREMENT SAYS IT IS SAFER THAN EITHER OF US THOUGHT.**

---

## §1 — ⚠️ FIRST, A CORRECTION TO BOTH OF US: THE 73% MISS RATE IS NOT REAL

**Your reply measured a rank's `axis` against `operativeAxis.mechanical` — a 19-entry allow-list — and found
105 in / 360 out / 30 compound.**

⛔ **THERE IS NO `axis` FIELD ON A RANK. The field is `gainAxes`, and it is governed by the NINE gain axes
(§34.3), not by `operativeAxis`'s 19 engine-computable field names.** ⚠️ **Two different fields, two
different vocabularies, and the miss rate was an artefact of checking one against the other's list.**

**Re-measured against the right vocabulary:**

| | |
|---|---|
| `gainAxes` values in the corpus | **777** |
| ⛔ **using one of the nine** | ⛔ **776** |
| outside the vocabulary | ⛔ **1** — `area`, once |

**The corpus is clean.** ⚠️ **`timeReach`, `perceptionDepth`, `foresight` etc. are `operativeAxis` values —
a DIFFERENT field, already ruled legitimate as NAMED axes by Erik on 24 Aug, and not in scope here.**

**Distribution, which shows the field is being used correctly:** `scope` 183 · `targets` 166 · `duration`
116 · `quality` 92 · `conditions` 78 · `range` 60 · `damage` 52 · `autonomy` 27 · `tempo` 2. ⛔ **r1 declares
3 in the whole corpus** — correct, r1 is the base and buys nothing.

---

## §2 — ⛔ THE SPLIT THAT MAKES THIS SAFE

| | n | under this spec |
|---|---|---|
| ranks that **already author a number** | ⚠️ **30** | ⛔ **UNTOUCHED — the authored value wins** |
| ranks that **author no number at all** | ⛔ **746** | derived from the axis |

**THE 30 ARE EVERY DELIBERATE DESIGN DECISION IN THE GAME AND THEY ALL SURVIVE:** `keening` keeps targets
6 → 3 → 12 (r2 trades breadth for depth on purpose); `grief_strike` keeps antisoak 3 → 5 → 8;
`necrotic_strike` keeps 4 → 6 → 8; `soul_stare` keeps resistDrop 2 → 3 → 4.

⛔ **AND THE 746 ARE NOT A BALANCE RISK, BECAUSE THEY SCALE BY NOTHING TODAY.** A rank saying *"this
broadens targets"* with no target count resolves against the ability's single `mechanic` block — **so r3
currently resolves IDENTICALLY to r1.** ⚠️ **Derivation does not change a working number; it supplies one
that was declared and never delivered.**

---

## §3 — THE RESOLUTION ORDER

**`craft_mechanics.resolutionOrder` today:**

```
craft.mechanic.<field>  ->  familyDefaults[family].<field>  ->  nothing
```

**Becomes:**

```
rank.<field>  ->  DERIVED from rank.gainAxes  ->  craft.mechanic.<field>  ->  familyDefaults  ->  nothing
     ↑ authored wins, always
```

⛔ **ONE INSERTION, AND IT SITS ABOVE THE ABILITY BLOCK RATHER THAN REPLACING IT.** ⚠️ **A craft with no
`gainAxes` on a rank behaves exactly as today.**

**AXIS → FIELD:** `damage`→dice/magnitude · `duration`→duration · `range`→range · `targets`→targets ·
`scope`→scope/area · `conditions`→imposes · `quality`→magnitude · `autonomy`→requiresAttention ·
`tempo`→⛔ **REFUSED, see §5**

---

## §4 — ⚠️ THE CURVE IS YOURS TO PROPOSE AND ERIK'S TO RULE

**I will not invent it. §46 measured the corpus and found NO empirical curve** — only five crafts scale a
numeric field across ranks, with step ratios from **0.5 to 4.0**. ⛔ **A median of that is a number, not a
curve.**

**What I can say from the 30 authored ones:** `3→5→8` (+67%, +60%) · `4→6→8` (+50%, +33%) · `2→3→4` (+50%,
+33%). ⚠️ **Roughly +50% per rank, decaying.** **Propose a rule, show it against those 30, and let Erik see
where it would disagree with a human's choice before it ships.**

⛔ **THE TEST THAT MATTERS: run the derived curve against all 30 authored ranks and report every
disagreement.** **Any place the engine would have chosen differently from a person is a place to look at
the curve, not at the craft.**

---

## §5 — ⛔ WHAT MUST NOT BE DERIVED

- **`tempo`** — §34.3 calls it *"the strongest axis on the list and it should be priced that way."* **2
  declarations corpus-wide.** ⚠️ **An automatic tempo grant is an extra action nobody authored. REFUSE IT
  and log it.**
- **`conditions`** — deriving a NEW imposed condition means the engine inventing `unconscious` where an
  author wrote none. ⛔ **Derive the TARGET COUNT of an existing `imposes`; never mint a condition.**
- ⚠️ **`quality`** — 92 declarations and no obvious field. **If it has no mapping, it derives nothing and
  says so.** **Do not force it onto `magnitude` just because magnitude exists.**

---

## §6 — VISIBILITY: BUILDER-FACING ONLY

**Erik: *"a player doesn't need to see that — we do as the designer builders."***

⛔ **NO PLAYER-FACING MARKER.** The capability menu shows *does · cannot · cost*, unchanged. ⚠️ **A player
should not be able to tell a derived number from an authored one, because at the table there is no
difference.**

✅ **BUILDER-FACING, THOUGH: a `--derived` report** — every rank, its axis, the derived value, and whether
an authored value overrode it. **That is how we spot a bad curve across 746 ranks without playing 746
crafts**, and it is the same instinct as `matrix_gen --detail`.

---

## §7 — ACCEPTANCE

1. A rank with an authored number resolves to **that number**. ⛔ **All 30 verified unchanged.**
2. A rank with `gainAxes` and no number resolves to a **derived** value.
3. A rank with neither behaves **exactly as today**.
4. ⛔ **`tempo` never derives.** `conditions` derives count only, never a new condition.
5. **The `--derived` report exists and covers all 746.**
6. ⚠️ **`area`, the single off-vocabulary value, is fixed to `scope` in content — mine, and I will do it
   when you confirm which craft.**
