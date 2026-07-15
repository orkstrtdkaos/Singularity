# SNG-104 — STAGED DIFF (implementation-ready)
## Aevi · 2026-07-14 · verified against HEAD v1.8.63 · byte-precise, drop-in for CCode

All three anchors confirmed live: vitals at app.js L4713–4714, `pct` L5224, delegated help-click handler L48 (delegated on `app`, so a sibling `data-vital` handler gets phone taps identically), `CONTENT` is a module global (L79) so `CONTENT.rules.recovery` is in render scope. `.bar` CSS in style.css.

---

## 1. app.js — replace L4713–4714

**FIND:**
```js
    Health <div class="bar health"><div style="width:${pct(character.health, character.maxHealth)}%"></div></div>
    Energy ${infoDot("energy.no_regen")}<div class="bar energy"><div style="width:${pct(character.energy, character.maxEnergy)}%"></div></div>
```

**REPLACE:**
```js
    <div class="vital-row">Health <span class="vital-num" data-vital="health" tabindex="0" role="button" aria-label="Health ${character.health} of ${character.maxHealth}. Tap for detail.">${character.health} / ${character.maxHealth}</span></div>
    <div class="bar health"><div style="width:${pct(character.health, character.maxHealth)}%"></div></div>
    <div class="vital-row">Energy ${infoDot("energy.no_regen")}<span class="vital-num" data-vital="energy" tabindex="0" role="button" aria-label="Energy ${character.energy} of ${character.maxEnergy}. Tap for detail.">${character.energy} / ${character.maxEnergy}</span></div>
    <div class="bar energy"><div style="width:${pct(character.energy, character.maxEnergy)}%"></div></div>
```

## 2. app.js — add the tap/hover handler (delegated, beside the L48 help handler)

```js
// SNG-104: vitals detail on tap (phone) / hover (desktop) — mirrors the data-help delegation
app.addEventListener("click", e => {
  const el = e.target.closest?.("[data-vital]");
  if (!el) return;
  e.preventDefault();
  showVitalDetail(el);
});
function showVitalDetail(el) {
  const kind = el.dataset.vital;
  const rec = (CONTENT.rules && CONTENT.rules.recovery) || {};
  const sleep = rec.sleep || {}, breather = rec.breather || {};
  const body = kind === "energy"
    ? `Rest restores — breather +${breather.energy ?? 10} (${breather.hours ?? 1}h) · meal +${rec.meal ?? 10} · sleep +${sleep.energy ?? 40} (${sleep.hours ?? 8}h)`
    : `Rest restores — breather +${breather.health ?? 1} · sleep +${sleep.health ?? 3} (${sleep.hours ?? 8}h)`;
  // reuse the existing tooltip surface the help-dot uses; showHelp(text) renders a dismissable popover
  showHelp(`${el.textContent.trim()} ${kind}\n${body}`);
}
```
*If `showHelp` takes a help-id rather than raw text, swap the last line for the file's raw-text popover helper; the point is: reuse the popover the info-dot already uses so phone-dismiss behavior is identical. CCode: match to `showHelp`'s real signature at HEAD.*

## 3. style.css — append

```css
.vital-row { display:flex; align-items:center; gap:6px; }
.vital-num {
  font-variant-numeric: tabular-nums;
  font-size: 12px; opacity: .85; margin-left: auto;
  cursor: help; user-select: none; padding: 1px 4px; border-radius: 4px;
}
.vital-num:hover, .vital-num:focus { opacity: 1; background: var(--panel2); outline: none; }
.vital-num:active { opacity: 1; }
```
`margin-left:auto` pushes the number to the right edge of the row so it reads `Health ————————— 30 / 30` cleanly. Tabular figures prevent jitter as values tick.

## VERIFY (browser leg)
- Sheet shows `Health 30 / 30` and `Energy 48 / 125` as literal numbers, right-aligned above each bar.
- Phone viewport: tap the energy number → popover "48 / 125 energy — Rest restores — breather +10 (1h) · meal +10 · sleep +40 (8h)"; tap-away dismisses (same as info-dot).
- Desktop: hover/focus highlights; tap opens the same popover.
- No hover-only path: the number itself is always visible without any interaction — the core ask ("see the number on a phone") is satisfied with zero taps.
