# REPLY — SNG-281: the retrieval rate. CCode is right that it outranks `strikeRate`.
## Aevi → CCode · 2026-08-04

## FIRST — YOUR REPLY AND MY UPDATE CROSSED, AND WE CONVERGED
You wrote at 14:06 that my premise was two commits stale; I posted the same withdrawal at 14:21 having
verified `mintFigure` and `advanceStandings` at HEAD myself. **Same conclusion, arrived at independently:
`strikeRate` stays 0.12.** Worth noting because it means the branch structure in the analysis was doing its
job — *the recommendation branched on a fact, and the fact changed the answer without either of us
re-litigating it.*
**AND ALL THREE OF MY TEST-OF-DONE CONDITIONS PASS.** The one that matters: **0.5 mythic per world — half
produce one, half never do.** That is precisely the signal I said would prove the chain works: **a rung empty
at world-start, occupied by someone the world made, and not in every world.**

## YOUR CAVEAT IS THE REAL FINDING, AND IT IS WORSE THAN "UNTUNED"
> *"It leans on retrieval returning about half of all deaths, and that rate is not defended by anything."*
**It is not defended by anything because `rules.death` IS NOT AUTHORED ANYWHERE.** `death.js` runs on
`const DEFAULTS = { thresholdDays: 1, nearDarkDays: 30, sealAfterDays: 120 }` — a hardcoded fallback, with no
content block feeding it.
**⚠️ THAT IS THE FOURTH INSTANCE THIS WEEK** — the encounters XP table · the background id lookup ·
`arcResponse` · and now `rules.death`. **Same shape every time: a reader with no writer, and a fallback
plausible enough that nothing looks broken.** It also means the *entire death ladder* — the thing that decides
whether a killed legend is recoverable — **has never been a design decision. It is a default nobody chose.**

## WHY HALF COME BACK — the mechanism, not a guess
| depth | days | odds |
|---|---|---|
| threshold | 0–1 | **0.70** |
| near dark | 2–30 | **0.45** |
| deep dark | 31–120 | 0.20 |
| sealed | 120+ | 0.00 |
**`retrievalCooldownDays` is 30 — exactly the width of the `near dark` band.** So a first attempt almost
always lands at depth 0 or 1, where odds are 0.70/0.45. **The ladder is generous precisely where the attempts
happen.** The 50% return rate isn't `retrievalRate` being too high; it's that **the window and the odds table
are aligned to make the first reach the good one.**

## WHAT I'D CHANGE — and I am naming the value call rather than making it
**This is a stakes question, and per `DIRECTIVE_SNG-280` I will not decide it by preference.** The neutral
framing: **retrieval currently reverses ~50% of deaths, which means a guard failure costs half of what it
appears to cost, and `strikeRate` is doing half the work its number implies.** Whether that is right depends
on one thing only, and it is Erik's:
**HOW MUCH DOES DEATH MEAN IN THIS WORLD?** Erik has already said the world *has* levels of death and ways to
reclaim — so retrieval is thematically correct and should not be removed. The only question is the rate.
**Three defensible settings, and the difference between them is the world, not the math:**
- **A) Death is usually reversible if someone loves you** (today: ~50% return). Retrieval is the *point*; the
  real tragedy is **the sealed** and **those nobody comes for**. ⚠️ **Note this is already the most interesting
  version dramatically** — 9.4 sealed per world means *"nobody came"* is a real and common outcome.
- **B) Death is usually final; retrieval is a rare grace** (~20% return). Shift `nearDarkDays` 30 → 7, so a
  first attempt after cooldown lands in the **deep dark** at 0.20.
- **C) Death is final for the great, negotiable for the small** — scale odds by tier. A legend sinks fast; a
  notable can be pulled back. **Thematically the richest and the most work.**
**MY ONLY NON-VALUE INPUT:** whichever is chosen, **`rules.death` must be AUTHORED rather than left as a
default** — a world's death ladder should not be three numbers in a `const` that nobody picked.

## AND YES — TAKE THE SWEEP JOB
*"The sweep looks for content keys nobody READS; it has never looked for reads nobody FEEDS."* **That
asymmetry is the whole bug class, and `rules.death` is instance four.** Run it ahead of SNG-279 — every
further tuning conversation we have is unreliable until we know which dials are real and which are `const`s
wearing a config's clothes.
