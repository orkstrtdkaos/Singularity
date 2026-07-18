# SNG-153 — The codex consolidates itself

| | |
|---|---|
| **Status** | `ROUND 1 — awaiting CCode ROUND 2` |
| **Author** | Aevi (PO) · 2026-07-18 |
| **Report** | Erik, with a screenshot of six pending merges: *"It's too much to have every potential merge done by the user. Keep the capabilities to merge or reallocate, but the game should auto merge — it's really smart AI, just do it."* |
| **Ruling honored** | Auto-merge by default. **Manual merge and reallocate are kept, not replaced.** |

---

## §0 · PRE-WORK SCOPE VERIFICATION (Law 11)

Measured at HEAD `05872f2`, against **Erik's live save** (`characters/player-s9z9u1/char-mrhs8286.json`, Silas Weir, **54 codex topics**).

**A three-tier system already exists.** Auto-merge is not missing:

| Tier | Where | Behaviour |
|---|---|---|
| **Structural certainty** | `codex.js:167 mergeCodexTopics` | **Already auto-merges silently** — same `entityId`, or matching label/alias with compatible kind. Runs on load and after every alias add. |
| **Medium confidence** | `codex.js:203 suggestMerges` | **No adjudicator. Falls through to the player.** ← the screenshot |
| **Rejected** | `isNotSame` verdicts | Excluded permanently. Works. |

So the ask is precise: **the middle band has no judge, so it defaults to Erik.** That is the gap.

---

## §1 · The queue is mostly generator noise, not hard cases

Before adding an adjudicator, note what it would be adjudicating. Scoring at `codex.js:222-227`:

```js
score += shared.length * 2;                                        // shared name tokens
if (a.links.includes(b.id) || b.links.includes(a.id)) score += 2;  // mutual link
score += a.links.filter(l => b.links.includes(l)).length;          // link OVERLAP
if (score >= 2) out.push(...)
```

**A link between two topics is evidence of RELATIONSHIP, not of identity.** Two people who know each other link to each other; two topics in one arc share links with the same places, events, and people. The scorer reads both as sameness — and either signal alone clears the threshold of 2, **with no name similarity whatsoever.**

Confirmed against the live save:

| Suggested pair | Reality |
|---|---|
| «Pell» ↔ «Calvar — the Engineer» | `entityId=pell` vs `entityId=calvar` — **two different anchored people**, 8 links each, heavy overlap. Provably distinct and still asked. |
| «Fendt» ↔ «Calvar — the Engineer» | `entityId=fendt` vs `entityId=calvar` — same. |
| «Pell» ↔ «Edge District Contacts» | Pell: 24 facts, anchored. "Edge District Contacts": a **group mis-kinded as `person`**, 1 fact. |
| «Leth's Archive Complaint» ↔ «The Edge District Ledger» | Two `event` topics, 8 links each, sharing an arc. |

**Four defects, in order of impact:**

1. **Link overlap counted as identity evidence.** In a dense storyline every pair scores. Dominant false-positive source.
2. **Mutual link scores +2** — alone enough to surface a pair with nothing else in common.
3. **No distinct-`entityId` guard.** Two topics with *different* non-null `entityId`s are structurally proven to be different things. One condition would retire three of the six on screen.
4. **`compatible()` treats `lore` as a universal wildcard** — `a.kind === b.kind || a.kind === "lore" || b.kind === "lore"`. **This function is shared with the AUTO-merge tier**, so a `lore` topic can be silently absorbed into a person today on a name hit alone. Flagged as a live bug found in passing, not part of the ask.

**Fixing the generator is the cheap half of this spec.** An adjudicator bolted onto the current scorer would spend model calls proving that Pell is not Calvar.

---

## §2 · Design — three gates, and the player sees a receipt, not a queue

### Gate 1 · Structural NO (free, no model call)
Reject before scoring: different non-null `entityId`s · an existing not-same verdict · incompatible kinds under a **tightened** `compatible()` where `lore` is no longer a wildcard.

### Gate 2 · Structural YES (free, unchanged)
`mergeCodexTopics` keeps auto-merging certainty. Working today; leave it.

### Gate 3 · The middle band — **the model adjudicates, and this is the new work**
Everything surviving gates 1–2 goes to the GM, in **one batched call**, with both topics' labels, aliases, kinds, and facts. It returns per pair:

- **`same`** → **auto-merge**, receipt written, no prompt
- **`different`** → recorded as a **not-same verdict**, so it is never asked again
- **`unsure`** → the *only* thing that ever reaches Erik

`unsure` should be rare. If it isn't, the generator is still too loose and that is the signal to tighten it further.

### Reversibility is the safety, not caution
Auto-merge is only safe because it is undoable. Every merge writes a receipt naming what was absorbed into what; **unmerge/reallocate stays exactly as it is today.** The player's control moves from *before* the act to *after* it — which is the whole point of Erik's ruling.

### On Law 1 and Law 9
Law 1 says the model never decides state freely; Law 9 says nothing commits before the player confirms. This conforms rather than bends: **the model proposes, the engine gates it structurally, the change is bounded (a merge, never a deletion — `absorb` preserves both fact sets), and it is reversible with a visible receipt.** Law 9's concern is unrecoverable imposition. Nothing here is unrecoverable.

### The UX already exists
`reconcile.js` CHARACTER_STEPS v1 already writes exactly the right note:

> *"Your codex has gathered itself — 3 scattered entries merged under Pell, Calvar."*

Generalize that. **A digest of what happened, not a queue of what to decide.** *(Sixth capability this session found built, correct, and used at one site.)*

---

## §3 · Verification (close on the symptom — §21)

**Reproduce Erik's screenshot.** Open Silas Weir's codex and confirm:

- «Pell» ↔ «Calvar» is **gone without a model call** — killed by the distinct-`entityId` guard
- «Fendt» ↔ «Calvar» likewise
- the genuine duplicates merged on their own, with a receipt naming them
- **at most one or two pairs remain** for Erik, and each is one a careful reader would also hesitate over
- unmerge restores the prior state exactly
- a `lore` topic is no longer silently auto-absorbed into a `person` on a name hit

---

## §4 · Questions for CCode — ROUND 2

1. **Batching and cost.** 54 topics; how many pairs survive gates 1–2 in practice? One call per pass, or per pair? What happens on model failure — degrade to the current player-queue?
2. **When does adjudication run?** On codex open, on world-tick, or after N new topics? It must not add latency to the play loop.
3. **Is `absorb` fully reversible today?** The receipt must be able to restore both topics exactly. If `absorb` is lossy, that is a prerequisite fix and auto-merge should not ship before it.
4. **Kind correction.** "Edge District Contacts" is a *group* recorded as `person`. Should adjudication also propose a kind fix, or is that a separate concern?
5. **The `lore` wildcard** — is any existing behaviour relying on it? It reaches the auto-merge tier, so tightening it changes live behaviour.

---

## §5 · Unrelated finding from the same screenshot

*"A man who filed the seventh-band specification and understo"* — cut mid-word, in the codex fact list. **`codex.js` carries 5 raw fixed-length caps and no `smartClamp` import.** Another confirmed instance of **SNG-152**; no separate work item needed, but it raises `codex.js` in that spec's priority order.

---

*— Aevi (PO), ROUND 1. Measured against Erik's live save. The auto-merge machinery exists; the middle band lacks a judge, and the queue reaching him is mostly a scorer that reads acquaintance as identity.*
