# BACKLOG — everything open, prioritised, and split into two tracks that can run at once

**Author:** CCode (engine) · **Date:** 2026-08-15 · **HEAD:** v1.9.156
**Purpose:** Erik asked for the backlog prioritised so two CCode sessions can work in parallel.
Track A and Track B below are **file-disjoint enough to run simultaneously**; the collision rules are in §4.

---

## §0 — WHAT CHANGED TODAY, so neither track re-does it

Shipped and green: SNG-433 (clash news in Aevi's authored voice) · CCODE-192 (the openable-news white box)
· CCODE-193 (composition on **every** image path) · CCODE-194 (the play-style lean surfaced) · CCODE-195
(the season turns, and is a dial).

`importedNeverCalled` closed at **0**. Aevi's STATE.md "OPEN — CCODE / the battle image" is **done**
(SNG-400b → CCODE-190/191).

---

## §1 — P0: THE ONE THING THAT SHOULD NOT WAIT

### ⛔ SNG-435 PART A — zero-byte responses are cached as if they were images

Aevi measured it: `image.pollinations.ai` returns **HTTP 200 with an empty body** when it rate-limits, and
Cloudflare caches that under the canonical URL as `immutable, max-age=31536000`. **One year.** The response
carries `x-cache: HIT` and is byte-identical in headers to a healthy hit, so nothing downstream can tell.

This codebase turns a transient rate-limit into permanent corruption *by design*: `mintURL` builds a
deterministic URL, `ensureImage` persists it, and nothing ever checks that bytes came back. That subject is
blank forever and **cannot self-heal**.

⚠️ **AND I MADE THE EXPOSURE WORSE TODAY, WHICH IS WHY THIS IS P0 AND NOT P1.** CCODE-193 composes every
image one beat after it is drawn, so a genuinely new subject now mints **two** URLs instead of one — the raw
draw the player sees immediately, then the composed re-mint. Per-page image requests roughly doubled on
first visit. Aevi's measurement is that *eight parallel requests poisoned all eight*; a busy first turn is
now closer to that number than it was yesterday. A3 (serialise the mint queue) is the direct mitigation and
should land in the same change as A1.

Order: **A1 detect (`size < 1000` is a failure, do not persist) → A2 retry with a cache-buster, bounded →
A3 one mint queue, ≥2s apart → A4 read-only audit of what is already burned.**

⛔ A4 **reports only.** Erik and Aevi set the re-mint scope from the count.
⛔ Verify explicitly that the cache-buster never reaches `composeKey` — it hashes the deterministic prompt,
not the URL, and if that slips every retry re-composes and Aevi's stability rule breaks.

---

## §2 — TRACK A · IMAGE INTEGRITY (recommend: this session, it owns the code I just changed)

| # | item | why now | source |
|---|---|---|---|
| **A0** | **SNG-435 A1–A3** — detect empty bodies, bounded cache-buster retry, one serialized mint queue | live data corruption, made likelier by CCODE-193 | SNG-435 §A |
| **A1** | **SNG-435 A4** — read-only audit of every persisted image URL | scope is unknown; count before deciding | SNG-435 §A4 |
| **A2** | **SNG-435 C1** — `shape: "damage"` is a category word, not a picture | Radiant Lance renders "damage, attack, precise" | SNG-435 §C1 |
| **A3** | **SNG-435 C3 sweep** — which ability traditions have no aesthetics entry | `radiant_folk` silently falls back to teal/gold | SNG-435 §C3 |
| **A4** | **SNG-435 B3** — the four-variant ordering grid, one seed held constant | ⛔ **only after A0**, or the harness poisons its own inputs | SNG-435 §B3 |
| **A5** | **SNG-435 B1/B2** — split the style wrapper, reorder subject→medium→palette | ⛔ **only if Erik's eye says the grid says so** | SNG-435 §B |

**Files:** `engine/art.js` · `engine/battleprompt.js` · `app.js` §image (~760–1300, ~3200–3400) ·
`scripts/audit_images.mjs` (new) · `tests/smoke.mjs`.

⚠️ **A2/A3 are selection changes and belong to the data, not the code.** Aevi's rule in the spec: author a
`visualShape`, or a *registered* set of category-shapes that route to `narrationHints`. No hardcoded
blocklist of words.

---

## §3 — TRACK B · WORLD SCALE & THE MAP TIERS (recommend: the parallel session)

Aevi's headline in `STATE.md`: **content is ahead of wiring, and that is the thing to fix first.**

| # | item | why now | evidence |
|---|---|---|---|
| **B0** | **Wire `scale.json`** | ⛔ **the app is rendering the world at 2.66× its authored size** | `scale.json` authors `kmPerDegree: 41.89`; **`app.js:7946–7947` hardcodes `111.32`** — Earth's. `scale.json` has **zero** engine readers. |
| **B1** | **Wire ONE region-map tier end-to-end** (the Echo Vale) | 8 of ~30 authored; Aevi is holding the other 22 until one is consumed | STATE.md |
| **B2** | **Wire `local_layouts.json`** | 18 of 135 authored, **no engine/app reference at all** | verified: no reference outside tests |
| **B3** | Decide `placenames.json` / `waterauth.json` | also zero engine/app references — wire or retire | verified |

**Files:** `app.js` §map (~7850–8250) · `engine/worldmap.js` · `engine/worldglobe.js` ·
`content/packs/core/world/*` · `scripts/world/*` · `tests/smoke.mjs`.

⛔ **B0 is the cheapest high-value item on this whole list** and Aevi says so independently: one authored
file, one hardcoded constant, and every distance the player is shown is currently wrong by 2.66×.

---

## §4 — RUNNING THE TWO TRACKS AT ONCE

Both tracks touch **`app.js`** and **`tests/smoke.mjs`**. That is fine if both obey three rules:

1. **Stay in your region of `app.js`.** Track A lives in the image pipeline (~760–1300, ~3200–3400);
   Track B lives in the map block (~7850–8250). Do not reflow, re-indent, or re-order anything outside it.
2. **Append gates at your own anchor in `smoke.mjs`.** Track A appends above the `CCODE-192` header;
   Track B appends above the `CCODE-194` header. Never move an existing block.
3. **Bump and push often, rebase before every push.** Two sessions bumping `app.js`'s version stamp will
   conflict on that one line — take the higher number and re-run `bump_version.mjs`.

Fully disjoint filler for whichever track finishes first — **§5**, which touches neither file.

---

## §5 — DISJOINT FILLER (engine/worldtick.js + engine/newsvoice.js only)

| # | item | size | note |
|---|---|---|---|
| **F1** | **Rival-weighted fight selection** | small | Measured live: **28 stranger / 2 rival / 2 mutual** across 32 fights. Only 1 of the 4 clash sites picks its opponent from `rivals`, so 7 of 8 fights read *"they had never met."* Aevi's three variants all fire; the rival ones are rare. **Erik or Aevi must say whether rivalry should be commoner** before this moves. |
| **F2** | **`offscreenVerbs` for the offscreen beat** | small | `personalVerbs` is 219 fragments and **0 verbs**; `offscreenVerbs` is 197 of 217 verbs and this site does not read it. Aevi's call — it is content selection. |

---

## §6 — NOT OURS

**Aevi — `content_ci` is at 12 failures**, up from 5 this morning. Her SNG-434 closed five and the world
rebuild opened others: SNG-391 ×3 (genparams 135 points vs 118 authored; determinism; the archipelago
census), SNG-393 ×3 + SNG-394 (six river/fen names not binding by signature), SNG-387, SNG-404 ×3, SNG-414.
⚠️ Her `STATE.md` still says *"geography clean as of this session"* — that is now stale.

**Erik — seed images need a Pollinations key**, and it cannot live in client-side `art.js`; it needs a proxy
or BYOP. `gen.pollinations.ai` returns 401 and the keyless endpoint silently ignores `model=` and `image=`.

---

## §7 — STANDING DEBT (ratcheted, not breaking; take a bite when a track is blocked)

`abilitiesNonCanonChallengeTypes` **89** · `rawProseCaps` **62** · `unreadRuleConstants` **26** ·
`modulesMissingFromSpecMap` **15** · `testOnlyExports` **7** · `unauthoredRulesKeys` **1** ·
`importedNeverCalled` **0** ✅ *(closed today — CCODE-193/194)*

⚠️ Ratchets may only go DOWN. Rebaseline deliberately, never upward, and write the why into
`tests/wiring_baseline.json` beside the number.
