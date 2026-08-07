# SNG-359 — A surged craft that slips should fail in its own shape

**Author:** Aevi (PO) · **Date:** 2026-08-07 · **Origin:** Erik — *"many of the cannots could actually
translate into surge failure costs… similar to a conserve being able to avoid the negative effects."*
**Status:** spec_ready · **Content authored and at origin** (23 abilities carry `backlash` +
`conserveSuppresses`). **Engine side is yours.**

---

## §0 — WHAT IS ALREADY REAL, AND THE ONE GAP

⚠️ **Verified before authoring.** Backlash is not aspirational — it is wired:

- `shouldBacklash()` fires only on `surge`, scaled by roll degree — **crit-fail ×2, fail ×1.5, partial
  ×1, clean success ×0.3.** A surge that lands clean is mostly safe; one that slips bites. Good design,
  already shipped.
- `applySurgeBacklash()` deducts health + energy from `surgeBacklashByTier` (T1 3/4 → T5 12/14).
- It is applied live at `app.js:5729`.

⛔ **THE GAP: backlash is GENERIC.** Every craft in the game fails the same way — a number off two pools.
A surged **Thinned Veil** that slips and a surged **Unbearable Word** that slips are mechanically
identical, when they should be nothing alike. And **the `intensity.conserve/surge` prose I have been
authoring for weeks is read by NOTHING** — my own writer-with-no-reader, found by applying my own
evaluator test.

---

## §1 — WHAT I AUTHORED (already at origin, 23 abilities)

Two new fields per ability. ⚠️ **The insight is Erik's and it is the good one: the `cannot` clauses were
already the failure modes. They just had nowhere to fire.**

**`backlash`** — what going wrong looks like for THIS craft, one line, concrete:

> `the_thinned_veil` — *"The thinning does not close. What came through stays, it is loose, and it is
> between you and the door."*
> `the_folded_pace` — *"The fold closes on the wrong side. The distance you took out of them comes out of
> you, and a closed span does not reopen."*
> `the_offered_mouth` — *"It looks at the person who showed it. You are the nearest appetite it has been
> introduced to, and it does not distinguish host from meal."*

**`conserveSuppresses`** — what conserve buys BEYOND a smaller number. ⚠️ **This is the half that makes
conserve a tactical choice instead of a worse option.** Today conserve is `effectMod -8` and nothing
else, so it is strictly a downgrade. Erik: *conserve should avoid the negative effects.*

> `the_keening` — *"the cry is aimed as far as a cry can be aimed: allies take no rung"*
> `the_plain_weight` — *"one stone, honestly thrown — it goes where you threw it"*
> `the_snaring_green` — *"the snare stays at bind only — no bite, on anyone, including you"*

---

## §2 — WHAT I NEED FROM THE ENGINE

**§2a — Narrate the authored backlash.** At `app.js:5729`, when backlash fires, hand `ability.backlash`
to the GM alongside the health/energy cost. ⚠️ **Smallest possible change and it is most of the value** —
the numbers already work; they are just anonymous.

**§2b — Conserve suppresses collateral.** This is the real rule and it needs your read. My proposal:
**at `conserve`, an ability's ally-facing and wielder-facing rungs do not apply.** Every collateral
clause I authored is now phrased as a rung ("allies in the area are struck one rung lower"), so the hook
exists — conserve drops those to none while keeping the primary effect at `-8`.

⚠️ **OPEN QUESTION FOR YOU, and I do not have a position:** is that a code rule keyed on intensity, or is
`conserveSuppresses` just GM guidance like `cannot`? **Code is honest and rigid; GM-side is flexible and
drifts.** Given collateral is currently GM-adjudicated anyway (there is no ally-targeting state — see
SNG-353's class), GM-side may be the only coherent answer today. **Your call.**

**§2c — Consider per-ability backlash SEVERITY.** `surgeBacklashByTier` is tier-scaled and probably
right. But some backlashes I authored are structurally worse than a health hit — *the thinning does not
close* is a scene consequence, not damage. **Do not build this on my say-so**; flag whether an optional
`backlashRung` or `backlashKind` is worth the complexity, or whether narration plus the existing numbers
carries it. I lean narration-only.

---

## §3 — CONTRACT + GATE

⚠️ Add `backlash` to `consumer_required_subfields.json` under `skill` once §2a lands — severity
**DEGRADED** (a surged failure narrates generically without it). **Do not add it before the consumer
exists**, or the contract asserts a read that is not happening, which is the SNG-353 error inverted.

My own `po/authoring_gate.py` now requires `backlash` on any ability whose `challengeTypes` include
FIGHT. **That is mine to enforce; the contract is yours.**

---

## §4 — OUT OF SCOPE

- Retuning `surgeBacklashByTier` — the numbers look right and belong in the SNG-357 harness anyway.
- Ally-targeting state (SNG-353 class) — named, not specced here.
