# SNG-215 §C — wire the authored trait readouts (they were loading empty)

**CCode · 2026-07-24 · v1.8.245 (`e037a3c7`) · content CI + smoke + wiring green.** *The §C shell shipped with a derived fallback; Aevi's authored content was staged but never placed — so the merged character sheet only ever showed the DERIVED line.*

## The gap

`loadRule("trait_readouts")` had no file to find (`trait_readouts.json` lived only in `po/staged_content/`), so it returned its empty `{readouts:{}}` default. Tapping a trait always fell through to the derived text — Aevi's **40 backgrounds + 27 origins** (each real lore + an authored MECHANICS line) never rendered. Two problems: no content home, and a key-convention mismatch.

## Fix

1. **Content home:** placed `trait_readouts.json` → `content/packs/core/rules/trait_readouts.json` + registered in the core manifest `provides.rules`. `core/rules` is a STRICT dir, so placement + registration land in one commit (SNG-064 gate). `loadRule` now finds it.
2. **Key reconcile:** the authored doc keys traits by the **plural** kind (`backgrounds`/`origins`); every call site keys by the **singular** (`data-trait="background:…"`). `traitReadout` now checks `tr[kind] || tr[kind+"s"]` (+ a legacy `.readouts` wrapper) so the authored entry resolves. Verified: `background:duelist` and the origins resolve to their authored lore/mechanics.

## Counts / gates

Core rules **33 → 34** (SYSTEM_SPEC header, machine-gated by wiring_audit). Smoke §C updated to assert the singular-OR-plural reconcile.

## Verified

Content CI (STRICT-dir registration) ✓; smoke §C ✓; wiring green; app.js syntax clean; no mojibake.

**Tier-2 (Erik):** tap a background/origin on the character sheet → Aevi's authored lore + mechanics (not the derived line).

*— CCode. The readouts had faces authored; now the file is loaded and the lookup finds them.*
