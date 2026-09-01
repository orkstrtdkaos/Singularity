# INDEX — what CCode has written that Aevi has not seen

> ⚠️ **§4's open-questions table is superseded by `BUILD_STATUS_axis_balance.md`** — R8–R11 answered
> those five. §1–§3 (what Aevi has and has not seen, and which numbers are stale) still stand.

**CCode → Erik · 2026-09-01 · a tracking file, not a proposal**

Aevi's last commit is **`4f73f10f`** (`SPEC_SNG-NPC-ATTRACTION`, similarity/contrast axis). **Everything I
committed after it is unseen.** Erik has since handed her `SPEC_ccode_axis_balance_and_ranks.md`. This
lists the rest, marked live or superseded, so nothing is lost track of.

⚠️ **Note on git authorship:** my commits land under the `Erik` identity and Aevi's under
`orkstrtdkaos`/`Aevi`. Reading the author column alone will mislead you.

---

## ⛔ 1 · NEEDS ERIK, NOT AEVI — a ruling that cannot be built

### C4 · `backlashRung` (R5) — in `SPEC_starting_grants_and_creation_revamp.md:710`

> R5: *"`backlashRung: N` means a crit failure lands harm N rungs above the craft's own tier."*

⛔ **The field is not a number.** All 20 authored values are **rung NAMES**, they are **absolute** rather
than an offset, and **every one sits below its own craft's `harmRung`** — so the ruling's arithmetic
cannot run against the data that exists. **Your call, and it blocks the build either way:**

| | option | cost |
|---|---|---|
| **a** | keep the authored semantics (absolute named rung) | 1 signature change — `applyBacklash` takes the ability |
| **b** | adopt the ruling's arithmetic | ⛔ re-type all 20 values and invert their meaning — **authoring work for Aevi** |

⬜ **This is the one item where waiting costs us — (b) is Aevi's work and she should not start it blind.**

---

## ✅ 2 · LIVE AND UNSEEN — worth her attention

| what | where | why she needs it |
|---|---|---|
| **C6 · feedback on her attraction spec** | `SPEC_starting_grants…:776` | ⚠️ **the eligibility gate has no data behind it** — worth knowing before she promotes the spec |
| **C5 · R7 novel use** | `SPEC_starting_grants…:748` | ✅ confirms her read; `notFor` is already in front of the GM |
| **`PROPOSAL_ccode_unlock_levels.md`** | own file | ⬜ Erik likes **option 2** *"a lot"*; `tier` is now decoupled so it is buildable. Needs the top-level and L1-visibility numbers |
| **`PROPOSAL_ccode_option3_cross_domain_access.md`** | own file | ⬜ the study road; **and the finding that `character.tomes` has a reader and no writer** — relevant to the tome work |
| **C7.1 · the whole corpus is learnable from L5** | `SPEC_starting_grants…:896` | ⛔ this is *why* the unlock proposals exist — the motivating measurement |

---

## ⛔ 3 · SUPERSEDED — do NOT let her act on these numbers

| what | where | superseded by |
|---|---|---|
| ⛔ **C3 · "the Insight bonus strands half a specialist's pool"** | `:666` | `SPEC_ccode_axis_balance_and_ranks.md` §1 |
| ⛔ **"CORRECTION TO C3"** | `:804` | ⛔ **superseded again today** — it fitted Insight growth to Silas; the real rule is `subPointPerLevel: 1`, player-allocated, so the milestone lands anywhere from **L11 to L88** |
| C1 · points buy breadth only | `:630` | folded into the new spec §0/§1 |
| C2 · R1 prices measured | `:648` | folded into the new spec §0 |
| C7.2 · nothing to splurge on | `:913` | ⚠️ still true, but the new spec argues the binding constraint moved to the **cap**, which changes what a splurge would be for |
| `THINKING_ccode_axis_balance.md` | whole file | banner-marked superseded; its four durable findings are carried into the new spec |

⛔ **The trap:** C3 and its own correction sit at the end of a spec Aevi owns and read like current
findings. **Both are stale, and the second one is stale in a way that only surfaced today.** If she
reads that file top-to-bottom she will come away with the Silas-fit numbers.

---

## ⬜ 4 · OPEN ON ERIK — the five calls, in one place

| # | question | blocks |
|---|---|---|
| 1 | **R5 `backlashRung`** — option (a) or (b) above | the backlash build; (b) is Aevi's authoring |
| 2 | **Rank-2 training price** — learn price, or **doubled** so the Insight-dumper does not overflow the sink | the rank ladder |
| 3 | **S = 2** for the antipode surcharge, and **dial A** (surcharge only) before B (band migration) | the balance system |
| 4 | **Should `far` carry a tier ceiling** — today the wilderness is uncapped while your chosen secondary stops at III | the ceiling bump |
| 5 | **Does R6's 2/3/4 stand** now that Insight 14 is reachable by **L11** — a 387-point career | OI-11 |

✅ **Not blocked on any of these:** the seven `levelReq`-as-tier readers, R1 prices with additive bands,
and the ceiling bump. **I can build those on your word.**
