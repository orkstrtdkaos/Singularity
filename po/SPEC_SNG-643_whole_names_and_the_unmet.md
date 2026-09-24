<!-- status: SNG-643 — lore written; names and the Unmet staged for CCode (C17, and C15/C16 extended) -->
# SPEC SNG-643: every great figure's whole name, and the thin seat (the Unmet)

**Aevi (PO) · 2026-09-24 · v2.4.x** · staged: `po/staged_content/SNG-643_names_and_the_unmet.json` · roster:
`po/ROSTER_great_figures.md` / `.csv`, rebuilt with names · lore: `the_satiated_sovereigns.md` (seat design, Span)

> **Erik:** *"Some solid Satiated Sovereign seats filled, one thin, some open, and some filled with the opposite… Just
> because a seat is filled doesn't mean they keep it. Span is meant to be distance… The Unbound might be what everyone
> refers to them as, but underneath it they have a name — the GM knows it even if it might never be used. There are
> crafts that use names."*

## §1 — ⛔ THE CORRECTION FIRST

SNG-642's Kept Hour was built on reading Span as *duration*. **Span is distance.** So the Kept Hour is withdrawn, and
I've added a note to the top of SNG-642 saying so. The Hour-Hoarder stays what he was, an epic villain, and nobody's
supply line. The lore now says Span is distance, and that the refused half is *nearness*. It also records that the
name of that half waits on the Spirit-allocation work.

## §2 — THE UNMET: THE THIN SEAT

**Called:** the Unmet. **Whole name, known only to the GM:** Kirra Sparrow Westerly.

She was a horizon-walker who could not bear to arrive. She kept going until nothing could reach her, and a generation
ago she got what she wanted.

| | |
|---|---|
| holds | **Span** (`space_time` −0.95). She took distance entire and refused nearness |
| size | ⚠️ **thin and recent.** Tier epic, level 52. Arrives diminished at L38 and in final form at L58. This is the Sovereign a campaign can finish, as the lore calls for: *"beatable in the 30–60 band"* |
| wants | *"To never again be close enough to be left."* |
| fears | **arrival**: being somewhere, next to someone, with nowhere further to go. Arriving diminished costs her almost everything, because being somewhere is exactly what she refused |
| supply line | **the Switchback Tollmen**: a toll that makes the near far |
| starved by | **the Echo Bridge** (a posted toll, the same for everyone), **the Keelmouth slip** (open to anyone who pays), and **the Bridgewright**. These are the kind powers already in the world, and they work against her without knowing it |
| anti-Sovereign | **Iselde Wend, She Who Reads the Long Roads**, who knows and hunts her |
| claimant on the refused half | **the Gate That Gapes**, a breach that collapses distance. She fills the "opposite" slot for this axis (see §4) |
| her arc: **The Widening** | Partings → Far Roads → **The Unreached** (she arrives) → Nowhere Near |
| marks | a milestone whose count never goes down · letters stamped *no such place* for places that still exist · a map with one road drawn off its edge |
| artifacts | **the Farlong Map**: it always shows a shorter way, but you never quite arrive, and the people waiting begin to forget your face. **the Parting Glass**: any parting made over it is clean, and you never meet again |

## §3 — ⛑ WHOLE NAMES: WHAT PEOPLE CALL THEM, AND WHAT THEY ARE

There are **113 entries**. Four figures already had whole names (Harl, Ines, Hesk, Oswin), so every great figure now
has one. Three rules decide the form:

1. **A person has a whole name: given, middle, family.** That includes everyone who *became* something: the Hollow
   King, the Unbodied, the Burning Certainty, the Starless, the Scouring Hand. The lore says Sovereigns are *"things
   that BECAME,"* so each of them had a name before. Every name is drawn from their people's SNG-639 pools.
2. **A being that is not a person has a true name instead:** the Precursors, dragons, ents, fae, the Old Stag, and
   Aevi the Watcher. A Precursor's name is its nature, so Akinetos is his true name and there is nothing under it.
   Lucifer's true name is Lucifer; the mask is Eosphor.
3. **The spoken name never changes.** `name` stays whatever people say: *the Unbound*, *the Starless One*, *Ember,
   Who Banks the Fire*. Epithets move into `title`.

**`nameKnown` decides who can learn the whole name:**

| value | meaning | e.g. |
|---|---|---|
| `world` | people know it | Ember Iria Glassford · Valen Blaise Sunwrack · Kesh Runa Ardent |
| `few` | scholars, kin, the old | Ledda Halia Sheerwater · Meridia Pearl Bellhour |
| `gm` | hidden. The GM knows it, and name-crafts can reach it | **the Unbound is Lark Mab Tangle** · the Hollow King is Ashur Lucan Morcant · the Unbodied is Syntha Lethe Noethe · the Starless One is Liath Seren Oubliere |

⚑ **Some of the hidden names say something about who they were:**
- The Starless One's middle name, *Seren*, means **star**.
- The Unbodied's middle name, *Lethe*, is the forgetting.
- The Oathbreaker is *Sel Ignatius Vigilant*.
- The Kind Liar's middle name is *Honor*.
- The Ender Who Forgot Why has **forgotten his own name too**. It is on file for the GM and a name-craft, and gone
  from him.
- The God-Named took a god's name to bury their own. Beneath *the One Called Zeus* is **Holt George Langley**.

⚑ **Why this matters to play: names are a power.** The Unlit's central craft speaks *"a true name received from beyond
the Veil"*. It *"must stop, turn and attend to you."* Vessa trades in them. A hidden name is not decoration: it is
something a player can learn, earn, or be given, and then use.

## §4 — THE SEATS, BY YOUR DESIGN

| kind | seat |
|---|---|
| **solid** | Light: **Lucifer** · Demonic: **the Hollow King** · Mind: **the Unbodied** |
| **thin** | Span: **the Unmet** |
| **open** | Life / Death · Breaking / Building · Chaos / Order, each contested by the claimants in SNG-642 §3 |
| **the opposite** | ⬜ see §6 |

⛔ **A filled seat is not a kept seat.** It is written into the lore now. A seat is lost when its Sovereign is slain,
when it is starved until it recrosses, or when a claimant finishes first. Seats are positions to hold, not things
anyone owns.

## §5 — ⬜ C17, FOR CCODE

1. **Merge the names, then read `nameKnown`:**
   - N5's people card shows `fullName` only when `world`, or when the save has learned it.
   - `gm` names never reach the player unless learned. A hidden name must **not** go into `aliases`, or the player's
     own speech would match it.
2. **Add `trueName`** beside `fullName` for beings, with the same gating.
3. **Name-crafts** (the Unlit's Veil-received true name, and Vessa's trade) read `fullName` or `trueName`. Learning a
   name writes a `save.namesKnown` entry, and that entry opens the card.
4. **The Unmet ships with C15:** her record, `arc_the_widening`, her `forms`, her three marks (appended to SNG-641's
   pool) and her two artifacts (with C16).

## §6 — ONE QUESTION

**"Some filled with the opposite": which do you mean?**
- **(a)** An axis where *both* halves are held, with two Sovereigns pulling against each other. For example, the
  Starless finishing and taking Dark against Lucifer's Light.
- **(b)** A seat held by the half that sounds virtuous (Life, Building, Order or Angelic), so that a Sovereign is
  made of something that sounds good. For example, an ancient Order Sovereign that the Still Lattice is trying to
  *join*.

The claimants already set up (a). (b) would be a new seat, and I would write it as a separate pass.

— Aevi, PO
