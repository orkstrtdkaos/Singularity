# SPEC — SNG-257: the maker-kit attribute-coherence fix (the ONE real content finding)
## Aevi (PO) · 2026-08-02 · answering CCODE-56

CCode's harness correction (CCODE-56) killed two of the three findings my SNG-256 assessment leaned on — the
19-point cliff was a single-build measurement artifact (the level pass ran only warrior, and the "top six" were
exactly the six physical-attribute traditions being measured on the one attribute they use). Corrected to all
four builds: **spread 7.0pts, no cliff, no tier.** My "hierarchy → wheel" diagnosis was aimed at the wrong layer
by a bug in the measurement, not in the content. I own that the assessment was only as good as the chart under
it — and the chart was wrong.

**The wheel is still good work** (112 edges, 0 inert, RESTORE finally with reach), just pointed at a target that
wasn't there. It stays — a real rock-paper-scissors layer that makes verbs matter is correct on its own terms;
it simply was never going to move a number made of something 60 points bigger (attribute fit). Its net-zero
ratchet (−8..+8) still guards something real and stays an open option.

## The ONE genuine content defect (verified against ability data)
CCode's real finding, confirmed: **maker-home traditions have attribute-incoherent kits.** Share of each
tradition's crafts rolling on its dominant attribute (verified from the ability files):
  - warrior-home / scholar-home / envoy-home: 80–100% coherent (a build can be right for its whole kit)
  - maker-home: enginewright 80%, lattice 63%, rootkin 55%, churnfolk 50%, harmonic 43%, radiant_folk 36%
`harmonic` and `radiant_folk` split their crafts across THREE attributes, so no character build can be right for
more than ~a third of the kit — which is why maker tops out ~26pts below every other build EVEN AT HOME. Six
traditions, no engine change, fixable by re-attributing crafts.

## But the fix is NOT "flatten all six to one attribute" — the categories differ
I checked what these crafts ARE and whether the spread is a defect or a design. Two distinct cases:

### Case A — RING maker-poles that SHOULD be coherent (the real defect): enginewright, lattice, rootkin, churnfolk
These are great-circle pole-traditions. Per SPEC §5 a pole-people has ONE coherent identity — its crafts should
roll on ONE dominant attribute (its makers' `practical`, mostly). enginewright is already 80%; the others
(lattice 63, rootkin 55, churnfolk 50) have crafts mis-attributed to mental/social/physical that, read for what
they DO, are practical maker-work. **Fix: re-attribute the off-attribute crafts to the tradition's dominant
attribute WHERE the craft's action actually is that attribute** — not blindly, per-craft. A rootkin craft that
genuinely reads (mental) can stay mental; one that BUILDS but was tagged mental is the bug.

### Case B — FOLK traditions where the spread is INTENDED: harmonic, radiant_folk
These are `folkTraditions` — "The Harmonic," "The Radiant," Valley-edge foothills. SPEC §5: folk traditions are
"near-centre crossings… the centre can hold a little of everything, because the centre of the world does." Their
attribute spread is CANON, not a defect — a folk light-worker genuinely perceives (mental prism_sight), projects
(physical radiant_lance), inspires (social daybreak_mantle), and mends (practical sun_coax). Flattening them to
one attribute would break what they ARE. **So the fix for folk is NOT re-attribution — it's a MECHANICAL
accommodation: a folk kit spread by design should not be PENALISED for the spread the design intends.**

## The proposal — split by case
1. **Case A (4 ring poles): re-attribute per-craft.** Aevi audits each off-dominant craft in enginewright/
   lattice/rootkin/churnfolk; where the craft's ACTION is the dominant attribute, correct the tag; where it
   genuinely isn't, leave it. Target ~85–100% coherence like the other pole families. Pure content, per-craft
   judgment, no flattening.
2. **Case B (2 folk): a folk-spread accommodation, not re-attribution.** Options for Erik/CCode:
   (a) a folk character rolls each craft on ITS attribute (already true) but the BUILD isn't penalised for
       breadth — e.g. folk get a small cross-attribute floor, so a spread kit isn't dead weight; OR
   (b) accept folk sit a little below a focused pole in raw win-rate as the PRICE of universality (they're
       open-to-all and touch everything) — a deliberate trade, not a bug. Lean: (b) is honest to the fiction —
       folk are generalists — as long as the gap is ~a few points, not 26. The 26 is inflated by measuring folk
       on ONE build; on their own best build the real gap is smaller (CCode: re-measure folk on best-fit).

## What's whose
- **Aevi (content, mine): Case A per-craft re-attribution audit** — the four ring maker-poles. This is the real
  content pass, and it's surgical (a dozen-ish craft tags, judged individually).
- **CCode (measure): re-measure the maker/folk gap on BEST-FIT build** (the CCODE-56 fix makes this cheap now) —
  is the residual gap after Case A a few points (fine, folk trade) or still large (needs Case B mechanical help)?
- **Erik (design call): Case B** — do folk PAY for universality (accept a small gap) or get a breadth
  accommodation? A fiction question as much as a balance one.

## Discipline note (for the record)
This is the THIRD harness-artifact this session read as a content verdict: the matchup-wire (functions/function),
the signature-situation base rate, and now the single-build level pass. Every one measured the wrong thing and
pointed real content work at a phantom. The pattern is now unmistakable — **before authoring against a
measurement, verify the harness measures what it claims.** CCode's new guard (fail if the top-6 share one home
build + print the ATTRIBUTE FIT table) is the structural fix, the same shape as the inert-pair and
registered-but-loaded ratchets. I'll hold my own version: when a chart tells me a content story, ask what ELSE
could produce that number before I author against it.
