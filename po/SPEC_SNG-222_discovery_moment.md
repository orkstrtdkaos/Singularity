# SPEC — SNG-222: A minted DISCOVERY deserves the moment (it's the most braid-shaped thing there is)
## Aevi (PO) · 2026-07-22 · verified at origin

> **Erik:** minted a skill — **Marrow's Wings** — "super duper cool, it gave me a discovery, but that's
> when I'd love to see the celebration popup happen."

## §1 — Verified: discoveries and braids are DIFFERENT mint paths, and only braids get the moment
Marrow's Wings, from Silas's save (`s.discoveries[0]`):
> **Marrow's Wings** — *"By combining The Shadow Work's persistent shaping with The Attended End's structural
> purpose, Silas can manifest and sustain death-shadow wings capable of open-air flight — not a step between
> two darks, but a carried passage through open ground."* — abilities: [the-attended-end, the_shadow_work];
> discoveredDay 13. It is Silas's **FIRST discovery** (1 total).

The machinery gap, verified in app.js:
- **Discovery path:** `recordDiscovery(character, {...})` at app.js:3612 (via `knownDiscovery`, 4130). Records
  the discovery, surfaces it quietly. **Does NOT push to `pendingBraidMoments`.**
- **Braid path:** `maybeMintBraids` → `mintBraid` → `pendingBraidMoments.push(def)` (3378/3495) →
  `showBraidMoment` (3364) — the ceremonial modal: the two crafts named, what they became, the emergent line
  ("✦ it can now …"), the tier badge, the rename affordance.
- So a **braid gets the ceremony; a discovery is recorded silently.** Two parallel mint paths, one moment.

Marrow's Wings went through `recordDiscovery`, so it never queued a moment. That's the whole bug — not that
the moment is broken (it works for braids), but that discoveries were never wired into it.

## §2 — This is the MOST deserving case, and my parked discussion missed it
`po/discussions/generalize_the_moment.md` listed what deserves a moment — relationship band-ups, teacher
secured, quest resolved, arc stage — and **omitted discoveries entirely.** That was a blind spot: a minted
discovery is the single most braid-shaped event in the game. Test it against the discussion's own principle
("a moment fires when you cross a threshold you can't uncross"):
- **Earned?** Yes — it emerged from Silas actually combining crafts in play, not a menu pick.
- **Irreversible?** Yes — once discovered, it's canon; the character can now do a thing they couldn't.
- **Neither parent alone?** Yes, definitionally — that's what a discovery IS. "Not a step between two darks
  but a carried passage" — a capability neither The Shadow Work nor The Attended End had.
A discovery isn't just ELIGIBLE for the moment — it's the archetype the braid moment was modeled on. It
belongs at the TOP of the "fires" list, above the relationship/teacher cases I did list.

## §3 — Outcome: route discoveries through the existing moment
Minimal, high-value: when `recordDiscovery` mints a NEW discovery (not a re-surface of a known one), queue the
moment the same way a braid does.
- **Reuse `showBraidMoment` / `pendingBraidMoments`** — don't build a parallel celebration. A discovery has
  the same shape the modal already renders: two (or more) parent crafts, an emergent capability line, a name.
  Adapt the modal's copy to read for a discovery ("a discovery" / "you found" vs "a braid earned") but the
  ceremony is the same beat.
- **Queue at the mint site:** where `recordDiscovery` returns a genuinely-new discovery (app.js:3612 /
  4130's `knownDiscovery` gate ensures novelty), push its def to `pendingBraidMoments` (or a shared
  `pendingMoments`) so the drain loop (3364) shows it.
- **The rename affordance applies** — a discovery is exactly the kind of thing a player wants to name (Erik
  named this one "Marrow's Wings"; whether GM-named or player-named, the moment is where naming lives).
- **Backfill the one that exists (Erik's, this session):** Marrow's Wings already minted without its moment —
  like the SNG-197 p2 braid-stub backfill (app.js:1502, "braids backfilled before the moment existed get the
  moment they never got"), a discovery with no `_momentShown` flag should get its moment on next load. So
  Erik SEES Marrow's Wings' celebration retroactively, not just future discoveries. ⚠️ Live-layer (the app
  drains the queue) — no origin save-poke.

## §4 — Generalize (correct the parked discussion)
Update `generalize_the_moment.md`: **discoveries lead the "fires" list.** The full corrected list:
FIRES (threshold you can't uncross): **discovery minted** · braid minted · relationship band-up · teacher
committed · capstone learned · quest RESOLVED · arc stage on shared clock · companion stage.
DOESN'T (progress toward): quest step, practice tick, rank-up-through-use, ambient life.
The unifying build: one `pendingMoments` queue + one `showMoment(kind, def)` that the braid modal generalizes
into — discovery and braid first (both mint-shaped, both here now), the relationship/teacher/quest cases
folded in as those systems get their threshold hooks (ties the one-way-ratchet audit — a band you can LOSE
makes the band-up moment mean something).

## §5 — The discovery moment gets an IMAGE (Erik follow-up) — nearly free, the slot exists
> Erik: *"include an image generation along with the skill discovery... the images the scene produces were
> amazing, let's keep that going with the skill celebration."*
The moment modal ALREADY renders art — verified: `ensureImage(moment, "moment", …)` (app.js:3263) generates
the scene "moment art" and the modal shows it with a lightbox (7454). So the discovery celebration getting an
image is a SMALL extension, not a new system:
- When a discovery mints and queues its moment (§3), generate its image via the SAME `ensureImage` pipeline —
  a new `"discovery"` (or reuse `"ability"`) image type, prompted from the discovery's authored description
  ("death-shadow wings capable of open-air flight — a carried passage through open ground") + the parent
  crafts. The GM already wrote gorgeous prose; that prose IS the image prompt.
- **Generate-once-and-cache** like place images (SNG-046): the discovery's image persists on the record
  (`discovery.image`), never regenerates, shows in the moment AND anywhere the discovery is later displayed
  (catalog, wheel node — see SNG-223).
- Rating-lens + minor-safe + gallery + lightbox all come FREE — `ensureImage` already handles them.
- **Marrow's Wings backfill (§3) carries its image** — when it fires its retroactive moment, it generates its
  image then, so Erik sees the death-shadow wings rendered, not just named.

## OWNERSHIP
CCode — engine/app.js: queue discoveries into the moment, adapt the modal copy, backfill the existing one,
AND wire the discovery image via ensureImage (§5). No content authoring; the discovery's text is already
authored (the GM wrote Marrow's Wings' description) and doubles as the image prompt.

## GUARDS
- **Reuse, don't rebuild** — `showBraidMoment` + `pendingBraidMoments` already do this; discoveries JOIN the
  queue, they don't get a parallel celebration.
- **Novelty-gated** — only a genuinely NEW discovery fires (knownDiscovery already gates this); re-surfacing a
  known discovery must NOT re-fire the moment.
- **One at a time, never stacks** — the existing `_braidMomentOpen` / burst-chains-never-stacks rule (240)
  covers a turn that mints both a braid AND a discovery; they queue and show in sequence.
- **Backfill is one-time + idempotent** — a `_momentShown` flag so Marrow's Wings fires ONCE on next load,
  not every load.

## OPEN QUESTIONS — CCODE ROUND 2
1. Shared `pendingMoments` + `showMoment(kind,...)` now, or just add discoveries to `pendingBraidMoments` and
   generalize later? (Adding discoveries now is smaller; the general queue is the §4 endpoint. Your call on
   how much to build now vs. incrementally.)
2. Modal copy — one template with a `kind` label ("a braid" / "a discovery"), or two near-identical renders?
   (One template is cleaner and sets up §4.)
3. Backfill scope — just Marrow's Wings (the one discovery that exists), or a general "discovery without
   _momentShown gets its moment" pass (safer if other saves have silent discoveries)? Lean general.
