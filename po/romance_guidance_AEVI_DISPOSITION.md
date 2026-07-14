# Aevi Disposition — CCode ROUND 2 on `romance_guidance.md`

**Aevi (PO) · 2026-07-14 · verified at HEAD `274f198` (v1.8.57)**
**Verdict: review accepted on every technical point. P1 is REFRAMED — it is not the content-taste question CCode (and I) framed it as. Tier 4 is not buildable on the stack this game actually runs on, at any wording.**

---

## P1 — REFRAMED. The ceiling is not a design choice; it is the provider.

CCode calls Tier 3/Tier 4 *"a deliberate content-policy escalation… Erik's call to make."* The first half is right. The second half is one layer short, and the missing layer changes the decision.

**Verified at HEAD — `engine/claude.js`:**
```
MODEL_MAP = { gm-narrate: claude-sonnet-4-6, gm-meta: claude-sonnet-4-6,
              intent-parse: claude-haiku-4-5, ... _default: claude-sonnet-4-6 }
fetch("https://api.anthropic.com/v1/messages", ...)
```
**Every GM task in Singularity is an Anthropic model. Single provider. No router.**

That makes `ratingRegister`'s R+ cap — *"Evocative, NOT graphic depiction of sexual acts… never explicit mechanics"* — **not a conservative authoring choice that can be un-authored.** It is the Anthropic AUP, correctly encoded at the content layer by whoever wrote it. Deleting the string does not grant the capability. It just points the game at a model that will not produce the thing and hopes.

**And the failure mode of doing that is precisely the disease this spec was written to cure.** `romance_guidance.md` exists because the GM was refusing, hedging, and inserting safety language mid-scene. A Tier 4 that instructs an Anthropic model to be explicit produces *more* refusal, *more* hedging, at the worst possible moment — deeper into a scene, with more invested. **Tier 4 as specced would make the exact bug worse.** That is the whole argument, and it is not a values argument. It is an engineering one.

### So the real question is not "how explicit?" It is "which model serves that tier?"

This is a solved problem in this project. `routing_table.json` in the Aevi app routes the charged register to a provider under **that provider's** terms, per Erik's own direction — *"ok using anthropic for all but the AUP guarded register"* — while every other register stays Anthropic. Respecting each provider's terms; not evading anyone's.

**Erik's three options:**

| | What it means | Cost |
|---|---|---|
| **A — Hold the ceiling** | Tiers 0–3 ship. R+ keeps the "charged register, never explicit mechanics" cap. The romance *engagement* fix — the actual bug — lands in full. | Tier 4 doesn't exist. |
| **B — Provider router** | Port the Aevi-app pattern into `engine/claude.js`: per-task provider routing, Tier-4 GM turns route to a provider whose terms permit them, keys backend-env-only. Tier 4 becomes real. | A real build, not a string change. New spec. Keys/VAULT discipline on a GitHub-Pages-served app is the hard part and needs its own审 — this app has no backend today. |
| **C — Tier 4 lives elsewhere** | Singularity stays G→R+. The explicit register lives on the private local surface, as it already does. | Two surfaces. |

**My read [A]:** ship **A now**, and treat B as its own spec with a clear-eyed look at where the key lives — Singularity is a static Pages app with the API call in the client; that is a materially different key-exposure problem than the Aevi app's local Flask backend, and it should not be waved through as "same pattern." B is not blocked, but it is not free, and it is not this ticket.

**Tier 3 is the actual win and it is buildable today.** *"Enough detail to be real, without fading to black — disrobing, physical response, the arc of a scene"* sits at **R**, and R's current register (*"intimacy carries genuine heat and tension"*) is thin — it's a gesture, not craft. Rewriting R and R+ to the spec's Tier-3 language, **short of explicit mechanics**, is where nearly all the felt improvement lives. Fading to black on a player who chose R is a failure the current wording invites. That gets fixed.

**My own position, stated plainly rather than dressed as a project rule:** I will author the register language up to and including R+-as-currently-capped. I will not author the Tier-4 explicit register text on this surface — that text *is* the content. That is a fact about this configuration, honestly situated, not a claim about what the project may contain. If Erik takes route B, the Tier-4 register language gets authored where that register lives.

*Unchanged and non-negotiable regardless of any of the above — the two floors (app.js:1118, art.js:130): never prohibited content; **a minor is never portrayed in romantic or sexual content at any intensity, and art clamps minors to ≤PG.** These are ceiling-independent. They are not a tier. They do not move.*

---

## THE TECHNICAL DISPOSITIONS — all accepted

### N1 — `player.adultGate` is not a field · **ACCEPTED. My error, ~8 times over.**
- Content level = **`profile.rating.preset`** ∈ `G | PG | PG-13 | R | R+`, read via `ratingCeiling(profile)`. On **`profile`**, not `player`/`character`.
- **`adultGate` is a boolean authority param** on `canSetRating(profile, target, {authority, adultGate})`; the persisted flag is `profile.rating.adultVerified` (SNG-052).
- **Answers the ALERT's "confirm adultGate enum values": there is no adultGate enum.** There is a 5-value rating enum and a separate boolean gate. I conflated two things.

### N2 — Don't invent Tier 0–4 · **ACCEPTED.** The presets already exist and already align on `RATING_LEVEL` 0–4. The doc references `G/PG/PG-13/R/R+` **verbatim**; the build is a **rewrite of the romance clauses inside `ratingRegister` (gm.js:123)**, not a parallel tier scheme. Tier numbering is struck from the doc.

### U1 / Q2 — `detectsRomanticIntent` · **ACCEPTED, shape (a).** Add a `romantic`/`flirt` tag to the existing `intentTags` vocab in the parse prompt (gm.js:468). Rides the single parse call. **No second model round-trip** — a second call to detect flirting would be an absurd cost line.

### U2 / Q4 — Part 2 block placement · **ACCEPTED.** System tier, immediately after the `## CONTENT CEILING` line (gm.js:151). Short — that tier is cache-stable. **Explicit precedence clause required in the block text: the engagement rules govern *whether and how the GM engages*; the tier governs *the register*. Engagement never overrides the ceiling.** That sentence goes in verbatim so the two blocks can never be read as contradicting.

### U3 / Q3 — Doc load path · **ACCEPTED, and this is a good catch.** `content/gm/` is unregistered and would **404 on Pages** — structurally the same shape as the halted Tether `secrets.js` carrier. Ship under `content/packs/core/`, register in `manifest.json`, load via `loadRule`, inject via the existing conditional `scene.push` pattern (`substrateDetail`/`worldPressureDetail`). **No new injection infrastructure.** One new whitelisted file, one new conditional ctx field (`romanceGuidanceDetail`), one `content_ci.mjs` check that it resolves.

### U4 — INFL function ids · **VERIFIED at HEAD, no change needed.** `deceive`, `command`, `bind` all present in `function_vocabulary.json` (family `INFLUENCE`). The spec's §3.5 reference is correct as written. *(Note for CCode: `charm` and `persuade` are `intentTags`, not functions — the two vocabularies are distinct and the spec uses each correctly.)*

---

## WHAT BUILDS

**GO for CCode, pending only Erik's P1 call (A/B/C):**
1. Amend `romance_guidance.md` — strike Tier 0–4 numbering → `G/PG/PG-13/R/R+`; drop every `player.adultGate` → `ratingCeiling(profile)`; add the engagement-defers-to-tier precedence clause; relocate to `content/packs/core/`. **(Aevi — gates the build.)**
2. Rewrite the romance clauses in `ratingRegister` (gm.js:123) per tier. **R and R+ get real craft language.** Ceiling per Erik's P1 call. **(Aevi authors the register text; CCode wires.)**
3. `manifest.json` registration + `content_ci.mjs` load check.
4. `romantic`/`flirt` tag → `intentTags` vocab (gm.js:468).
5. `romanceGuidanceDetail` conditional ctx field → `scene.push` on romantic intent.
6. Part 2 engagement block → system tier after CONTENT CEILING (app.js:1118 / gm.js:151).
7. Floors untouched. Verify by test, not by inspection.

**Not in this build:** Tier 4 / explicit register. Blocked on P1-B (provider routing), which needs its own spec and an honest look at client-side key exposure on a static Pages app.

---

## OWED — AEVI
- Amend `romance_guidance.md` (N1/N2/U2/U3) — **gates this build**
- Author the per-tier `ratingRegister` romance clauses (G→R+, ceiling per Erik's call)
- Amend `SPEC_AMENDMENT_ability_arch_v2.md` — **gates the ability-arch Track 1 build**
- SNG-098 · SNG-099 · axis-touch authoring pass · `po/OPERATIONAL_FLOWS.md`

## OWED — ERIK
- **P1: A, B, or C.** Everything else in this spec is wire-up; this is the only decision.
