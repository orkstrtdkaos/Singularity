# SPEC — SNG-108: Relationship arcs — bonds with a growth path, not just a band
## Aevi (PO) · 2026-07-14 · authored to spec · **awaiting CCode ROUND 2**

> **One line.** NPC bonds already track a score (−10..+10) and a band (neutral→friendly→ally→devoted), and it's fed to the GM as fact — but it's (a) never SHOWN to the player, and (b) a flat scalar. A relationship like Silas + Pell ("his woman") is beyond "devoted" — it's a distinct KIND of bond with its own **growth path** (acquaintance → friend → close → committed/partner → bonded). Surface the bond, and give committed relationships a named arc that advances through play, the same way abilities and domains do.

> **Verified at HEAD `v1.8.67`.** `npcs.js`: every NPC has `relationship` (−10..+10), `relationshipBand()` (neutral/friendly/ally/devoted/…), `firstMet`, `lastSeen`, history — already passed to the GM as established fact. **Two gaps:** the player never sees the band on any page (display gap), and there is no relationship *type* beyond the scalar — "devoted" is the ceiling, and it can't express a romantic/committed partnership as a different category with its own progression.

## THE MODEL — two layers on the existing score

**Layer 1 — surface what exists (small).** Show each known NPC's band + score on the character/companion/chronicle page. Pell reads "devoted (8)". This is the SNG-108a display half and it's nearly free — the data is all there.

**Layer 2 — relationship KIND + arc (the real ask).** Add an optional `bondType` to an NPC bond, orthogonal to the score:
- Types: `platonic` (default) · `mentor`/`student` · `rival` · `family` · **`romantic`** (with sub-stages) · `sworn` (oath-bond).
- A `romantic` bond carries its own **arc/stage**, advanced by attended play (this session's thesis — the bond grows because it's tended): `courting → together → committed → partner/bonded`. Stage is set by GM op on real narrative beats (a confession, going steady, a vow), never auto-inferred from score alone — but gated so it can't leap stages without the score to support it (you can't be "partner" at relationship 2).
- The arc is a growth PATH with visible next-step, exactly like a domain or an ability rank: the player sees "together — deepening toward committed," so the relationship reads as something you're *building*, not a number that drifted up.

**Why a separate type, not just a higher score:** "devoted" and "his woman" are different in KIND, not degree. A devoted platonic ally and a committed partner can both be at relationship 9; the score is intensity, the type is the nature of the bond. Silas+Pell is a `romantic`/`committed` bond at high score — the tag should say so.

**Party integration:** a partner-stage romantic bond can flag the NPC as party-adjacent (Pell "basically in the party"). Reuse `companions.js` — a committed partner is a companion by relationship, surfaced with the bond stage, not just a name.

## ENGINE SURFACES
| Module | Change |
|---|---|
| `engine/npcs.js` | Add optional `bondType` + `bondStage` to the NPC record; `advanceBond` op-handler (GM sets stage on a beat, gated by score floor per stage); `relationshipLabel(n)` returns type+stage+band ("committed partner · devoted"). |
| `engine/gm.js` | `advanceBond{npcId, bondType, stage}` op + whitelist + sanitizer + guidance (set on real relational beats: confession/steady/vow; never leap stages). |
| `engine/companions.js` | A partner-stage romantic bond surfaces as party-adjacent. |
| `app.js` | Show bond label + stage on the character/companion/chronicle page; a committed partner gets a distinct indicator (beyond the plain band). |
| `tests/*` | Score-floor gating (can't reach `partner` at low score); stage advance logged; type orthogonal to score; partner → party-adjacent. |

## GUARDS
- Stage set by narrative beat via op, gated by a score floor — never pure auto-inference, never a leap past stages.
- Minor-safety floors unchanged: `romantic` bondType is subject to every existing minor protection; a minor NPC can never carry a romantic stage (same floor as the art/romance systems).
- Bonds remain additive/logged (the npcs.js "never silently rewrite identity" principle extends to bond changes).

## OPEN QUESTIONS — CCODE ROUND 2
1. Does `companions.js` key off an explicit companion list, or off relationship score? (Determines how a partner becomes party-adjacent.)
2. Best home for score-floor-per-stage thresholds — `resolution.json` (the rules bag) consistent with SNG-100b? Recommend yes.
