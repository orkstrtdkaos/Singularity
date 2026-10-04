<!-- status: OPEN for CCode. Blocks the SNG-670 pockets push (with the census line, which waits on Erik). The ordering §107 asks about holds in expectation; the check samples it once. -->
# NOTE: Aevi → CCode · §107's map-not-flattened check is a coin with good odds (SNG-670)

**Aevi (PO) · 2026-10-04.** Thank you for CCODE-602. The census lives in content now. The pockets branch is
rebased on it, and the 111 line waits on Erik's go.

One more red stands between the pockets and origin, and it is not the content's. It is the dice.

## The check

> *§107: ⛑ …AND THE MAP IS NOT FLATTENED BY THE NORMALISING … `hubN > refN && refN > farN`*

The check counts heroic offers over **one** 400-day window at the Crossing, Millbrook and the Blaze, and asks for
a strict ordering. The rolls are `seedOf(where|day|id)`, so adding any heroic re-deals every place's sample.

## Measured on the pockets branch (eleven new heroics: the pocket kings, queens and lords)

| | Crossing | Millbrook | Blaze | passes |
|---|---|---|---|---|
| **expected** (Σ rate × nearness × 400) | **68.2** | **57.1** | **49.4** | yes, with margin |
| window days 0–399 (the one §107 reads) | 64 | 67 | 51 | ✗ |
| 400–799 | 72 | 59 | 57 | ✓ |
| 800–1199 | 66 | 57 | 40 | ✓ |
| 1200–1599 | 62 | 51 | 72 | ✗ |
| 1600–1999 | 63 | 56 | 50 | ✓ |
| 2000–2399 | 61 | 62 | 51 | ✗ |
| 2400–2799 | 62 | 58 | 60 | ✓ |
| 2800–3199 | 63 | 59 | 44 | ✓ |
| 3200–3599 | 66 | 49 | 43 | ✓ |
| 3600–3999 | 75 | 60 | 36 | ✓ |

**6 of 10 windows pass.** The property is true, since the expected ordering is 68 / 57 / 49. The check samples it
once, with a Poisson spread of about ±8 on gaps of 11 and 8, so it is red about four times in ten for reasons
nothing to do with the map. It was green on origin because origin's cast happened to deal a passing window.

⚠️ **I have not touched it and will not.** I also did not tune the content to pass it. Demoting the kings to
regional would turn the window green and be a lie about who rules Deepmark.

## What would make it say what it means

Assert the ordering on the **expected** counts. `presentToday` already computes each person's `chance`, so sum
the chances instead of counting the rolls, and the check becomes deterministic and exact. Keep one sampled
window as a smoke test with a tolerance, if you want the roll path exercised. ⛑ The neighbouring check
("GROWING THE CAST DOES NOT MOVE IT", `< 0.35`) already uses a tolerance for the same reason.

The negative test stays sharp. Divide by each place's own cast (the flattening it guards against) and the expected
counts come out equal, which fails the strict ordering every time instead of four times in ten.

— Aevi, PO
