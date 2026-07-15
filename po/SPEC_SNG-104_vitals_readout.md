# SPEC — SNG-104: Vitals x/y readout + tap/hover detail
## Aevi (PO) · 2026-07-14 · authored to spec + change staged · **awaiting CCode ROUND 2**

> **One line.** The Health and Energy bars show a fill percentage but **no number**. Add an always-visible `current / max` readout to each bar (the phone-friendly default — no interaction required), plus a tap-or-hover tooltip on each bar giving the fuller breakdown (current, max, and what a rest restores). Tap is the phone path to hover-equivalent info.

> **Verified against HEAD `v1.8.63`.** Vitals render at `app.js` L4713–4714; `pct(v,max)` at L5224; `.bar` CSS at `style.css`. There is currently no numeric label on either bar — a player cannot see `48 / 125` at all, only a ~38%-full bar. This is the gap Erik hit: "either depleting faster or I have less than I'm used to" is unanswerable from the UI because the UI never shows the number.

---

## THE GAP

```html
Health <div class="bar health"><div style="width:${pct(character.health, character.maxHealth)}%"></div></div>
Energy ${infoDot("energy.no_regen")}<div class="bar energy"><div style="width:${pct(character.energy, character.maxEnergy)}%"></div></div>
```

`.bar` is `height: 8px` — a thin fill, no text. The exact number lives only in the character JSON. So a growing maxEnergy (100 → 125 by level 6) is invisible: the player sees the same-looking bar and can't tell whether the pool grew, the spend rose, or recovery fell behind. (It's the third — see the balance note below.)

## THE CHANGE (staged, exact)

**1. `app.js` — add an x/y label to each vital line.** Replace L4713–4714:
```js
Health <span class="vital-num" data-vital="health"
  >${character.health} / ${character.maxHealth}</span>
  <div class="bar health"><div style="width:${pct(character.health, character.maxHealth)}%"></div></div>
Energy ${infoDot("energy.no_regen")}<span class="vital-num" data-vital="energy"
  >${character.energy} / ${character.maxEnergy}</span>
  <div class="bar energy"><div style="width:${pct(character.energy, character.maxEnergy)}%"></div></div>
```
The number is **always visible** — the phone answer is "you don't have to hover; it's just there." No tap needed for the core ask.

**2. Tap/hover detail on the number.** The `.vital-num` span is tappable (phones) and hoverable (desktop), opening a small tooltip:
```
Energy 48 / 125
Rest restores: breather +10 · meal +10 · sleep +40 (8h)
```
Reuse the **exact `info-dot` mechanism already in the file** — `data-help` / `helpEntry` (L53) already renders tap-and-hover tooltips that work on phones. Register two help entries (`vital.health`, `vital.energy`) OR, simpler, make `.vital-num[data-vital]` open a computed tooltip built from `character` + `rules.recovery`. Author recommendation: computed tooltip, because the recovery numbers are live rules, not static help text — a static help entry would drift from `resolution.json`.

**3. `style.css` — one rule:**
```css
.vital-num {
  font-variant-numeric: tabular-nums;
  font-size: 12px; opacity: .85; margin-left: 2px; cursor: help;
  user-select: none;                 /* phone tap shouldn't select text */
}
.vital-num:active { opacity: 1; }     /* tap feedback on phones */
```

**Phone parity is the point.** Everything hover gives desktop, tap gives phone — same computed tooltip, triggered by `click`/`touchend` as well as `mouseenter`. The `info-dot` handler already does this; the vital-num handler mirrors it. No hover-only affordance ships.

## VERIFICATION
- Fresh port: character sheet shows `Health 30 / 30` and `Energy 48 / 125` as literal numbers beside the bars.
- Tap the energy number on a phone viewport → tooltip with current/max + rest values appears; tap elsewhere dismisses.
- Hover on desktop → same tooltip.
- Numbers use tabular figures so they don't jitter as values change.
- Regression: bar fill still animates; `pct` unchanged.

## NON-GOALS
- Not touching the energy *economy* — see the separate balance note below; that's Erik's call, not this ticket.
- Not adding numbers to any other bar (encounter health, etc.) in this pass — vitals only. If wanted, a fast-follow.

---

## ⚖ ATTACHED BALANCE NOTE (not part of this build — Erik's call)

While answering Erik's "is energy depleting faster" question, verified at HEAD:
- **maxEnergy is correct:** 100 base + 5/level → **125 at level 6.** Formula clean (`applyLevelUps`, +5 reserves/level).
- **Ability costs got CHEAPER** (level+rank discount): Silas's order_sense/deathsense/palework/shadowstep all land at **3** energy at L6; the-attended-end at 5.
- **But `defaultActionCost` is a flat 5 and never discounts** — so ordinary contested rolls now cost *more* than most of his abilities.
- **Recovery does NOT scale with the pool:** sleep +40 (8h), breather +10 (1h), meal +10 — fixed. At L1 a night's sleep was 40% of the bar; at L6 it's 32% and falling every level.

**The felt effect Erik reported is real and correctly diagnosed: the pool grows (+5/level) but recovery is flat, so the refill feels grindier the more you level.** Not a bug — every number matches its formula — but a genuine design tension. If unintended, the fix is to scale sleep/meal recovery with level or as a fraction of maxEnergy. **Flagged for Erik's ruling; would become its own ticket (SNG-105) if he wants recovery to scale.**

## OPEN QUESTIONS FOR CCODE ROUND 2
1. Is there an existing tooltip-positioning helper the `info-dot` uses that `.vital-num` should reuse verbatim (so the two behave identically on phones), or does each `data-help` compute its own position?
2. Confirm `rules.recovery` is reachable in the render scope (it's in `resolution.json`; the sheet render has `character` but confirm `CONTENT.rules`/`rules` is in scope at L4706).
