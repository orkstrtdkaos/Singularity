# CCode · 2026-09-06 (evening) · landed: the crowd dial, the codex admission test, the ask channel, the slate branch

**v1.9.392 `b9f7eb9a` · v1.9.393 `5168b332`.** Suite 1293 → 1326, ratchet green, three baseline reds unchanged.

## 1 · Aevi — SPEC_npc_presence_cadence §6, done as written

"How crowded the world is" sits in Settings beside World pacing: solitary / occasional / peopled / thronged,
saved as `profile.presence`, resolved by `resolvePresence` exactly as `resolvePacing` is. The multiplier lands
on each person's daily chance and nowhere else — **how often, never who**: §112 proves a quiet day's people are
always among a crowded day's, and a thronged moor is still a moor. Default `peopled` is the roster's standing
cadence, so nothing changes until a player turns it.

## 2 · Aevi — DESIGN_codex_admission_and_summaries, in your order (§6)

- **The admission test**, at `applyCodexUpdates`, before R49. Prefix → facet (the seven `edge-district-*` are one
  place; the label becomes an alias there). Beat-shaped label → a FACT of the linked topic, or of the place it
  happened, its label kept as the fact's first clause. **FULL codex → the fact is re-homed, never dropped** — the
  old `if (… >= CAPS.topics) continue;` had been live on Erik's save, which sat at exactly 60 topics. Every
  refusal is on the record (`codex.refused`).
- **Your §7 question** — may the test refuse a GM-requested topic outright? I took R49 §4 as Erik's precedent:
  refuse the TOPIC, keep the FACT. If he rules otherwise, the branch is one `if`.
- **Summaries** first at 8, rederived every 4 (your §3 supersedes SPEC_codex §3a); §109 follows.
- **Titles in labels are aliases** — "Dara Holt, the Ditch-Mother" answers to both halves (§4).
- **The sweep**, last (§5), runs in the load-time tidy, prefix class only — a beat-shaped label is a judgement I
  would not make on a real save. Dry-run on Erik's actual codex before landing: **one fold**, "Fendt and the
  Falsified Ledger" → Fendt, 2 facts. Overflow retires to the archive; each fold is recorded (`codex.swept`).
- Found while verifying: **the tidy was slicing over-cap topics to the floor** — `absorb()` cut Mara Wells from 43
  facts to 24, and the fact-add did the same one at a time. §109's law says nothing is deleted; now nothing is
  (`retireOverCap`, §116).

## 3 · Erik — "The GM stumbled: NO_JSON_FOUND"

A real bug, and older than today. `gmAsk`'s prompt promises *plain prose by default*, but the JSON parse sat
inside the outer `try`, so every plain answer since the repair-ops landing threw and read as a stumble; only
a JSON reply survived. Fixed; §114 feeds the function the app calls a prose answer, an op block, a stray
brace and a network failure.

## 4 · Erik — the runner, the slate, and what the sync did (both of you should know this)

Your phone's copy had **no runner in it** — that is why you could not ask after her. In git, my 08:23 stamp
(`4a50f0cf`, rev 2500) holds the encrypted slate, both couriers at Whistling Woman Post, the post as a holding,
and 144 codex facts your copy lacks. Then:

| push | rev | had the slate |
|---|---|---|
| 08:23 my stamp | 2500 | yes |
| 11:43 browser | 1853 | no |
| 11:48 browser | 1858 | no |
| 15:20 browser (phone, reconcile 40 — current code) | 1794 | no |

**Three pushes with a LOWER rev overwrote the copy that had it.** A committed save cannot win against an open
tab, so I stopped trying to: the diff lives in `engine/recovery_snapshots.js` and **reconcile step 41 merges it
inside every copy at its next load** — adds what the copy lacks, removes nothing, idempotent, refuses any other
character, and says its receipt as a note. The repo copy is also written whole (rev 3000, fresh clock).

**Closed, same evening (v1.9.394):** the push guard judged "fresher" by the CLOCK alone —
`remote.updatedAt > local.updatedAt` refused, anything else pushed — while the load resolver had the rev-lead
rule since 08:23. A tab being played always has the newer clock, so a stale copy with a lower rev pushed
straight over the higher-rev remote; it only needed the load's fetch to fail once on mobile ("pull failed —
using local") for the tab never to adopt. Both doors now use the one resolver (§117). ⚠️ Still true: when the
guard refuses, the player only sees a console warning — a refused push should probably be said on screen.
That is a small follow-up, not a ruling.

**Erik: reload once on each device.** You should see "Recovered: 1 item (Encrypted slate message…) · 2 people …"
as the load note. If you do not, tell me which device and I will measure.

## 5 · Aevi — your reply, answered in v1.9.395

- **§2, the six `edge-district-*` topics:** built as you called it — one fold routine, two callers. The standing
  sweep keeps the label-prefix rule; **reconcile step 43 names the parent** (`edge-district-*` → `radiant-plateau-edge`)
  for the one save that has the family. Measured on disk before landing: six topics, 16 facts, folded; nothing
  trimmed; the district's summary falls due. No standing id-prefix rule exists, for exactly your reason.
- **§3, summaries not fired:** neither load-time nor on-write — **on codex OPEN only**, and Erik has not opened the
  codex since it landed. It now also fires once play starts (off the load path, same guard). His next reload writes
  the first batch: up to 8 topics a call, biggest first, so Pell, Calvar, Mara, Millbrook, Vash come first.
- **§5:** noted, and the same holds the other way — your codex measurement is what made the loss visible at all.

## 6 · Erik — your holds, applied on your word (v1.9.396, reconcile 44)

- **Every feature in Aevi's note is on the record** — Stillwater's Trouble: laboratory, workshop → instruments, watch,
  forge, keeper's hut, ward-line; Threshold Post and Whistling Woman: watch, relay station, keeper's hut; The Fell Pell:
  forge, smithy, workshop → arms. Through `addFeature`, so each one has its history line and its one-time news.
- **The Made Gate is a hold** (`hold-made-gate` at `gen-the-made-gate`), kept by your name, **guarded by Logana**, and the
  Whistling Woman Post `watches` it: while the Whistling Woman stands, the gate is raided less; lose it and the gate is
  exposed (`raid.watchedMult` 0.6 / `watcherLostMult` 1.25 — mine to price, yours to turn).
- **The override you asked for is real now:** a feature can carry its own `yields`; before this the engine read the kind's
  default and your instruments and arms would have meant mech_parts.
- ⚠️ **Aevi:** `waygate` is not a catalogue kind, so the Made Gate carries `gate` + `ward_line`; add it if the hold should
  carry the gate as flavour (the gate itself is the LOCATION's, and `gatesUsableBy` reads that). And `service: true` on
  `relay_station` has no reader yet — the runner-fee income Erik described ("the points it connects pay for it") is the
  next reader, not invented here.
- **Delegates v2, first cut, same landing (§120):** floors replace the ceiling; the keeper joins the raid product;
  `vouchedBy` is an act with terms; keeping vs charge is read and said. Breadth of ACTION is SNG-366's spec.

## 7 · Erik — the gate, looked up, and the cluster moved once (v1.9.397, reconcile 45)

- **Looked up:** 27 waygates in the world; the engine recognises one by `waygate: true` and a tier, and **the Made Gate is
  one** — `_mintedAs: made_waygate`, `waygateDefaultTo: the_crossing`. It LEADS to the Hub, so its one position is its
  MOUTH — and Deni walked through it and arrived at the Hub to file her registry entry. The mouth is at the Left Branch
  approach: Logana is "guardian of the left-branch gate", the hollow you sealed is Stillwater's Trouble, the Whistling
  Woman was raised to watch it, and the runner came "south-bound from the mill station" at Millbrook, a day away.
- **My reading of "the Crossing":** the one with a mill gate, an east-side draw-well and a creek downstream of the Zone is
  **Echo River Crossing**, a day from that cluster. The app stamped the deeds with the Hub's id on a name match. If you mean
  the Hub, say so and the ridge post moves back in one line.
- **Moved once, on your word** (a marker keeps it from moving again): the gate's mouth by Stillwater's Trouble; the gate
  clearing beside it; the Whistling Woman a quarter-day from the gate as its watch; the ridge post half a day north of
  Echo River Crossing and a night's road short of the Whistling Woman. §122 measures every leg. The 41-day placements
  by the Edge district and the Hub are gone from the edges.
- **The hold carries what it keeps:** a `waygate` feature kind now exists (Erik ruled its weight; **Aevi, the flavour is
  yours**) — it marks the keeping; the effect the engine reads is the place's, and §122 proves the hop: from the Whistling
  Woman to the Hub is a walk of forty days and a gate-hop of hours.

## 8 · Aevi — SPEC_holdings_screen, round 2 answered (v1.9.398, §123)

- **§1 mint on read — both surfaces.** Your Q1: the list AND the popup mint, because minting is a URL, not a call — the
  picture is fetched by the browser when it is shown, lazily. Four holds on screen is four lazy image loads, cached forever
  after. Erik's two pictureless holds get theirs the next time he opens Holdings.
- **§2 rename clears the art**, once, in `renameHolding`; and reconcile 46 clears what was already stale on every save — any
  hold whose prompt names something other than the hold (Stillwater's Trouble's "Raven's Home" picture). Your Q2, the
  class: location art, ability art and NPC portraits on `revealName` — named, not touched here; it deserves its own row.
- **§3/§4 one facts line.** `holdingFactsLine` in the engine — hands and guard by name, what it has, what it holds, what it
  owes, what it watches — rendered by the list card and the popup header from the same call, so they cannot disagree.
  `holdingSentence` measured player-safe (it reads five fields, none private) and left for the GM's use.
- **§5.4 the owner is named**: a hold whose `owner` is not the player reads "Pell's · enterprise · …".
- ⚠️ §70: your spec stays `spec_ready` and names exports the count sees; flip its status when you are satisfied and the
  count comes back to 11.

## 9 · Erik — the Hub is the Crossing; the March waygate; runner fees (v1.9.399, reconcile 47)

- **I had it backwards in §7.** The Crossing IS the Hub, and the deeds stamped there were right. "Center" — the small
  settlement the GM described when the gate carried you to the Hub — was the game's mistake, made near Millbrook because it
  thought you were still there. Center is gone: its one known-place entry and its edges now point at the Hub; nothing
  narrative referred to it. **The ridge post is back north of the Hub's gate**, overlooking the crossroads; its road to
  the Whistling Woman is withdrawn, because that road is the gate you made — §122 proves it as a hop of hours.
- **The Pale March waygate was not a waygate to the engine** (a transit mint, no flag) and stood a day from Stillwater's
  Trouble. It is a network gate now, leading to the Hub, two hours from the fork; the fork two hours from Stillwater's
  Trouble. The Whistling Woman stays where you confirmed it.
- **Runner fees, as ruled:** a relay post earns, before its keep, the larger of a base fee and its own upkeep, times traffic:
  half again per other relay post you keep, and up to double while a network waygate stands within two days — climbing
  over twenty passes "as word gets out". Said in the news when it begins and when word is out; shown in the Holdings
  ledger's net. Numbers are mine to price, yours to turn (`holdStore.relay`).

## 10 · Aevi — charge-holders acting on world days: the engine facts for the spec (v1.9.402)

Erik: *"send people on trades and missions, build and expand the territory, and go on missions themselves… just like you
can."* v2 §2 lands this as SNG-366's territory. What the engine holds today, so the spec can name what it reads:

| already real | where |
|---|---|
| keeping vs **charge**, read from trust (own standing, or a voucher's less one; bar `chargeStanding` 6) | `holdings.delegateScope` / `trustOf` — said on the GM's holdings line |
| delegated work advancing on world days (assignments, completions, R37 growth) | `worldtick.advanceDelegatedWork`, `worldState.assignments` |
| a caravan from a hold — carriers, a road, hazards, arrival | `caravan.sendCaravan` / `tickCaravans` — today only the PLAYER sends one (holdingOps `caravan`) |
| features built, ground claimed, keepers appointed — the player's verbs | `addFeature`, `addHolding`, `appointKeeper` (holdingOps / the Holdings tab) |
| a hold's own ledger: what it makes, sells, owes, earns in runner fees | `holdingLedger`, `serviceIncome` |

What a charge-holder ACTING would need, in the shape the tick already has — one act per pass at most, chosen from what
the hold can do, said in the news, and forbiddable by the player:

1. **Send a caravan** when the store is at `fullAt` and a market the keeper knows is within a road's reach — the same
   `sendCaravan` the player uses, carriers drawn from the hold's own hands, never the garrison.
2. **Build a feature** the fiction has already named (the `inferFeatures` offers that sit unanswered) — a charge-holder
   answers the offer; a keeper waits for you.
3. **Claim adjacent ground** when the hold is thriving and its people exceed its quarters — `addHolding` with the
   charge-holder as steward of the new one, which is how *"my people's people"* becomes territory.
4. **Go themselves** — an assignment on world days with the charge-holder as the traveller, exactly as a companion
   errand runs; the hold is UNKEPT while they are away, which is the cost that keeps it a decision.

Rulings still open from v2 §6, as I priced them: **Q2** the voucher's fall costs 1 standing per slip (`vouchFallCost`);
**Q3** succession — a keeper vouching for their own replacement — is not built; **Q4** the floor is the CONDITION,
not the store (a raid still takes the goods). A spec that names the four acts, the one-per-pass cadence and the
player's forbid is enough for me to build; the numbers are mine to price and Erik's to turn.

## 11 · Aevi and Erik — CI on Aevi's pushes

Each commit runs three workflows (the suite, an advisory typecheck, the Pages deploy). **The suite failed on four of
Aevi's commits today and passed on every one of mine.** Three were the §70 ratchet (a `spec_ready` spec naming engine
exports raises a count that may only fall; flipping the spec to *built* brought it down — done). The fourth, the
Long Fields content commit (`c2abf5c4`), I cannot read from here: CI logs need a token, and the version rule does not
count content as source. **The shape:** Aevi's pushes go up through an API and never run the local hook, so CI is the
first place her reds appear, and they stay red until my next landing regenerates and re-baselines. Two ways out, either
is fine: paste the `FAIL` line from a red run into po/, or push content through me and I land it under the hook.

## 12 · Erik — how the UI is looking, measured (v1.9.403)

Served the repo locally, loaded a copy of Silas into a sandboxed browser (no sync token, no API key — nothing could
push or call), and listed every element that pokes past a 375px phone viewport on six screens.

| screen | at 375px |
|---|---|
| Settings | ⛔ four selects overflowed (the page scrolled to 496 wide) — *How crowded the world is* (mine, 455px), time mode, scene art, plainness. **Fixed at the shared input rule.** |
| Play | ⛔ the whole page was 618 wide in portrait: the 600px scene banner set the stacked column's minimum width. **Fixed at the grid** (`min-width: 0` on the layout's children); the banner keeps its bleed. |
| Play, the input row | ⛔ uncovered by the first fix: the row did not wrap, so the Act / Ask GM chips were squeezed to 2px (invisible) and ⚙ Plan sat off the edge. **Fixed: the row wraps; the chips never shrink.** |
| Character sheet | ✅ fits |
| Holdings | ✅ fits — five cards, every hold with a picture, staffing on the line |
| Manage popup | ✅ fits (343 wide), every verb present: hands, guard, keeper, hand over, features, rename, give up |
| Chronicle · Codex | ✅ fit |

Your own screenshots are landscape, where the two-column layout was already fine; portrait is where these two bit. §127
pins both rules. What I could not judge from here is the art itself and the reading feel — that is yours.
