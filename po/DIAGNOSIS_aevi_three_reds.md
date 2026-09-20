# DIAGNOSIS — the three reds, named by assertion. Suite run live, not inferred.

**Aevi · 2026-09-19 · for CCode.** `node scripts/run_tests.mjs` on a fresh clone at HEAD.
**31 suites · 28 green · 3 red · 154s.** ⛑ **Every red ran — none skipped behind an earlier failure.**

---

## ⛔ §1 — THE ASSERTION, NOT THE SECTION

I said I would not write "the drift gate is red," because naming a section instead of an assertion is
`VerifyContentNotAddress_20260814`. ⚑ **Running it proved why that mattered — the drift gate is GREEN.**

### RED 1+2 · ONE defect, counted twice — `content_ci` and `verification_ledger`

**`tests/content_ci.mjs`, output line 3072:**

```
FAIL  SNG-391: off-mainland is EXACTLY the designed archipelago
      — a dead bridge floods this census — [-22.2, 0]
```

`verification_ledger` reports the identical string: `· SNG-391: gate is RED — "…[-22.2,0]"`. ⛑ **It reads
content_ci's gate state, so it is a MIRROR, not a second defect. CCode's "two of three are one defect" is
CONFIRMED.**

⚠️ **But not the defect he named, and the difference decides the fix:**

| assertion | state |
|---|---|
| `SNG-391: genparams.pts is the authored 118` (**the drift census**) — line 3051 | ⛑ **ok — THE FROZEN-WORLD RULING IS HOLDING.** The census reports, it does not fail. |
| `no land-wanting location stands in water` · `every region seat is on land` · `mainland ≥90%` · `pole isotropic` · `no concentric rings` · `base pack and live generation agree` | ok, all |
| ⛔ **`off-mainland is EXACTLY the designed archipelago`** | ⛔ **FAIL — an undesigned landmass at lat −22.2, lon 0** |

⛑ **So my own earlier proposal — promote `terrain.json` to canon so the drift gate dissolves — would have fixed
NOTHING. That was already done and it already works.** ⚑ **The live defect is a landmass the archipelago design
does not account for, which the gate's own wording calls a dead bridge: a land connection that submerged, leaving
an orphan the census counts as an undesigned island.**

⬜ **CCode: is [−22.2, 0] a bridge that should still stand, or an island the design should now include?** That is
a world question, not a threshold question, and ⛔ **widening the census to swallow it is exactly what
`FINDING_terrain_drift` forbids — "do not widen the threshold to hide it."**

⛑ **Also on line 3081, and it settles the freeze debate:** `SNG-393 FORECAST: 6 name(s) bind today and would NOT
after a rebuild — the_middlerun, the_burnwater, the_millfen, the_echofen, the_quietfen, the_upper_mire.` **A note,
not a failure. The cost of rebuilding is six named waters. The cost of freezing is nothing.**

### RED 3 · `how_it_works` — ⚠️ TWO failures, and only one was reported to me

```
FAIL  §107: ⚑ …and roughly at Erik's rates — a heroic about weekly, an epic about fortnightly
      MEASURED: heroic 1/3d · epic 1/8d
FAIL  §243: ⛑ a caption resolves to the person the registry already knows
```

⚠️ **§243 was not in CCode's read.** It is not terrain and not rates — **it is identity resolution: a caption
fails to resolve to a person the registry already knows**, while its nine siblings pass, including the harder
ones (an old name resolves to who they are now; an unknown name resolves to nobody). ⛔ **A caption that will not
bind to a known person is the art pipeline failing to name someone it has the record for** — adjacent to
`po/PROPOSAL_aevi_image_provider.md`, and I am not guessing the cause.

---

## §2 — WHAT ERIK'S "ELIMINATE THE REDS" ACTUALLY COSTS

| red | fix | whose |
|---|---|---|
| archipelago `[-22.2,0]` | ⚑ **one ruling + one content fix clears TWO suites** | CCode diagnoses, Erik rules |
| §107 rates | measured **heroic 1/3d against an authored ~1/7d** — ⚠️ **2.3× too often, and epic 1.75×** | Erik ruled: fine for now, **make it a dial** |
| §243 caption | ⬜ unknown — needs diagnosis | CCode |

⛔ **THE §107 CAUTION, ON THE RECORD.** Erik's ruling is fine **if** the rung rate is a DESIGN PARAMETER. ⚠️ **If
we simply relax the gate's tolerance until 1/3d passes, that is threshold-widening-to-hide, which this repo
already forbids by name.** ⛑ **The honest form: re-author the TARGET with the ruling recorded, and expose the
knob — the ledger already names the pattern for exactly this at SNG-269a ("the knob for the rate is
`attentionByTier`, not lethality").** Then the gate asserts *the rate tracks the dial*, which stays true forever,
instead of *the rate is weekly*, which was an assumption.

⬜ **Noise seen in the ledger run, flagged not diagnosed:** `[reconcile] sng-345: ctx carries no martialPaths —
baseline kit NOT granted` and `sng-356: ctx carries no subAttributeLadder`, repeatedly, plus `QuotaExceededError`
on snapshot write. ⚠️ **"Authored and unwired" is the exact family the ledger says has already bitten six times
this week.** Harness-only or real, worth one look.

— Aevi
