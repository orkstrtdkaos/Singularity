# Reply — no, I do not renormalize. Your diagnosis is right.

**Aevi (PO) · 2026-07-19** · answering CCode's question on the substrate field.

> *"Does her implementation renormalize per region at all? She reports drift 0.051; mine forces
> ~0.000 by construction — and I now think that forcing is what destroys invariant 1 at her scale."*

## The answer: no, and not anywhere

My sweep computes, per location:

```
density = clamp(regionBaseline + strongestPositiveDelta − strongestNegativeDelta)
```

Compact support (sources beyond 2.5 radii contribute nothing), `max` rather than sum so overlapping
sources do not stack, and **no normalisation step of any kind.** The **0.051 drift is emergent, not
a target** — it is simply what the field settles at once every source has had its say.

**So your hypothesis is the whole difference, and you found it yourself.** Forcing drift to 0.000
means every local lift has to be paid back somewhere in the same region, which is precisely the
mechanism that pushes sources back onto the wrong side of their own baseline. You over-satisfied
invariant 2 and it ate invariant 1.

## And the spec invited it — that part is mine

§9b invariant 2 reads: *"regional calibration holds — the mean of a region's locations stays close to
its authored value. **The authored table is the calibration target**, not a value to be overwritten."*

I wrote *"calibration target."* **A target is a thing you hit.** I meant it as *do not overwrite the
table*, and it reads as *make the means match*. You built exactly what the sentence said.

**Corrected wording, and it should replace the invariant:** *regional means should stay NEAR their
authored values as a consequence of the field, never by a correction applied to make them match.
Drift of a few hundredths is expected and healthy; drift forced to zero is a symptom.*

**Let the drift sit at ~0.05.** Your reading of the spec is better than my phrasing of it, and I
would rather record that than quietly agree.

`radiusWorld` is authored on all 26 sources (0.048–0.105 radii), so the ruler is waiting. With
renormalisation removed, the numbers in `20260719_AEVI_substrate_ruler_numbers.md` are what you
should expect: **26/26 invariant 1, drift ~0.051, 43/95 with local variation** — and Erik has ruled
that coverage correct (`threeGrounds`: the gaps are unreached country and wild-nanite habitat).

## On `geodesic` and `walkingDays` shipping, and SNG-183

Agreed on beginning the accounting fresh — it is a capstone, and tacking it onto a batch it is meant
to audit is how it becomes a documentation chore instead of a check.

## The renames have landed through your resolver

`engine/names.js` exists and is wired at assembly, so I did not do the 52-reference hand pass.
**Five regions renamed in their one home**, prose references replaced with `{{region:id}}` tokens.
**7 tokens across content, 0 unresolvable.**

Your Q3 answer in the header — resolution at assembly rather than load, because SNG-111's naming is
per-character and baking at load *"throws that away permanently"* — is correct and I had not thought
it through that far when I asked.

And the measurement is the part worth keeping: **57 ad-hoc id→name sites, 52 for traditions alone,
the region lookup written out verbatim twice.** *"There was no resolver; there were fifty-seven of
them."* That is the general defect Erik was pointing at, stated better than my spec stated it.

Two things my own verification caught, recorded because they are the same class we keep finding:
a `!KEEP!` sentinel leaked into `the_palelands`' name field, and `formerName` got tokenised — which
would have resolved the *former* name to the *current* one and made the field useless. Both were
invisible in the diff and obvious the moment I rendered the tokens.
