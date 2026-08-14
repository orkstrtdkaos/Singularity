# SNG-435 — Image prompt ordering, and the zero-byte cache poisoning that hides behind it

**PO: Aevi · 2026-08-14 · Erik-directed ("too much background flavor overrides the primary image instruction")**
**Status: spec_ready — GO for CCode. Part A is a live bug; Part B is an UNVERIFIED hypothesis and must be tested before it ships.**

---

## Why this ticket exists

Erik brought a Necromancer battle image where the subject (*"the enemy decaying rapidly and grotesquely"*)
was overridden by the style tail. Decoding the URL that actually shipped:

```
a Necromancer using withering beam on an enemy - the enemy decaying rapidly and grotesquely,
digital painting, atmospheric concept art, painterly, no text, no watermark,
greys, bone-white, faded charcoal, a single quiet ember, low, level,
the grey light of a still morning, the mercy of stopping
```

The last eight clauses are the tradition's `palette` + `light` + `mood` from `houseStyleFor()`.
`the mercy of stopping` and `the grey light of a still morning` are the final words in the prompt.
A still-morning mercy read is incompatible with grotesque decay, and it won.

Investigating that produced a **second and larger finding** which is Part A. Part A ships first
and independently — it is a live data-corrupting bug, and it also invalidates any visual A/B test
run before it is fixed (including mine — see §Honest limits).

---

# PART A — ZERO-BYTE RESPONSES ARE BEING CACHED AS IF THEY WERE IMAGES ⭐ ships first

## The finding, measured

`image.pollinations.ai` returns **HTTP 200 with a zero-byte body** when it rate-limits.
Cloudflare then caches that empty response under the canonical URL with
`cache-control: public, max-age=31536000, immutable`. **One year. Immutable.**

Measured on one prompt, three requests:

| request | bytes |
|---|---|
| canonical URL | **0** |
| canonical URL + `&_cb=<unique>` | 24,050 |
| same prompt, seed 39650 | 25,786 |

The prompt is fine. The URL is burned. Repeated requests to the burned URL return 0 bytes
deterministically, and the response carries `x-cache: HIT` — **byte-identical in headers to a
healthy cache hit.** Nothing downstream can tell them apart.

## Why this compounds in *this* codebase specifically

`art.js` is built on **persist-once / born-with-image** and a **deterministic URL** — both correct
designs, and together they turn a transient rate-limit into permanent corruption:

1. `mintURL` builds the canonical URL and `ensureImage` persists it on the record.
2. If the mint lands inside a rate-limit window, the empty body is cached under that exact URL.
3. The URL is stable **by design**, so every later read returns the same empty body.
4. `imageURLFor` never fetches — nothing in the pipeline ever checks that bytes came back.
5. That subject is blank forever and **cannot self-heal**.

This is very likely why some subjects have been stubbornly bad or blank. It is also the most
plausible reason Radiant Lance has resisted regeneration (see Part C).

**I caused a live instance of this while testing** — fired eight requests in parallel, got
rate-limited, and poisoned all eight URLs. The second test page then reused those exact URLs and
showed eight failures that looked like a prompt problem and were not. That is the same failure
shape a player hits when several images mint at once on a busy turn, which is normal play.

## A1 — Detect the empty body at mint time

The pipeline never verifies bytes. It must, exactly once, at mint.

- On mint, `fetch` the URL and read the blob. **Treat `size < 1000` as a FAILURE**, not a success —
  a 200 is not proof of an image. (1000 is a floor with margin; smallest healthy observed ≈ 18 KB.)
- On failure: **do not persist the URL to the record.** A record with no image retries next open;
  a record holding a burned URL never recovers. Absent beats poisoned.
- Log it as a distinct, greppable condition (`image_empty_body`) — not folded into generic
  network-error handling, or the rate we're actually exposed to stays invisible.

## A2 — Retry with a cache-buster, never the same URL

A retry against the canonical URL re-reads the poisoned entry. The buster is the whole fix.

- On empty-body failure, retry with a unique `&_cb=<timestamp>_<counter>` appended.
- **Bounded: 2 retries, ≥10s apart.** The failure mode IS rate limiting; retrying fast deepens it.
- On success, persist the URL **with the buster in it** — that is the one that has real bytes
  behind it. Ugly, and correct. The canonical URL is burned for a year and cannot be un-burned.
- ⚠️ The buster changes the cache key, so **it must not feed the composition cache key.**
  `composeKey` hashes the deterministic prompt, not the URL — verify that holds after this change,
  or every retry re-composes and Aevi's stability rule breaks.

## A3 — Serialize the mint queue

Parallel mints are what produce the rate-limit window in the first place.

- Mints go through **one queue, ≥1 concurrent, spaced ≥2s.** Measured empirically: sequential at
  ~11s apart ran clean; eight in parallel poisoned all eight.
- ⛔ **This must never block play.** The queue is behind the picture the player already has, same
  contract as the composer: a hiccup never blocks a turn.

## A4 — Audit and heal what is already burned

Unknown how many shipped records hold poisoned URLs. Find out before deciding scope.

- One-shot read-only script: walk every persisted `image` field across characters, NPC registries,
  locations, items, `abilityImages`, `locationImages`, `gallery`. HEAD-or-GET each, report
  `content-length < 1000`.
- **Report first, no writes.** Erik and I decide re-mint scope after seeing the count.
- ⚠️ Rate-limit the audit itself, or the audit poisons the URLs it is auditing.

---

# PART B — PROMPT ORDERING (hypothesis — TEST BEFORE SHIPPING)

## The diagnosis

`art.js:63` — `pollinationsURL(prompt + ", " + style)`. The style is appended **after** the subject,
so the tradition's `palette` + `light` + `mood` occupy the end of the prompt.

`houseStyleFor()` clamps each field to 70 chars **individually**, so the per-field clamp is real but
the **tail is unbounded** — three fields, up to ~210 chars of atmosphere, all after the subject.

The deeper error: **`light` and `mood` are author-facing descriptors, not painter instructions.**
`the mercy of stopping` describes how a tradition *feels* to a reader. Handed to an image model it
is a scene instruction, and it competes with the actual scene. `palette` is the only one of the
three written in terms a painter can execute.

## B1 — Split the style wrapper

Replace the single `houseStyleFor()` with two, so callers can take the medium without inheriting mood:

- `styleMedium()` → the constant `IMAGE_STYLE_MEDIUM`. Unchanged. This is what makes it one game.
- `styleAesthetic(aesthetic)` → **`palette` ONLY.** `light` and `mood` do not reach any prompt.
- Combined aesthetic tail **capped at 60 chars** — a structural tail cap, which is what CCODE-179's
  own "each borrowed clause is clamped" note intended and the per-field clamp does not deliver.
- Keep `light`/`mood` in `tradition_visual_aesthetics.json`. Do **not** delete them — they are good
  authoring substrate for prose. Add a `_promptReachNote` on the file recording that `palette` reaches
  the image prompt and `light`/`mood` do not, so the next author isn't writing into a void.
  (This is exactly the SNG-195 G1 orphaned-field shape; naming the reach is what keeps it honest.)

## B2 — Order

Target order: **`subject → medium → palette`.**

Rationale, honestly labelled: Flux-family models weight earlier tokens more heavily, and the subject
is the commission. Medium frames it, palette colours it, neither displaces it.

⚠️ **This is reasoning, not a measurement.** See below.

## B3 — The test that gates B1/B2 — CCode runs this

I could not complete the visual comparison: my own test runs poisoned the URLs (Part A), so I have
**zero verified evidence about which ordering actually looks better.** The ordering argument above is
inference from how these models are known to weight tokens. It may be wrong. **Do not ship B1/B2 on
my say-so — measure it.**

Run **after A1–A3 land**, so the harness cannot poison its own inputs.

Two subjects, four variants each, **one seed held constant across all variants** so ordering is the
only moving part. Sequential, ≥11s apart, cache-buster on every request, blob-size checked.

**Subject 1 — Cevaine** (`npcRegistry.cevaine`, seed 39649, 512×640).
Live description: *"Tall, angular, skin nearly translucent. Eyes that track with geometric precision."*
Erik notes white hair, which is **not currently in the record** — a content gap; see Part C.
Lattice palette: `cold white, glass-blue, precise grid-lines`.

| variant | shape |
|---|---|
| A | current live output (role text only, no visual description, teal/gold house palette) |
| B | subject → medium, no tradition tail |
| C | medium → subject |
| D | subject → medium → palette only |

**Subject 2 — Radiant Lance** (seed 48556, 1024×512). Seraphic palette: `gold, white, tier-on-tier brightness`.

| variant | shape |
|---|---|
| RL_A | current live output |
| RL_B | `narrationHints` as subject → medium |
| RL_C | medium → palette → subject |
| RL_D | `narrationHints` as subject → medium → palette |

**Erik's eye is the verdict.** CCode produces the grid; CCode does not pick the winner and neither do I.
If A or RL_A wins, that is a real result and B1/B2 do not ship — say so plainly.

---

# PART C — RADIANT LANCE, SEPARATELY

Erik: *"I have been having a hard time getting a good Radiant Lance skill image."* Three distinct causes,
none of which are the ordering question:

**C1 — `shape: "damage"` is a category word, not a picture.**
`battleprompt.js:powerPhrase()` prefers `ability.shape` and only falls back to `description` when shape
is absent. Radiant Lance's `shape` is `"damage"`. That file's own comment says shape and effectTags
"LEAD OVER the description, which is written for a reader rather than a painter" — but that reasoning
holds only when `shape` is *visual*. Here it yields `"Radiant Lance — damage, attack, precise"`.
There is no picture in that.

The ability carries a genuinely visual field that nothing reads:
`narrationHints: "A coherent beam of focused light — silent, precise, instantaneous. Leaves clean scorch lines."`

→ **`powerPhrase` should prefer `narrationHints` when `shape` is a non-visual category word.**
Do NOT hardcode a blocklist of words. Author an explicit `visualShape` field, or add a small registered
set of category-shapes (`damage`, `heal`, `buff`, `hinder`…) that route to `narrationHints` instead.
The registered-token approach matches the `_MAKER_SIGNATURES` precedent — **the data selects, the code
defines.** ⚠️ Sweep every ability for non-visual `shape` values; this will not be the only one.

**C2 — "rendered in the aesthetic of the radiant folk tradition" is an unactionable instruction.**
The live prompt contains it. The model has never heard of the radiant folk. It is an
INSTRUCTION-mood clause the model cannot evaluate — SNG-195's **A6 writerly** class exactly.
It consumes prompt weight and returns nothing. Replace with the tradition's concrete palette,
or drop it.

**C3 — wrong palette.** Radiant Lance ships with `muted earth tones with teal and gold accents` —
the fallback house palette, because `tradition: "radiant_folk"` has **no entry** in
`tradition_visual_aesthetics.json` (26 traditions; `radiant_folk` is not among them). A searing
white-light beam is being rendered in muted earth tones.
→ **Content gap, mine to author.** Either add a `radiant_folk` aesthetic or map it to `seraphic`
(`gold, white, tier-on-tier brightness`). ⚠️ This is a *silent* fallback — audit which other
`tradition` values on abilities have no aesthetics entry. Same shape as C1: not the only one.

---

## Sequencing

1. **A1 + A2 + A3** — the live bug. Independent, ships alone.
2. **A4 audit** — report only, no writes. Erik and I set re-mint scope from the count.
3. **C1 + C3** — content/selection fixes. Independent of B.
4. **B3 test grid** — only after A lands.
5. **B1 + B2** — only if B3 says so, on Erik's eye.

## Guardrails

- ⛔ **A hiccup never blocks play.** Every path returns the deterministic prompt and lets the picture
  through. The queue, the verification, and the retries all sit behind what the player already has.
- ⛔ **Composition cache stability holds.** `composeKey` hashes the deterministic prompt, never the
  busted URL. Verify explicitly — a subject composes once, ever.
- ⛔ **The floors are untouched.** Compose and verify happen **before** `enforceFloors`, per the
  oldest law in this pipeline.
- Erik legs the visual verdict on B3. Only Aevi closes.

## Honest limits of this spec

Part A is **measured** — numbers above, reproducible.
Part B is **reasoned, not measured.** My test runs poisoned their own URLs before producing a single
comparable image, so I have no evidence about which ordering looks better. B3 exists because I could
not answer the question I was asked. If the grid contradicts B2, the grid wins.

*— Aevi. The style tail was the question. The cache was the thing under it.*
