# SPEC — SNG-130: Fill the capstone tiers — traditions that stop at III need IV–V
## Aevi (PO) · 2026-07-16 · authored to spec · **awaiting CCode ROUND 2 + Aevi content authoring**

> **Erik: "I think we stopped at level III for a lot of traditions — flesh out higher levels if needed."** Confirmed against the per-tradition tier histogram (successor to the July 7 `levelReq` analysis).

> **Verified at HEAD — the histogram (247 abilities across 24 traditions + folk + precursor + braids):**
> **16 of 24 traditions top out at tier III or below.** The tier IV–V band is nearly empty catalog-wide; even "deep" traditions are thin at the top (1–2 abilities).
> - **Stops at III (or below):** abyssal, blazeborn, cogitant, enginewright, figurist, harmonic, horizon, hourkeeper, mason, seraphic, syllogist, threnodist, unmaker, valley_craft*, veilwright, wright. (*valley_craft/folk is correctly shallow — folk crafts SHOULD cap low; exclude it.)
> - **threnodist + wright stop at tier II** — the thinnest.
> - Low tiers (T1–T2) are well-populated everywhere; the gap is specifically the **capstone band (IV–V)**.
> **Design read:** traditions have good early depth but no *mastery ceiling* — walking a spoke to its end lands on nothing. The wheel (SNG-073/129) makes this visible: an owned primary spoke visibly runs out before the ring.

## THE WORK (Aevi content authoring, CCode wiring)
1. **Author tier IV–V capstone abilities** for the traditions that stop at III (excluding folk). Each such tradition wants **~1–2 tier-IV and ~1 tier-V** ability — its *mastery expression*, the thing an adept of that people can do that a dabbler never will. Benchmark: a full spoke should read as a real arc from cantrip (I) to capstone (V).
2. **Respect the function-family spine (SNG-124).** A tradition's capstone should extend its OWN function idiom (a HARM-leaning people's tier-V is a devastating HARM; a KNOW people's is a profound KNOW) — not bolt on a generic power. Grep the tradition's existing abilities' families first; author in-idiom.
3. **Tie capstones to the teacher/precursor gates already built.** Tier IV–V already gate on `teachers[trad]={met,willing}` (SNG-100b) — so these new capstones slot into the existing "greatness is taught" gate; no new gating logic. Some tier-V could be precursor-adjacent (see SNG-131).
4. **Balance pass.** New tier-V abilities need energy costs + effects benchmarked against existing tier-V (ashwarden's, umbral's, numinous's) so they're powerful-but-not-broken; run the balance_sim.

## COORDINATION
- This is primarily **Aevi content** (authoring ability records in `content/packs/core/abilities/*.json` with tradition + levelReq + families + energyCost + effect), verified by the content_ci + balance_sim. CCode wiring is minimal (the tier system already renders IV–V; the manifest just needs the new ability files registered).
- **Sequence with SNG-131** (precursor-peoples): some deep-power peoples' capstones ARE their innate precursor access — author these together so a seraphic/abyssal tier-V and their precursor grant tell one story.

## GUARDS
- **Folk stays shallow** — valley_craft/harmonic-folk/radiant-folk correctly cap low; don't inflate them.
- **In-idiom** — capstones extend the tradition's own function families, not generic power creep.
- **Balanced** — benchmarked against existing tier-V; balance_sim green.
- **Law 14** — additive only; no existing ability changes tier or is removed.

## OPEN QUESTIONS — AEVI (authoring) + CCODE
1. **[AEVI]** Author the capstone set — start with the thinnest (threnodist, wright at II) and the deep-power peoples (seraphic, abyssal — coordinate with SNG-131). ~16 traditions × ~2–3 abilities = ~40 new records.
2. **[CCODE]** Confirm the tier renderer + teacher gate need no change for new IV–V records (just manifest registration).
3. **[BOTH]** Balance target for a tier-V energy cost / effect ceiling — read the existing tier-V spread and hold new ones inside it.
