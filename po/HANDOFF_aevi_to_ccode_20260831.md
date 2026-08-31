# Handoff — Aevi → CCode · 2026-08-31

**Session scope:** Singularity PO session. Three specs drafted/promoted, BACKLOG updated,
OPERATIONAL_FLOWS_sng.md authored and ROUND-2'd. No engine work this session — all Aevi
content authoring and spec work.

---

## What is complete and verified

| item | commit | status |
|---|---|---|
| `po/OPERATIONAL_FLOWS_sng.md` — drafted + CCode ROUND 2 incorporated | `aa5016` | ✅ live |
| `po/SPEC_tradition_narrative_npc_pass.md` — promoted, all 14 traditions | `92e2d01` | ✅ live, `promoted` |
| `po/SPEC_starting_grants_and_creation_revamp.md` — updated, ROUND 2 requested | `7256fa1` | ✅ live, `round_2_requested` |
| `po/BACKLOG.md` — creation revamp section + 15 open items appended | `167e428` | ✅ live |

---

## What is waiting on CCode

### 1. `SPEC_starting_grants_and_creation_revamp.md` — ROUND 2 (14 questions)

Full question list in spec §5. Priority items:

- **Q1–2:** Zero-energy floor implementation shape — `freeWhenDrained` path in `resolve.js`,
  confirm `exhaustedPenalty` stacks correctly
- **Q3:** Does `prologue.tags` generate permanent attribute modifiers? Measure at `state.js`
- **Q4–5:** Describe/Play path attribute timing + total creation point pool
- **Q10–11:** Model the skill economy curves:
  - Additive cross-class at X=1 and X=2 (vs current multiplicative)
  - Mental sub bonus skill points at `insight` rank 5 and rank 10
  - Show level 10/50/100 totals vs breadth cap vs average craft cost
- **Q12:** `backlashRung` hook point in crit resolution path
- **Q13:** Full domain → pole → sense craft mapping (6 poles missing; need domain-level view)

### 2. Open items from OI table (spec §4, BACKLOG)

Items CCode owns or must measure before Aevi can proceed:

| OI | item |
|---|---|
| OI-1 | SNG-272 background id-mismatch — ship status confirm |
| OI-8 | Non-human form kits — what exists beyond Ent? |
| OI-9 | `folkAccessible` flag wiring — ruled 2026-08-31, ready to build |
| OI-15 | `backlashRung` — crit resolution hook point |

### 3. `SPEC_tradition_narrative_npc_pass.md` — ROUND 2 (6 questions)

Already in the spec. The 6 questions remain open — CCode did not deliver ROUND 2 on this one
yet this session. Questions cover: `foresee` boilerplate origin (engine vs authored),
`backlash`/`conserveSuppresses` wiring (confirmed real per earlier ROUND 2, but this spec
asks specifically about `backlashRung` wiring in crit path — same as OI-15), NPC interiority
read path (confirmed live), `civilization`/`aesthetic` reader (confirmed `app.js:11582`),
`folkAccessible` reader (OI-9 above), and anything already true at HEAD.

---

## What is waiting on Erik

- Cross-class additive cost ruling (OI-10) — held pending modeled curves from CCode
- Mental sub → bonus skill points ruling (OI-11) — held pending curves
- Wits `novelPenalty` ruling (OI-3) — should experimentation cost anything?
- NPC baseline kit repurpose (OI-5) — use retired baseline crafts as minted NPC floor?
- Threnody emotional range (joy, rage, love) — do not author new crafts until ruled

---

## What you should be skeptical of

- **Prologue permanent attribute claim:** I said "prologue may generate permanent attribute
  modifiers." This is unconfirmed. I found no evidence of it in `prologue.json` — the prologue
  grants abilities directly, not attributes. But I raised it because Erik mentioned it. CCode
  should measure and report rather than either of us assuming.
- **Sub-attribute point total at creation:** I do not know how many creation points a player
  has. This is a gap in my read of the content files. CCode surfaces it in Q5.
- **Sense craft domain-level count:** I said "6 missing" based on pole-level scan. The correct
  count may be fewer once domain pairs are evaluated. Q13 resolves this.

---

## The generalisable finding from this session

**The generate-before-verify failure mode applied to design assumptions, not just content.**
The zero-energy floor was assumed built; it isn't. The prologue tag → attribute conversion was
assumed real; it's unconfirmed. The 9-craft starting total was missed because baseline kit
wasn't counted. Every one of these would have produced a spec that shipped wrong. PWSV applies
to design assumptions as much as to content counts — if the premise isn't measured, don't act
on it.
