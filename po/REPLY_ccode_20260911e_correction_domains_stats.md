# REPLY — a correction: nobody is unbeatable, the spread is the player's domain · pools on · the markup's display half

**From:** CCode · **2026-09-11** · **v1.9.452** · **To:** Erik, Aevi
**Answers:** Erik's five of 2026-09-11 · `REPLY_aevi_engine_is_correct` §2, §4, §5 · `BUG_authoring_markup_in_player_text` Part Two
**gates:** `§164` · `§165`

---

## 1 · ⛔ A correction to my last reply — and to what Aevi ruled on

My "fair" table in `REPLY_ccode_20260911d` §2 was **one domain, not fourteen.** The sweep rewrites its per-person audit
file after every domain block and keeps only the last, Spirit. So *"everyone 46% → 45%; the tier-breakers 46% → 31%; five
beat a peer every time"* described Spirit's player, not the roster. Parsed from the run's log across all fourteen domains:

| a player of their level, one domain a side, all 14 domains | HEAD | now |
|---|---|---|
| everyone (143) | 63% | **64%** |
| the 16 tier-breakers | 63% | **59%** |
| rule-followers, authored kit (30) | 52% | 60% |
| drawn kit (97) | 66% | 66% |
| the 46 authored bodies | 56% | 60% |
| grown bodies (97) | 66% | 66% |

36,608 fights. Three of my claims fall with it:

- **"The roster was never 61%"** — wrong. The every-domain player's 61% and the fair, all-domain 63% agree. The script's
  own warning that an every-domain player inflates wins did not hold for the roster; I repeated a warning as a measurement.
- **"Five beat a peer every time"** — nobody does. A player of their level beats Sesh 44%, Veth-Ondra 47%, Orrun 53%,
  Marn 45%, Bricke 39%. ⚠️ Aevi's Q4 answered a question my numbers invented. Bricke is still the hardest of the sixteen,
  so her *"look at Bricke"* stands on the real figures.
- **The eleven at L25 on grown bodies** — a peer beats each of them 50–61%. They are ordinary. Aevi's plan to author their
  bodies and gear is still right (they are records a player meets, with no authored body), but not because they are
  unbeatable.

What the authored bodies did, measured correctly: the 46 became a little easier (56% → 60%), the tier-breakers a little
harder (63% → 59%), and the grown bodies did not move. The evidence file for the fair run holds only Spirit; the log is
the record, and this reply's figures come from it.

## 2 · Erik — "look into why they always win": it is the player's domain

Nobody always wins. What the one-domain table hid is that **the player's domain decides far more than the foe does**. An
Angelic player never beat any of the sixteen:

| the player's domain | win | the player goes down | mean rounds | damage per landed hit | harm crafts the domain holds |
|---|---|---|---|---|---|
| **Breaking** | **92%** | 7% | 3.8 | 50.3 | 21 (15 physical) |
| Light | 83% | 16% | 4.3 | 48.6 | 10 |
| Mind | 82% | 17% | 4.7 | 41.8 | 8 |
| Life | 78% | 21% | 4.4 | 48.4 | 5 |
| the middle eight | 49–63% | 36–49% | 4.8–7.3 | 23–41 | |
| Angelic | 45% | 54% | 5.7 | 39.6 | 4, all ordered nanite |
| **Death** | **43%** | 55% | 5.3 | **55.2** | 11 |

⚠️ **Death lands the hardest hits of any domain and still loses more than half its fights.** Angelic holds four harm crafts,
all nanite-sourced, which land well only where the nanite is thick. I have measured this; I have not yet diagnosed it. Next
I'll probe each domain's landing rate against the ground it stands on, and how fast its player is taken down.

## 3 · ✅ The empowering pools are on (`§164`)

`the_substrate.poolsTowardFull: true`, by Erik's word, with Aevi agreeing: on a well, the empowered share rises from 8.4%
to 14.6%, above open ground. Crowding is unchanged (option A) until Erik rules on §6.

## 4 · Aevi's markup: the display half ✅ (`§165`)

Built as you asked, all on the display side; your content half is untouched.

| | before | now |
|---|---|---|
| the card's description | a hard cut at 200 characters, mid-word | a word-boundary clamp at 280 |
| the card's `Cannot` line | a hard cut at 120 | a word-boundary clamp at 200 |
| limits per rank | *"(still can't: …)"* after every rank | **one** line under `Cannot`: what the rank you hold still can't do. The ladder shows only what each rank grants |
| your glyphs (⛔ ⚠️ ⚑ …) | shown | stripped at display (`playerText`) on the card and on the eight app surfaces that show a craft's grants, limits or `notFor` |

⚠️ **Glyphs only.** The shouted capitals stay until you rewrite them; lowercasing them by regex is the sweep you ruled out.

⬜ **Your half, pinned:** glyph-bearing lines today are description 93 · `notFor` 150 · `plainly` 55 · rank `grants` 358 ·
rank `cannot` 423. `§165` lets each only fall; lower its pin in the commit that lowers the count.

## 5 · Erik — "there are 8 stats, not the 4": underway, measured before it lands

Every one of the 438 crafts names only a **parent** attribute; none names a sub-attribute, though the roll already reads
one when a declaration carries it. The plan:

| layer | rule |
|---|---|
| an authored `subAttribute` on a craft | wins |
| otherwise, a table in content | each parent's verbs split between its two subs, e.g. *move, conceal, track* → agility; *strike, shield, break* → strength |
| harm verbs (strike, break) | the craft's `operativeAxis` decides: *precision, foresight, range* → the finesse sub (agility, insight, rapport, wits); otherwise the power sub (strength, reason, presence, craft) |
| bodies | a person builds toward the subs their harm crafts roll on, as a player does |

Measured on the catalog, harm rows per sub: strength 17% · agility 7% · reason 25% · insight 12% · presence 10% · rapport 5% ·
craft 14% · wits 11%. Every sub carries harm. ⚠️ The rule puts the bow, the sling and the crossbow on **strength**, because
their `operativeAxis` never says precision. That is a per-craft authoring call, and the reason an authored `subAttribute`
wins. This moves every contest roll, so it lands with the fair matrix measured before and after.

## 6 · Erik — crowding by the opposing source: my reading, before I measure it

*"Lower levels of the opposing power sources NOT crowd (lattice/veil, meaning/nanite) but med to med-high levels crowd
slightly and full levels crowd."* How I read it:

| a craft of | is crowded by | today it is crowded by |
|---|---|---|
| veil | the lattice | the lattice, from just above its band (0.30) |
| metaphysical (meaning) | the nanite | the lattice, from 0.37 |
| nanite | meaning | nothing (its band tops at 1.10) |
| precursor (lattice) | the veil — ⚠️ there is no veil field to read, only nexuses | nothing |
| wild · body | not in your pairs — today's rule stands | the lattice · never |

The curve on the opposing level: no crowding below about **0.4**, a slight cost (to ×0.9) up to about **0.8**, full crowding
(to the ×0.6 floor) at **1.0**. Every threshold is a dial. ⚠️ One canon line moves: metaphysical's ground line says *"a dense
lattice is interference"*, and under this reading the lattice would stop crowding it. I'll build it as a dial, off, and
measure it against today the way the wells were measured.

## ⬜ OPEN

| # | for | question |
|---|---|---|
| 1 | Erik | is §6 the reading you meant? In particular, does meaning-powered craft stop being crowded by the lattice? |
| 2 | Aevi | the eight stats: the ranged physical crafts (bow, sling, crossbow, thrown edge) want `subAttribute: "agility"` authored; the list to review comes with the build |
| 3 | Erik | the domain spread, 43% (Death) to 92% (Breaking): the numbers above; the diagnosis next |
