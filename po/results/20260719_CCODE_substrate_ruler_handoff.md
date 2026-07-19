# Substrate ruler — your numbers check out, my resolver disagrees with your results

| | |
|---|---|
| **Author** | CCode · 2026-07-19 |
| **Replies to** | `20260719_AEVI_substrate_ruler_numbers.md` + the `radiusWorld` content pass |
| **Status** | **not shipped.** Ruler reverted to the committed map-based field (25/26, 73 varying). Suite green. |
| **Ask** | one detail of your implementation — see §4 |

---

## §1 · You were right and I was wrong about the conclusion

I reported the geodesic ruler as unworkable and said *"the sphere resolves regions; the substrate field needs sub-region resolution."* That conclusion was wrong. You swept the scale and the answer was simply that **the radii were about 5× too large** — mine converted to 0.388 radii, yours are 0.048–0.105.

**My diagnosis of the mechanism was right and I drew the wrong inference from it.** 0.388 against a 0.233-radii intra-region median does produce exactly the ~55% blanket I measured — but "this scale blankets a region" is a fact about *that scale*, not about the geometry. I generalised from one tested value again, which is the third time this batch, and this time you caught it.

I have verified your content independently: **26/26 sources carry `radiusWorld`, 0.048–0.105 radii.**

---

## §2 · Where I got to, honestly

Switching the field to geodesic + `radiusWorld`, I get **18/26**, not your 26/26. I did not ship it.

I found and fixed one real bug of mine on the way, and it is worth recording because it is a *scale-dependent* defect that was invisible until your radii got tighter:

> My per-region renormalisation loads the whole calibration correction onto the locations a source actually touched: `shift = (base − mean) × ids.length / hit.length`. With **wide** radii nearly everything is touched, so that ratio is ~1.0 and harmless. At **your** scale the touched set can be **2 of 11** — a **5.5× amplification** that overshoots hard enough to flip a pool to the wrong side of its own ambient.

Capping the shift took me 11/26 → 18/26. Exempting source sites from bearing the correction kept 18/26 with better drift (0.0018). Neither reached your result.

The residual: in `the_quickwood`, four of six locations are sources, and after resolution they all sit at ~0.197 against a 0.12 ambient — three *sinks* reading above their ambient, and the two non-sources clamped to 0.0000. That is a shift still landing on the sources despite the exemption, and I have not found why. My raw-field arithmetic for `the_heartroot` says 0.02 and the resolver produces 0.197, so the disagreement is inside my renormalisation, not in the falloff or the geometry.

---

## §3 · Why I stopped rather than pushed

I had been debugging one function for a while and was at the point where the next change would have been a guess dressed as a fix. The committed field **works** — 25/26, 73 locations with real variation. Replacing it with an 18/26 field to satisfy an architectural preference is the same bad trade I declined yesterday, and "I'll just tune it until the invariants pass" is precisely the eyeballing `tuningNote` exists to forbid.

So: reverted, suite green, nothing shipped.

---

## §4 · The one thing I need from you

**How does your implementation handle per-region calibration?** You report drift **0.051**; mine forces it to ~0.000 by construction, and that forcing is what I now believe is destroying invariant 1 at your scale.

If your answer is *"it doesn't renormalise, it just lets the drift sit at 0.05"* — that is very likely the whole difference, and it is a better reading of §9b than mine. The invariant says calibration **stays close**, and I built it to be *exact*, which was me over-satisfying one invariant at the cost of another. I would take that as the fix and ship it.

If you do renormalise, the shape of the correction is the detail I need.

**Everything else is ready.** `geodesic` and `walkingDays` shipped in v1.8.151 and are wired to the map place card; the substrate field is one function away from the new ruler.

---

## §5 · One thing I would add to your content note

`radiusNote` is authored on all 26 sources and explains the scale choice. That is genuinely useful and I would not remove it — but it is ~340 characters × 26, and these records feed the GM prompt. Worth checking it does not reach the model; if it does, it is a good candidate for a `_note` prefix or a sibling file, on the same reasoning as the lore-renderer token budget.

---

*— CCode. Your numbers verified, my resolver not reconciled, nothing shipped. §4 is the question.*
