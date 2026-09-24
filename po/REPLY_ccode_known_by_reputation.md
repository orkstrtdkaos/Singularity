# CCode → Erik, Aevi — known by reputation (CCODE-483, v2.5.2, shipped)

Erik, your ruling:

> we need a way to "know" these kind of power figures by reputation. That way you can learn about them
> as you play without ever meeting them. Your codex will list the powers of the region you start in or
> are from, as well as some of the bigger powers in the world.

Built and shipped. What follows is what it does, then the four things I measured wrong on the way,
then two content gaps that are Aevi's.

---

## 1 · What a character now knows

Every character has heard of two sets of powers, and the codex keeps them apart:

- **the ones of their own country** — the region they started in, and the region their people is from;
- **the ones whose names travel** — and this is decided by three facts Aevi already writes down, never
  by a number I picked: a power belongs to a `bloc`, or its `strength.scale` is `legion`, or its reach
  crosses more than one region. Seven of the eleven authored powers qualify.

On the sixteen saves on this device that comes to **seven or eight powers each**. Silas knows the four
that hold the valley he has lived in, plus the Gralloch Crown, the Undercount and the Ender's Host —
names that travel.

Each one becomes a codex entry marked **"by reputation"**, carrying the power's own `plainly` line and
nothing else. That marker drops away the moment play adds anything of its own, because then you no
longer merely know *of* them.

**It knows of the power, not of its leader.** Nothing is added to your known-people: knowing of the
Gralloch Crown is not knowing Harl Osric Maddock. The GM's prompt is told explicitly when this
character has never heard of a power whose ground they are standing on, so it cannot hand over a name
the fiction has not given.

Two more things follow from it:

- **being noticed teaches you of them.** A crown that has taken an interest in you is one you have
  heard of, whatever you knew an hour before.
- **the world only reports powers you know of.** "It is stronger than it was" was a line about a
  stranger; eleven strangers reporting their business every pass is how a player learns to stop
  reading the world news.

Both doors are wired: a character being born, and everybody who already exists (reconcile step 79,
`what-you-have-heard-of`).

---

## 2 · Four things I measured wrong before it shipped

Recorded here because each one looked like success.

**Seven heard of, one listed.** I seeded through `applyCodexUpdates`, the door that admits the GM's
output. Its policy is a *filter* — an id-prefix fold, a beat fold, and a hard stop at sixty topics.
Driven on Silas's real save, which stood at 59 of 60, the first power was admitted and the other six
fell through the full-codex fallback onto an unrelated lore topic. The log said "heard of 7 power(s)"
and the codex gained one. Nothing threw. The cap is right for a model's suggestions and wrong for the
world's own furniture, so these are minted as reference entries, outside it.

**A writer no reader could consume.** My mint pushed `{ text, day }` objects. A fact in this codex is a
*string* — `searchCodex` calls `.toLowerCase()` on it, `codexForGM` joins them into the prompt, the
merge path slices past a bracket. Seven topics written, zero readable. I had driven it with a script
that printed `facts[0].text` back, so the measurement agreed with itself.

**"Or are from" was a dead branch.** I read `startingLocation || currentLocationId`. **No save has ever
recorded a `startingLocation`** — nothing in the app had written one — so that half was dead on
arrival, and the fallback served the region they are *standing* in. For ten of the sixteen saves that
is not the country their people comes from. Silas is of the Making and stands in the valley. It now
reads the origin's authored `homeRegion`, which all 27 origins declare, and a new character records
where it began.

**And reading the ruling strictly made it worse first.** No authored power reaches the Making, so "of
the Making" alone handed Silas *nothing* of the four powers whose ground he has walked on all game.
Where a character has been standing is evidence about what they have heard — so it is added when
nothing recorded where they began, and never consulted when something did.

§355 gates all of it, eleven assertions. Three of my own gates asked the wrong question and this change
exposed them: §322 counted every note a whole reconcile wrote for a sentence about the purse's two
lines, and §353 twice counted news rows for a rule about the mechanism.

---

## 3 · Two things for Aevi

**a · 8 of 38 regions have a power that holds them.** The eleven authored powers reach into eight
regions. Thirty have nobody holding ground — including six that characters on this device are *from*:

| region | who is of it |
|---|---|
| `somatic_reaches` / `the_cogitarium` | Saehara Makashi |
| `the_quickwood` | Aelyn Kantoro, Chernak |
| `the_numinous_reach` | Splarf |
| `radiant_wastes` | Aeraqor |
| `the_making` | Silas |
| `the_gearlands` | Loki |

Four of the sixteen saves therefore hear of **nothing in their own country** and know only the seven
whose names travel. That is not an engine gap — the readers all work — it is thirty regions with no
authored power yet. The valley, the Echo Vale and the Riven Marches are covered well.

**b · two saves carry origin ids the content no longer has** — `valley` and `radiant`, where the
content now says `valleyfolk` and `radiant_plateau`. Their people's homeland cannot be looked up, so
they fall back to where they stand. The mapping is obvious to me and it is still a content call, not
mine to guess silently: say the word and I will add a reconcile step that renames them.

**One thing to know, not a request:** a power's `plainly` line is now prose a player reads verbatim in
their codex. `generate.js`'s PLAYER REGISTER already listed `plainly` as a player-facing field, so this
is the existing contract rather than a new one — but it is worth knowing which sentence is on show.

---

v2.5.2. Ratchet green, 31 suites; §107 remains the one baseline red and is on my list as a dial.

Next in the SNG-634 queue: **C8** — a leader's death opening the seat, through the existing
`faction_leaderless` mint, with a player who holds the seat keeping it. Aevi's SNG-640 ties the
Sovereigns to the powers and I want to read it alongside C8 rather than before it.
