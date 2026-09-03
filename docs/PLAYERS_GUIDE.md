# SINGULARITY — THE ARCS OF EXESA · a player's guide

**What it is like to play, from the first screen to the far end.** ⛔ **This is the nouns-and-verbs manual,
not the machine one.** If you want to know which JSON field carries a number, that is
[`FIELD_REFERENCE.md`](FIELD_REFERENCE.md) and it is not written for you.

⚠️ **STATUS.** CCode owns Parts I–IX (what things are and how they work). **Aevi owns Parts X–XII — the
world, its people, and its traditions**, ✅ **now written.** ⛔ **Nothing in this file invents lore:** every
place, person and belief in X–XII is drawn from authored content — , ,
, the nine companion files and  — and where the world has not decided
something, the guide says so rather than filling it in.

**Last verified: 2026-09-03 · v1.9.331 · 428 crafts · 135 places · 112 people · 9 companions.**

---

# PART I · WHAT THIS IS

You play one person in a valley, and a Game Master — an AI — narrates the world around you and answers
what you do. **It is a conversation with rules underneath it.** The rules are not hidden from you: every
roll shows you its terms, and every blow shows you what stopped it.

**Three things are always true:**

- ⛔ **The world remembers.** People you meet stay met. Places you change stay changed. What you did is
  recorded and other people find out.
- ⛔ **You are not the only thing happening.** The world moves on a clock whether you act or not. Rivals
  advance. Work continues. Someone else takes the thing you were slow about.
- ⚠️ **Nothing is free and nothing is impossible.** A craft you cannot afford is a craft you cannot use
  today. A foe too strong is a foe you should not meet head-on — not one you cannot ever beat.

---

# PART I½ · WHERE EVERYTHING IS

**Read this once and you will never hunt for a button again.** ⚠️ **Singularity does not have menus in
the usual sense.** It has **places you go**, and each one answers a different question.

## The one you are in most

⛔ **THE PLAY SCREEN.** You type what you do; the world answers. Everything else is somewhere you step out
to and come back from. **When in doubt, you are meant to be here.**

## When it turns into a fight — or a contest

**A fight is not a different game, it is a different rhythm.** You get **three phases every turn, in this
order:**

| phase | what it is for | ⚠️ the catch |
|---|---|---|
| **◎ SENSE** | read them before you commit | ⚠️ **it costs the craft's energy** — skipping it is a real choice |
| **⚔ ACTION** | your actual move | this is the one you always get |
| **✦ BONUS** | ⛔ **a FULL extra action** | ⛔ **earned by a good read — this is what sensing buys** |

✅ **THAT IS THE WHOLE COMBAT ECONOMY.** Spend energy to look, and a good look pays for a second move.
⚠️ **Most players never sense, and most players never see the bonus.** They are the same sentence.

## The places you step out to

| when you want to know | go to |
|---|---|
| **who am I, and why is that number that number** | your **character sheet** — ✅ **tap any trait and it tells you the lore AND the mechanics, in place** |
| **what can I do** | your **crafts** — as a wheel, or as a graph if you want to see how they connect |
| **what am I carrying** | your **inventory** |
| **who is with me** | your **roster** — ⚠️ **everyone here participates, and everyone here can fall** |
| **where am I, and what is out there** | the **map** — the valley, then a place inside it |
| **what have I actually done** | the **chronicle**, and your **quest log** |
| **what does the world know** | the **codex** — what has been established as true |
| **what have I seen** | the **gallery** and the **library** |

## Things that interrupt you, and mean something

- **You have found something** — an acquisition. Take it or leave it.
- **Something has changed about you** — a promotion, a level. ⚠️ **This is a choice, not a notification.**
- **A fork** — the story could go two ways and it is asking which.

## ⚠️ WHAT THE GAME CANNOT YET ASK YOU

**Three things the engine knows how to do and has no way to ask you about.** They are listed here rather
than hidden, because finding out by being surprised is worse:

- **You cannot yet name which ally** a protecting craft is protecting — it chooses.

✅ **AND TWO THINGS THIS GUIDE BRIEFLY CLAIMED YOU COULD NOT DO, YOU CAN.** You *can* choose who steps
forward — tap a companion's name in a fight and they swap into the front, and it sticks between rounds.
And provoking needs no pick: **it works by making *you* the thing they cannot ignore**, which is the
whole point of the verb. ⚠️ **That now actually reaches the fight** — until this build the taunt was
calculated and quietly dropped, so provoking read as though it did nothing. **It does something.**

⛔ **THESE ARE MISSING QUESTIONS, NOT MISSING FEATURES.** The mechanics behind them work; nothing on the
screen asks you. They are tracked as open gaps, and when the game learns to ask, this section shrinks.

---

# PART II · MAKING SOMEONE

You are asked three questions and they are the only three that matter at the start.

## Your four attributes

**PHYSICAL · MENTAL · SOCIAL · PRACTICAL.** Everything you attempt is tagged to one of them, and the
attribute it is tagged to is the biggest single term in whether you succeed.

⚠️ **THIS IS WHY A BUILD COHERES OR DOES NOT.** A kit whose crafts are tagged to your strong attribute
rolls strong; one scattered across all four rolls average at everything. **You are not punished for being
broad — you are simply never excellent at it.**

⛔ **THERE IS A KNEE AT 4.** Up to 4 in an attribute, each point is worth a great deal. Past 4, each point
is worth much less. **The knee is deliberate: it makes the fifth point in your best attribute worse than
the first point in your second-best, and that is the shape of a well-rounded person.**

## Where you come from

**An ORIGIN** — 27 of them — says what people you were born to and what that gave you.
**A BACKGROUND** — 40 — says what you did before the story starts, and grants what that taught you.

⚠️ **Neither is a class.** Neither locks anything. They open doors and they tilt you; they do not fence you.

## What you practise

**A TRADITION** is a way of working — a body of craft with a shared idea behind it. ⛔ **There are 24
pole-traditions standing on a ring, in 12 opposed pairs**, and three folk traditions near the centre that
are **open to anyone**.

⛔ **THE RING IS THE MAP AND THE MAP IS THE RING.** Two traditions beside each other on the ring are kin —
their crafts sit comfortably together. Directly across the ring is your **antipode**, and its crafts fight
yours. **How far apart two traditions are on the ring is how far apart they are in disposition, in
geography, and in how hard it is for you to learn the other one.**

⚠️ **NO TRADITION IS STRUCTURALLY BETTER.** Every one has exactly two neighbours and exactly one opposite.
**That is fairness by geometry rather than by balance patching.**

---

# PART III · A TURN

You say what you want to do, in your own words. The GM answers. **Underneath, a turn has a shape:**

```
    SENSE   →   ACTION   →   BONUS
```

- ⛔ **SENSE is free and it is the most under-used thing in the game.** Reading a situation before you act
  buys you a real, named bonus on what you do next. **It does not cost your action.**
- **ACTION is the thing you do.**
- **BONUS is what you get to do as well**, when something you have grants it.

⚠️ **AND SENSING IS CONTESTED.** The other side is reading you too. **Hiding protects you and blinds you** —
a character who obscures cannot see who the enemy is about to hit, and a character who reads is exposed and
can intervene. **That is a decision every round, not a setting.**

## How a roll works

You roll **d100** and you succeed if you roll **at or under** your chance.

⛔ **EVERY TERM IN THAT CHANCE IS NAMED AND SHOWN TO YOU.** Your attribute, the craft's tier, how the
matchup sits, how hard you are pushing, any standing effect. **The engine never hides a modifier.** If you
want to know why a roll was 62 and not 80, the answer is on the screen.

**How well you succeed matters, not just whether.** A near miss, a clean success and a critical are three
different outcomes and the fiction reflects all three.

---

# PART IV · CRAFTS

**A craft is a thing you can do.** Not a spell list — a practice. **387 of them.**

## Three ranks

You learn a craft at **rank 1** and grow into **2** and **3**.

⛔ **RANKS ARE ADDITIVE. YOU NEVER LOSE A LOWER RANK'S USE.** You do not learn to burn down a hall and
thereby forget how to light a candle.

**Each rank says how it grows you** — it may **ADD** something new you can do, **DEEPEN** what you already
did, or **EXTEND** its reach: further, longer, wider, more of them at once.

## What it costs

⛔ **ENERGY, AND ENERGY ONLY.** No vows, no debts, no exhaustion tracks. A craft has a price, and reaching
higher costs more: **+3 energy for each rank of reach above the first.** A craft that costs 4 at rank 1
costs 7 at rank 2 and 10 at rank 3.

⚠️ **TWO CRAFTS IN THE WHOLE GAME BREAK THIS**, and they say so plainly: they take everything you have left
and leave you at nothing until a full night's rest.

## What a craft tells you

When you choose one you see exactly three things per rank: ⛔ **what it DOES · what it CANNOT do · what it
COSTS.** Everything else on a craft is for us.

⚠️ **"CANNOT" IS A SCOPE LIMIT, NOT A BILL.** It tells you what the craft will not produce — not what it
will charge you for producing it.

---

# PART V · WHEN IT COMES TO BLOWS

## What lands

⛔ **A blow is a MIX, not a single thing.** A psionic strike is part force and part mind. A smite is
radiance and judgement and impact. **The word people use for an effect is the mix.**

**Every kind of harm belongs to one of four families:**

| family | what it is |
|---|---|
| **PHYSICS** | the fabric of the world — matter, force, space, time, and the two kinds of light |
| **ELEMENTAL** | the energies moving through it — heat, cold, lightning, corrosion |
| **VITAL** | life ended, grown, or moved |
| ⛔ **INTRINSIC** | ⚠️ **harm that requires a WILL to make it.** A rockfall cannot do this |

⚠️ **HEAT AND COLD ARE SIBLINGS, NOT OPPOSITES.** A ward against fire is not a ward against ice, and it
never will be.

## What stops it

**A WARD answers a family, or one kind inside a family.** An elemental ward stops heat and cold and
lightning. A cold ward stops only cold — **and is cheaper and sharper for it.**

**Wards have DEPTH as well as breadth, and they are three different answers rather than three sizes of
one:**

- **RESIST** — you are harder to land on. It moves the roll.
- **SOAK** — it lands and takes less off you. It moves the damage.
- **IMMUNITY** — that kind does not touch you.

⛔ **PARTIAL WARDING IS THE POINT.** A shield answers the physical half of a psionic strike and **the mind
half goes straight through.** ⚠️ **The interesting thing about a ward is the list of what it does NOT stop.**

⛔ **AND A BLOW WHOSE EVERY PART IS ANSWERED LANDS NOTHING.** Armour can fully answer. Immunity means
immunity. **A receipt tells you what stopped it and why**, so a zero reads as *answered* rather than as
*broken*.

## Raising a guard

**A guard ABSORBS. It makes the blow smaller — it does not make you harder to hit.** Guards are typed: a
death-ward answers decay and cold and the draining of life, and nothing else. **A big enough guard can stop
a blow entirely.**

## Being stopped without being hurt

Some crafts do not wound you. They **STOP** you — stagger you, cost you your action, put you out.

⛔ **A FAILED RESIST DEGRADES; IT DOES NOT NEGATE.** You do not shrug it off. **You take the lesser
version** — the thing that would have knocked you out costs you your turn instead.

---

# PART VI · THE PEOPLE WITH YOU

**Nine companions.** They are people, not equipment.

⛔ **EVERYTHING PARTICIPATES.** Being able to swing is not the same as taking part. Four of the nine do not
fight and **all nine contribute** — healing is acting, distracting is acting, knowing something is acting.

⚠️ **AND LOSING ONE COSTS SOMETHING SPECIFIC.** Not "you are down a body" — each of them, when they go
down, takes a named thing out of the world with them.

## Bringing people forward

**You can only pay attention to so many people.** The ones you bring FORWARD act blow by blow. The rest are
**FOLDED** — still in the fight, still contributing, just not narrated one swing at a time.

⛔ **A FOLDED COMPANION IS NOT SAFE.** They add to your blows when you are winning and **they take losses
when you are not.** ⚠️ **Including the ones who cannot fight — being unable to swing is not being
protected**, and the reverse would make non-combatants the smart thing to hide behind.

## Bigger than a party

**As you gain standing you lead more than a handful.** A band, then units, then something that meets an
army. ⚠️ **The scale of a fight changes what a round IS** — but a duel inside a war is still a duel, and a
single assassin can still find you in the middle of your own legion.

---

# PART VII · LONG WORK

**Some crafts are WORKS, not workings.** They take days. You come back to them.

⛔ **A PROJECT FINISHES ON A THRESHOLD, NEVER ON A DATE.** A date can only be waited out. **A threshold can
be:**

- **INTERRUPTED** — something stops the work. What you banked is kept.
- **RESUMED** — you take it up again.
- **SABOTAGED** — someone sets you back. ⚠️ **A setback, never a deletion.**
- **INHERITED** — the work passes to someone else and continues in their hands.

**More hands make it go faster.** The GM will not promise you a completion day, because there is not one.

---

# PART VIII · DYING

⛔ **DEATH IS A LADDER, NOT A SWITCH.**

| how far gone | what it means | who can still reach |
|---|---|---|
| **the Threshold** | dead about a day | a rank-1 working |
| **the Near Dark** | about a month | rank 2 |
| **the Deep Dark** | months; the road is nearly closed | rank 3 |
| ⛔ **SEALED** | ⛔ **nothing, at any rank** | — |

⚠️ **AND THE LADDER MOVES.** A failed retrieval **sinks them a rung.** A failed reach at the Deep Dark
**seals them permanently.** ⛔ **Using the craft badly is how a person becomes unreachable** — which means
trying and failing is a real risk and not a free attempt.

**Five traditions answer this ladder differently and share one set of verbs** — retrieve, sink, seal, hold,
slow. Ashwardens drag you back. The Numinous invite. Threnody delays the sinking. Rootkin pay a price.

---

# PART IX · GROWING

**You gain levels, and you gain STANDING — which is not the same thing.**

- **LEVEL** is capability. It opens ranks and crafts.
- ⛔ **NOTORIETY is what the world has heard.** It is earned by DEEDS — things you actually did, that people
  actually found out about.

⚠️ **STANDING IS WHAT LETS YOU LEAD.** How many named people will act alongside you is earned, not bought:
**it rises with your level, your presence, and what you are known for.** At the top of that arc you hold
ground, raise a band, and the game stops being about one person's arm.

---

# PART X · THE VALLEY

## Where you start

**Millbrook.** A riverside farming village on the Echo, water wheels turning along the bank, a fen to the
south that the road has to go round. Ordinary ground, and it is ordinary **on purpose** — farms, a river,
and a road to somewhere worse.

Nothing has happened to Millbrook. That is the point of it. You begin somewhere that has not yet been
made into a story, seven kilometres from a place that has.

## The shape of the valley

The valley floor is where play lives, and it is deliberately the part of the world that is **not a
statement**. Crossing it is unremarkable. That is why what sits at its eastern end reads as loudly as it
does.

**The places you are likely to meet first, and what each is FOR in a life:**

| | |
|---|---|
| **Millbrook** | home, and the thing you are from. Grain, wheels, a lane east |
| **Echo River Crossing** | the old stone-and-cable bridge where the Echo narrows. **Everyone crosses here**, which is why everyone meets here |
| **Waystone** | bridge-builders and road-walkers. **The Masons build the crossing** — a bridge needs a road, and a road needs somebody who will keep it |
| **Greywater Stilts** | a town built **on stilts over the southern marsh**. Dead flat, and the water is the only direction that matters |
| **Archive Hollow** | a collapsed limestone sink upstream, **opened by spring floods.** Something was under there and now it is not under there |
| **The Disputed Zone fringe** | seven kilometres east of home, and **the dispute it is named for is 113 walking days away**. The fringe is where you feel a quarrel you are not part of |
| **The Quiet Ground** | still grey water and wide windows. ⚠️ **The water is what the dying look at.** People are brought here |
| **Thinwater** | *"the water runs thin here, and so does everything else"* |

## What is pressing, where you are

⛔ **THERE IS NO SINGLE STORY WAITING FOR YOU.** The valley carries **six live arcs** at once, and they move
whether you touch them or not. ⚠️ **The one nearest your hand depends on where you are standing** — start in
the Deepwood and the water is somebody else's problem, and stays that way.

| arc | pressure | what it is doing |
|---|---|---|
| **The Second River** | high | contamination spreading from the Echo outward — well-water, then gardens, then the cities' lower districts |
| **The Patient Buyer** | medium | someone buying pass-debts cheaply and patiently, assembling the free crossroads **by arithmetic instead of force** |
| **The Long Reach** | medium | two aligned cities extending quiet control over unaligned places — **safety in exchange for autonomy** |
| **The Question of Knowledge** | medium | the Lost Archive, and the pressure to seize, burn or open it building from every side |
| **What Sleeps Under** | slow-building | the Precursor lattice stirring beneath the valley |
| **The Failing Accord** | slow-building | the Green Accord failing as the Old Stag dies |

⛔ **ARCS RESOLVE.** Not "advance" — **finish.** One way or another, and the result is permanent: a valley
where the Second River was answered is a different valley from one where it was not, and neither goes back.

⚠️ **AND CLOSED ARCS LEAVE WAKES.** What a resolution changes becomes the ground the next arc rises from.
**The list above is not the game's plot; it is the weather at one moment**, and it will not be the same
list a season in.

## What you should expect to know

**About as much as anyone standing where you are.** ⚠️ **A Millbrook farmer knows the river is not
behaving.** A Deepwood walker knows the Moot has been arguing for a very long time and that the argument has
started to have a winner.

⛔ **YOU ARE NOT OWED THE SHAPE OF IT.** Which arc you meet, whether you engage, and whether it resolves for
good or ill is play — **and an arc you ignore does not wait politely.**

## Who you deal with

Ten accords hold the valley together and they are **things you deal with**, not factions you join:

- **The Water Authority** decides who gets the river. ⚠️ **Since the shoreline moved, that decision is
  worth more than it was, and everyone knows it.**
- **The Masons' road-and-bridge accord** keeps the crossings open. They are the reason you can get
  anywhere, and they are owed by everyone.
- **The burying trades at Greyhearth** handle every road's dead. ⛔ **Nobody finds it grim. Everyone there
  has handled it.**

⚠️ **An accord is a standing arrangement, not a membership.** You do not sign up. You come to it with
something it wants, or you come to it needing something, and either way it remembers which.

---

# PART XI · THE PEOPLE

## The nine who might walk with you

**A companion is not a resource.** Everything they bring, they bring because of what they are — and when
one goes down, **you lose the specific thing they were doing**, not a percentage.

| | what it is | what it costs when it goes down |
|---|---|---|
| **Aevi** | a curious swarm of nanite-motes | ⛔ **the perimeter goes dark** — no warning breath before danger. ⚠️ It is scattered, not killed; the motes drift back over hours, dimmer, and wary of that ground |
| **Bristle** | a scarred marsh-hound with more sense than most people | the pack-read is gone — no plain answer on whether a danger is **people-shaped or place-shaped**. ⚠️ And the party fights the rest of it angry |
| **Coil** | a Precursor maintenance-thing that has adopted you | ⛔ Precursor mechanisms stop answering, and **anything Coil was quietly keeping working starts failing** |
| **Ember** | a Glade-touched fox-thing that chose to walk out of the Glade | you walk onto Precursor-active ground blind. ⚠️ **It goes back to the Glade to heal, and whether it returns is a real question** |
| **Hush** | a thing of the deep dark that finds you interesting | the kept dark lifts and **you are abruptly present**, mid-scene, at the worst moment |
| **Marrow** | a carrion bird that attends endings, including yours | ⛔ **nothing is attended** — in a fight where people are dying, you lose the only thing that knows the schedule |
| **Quill** | a disgraced Heights scholar chasing a question the colleges closed | no surfaced fragment, no unexpected approach. ⚠️ **Going down confirms something they already suspect about themselves** |
| **Sprig** | a Rootkin cutting slowly becoming someone | the rooting stops and **what it had rooted is at risk** — a wound it was closing right may close wrong |
| **Tal** | a road-met apprentice who would not be shaken off | ⛔ a second pair of hands becomes one. ⚠️ **They went down doing your work, beside you** |

⚠️ **Four of the nine cannot swing** — Aevi, Coil, Marrow and Sprig. **They are still in the fight**, because
healing is acting and watching is acting, ⛔ **and they can still be hurt.** Being unable to fight is not
being safe.

⛔ **Marrow will not hasten an ending. Ever. For any reason, including mercy.** That is a choice it holds,
not a limit it has — and a choice implies somebody else made the other one.

## People you will meet

- **Ama**, in Millbrook. She finishes what she is doing before she turns.
- **Mara Wells**, who runs the supply store — a close-ledger woman who reacts to what a person is actually
  worth to her, and remembers.
- **Calvar**, past sixty, a **pre-Transition filtration engineer**. ⚠️ **Decades at a drafting surface, in a
  valley whose water is moving.** He is the most important person in Millbrook and does not think so.
- **Veth Ondra**, eleven years a warden, still and direct. ⛔ **She teaches by refusing to soften a
  reckoning**, which is not the same as being unkind.
- **Siol**, a tall Elven traveller, quiet-attention rather than indifference. Has been on the road a long
  time and is not lost.

## What can go wrong

⛔ **Relationships here are held by attention, not by status.** A companion's bond deepens because you
kept using what they gave you, and it thins because you stopped.

⚠️ **The specific way it breaks is different for each of them**, and two are worth knowing up front:
**Ember is half-wild and can decline to come back.** **Hush had not finished deciding about you**, and
being made abruptly present in front of everyone does not help it decide well.

---

# PART XII · THE TRADITIONS, ONE BY ONE

**Twenty-four poles on twelve axes, plus three folk who are neither.** ⚠️ **You do not pick a side of an
axis and lose the other** — you learn where you can reach, and reaching against your own grain is where
the interesting crafts come from.

⛔ **What each one BELIEVES is not decoration.** A tradition is a claim about what the world is, and its
craft is that claim applied until it works.

| tradition | craft | what its people hold | what the craft feels like |
|---|---|---|---|
| **The Ashwardens** | `Palework` | who tend endings as the Rootkin tend growth | like reading a schedule you did not ask to see |
| **The Rootkin** | `Vivimancy` | grove-cities that grow rather than build | like something under your hands deciding to grow |
| **The Threnodists** | `Pathos` | who hold that feeling is the only true knowing; their cities are built around grief-houses and joy-halls | like feeling it entirely, first, before anyone else does |
| **The Syllogists** | `Logos` | who reason from first principles and regard emotion as noise in the signal | like the answer arriving before the feeling does |
| **The Veilwrights** | `Falsecraft` | who hold that every truth is a made thing, and make better ones | like building something true enough to stand on |
| **The Verists** | `Verity` | who speak only what is so, whatever it costs, and it costs | like saying the thing and watching the room change |
| **The Umbrals** | `Umbracraft` | who see by other means in the great dark | like the dark agreeing to hold still |
| **The Blazeborn** | `Radiance` | who live in a light so total it has burned their land to glass | like carrying more light than you can put down |
| **The Abyssal Choir** | `Descent` | who commune with what the world flinches from, and are not all wrong to | like being answered by something that was already listening |
| **The Seraphic Orders** | `Ascent` | luminous, hierarchical, certain; their mercy is real and so is their judgment | like being certain, and being right, and neither being a comfort |
| **The Unmakers** | `Ruinwork` | who hold that ending a thing well is a craft, and that the world is choked with what should have ended | like finding the seam a thing has always had |
| **The Wrights of the New** | `Makecraft` | who cannot stop making; their cities are never finished and that is the point | like the work refusing to be finished |
| **The Churnfolk** | `Wildcraft` | who live in constant productive disorder | like the middle of something going well by accident |
| **The Lattice-Cities** | `Latticework` | perfectly ordered arcologies where nothing is unplanned and nothing is free | like a place where nothing is unplanned and you are now in the plan |
| **The Masons of the Given** | `Thingcraft` | who hold that only what can be touched is real; the world's great builders and its great skeptics | like weight settling where weight goes |
| **The Figurists** | `Formcraft` | who work in pattern, symbol and idea, and hold matter to be the coarsest layer of the real | like a shape you can hold that has no edges |
| **The Somatics** | `Soma` | cultures of the perfected body, movement as language | like your body knowing before you do |
| **The Cogitants** | `Noesis` | who have nearly left their bodies behind for pure thought, and pay for it | like standing slightly outside your own head |
| **The Enginewrights** | `Enginecraft` | whose entire world is mechanism | like a mechanism admitting what it is for |
| **The Numinous** | `Numenwork` | who have dissolved most of their material life into pure spirit-practice | like the material part of you becoming optional |
| **The Horizon-Walkers** | `Spanwork` | nomads of distance; for them everywhere is a place you have not yet arrived | like distance stopping being an obstacle |
| **The Hourkeepers** | `Hourcraft` | who tend duration; their cities remember and pre-remember, and they pay for both | like an hour you can hold and spend |
| **The Marchers** | `The Edge` | a warrior culture whose whole society is honed conflict | like the fight already being decided and you doing the deciding |
| **The Stillhold** | `Stillcraft` | a walled peace so absolute it has become its own kind of prison | like a quiet you are not allowed to break |

## The three folk who are on no axis

| | |
|---|---|
| **The God-Named** — `Service` | heavily augmented humans who never wanted the Transition. ⚠️ **They serve, and the question of whom is the whole of them** |
| **The Bargainers** — `Terms` | ⛔ **the god-named who went DOWN instead of up.** Augmented the same way and answering to something else |
| **Valley folk** | ⚠️ **no tradition at all** — most people. The crafts in this guide are what a few can do, not what everyone does |

## What this means at a table

⛔ **A tradition is not a class and it is not a faction.** It is a way of working that a place teaches.
⚠️ **Two Ashwardens from different valleys will disagree about mercy**, and both will be practising
correctly.

**And the axes are real oppositions, not flavours.** ⛔ **A Verist and a Veilwright cannot both be right
about what a truth IS**, and when they meet, that is the scene.

---

## ⚠️ WHAT THIS GUIDE DOES NOT COVER, ON PURPOSE

- **Field names, JSON shapes, engine internals** — [`FIELD_REFERENCE.md`](FIELD_REFERENCE.md).
- **What is built versus proposed** — [`HOW_IT_WORKS.md`](HOW_IT_WORKS.md). ⛔ **Everything described in
  Parts I–IX is BUILT. If something here stops being true, a gate goes red.**
- **Why the design is this way** — `SYSTEM_SPEC.md`.
