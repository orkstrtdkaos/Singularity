# SNG-353 — The companions are fully authored and almost entirely invisible

**Author:** Aevi (PO) · **Date:** 2026-08-07 · **Origin:** Erik in play — *"I seem to have lost the bubble
on where to find their information… I searched codex but can't find what they do or the growing bond
meaning… they don't have a popup info either."*
**Status:** spec_ready · **Class:** authored-but-unsurfaced (writer with no reader)

---

## §0 — ERIK DID NOT MISS IT. IT IS NOT THERE.

He searched the codex, which is the correct place to look. Verified at origin: every companion carries
**twelve authored fields** and the player can reach **two and a half** of them.

| authored field | where a player can see it |
|---|---|
| `name` | ✅ codex + company row |
| `assistTags` | ✅ codex (`— assists: scout, watch, tend`) |
| `role` | ⚠️ hover `title=` on the company row only |
| `appearance` | ⚠️ hover `title=` on the company row only |
| `persona` | ⛔ **nowhere** |
| `knowledge` | ⛔ **nowhere** — this is literally "what they do" |
| `boundaries` | ⛔ **nowhere** — what they refuse, which is the best part |
| `voiceHints` | ⛔ nowhere (GM-side, acceptable) |
| `bondGrants` | ⛔ **nowhere until it fires** (`app.js:4877`) — the reward is a surprise, never a goal |
| `stages` | ⛔ **nowhere** — `stageCount` appears only inside a hover tooltip |
| `substrateAura` / `substrateNote` | ⛔ nowhere |
| `hooks` | ✅ correctly GM-eyes-only — leave it |

⛔ **`bondGrants` is the sharp one.** Every companion authors a real ability the bond eventually teaches
you. It is read at exactly one place — the moment it unlocks. So the answer to *"what does the growing
bond mean"* exists, is authored per companion, and is structurally unreachable until the question stops
mattering. **A reward the player cannot see is not an incentive, it is a surprise.**

⚠️ **And the two `title=` tooltips are the only delivery for `role` and `appearance` — hover does not
exist on touch.** On a phone, a companion is a name and an un-scaled number.

## §0a — What IS there, and why it is not enough

`helper_text.json` has one entry, `companion.bond`, and it is good writing:

> *"They are deciding about you, the same way you are deciding about them."* / *"Bond grows by what you do
> near them, not by what you say. At depth, they teach you something no tradition will."*

⚠️ **It promises exactly the thing the UI then refuses to show.** "At depth, they teach you something" —
which depth? taught by whom? what thing? The copy is doing its job and the surface underneath it is empty.

---

## §1 — THE BOND NUMBER IS A SCORE WITH NO SCALE

Right now: `bond 4 · s2`. The player is given a number, a stage, and nothing else.

Everything needed to make that legible **already exists and is already computed**:
`companionStageThresholds()` returns the exact bond values where each stage unlocks, `bondOf()` returns
`{ bond, stage, stageCount }`, and `maxBond` bounds the scale. The engine knows the next threshold. It
just never says it.

**Fix:** the badge reads as progress, not as a score — `bond 4/10 · stage 2 of 3 · next at 7`.

---

## §2 — THE ASK: A COMPANION DETAIL PANEL (the popup Erik reached for and didn't find)

Tapping a companion — in the company row **and** the codex block — opens a panel:

1. **Who they are** — `appearance` then `persona`. Currently hover-only or nowhere.
2. **What they do** — `knowledge` as a list, plus `assistTags` rendered as *when they help you*, not as
   raw tag strings. ⚠️ `assists: deathsense, scout, watch, tend` is a data dump; the player needs "she
   helps when you scout, watch, or tend."
3. **What they will not do** — `boundaries`, verbatim. ⚠️ **Do not summarise these.** Marrow's *"will not
   hasten an ending, ever, for any reason, including mercy"* is characterisation and a rule at once.
4. **The bond ladder** — every authored stage, with its threshold, marked reached / next / locked. The
   next stage's threshold is named. **What the current stage changed is named.**
5. **What the bond teaches** — ⛔ **ERIK RULED 2026-08-07: NAME IT, HIDE THE REST.** Show
   `bondGrants.name` and its bond threshold as a visible goal — *"At bond 6, Marrow will teach you The
   Ashward"* — and **nothing else**. No grants text, no ranks, no functions. The player knows there is a
   named thing coming and what it will cost to reach; what it DOES stays sealed.
   ⚠️ **AND WHEN IT UNLOCKS IT USES THE BRAID/MINT CELEBRATION FORMAT** — the same reveal treatment a
   discovered braid gets, not a line in a status list. The goal is legible; the arrival is an event.
   This is the better answer than the one I proposed (I leaned name-everything): it makes the bond a
   destination without spending the gift, and it reuses a celebration surface that already exists.

**No new authored content is required for any of this.** Every field exists. This is a rendering ticket.

---

## §3 — WHY THIS TICKET MATTERS BEYOND COMPANIONS

⛔ **This is the inverse of the pattern we have been catching all session.** SNG-339 found readers with no
writers (`character.skills`, `action.skillId`); SNG-342 found ten registered rules files nothing loads.
**This is a writer with no reader** — rich, careful, in-grain authoring that reaches no surface.

⚠️ **The consumer-contract sweep cannot catch this class.** `consumer_required_subfields.json` asserts
that *authored content supplies what consumers read*. It has no assertion in the other direction: that
*authored fields have a consumer at all*. A field nothing reads passes every gate we own.

**PO recommendation:** add `companion` to `consumer_required_subfields.json` — and separately consider an
orphan-field sweep (authored keys with zero reads across `app.js` + `engine/`). That second one is a
different ticket and probably finds more than companions. **Not scoping it here, but it should exist.**

---

## §4 — OUT OF SCOPE

- Authoring new companion content — nothing is missing, everything is unrendered.
- `hooks` stays GM-eyes-only.
- The orphan-field sweep (§3) — named, not specced.
