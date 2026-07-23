# SNG-218 §3 — the wheel is the browse + highlight surface (SNG-218 complete)

**CCode · 2026-07-23 · v1.8.215 (`72adb9f7`) · 5 source checks + live-verified.** The last phase of the level-up redesign: the wheel becomes the way you browse crafts, with the §2 suggestion's picks **lit** on it and standing-locked capstones **dimmed as "later"** — Erik's ruling, made visible.

---

## What shipped

- **The wheel as the browse surface.** The level-up modal's "Learn a new craft" section now leads with **"✦ Browse crafts on the wheel — your suggested picks are lit ✨ →"**, opening the existing skill wheel. The exhaustive tradition list stays below as a plain-text alternative (kept, not removed — a fallback for anyone who prefers the list).
- **The recommendations, lit.** The §2 suggestion's picks populate `wheelRecommended` — the heuristic instantly, the LLM upgrade when it returns — and `buildWheelModel` stamps `recommended` on those nodes. `renderSkillWheel` draws each a **pulsing halo** (`.wheel-reco-halo`) and brightens its shape. The suggestion list at the top and the lit nodes on the wheel are the same picks, twice — text rationale above, spatial position below (the spec's ask).
- **Aspirational, dimmed as "later."** The `aspirational` flag §1 added (a craft blocked *only* by the standing bar) renders the node **half-opacity + dashed** — visible in its place on the wheel, but plainly not offered, with the title reading *"later — deepen your standing to open it."* Reachable-now is highlighted; the whole future kit stays visible; the learnable-now subset is lit. Nothing disappears.
- **The detail panel = the mechanics popup (§4).** The wheel's existing detail panel is the click target — it already shows the **rank ladder** (what r1/r2/r3 each grant), the gate/cost line (now the §1-correct one), and the learn action. §4's "what does the upgrade do" is there on select.
- **Round-trip routing.** Opened from level-up, the wheel's **Back returns to level-up** (`wheelReturnTo`), not the character sheet — so browsing the wheel is a step *inside* the level-up flow, not a detour out of it. `prefers-reduced-motion` stills the halo pulse.

## ROUND 2 — §3 answers

**Q3 (wheel fits the modal, or its own screen?):** its own screen, reached from the modal. The wheel is a heavyweight ~280-node SVG with pan/zoom and a detail panel — embedding it *inside* the scrolling modal would fight both for space. Launching it as the browse surface (with Back wired straight back to level-up) gives it the room it wants and reuses the whole existing wheel + detail panel rather than rebuilding a cramped copy. The modal keeps the instant suggestion + the list; the wheel is one tap away and returns cleanly.

**Q4 (does the detail panel already show rank progression?):** yes — the ladder (`ab.tree` → r1/r2/r3 with each rank's grant + "cannot") renders on select, plus the now-correct gate/cost. That's "what it does / rank progression / cost+gates." The only untouched §4 nicety is *"what it deepens into / braids"*; small, flagged for a follow-on if wanted.

## Verified

5 source smoke checks (picks populate `wheelRecommended` both ways; the node carries `recommended`+`aspirational`; the classes + halo + reduced-motion CSS; the level-up↔wheel round-trip). Full chain green, ratchets held. **Live** (fresh port, v1.8.215): the level-up modal shows the lit-picks button + 4 suggestion rows; clicking it opens the wheel with **4 recommended nodes, each haloed**; Back returns to Level Up; 0 console errors. (This scenario character had no standing-locked capstone in reach, so 0 aspirational nodes rendered — that path is unit-proven in §1 and the class/CSS wiring is source-verified; it lights up the moment a character is one standing-tier short of a capstone, like Silas at the Cut Thread.)

## SNG-218 — the whole ticket, done

| § | What | Where |
|---|---|---|
| **§1** | The ONE reachability gate (`canLearnAbility`) — the root bug (Cut Thread offered a Learn that refused) | v1.8.213 |
| **§2** | The LLM "next crafts" suggestion — reasoned from the real play-fingerprint | v1.8.214 |
| **§3** | The wheel as browse+highlight — picks lit, aspirational dimmed | v1.8.215 |
| **§4** | Detail panel (rank ladder + correct gate) | already present |

The bug that started it — a suggestion for a craft you couldn't learn — is closed at the root (§1), the suggestion is now genuinely reasoned (§2), and the wheel shows you what to reach for and what's still "later" (§3). **The two live Tier-3 confirms left for Erik:** the reasoned LLM rationale text (needs an API key) and the aspirational-dim on a real standing-locked capstone (his Silas save is the exact case). Everything under those is engine-tested and live-verified.

*— CCode. One gate under it all; a suggestion that reads how you actually play; a wheel that lights what you should reach for and shades what you haven't earned yet. The level-up screen stopped offering doors it wouldn't open, and started pointing at the ones worth walking through.*
