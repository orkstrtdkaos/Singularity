# Results — The Wild Half: the tangled substrate wired (SNG-140)

Date: 2026-07-17 · HEAD `fceb17a` · **v1.8.103** · full suite green (incl. content_ci + balance_sim) · browser-verified (real content). Status: **shipped, complete_pending_review.**

Completes the substrate cosmology as a **third keeper-kind**. Aevi's two rulings settled the design; this is the wiring (the SNG-131 shape + a resolver variance knob) against the already-seeded content.

- **fabricated, KEPT** — the Continuous (seraphic): `innatePrecursor` (SNG-131).
- **living, KEPT** — the Rootkin: `innateLivingCurrent` (SNG-131).
- **BOTH, WILD** — the Wild Half (churnfolk/abyssal): `wildCurrent` — both currents tangled, kept by no one, *"joyous, generous, and lethally unreliable."*

## The gate + seed (mirrors SNG-131 exactly) — `engine/progression.js`
- **`effectiveLevelReq`** gains a `wild_current` branch: locked unless the id is in `character.wildCurrentAccess`, identical in shape to precursor/living. The wildness is in the *resolver*, not the gate.
- **`learnAbility`** routes `wild_current` to the access gate (added to `innateAccess`), not the domain gate — so it's innate to the Wild Half people, not learnable by anyone with the domain.
- **`seedInnateSubstrate`** also seeds `wildCurrentAccess` from `origin.wildCurrent` (churnfolk + abyssal), **powerSystem-validated** (`=== "wild_current"`) so a mis-authored id can't create a false access. Called in `finish()` (born with it) + `migrate()` (existing Wild Half saves on load). **`unlockWildCurrent`/`unlockSubstrate` (SNG-141, shipped) is now functional** for deeper wild craft.

## The wildness/variance mechanic (Ruling 1) — `engine/resolve.js` + `resolution.json`
A `wildVariance` action **widens BOTH crit bands, upside-forward** — it extends the existing novel-use volatility pattern one step further:
- **crit-success widens `+6`** (`wild.critSuccessWiden`) — more likely to bloom past what you aimed.
- **crit-failure widens `+3`** (`wild.critFailWiden`) — a real but *smaller* tail.
- Net: **potent and generous, with a real tail** — never a flat per-cast penalty, never strictly-better. Backfire lands only on a genuine `crit_failure` (whose band the widening enlarges), never a baseline risk on an ordinary use. This is *"nobody is driving,"* made mechanical, and it's **data-tunable** (the `wild` knob in `resolution.json`) + balance_sim-checkable. (`critLow` changed `const`→`let` to allow the upside widening.)

## The flag — `app.js`
The resolve-path action now carries `wildVariance`, derived from the ability's own `wildVariance` field / `powerSystem === "wild_current"` (across `abilityId` + any `comboAbilities`), so `resolveAction` sees it.

## Rulings honored
- **Ruling 2 — wild-keepers = churnfolk + abyssal only.** Wired exactly those two; unmaker stays adjacent (no `wildCurrent`) — the wild's undertaker, not its wielder. No data change (ratifies what was seeded).
- **Ruling 1 — variance = extend novel-use volatility, upside-forward, rare crit-fail backfire.** Built as the both-bands widen with a larger upside; backfire only on crit_fail.

## Guards honored
- **Three kinds stay distinct** — fabricated-kept / living-kept / both-wild; the Wild Half's signature is the *lack* of a keeper (the resolver variance), not a fourth pole.
- **Abyssal carries BOTH** `innatePrecursor` (`latticespeak`) AND `wildCurrent` (`the_honest_bargain`) — the canon duality (it's in two clusters); verified the seed opens both lists without conflict.
- **Wild = potent BUT variable** — never strictly better than the disciplined grants; the power is real and so is the unreliability.
- **Ring NOT moved** (the SNG-131 lesson) — this adds a substrate identity, not geometry.
- **Data verified real** (the SNG-124 lesson) — churnfolk→`the_churns_gift`, abyssal→`the_honest_bargain` are both authored `powerSystem: wild_current` abilities carrying `wildVariance`.

## Verification
- **14 smoke tests:** the seed (opens `wildCurrentAccess`, the abyssal both-currents duality, refuses a wrong-powerSystem id); the gate (locked without access, returns levelReq with it, `learnAbility` learns it); the resolver variance (a wild craft crit-**succeeds** on a roll a plain action wouldn't and crit-**fails** on a high roll a plain action wouldn't — both bands widened; upside forward of the tail); the app flag; the knob is upside-forward; end-to-end on real content (the authored wild abilities carry `wildVariance`; churnfolk/abyssal `wildCurrent` point at real `wild_current` ids). Full `npm test` green — **content_ci + balance_sim pass with the new content + variance.**
- **Browser-runtime on real loaded content (fresh port 8103):** a real churnfolk seed opens `the_churns_gift` and the gate returns its levelReq; abyssal carries both precursor + wild access; wild is locked without the seed; the resolver widens both bands upside-forward on the real `wild` knob; v1.8.103; boot-clean.
- **Not headless-reachable:** a live wild cast showing the sideways-generous / occasionally-backfiring outcome in fiction — the GM narrates the `wildVariance` flag's cue; the mechanic (band-widening, seed, gate) is fully verified.

## Files
`engine/progression.js` (wild_current gate + learnAbility route + seed) · `engine/resolve.js` (wild band-widening) · `content/packs/core/rules/resolution.json` (`wild` knob) · `app.js` (action wildVariance flag) · `tests/smoke.mjs` · `index.html` (v1.8.103). *(Content — wild_current.json, origin `wildCurrent` fields, cluster note — was authored by Aevi.)*

## Note
The full substrate trilogy is now live end-to-end: precursor (seraphic), living_current (rootkin), wild_current (churnfolk/abyssal) — each with an innate origin seed, a per-ability access gate, and a fiction-unlock door (`unlockSubstrate`, SNG-141). The Wild Half alone carries the resolver variance that marks it as *untended*.
