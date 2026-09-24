<!-- status: SNG-642 — lore ruled and written; arcs, forms fix and artifacts staged for CCode (C15, C16); seats await Erik (§3) -->
# SPEC SNG-642: every Sovereign gets an arc named for what it does; the seats and their claimants; artifacts that feed

**Aevi (PO) · 2026-09-24 · v2.4.x** · staged: `po/staged_content/SNG-642_hunger_arcs.json` and `SNG-642_artifacts.json`
· ruled and written: `content/packs/valley/lore/the_satiated_sovereigns.md`

## §0 — RULED BY ERIK, 2026-09-24 08:31, AND WRITTEN INTO THE LORE

- ✅ **Eosphor, the Dawn Seraph**, is Lucifer's mask.
- ✅ **Every Seraph bleeds gold.** Lucifer bleeds light.
- ✅ **The supply-line rule** (SNG-641 §6) is ruled as written.
- ✅ **Lucifer is a Precursor being.** He was a true Seraph. The Seraphs of the world are humans made radiant by ordered
  nanite, patterned on what he was. He made the first light. He became addicted to the distinction it cast and fell
  toward the Void to keep having it.

⚠️ **This meant amending one line of written canon, and I have left the original standing.** The lore said the
Sovereigns are *"not the Precursors' equivalents in origin… their opposite in kind."* It now continues: *"With one
exception, and he is the eldest."*

[A] I think this makes the lore stronger, not weaker. The Precursors are what accepted limit, and the Sovereigns are
what refused it. A Precursor who refused limit shows that the difference is a choice, not a nature. That is what
Kenosis argued, and Lucifer is the counterexample on the other side. Your first-light ruling also connects to two
things already in canon:
- Your Umbral ruling, *"shadow came when light came to the Void"*, means he made the first shadow too.
- That is why the Starless hates him: every shadow is his, and his light is why the Void is not total.

## §1 — ⛑ YOUR ARC IDEA SOLVED A BUG I WAS ABOUT TO BRING YOU

> **Erik:** *"showing the arcs not as numbered stages only… if the Hollow King is fully Satiated the stage describes
> Full Bargains… people might know that bargains are being made… without naming the Hollow King yet."*

**The bug.** R41 keys each arrival to an arc's stage, and R40b.2 derives a Sovereign's supply state from that stage.
But the arcs are not set up for that:
- **Lucifer has no arc.** His `forms.arcId` is null on purpose. His own note says *"the day an arc is authored for the
  Light seat, this one field makes him arrive."* So SNG-641's C13, where starving a supply line counts as a deed
  against the arc, **does nothing for Lucifer**, because there is no arc for the deed to act on.
- **The Hollow King and the Unbodied share `arc_the_poles_pull`.** Once their forms are read, both arrive at the same
  stage 3, on the same day.
- ⛔ **The Hollow King's forms are never read.** His record stores them as a list; `sovereign.js` expects an object
  with `diminished` and `final`.
- **The Unbodied has no forms at all**, so it can never arrive.

**The fix is your idea. Each Sovereign gets its own arc, and the arc's stage names are the readings.**

| arc | 1 | 2 | 3 (arrives diminished) | 4 (final form) |
|---|---|---|---|---|
| **The Long Petition** | Favours | Bargains | Hard Bargains | **Full Bargains** |
| **The Glare** | Exposure | Glare | Scouring Light | No Shade |
| **The Long Sleep** | Drowsing | The Long Sleep | Wearing | Empty Houses |

Each stage has three layers, and each layer unlocks separately:

| layer | who sees it | e.g., The Long Petition at stage 2 |
|---|---|---|
| `publicFace` | everyone | *"People are trading things they cannot get back for things they want now — a name, a harvest, a year."* |
| `onceLineKnown` | after three marks confirm a line (SNG-641 §2) | *"{power} is where the bargains are struck."* |
| `onceNamed` | only when the save knows the Sovereign's name | *"Every bargain is a grant from the Hollow Court, and the grant is the hunger."* |

⚑ **The arcs still follow R40a.** Each describes the drift and names its own causes: scarcity, ambition, the Mavens
refusing claims. The Sovereign benefits from the drift; it does not cause it. Each arc connects to
`arc_the_poles_pull`. Each has its own clock, so the arrivals come at different times, and each names its
anti-Sovereign or counterweight as a hinge figure.

⚑ **Every arc can show a word, not a number.** Every stage in `greater_arcs.json` already has a `name` and a
`publicFace`, and `arceffects.js` already passes `stageName` along. **C15 asks CCode to make sure no stage number ever
reaches the player.**

## §2 — ⬜ C15, FOR CCODE

1. Add the three arcs from `SNG-642_hunger_arcs.json` to `greater_arcs.json`.
2. Apply `formsFix` **at the same time**:
   - the Hollow King's list becomes the object shape;
   - the Unbodied gets R41's forms (it must take a body to arrive, and that body is its diminishment);
   - each `forms.arcId` points at its own arc, and Lucifer's does what his note asked for.
3. **Unlock the reading layers:** `onceLineKnown` from SNG-641's confirmation, with `{power}` filled in;
   `onceNamed` from a `save.knownSovereigns` entry. That entry is set only when an anti-Sovereign tells you (R41c)
   or the Sovereign arrives.
4. **Mask reader.** While the save does not know Lucifer, any line that would name him names Eosphor instead.
5. ⛔ Neither `sovereignGM` nor `onceNamed` reaches the player before their unlock.

## §3 — THE SEVEN SEATS: FILLED, OPEN, AND WHO IS CLOSEST TO EACH

> **Erik:** *"Yes 7 seats. We need to determine who fills the rest if any."*

The corpus has already been growing claimants. CCode measured four of them on 09-08, and there are more now:

| axis | holds it | reaching for it |
|---|---|---|
| Light / Dark | **Lucifer** (Light) | Valen Sunwrack (Light, his supply line) · ⚑ **the Starless takes the refused half** (Dark −0.98) |
| Mind / Body | **the Unbodied** (Mind) | Halvex Coil (Mind +0.9) · ⚑ **the Appetite takes the refused half** (Body −1.0) |
| Angelic / Demonic | **the Hollow King** (Demonic) | ⚑ **the Burning Certainty takes the refused half** (Angelic +0.9). The lore says *"pride is the Angelic axis"* |
| **Life / Death** | ⬜ open | **two claimants on opposite halves:** Thornmother (Life +0.9) and Morvane of the Harvest Hand (Death −0.9) |
| **Breaking / Building** | ⬜ open | **two claimants:** the Scouring Hand (Breaking −0.9; the lore's own promotion example) and Cinder Vael (Building +0.9) |
| **Chaos / Order** | ⬜ open | the Still Lattice (Order +0.95), with Harrow behind it. Order is Akinetos's own axis carried into refusal, so it is Lucifer's story again in the other direction |
| **Span / Spirit** | ⬜ open | the Hour-Hoarder (*"to keep one perfect hour forever"*) · the Gate That Gapes (Space −0.9) |

**[A] My recommendation: fill one now, and let play fill the other three.**

1. **Span / Spirit → author "the Kept Hour" now, as the thin and recent Sovereign the lore asks for.** The lore says
   *"a RECENT one… is THIN… beatable in the 30–60 band."* This one reached satiation a generation ago by holding a
   single moment open and refusing to let it end. The pieces are already authored: the Hour-Hoarder is its supply
   line, and the Clockmother is its counterweight, rivals already. **It would be the only Sovereign a player could
   realistically finish in a normal campaign.**
2. **Life / Death and Breaking / Building stay open, and each is contested between two claimants.** Whichever one
   finishes first takes the seat; the lore's *"a villain you fail to stop is a promotion."* The other one then becomes
   its counterweight or its first victim. **The seat count changes from save to save**, which is exactly the
   untidiness the lore asks for.
3. **Chaos / Order stays open with one claimant.** The Still Lattice has no rival for the seat, so it is the most
   likely to succeed.
4. **Claimants on the held axes take the refused half.** If one finishes, that axis has two Sovereigns who cannot both
   exist, and they fight. That is the lore's *"one axis with two claimants"*, and it is how an eighth Sovereign could
   arise.

With the Kept Hour, that is **four seats filled and three open**, the number you had in mind at the start.

⚠️ **Span / Spirit has no vector.** The lore's seven axis names do not map cleanly onto the twelve vectors in
`spectrums.json`. The other six have close matches; Span / Spirit does not. The horizon tradition reads Span as
*distance* (thin-step, waygate); my 09-08 plan read it as *duration*. The Kept Hour fits the duration reading.

## §4 — ARTIFACTS THAT WORK, AND FEED

> **Erik:** *"If a PC finds one (or NPC) they can use it… but it would likely be helping feed the sovereign."*

There are nine artifacts, three for each Sovereign. They use the live item schema (`kind`, `bonusTags`, `worth`,
`goods`), so the part a player uses is already readable. **Each artifact is also one of SNG-641's marks.** A player
who has learned the lidless ring will recognise the Lidless Ring.

| artifact | what it does | what it costs | where it is |
|---|---|---|---|
| **the Lidless Ring** | nothing within arm's reach can be hidden from you | you can't hide either, and it doesn't want to come off | the Coliseum champion's prize |
| **the Open Lantern** | shows concealed doors, veiled craft, what the Umbral keep | can't be dimmed; you are seen from very far away | Valen's zealots at the Blaze |
| **the Herald's Brand** | whatever it brands is believed | nothing branded can be private again | the accountability board |
| **the Hollow Coin** | any petition paid with it gets a yes | a notch on your door for every yes, and the coin always comes back, so you can ask again | Harl Maddock's treasury |
| **the Seam Contract** | both parties keep whatever they write on it, absolutely | the blank line below the signatures is filled in later, by someone who wasn't there | Oswin Tarrant's strongbox |
| **the Seal of Leave** | a sealed claim reads as granted and beyond argument | legitimacy by grant, not credibility; the Mavens can tell, and an empty chair appears at your table | the Bright Bargain's envoy |
| **the Ninefold Chit** | your mind works while you sleep, and you wake with the answer | each use you sleep longer and wake further away | the Cogitarium |
| **the Choirmaster's Fork** | hear what any humming sleeper is near | each sleeper you listen through sleeps deeper | the Thinning |
| **the Cold Seal** | whatever it seals is kept exactly as it was, even a living body | nobody sealed has ever been let out by the person who sealed them | the Undercount's Dusklow fence |

⚑ **Every use is a deed toward the Sovereign's arc**, whether a PC or an NPC uses it. R40b.4 says agents push as
ordinary figures, and this is the same mechanism. Nothing marks the user as an agent. **Using an artifact makes you
part of the supply line without knowing it**, which is the lore's *"individually reasonable, cumulatively
impossible"*, with the player's own hand on it. Destroying one, or handing it to an anti-Sovereign, is a deed against
the arc.

## §5 — ⬜ C16, FOR CCODE

- A reader for `feeds`: each use enters an `arcContests` push on `feeds.arcId`, credited to the user.
- `whatItDoes` and `whatItCosts` reach the GM. The cost is **enforced**, not just described: the Ring blocks stealth
  and the Lantern cannot be dimmed.
- `markId` means holding the item counts as seeing that mark.
- Placement follows `_foundAt`. Items are staged, not merged.

## §6 — ONE RULING I NEED

**Should Span / Spirit be filled now with the Kept Hour** (a thin, recent Sovereign; the Hour-Hoarder as its supply
line and the Clockmother as its counterweight), leaving the other three seats for claimants to win in play? If yes,
I will write it next as a single seat, in a pass of its own, as the lore requires.

— Aevi, PO
