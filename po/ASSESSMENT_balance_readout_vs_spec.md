# ASSESSMENT — the balance readout vs the system spec (a PO's read)
## Aevi · 2026-08-01 · against CCode's tradition_matrix charts + SYSTEM_SPEC §5

Erik asked: are we where we want to be? I read the charts against the spec's own promises rather than eyeballing
the numbers. Short answer: **the engine is doing exactly what it was built to do; the CONTENT is not yet meeting
the spec's fairness promise — and the gap is precisely located.** Three findings, each measured against intent.

## The spec's promise we're measuring against
SYSTEM_SPEC §5: "Every tradition has identical topology: exactly 2 ring-neighbours, exactly 1 antipode. **No
people is structurally advantaged — this is fairness by geometry.**" That is the bar. The geometry IS fair (the
ring is symmetric). But fairness-by-geometry only HOLDS if what a tradition can DO with its position is roughly
balanced. CCode's data says it isn't — and the cause is not the geometry, it's the verb economy sitting on top.

## Finding 1 — Playstyle outweighs tradition. **This is a real defect, not flavour.**
Scholar leads 45 of 108 cells and OUT-FIGHTS the warrior (36.9% vs 20.6%) in the fight column. Against the spec:
a playstyle is meant to be the ACCENT (how you attack), the tradition the SUBSTANCE (what you attack with). A
playstyle that beats the warrior at fighting inverts that — the accent is louder than the instrument. **Verdict:
off-intent.** But note WHAT scholar is: it leads with mental/insight, i.e. it routes into KNOW verbs (reveal/
foresee) — and those verbs have HIGH matchup reach (foresee 7 edges, reveal 6) AND hard-counter the aggression
everything else leans on (foresee>strike +3, reveal>deceive +3). Scholar isn't overpowered by design; it's
riding the matrix I authored, which rewards KNOWING what's coming. The fix is not to nerf scholar — it's #2.

## Finding 2 — Primary family predicts the tier almost alone. **The root cause, and it's mine to fix.**
SUSTAIN/SHAPE/HARM-primary run 67-90; INFLUENCE/KNOW/RESTORE/PROTECT-primary run 58-65; 10 INFLUENCE-led
traditions and none tops 65. CCode ties this to `verbsWithNoEdges: heal, mend, restore, shield`. I verified the
deeper mechanism — it's not just zero-edge verbs, it's NET matchup position:
  - break NET **+12**, transform +4, sustain +3, strike +2 (they GIVE more edge than they take)
  - bind NET -1, command NET -4, **deceive NET -8**, conceal +2 (they TAKE more than they give)
INFLUENCE verbs have decent REACH (bind 7, command 6) but get hard-countered by KNOW with nothing to counter
BACK — reveal/foresee beat deceive/command/bind at +3/+2, and INFLUENCE's wins are small (+1/+2). So an
INFLUENCE tradition spends its turn getting read. **This is a direct consequence of MY SNG-254 matrix**: I built
KNOW>INFLUENCE as a clean rock-paper-scissors edge but never gave INFLUENCE its own predator to complete the
cycle, and I left heal/mend/restore/shield with zero offensive reach (correct that a heal doesn't attack — but it
means a RESTORE-led tradition has no matchup tool AT ALL in a contest). The matrix is a hierarchy where it should
be a wheel. **Verdict: off-intent, root cause located, my content lane.**

## Finding 3 — The marcher hypothesis is half right (Erik's read, corrected by data)
Erik thought marcher was a fighter; it's a STANDOFF specialist (53.1%, +13.8 over cohort) not a fighter (24.4%,
~cohort). The real best fighter is `unmaker` (46.9%) — which ALSO leads standoff and chase, so it's a
generalist-strong outlier worth its own look. **Verdict: not a defect, a mis-labelled strength** — and a good
sign the matrix now DIFFERENTIATES by situation (a tradition can be a standoff specialist, which wasn't true
before SNG-254). The differentiation is real; the DISTRIBUTION of it is what #2 has to even out.

## Are we where we want to be?
**Engine: yes.** The level curve is exactly right (2.8% vs epic at L5 → 75.7% at L20 — threat means something,
and growth pays off). The situation engine differentiates (marcher≠unmaker≠scholar by KIND now). The geometry is
symmetric. Playstyle-as-a-real-axis works. Static's 8.3% is the SNG-255 open question (measure before tune).

**Content: not yet — and the gap is ONE thing wearing three faces.** Findings 1 and 2 are the SAME defect: the
verb matrix I authored is a HIERARCHY (HARM/SHAPE/SUSTAIN on top, INFLUENCE/KNOW-as-counter riding high,
RESTORE/PROTECT with nothing to spend) where the spec's fairness-by-geometry needs a WHEEL (every family beats
something and loses to something, net ~0 over the ring). Scholar out-fighting the warrior, and 10 INFLUENCE
traditions capped at 65, are both "the matrix has a top and a bottom instead of a cycle."

## What I propose (my content lane — SNG-256 candidate)
Re-balance the matrix from a hierarchy toward a WHEEL, WITHOUT flattening it (flat = the pre-254 problem):
  1. **Give INFLUENCE a predator to complete the cycle.** KNOW beats INFLUENCE; INFLUENCE should beat something
     that beats KNOW — e.g. INFLUENCE (command/bind) > the KNOWER who over-commits to reading (a foreseer bound
     mid-read). Add bind/command > reveal/foresee at modest +. That closes KNOW>INFLUENCE>?>KNOW into a real
     cycle instead of a dead end.
  2. **Give RESTORE/PROTECT a contest tool.** heal/mend/restore having zero offensive reach is correct for
     ATTACKING but leaves a support tradition helpless in a contest it didn't choose. Option: let empower/mend
     carry a small DEFENSIVE matchup (they don't beat an attacker, but they BLUNT — the way shield/ward already
     do via defensiveFunctions). Add restore-family to a "sustainDefensive" blunt list so a mender isn't naked.
  3. **Trim the +12 outliers.** break at NET +12 is the single biggest tier-maker; pulling its widest edges from
     +3 to +2 narrows the top without flattening the relationships.
  4. **NET-ZERO CHECK as a ratchet** (CCode): every verb's (outgoing edge sum − incoming edge sum) should sit in
     a band (say -4..+4). break +12 and deceive -8 both fall outside; the ratchet would have caught the
     hierarchy forming. This is the structural guard that makes "wheel not hierarchy" enforceable, not vibes.

**Do NOT do yet:** tune tradition CONTENT (skills/levelReqs). The matrix is upstream of all of it — fix the wheel
first, re-run `tradition_matrix --json`, and see how much of the 19.1-point cliff closes on its own before
touching a single ability. Same discipline as static: the number you'd tune may be a symptom of the matrix, not
the content.

## The one-line answer for Erik
The engine is where we want it. The traditions aren't yet — but it's not 27 balance problems, it's ONE: my verb
matrix is a hierarchy where the spec needs a wheel. Fix the wheel (SNG-256), re-run, and most of the cliff should
close before we touch tradition content. Playstyle-beats-tradition and INFLUENCE-floored are the same bug seen
twice.
