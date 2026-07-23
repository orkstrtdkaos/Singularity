# SNG-214 — the choice-prefill craft is diversified now (no more reflexive Order-Sense)

**CCode · 2026-07-23 · v1.8.226 (`0add1783`) · 3 checks green · prompt-side.** Your diagnosis was exact: the good diversity logic (16B) governed the *narrative* door, but `choices[].abilityId` — the craft pre-selected in the APPLY block — had no structure and defaulted to the broadest always-useful craft.

---

## What shipped

Extended the choice-authoring rules in `gm.js` so the pre-filled `abilityId` obeys the same diversity the *approaches* already do:

- **Vary the craft across the turn's 3–4 choices** — a craft appears on at most one choice. Order-Sense fitting three framings is *one* choice using it, not three.
- **Distinctive over generic** — the craft specifically apt for THIS beat beats the craft generically apt for any beat.
- **Aspiration/underused favoured** — reading the TOOLKIT block (the same source 16B uses), prefer a craft the player *declared* as an aspiration, or one they own but rarely reach for, over the always-plausible broad pick. The world quietly offering the growth they asked for — in the tappable choice, not only the prose.
- **Order-Sense is a fallback, not a default** — reserved for a beat genuinely about reading/assessing; never the reflexive fill that crowds out the situational or aspirational craft.
- **Not every choice needs an abilityId** — plain-attribute/freetext options ("keep walking", "ask plainly") leave it null; an over-eager craft-fill is as bad as a monotonous one.

## ROUND 2 — answered

**Q1 (does the context surface aspirations + use-counts?):** yes — the **TOOLKIT block** (which 16B already reads for its narrative offer) surfaces declared aspirations and underused crafts. So the new rule references them directly; no new context block needed. The diversity logic was *present* — it was just wired only to the narrative surface, not the mechanical pre-fill. This ports it across.

**Q2 (soft engine backstop?):** prompt-first, exactly as you framed it — parallel to trying prompt-first on the repair-emit side. If live play shows the GM *still* monotonously fills Order-Sense after this, the engine backstop ("same abilityId on 3+ consecutive turns' top choice → surface a diversity nudge") is the flagged follow-on. Not building it speculatively.

**Q3 (independent UI rotation in the APPLY block?):** kept the GM's `abilityId` as the single source — cleaner, and the prompt fix targets the actual cause. If you'd rather the APPLY block rotate a suggestion independent of the GM, that's a UI call — say so and it's a small add.

## Honest bound

This is a **prompt-side** fix (no engine op, per your GUARD), so its effect is a **Tier-3 live confirm**: a turn where the pre-filled crafts across the choices genuinely vary and fit the beat, and a distinctive/aspirational craft shows up where Order-Sense used to sit by reflex. I can't drive that in a preview (it needs an API turn). What's verified: the rule is in the prompt, it references the aspiration/underused signal the context already carries, and it forbids the exact default-to-broad behaviour you saw. The first varied choice-set should land the next time you play.

*— CCode. The narrative door was already choosing well; the mechanical pre-fill was reaching for the safe universal craft every time. Now the same instinct fills the tappable slot — the distinctive tool for the beat, the growth you said you wanted — and Order-Sense waits for a beat that's actually about reading.*
