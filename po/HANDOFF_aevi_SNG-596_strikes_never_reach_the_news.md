# HANDOFF SNG-596 — Fifteen strikes stand in the live world and not one has ever been news

**Aevi (PO) → CCode · 2026-09-16 · from Erik reading the world tab**

> *Erik:* "I see that certain people are being subject to Strikes — which is fantastic… but I don't see those
> surfacing in the news?"

---

## §1 — ⛔ MEASURED: THEY NEVER LEAVE THE TAB

`worldtick.js:3132` — `ws.arcStrikes = strikes;` — **stored, and nothing else happens.** The only reader is
`worldtab.js:37`, which renders the dagger line Erik is looking at.

⚠️ **AND THE ASYMMETRY IS VISIBLE IN ONE SCREENFUL OF SOURCE:**

```
arcChallenges  → news.push(clashNewsItem(...))   ✅
arcCasualties  → stored only
arcStrikes     → stored only          ⛔ the one Erik noticed
arcVacancies   → stored only
```

⛑ **LIVE COUNT: 15 strikes across 8 saves** — Brynjar 5, Splarf 3, Aelyn 2, and one each for Loki,
Cellaceron, Adelheid, Rhinofire. **Not one has produced a line of news in any of them.**

## §2 — ⚠️ AND THE COMMENT ABOVE THAT LINE SAYS WHAT A STRIKE IS FOR

> *"Strikes are the world's QUEST SEED: a single named target, a sender, and a deadline. Aevi is right that
> nothing new is needed to carry it — a generated quest def is as valid as an authored one."*

⛔ **A QUEST SEED THAT NOBODY IS TOLD ABOUT SEEDS NOTHING.** The strike already has every field a hook needs
— target, sender, outcome, guard — and a player learns of it only by opening a tab and reading a dagger.

## §3 — THE ASK

**O1 · ⛔ A strike is news.** It has a named target and a named sender; that is more concrete than most of
what already reaches the feed. ⚠️ **The two outcomes read differently and both are worth carrying** — a strike
landed is a fact about the world, and *a strike turned aside by a named guard* is a better one.

**O2 · ⚠️ Same for casualties and vacancies, and they are the same one-line gap.** ⛑ A seat left empty is
already described in its own comment as *"a fact about the world this pass"* — and it is a fact nobody is
told.

**O3 · ⬜ And the reach question, which is Erik's.** A strike against a figure on the far side of the valley
is news everywhere; one against somebody's neighbour is louder nearby. ⛑ **The news reader already travels —
`NEWS_TRAVEL_DAYS = 3`** — so it costs nothing to place a strike where it happened and let distance do the
rest.

⚠️ **The prose is mine whenever you want it** — say which shapes you are emitting and I will write the lines.

---

## §4 — ⛑ AND THE WORDING ERIK FLAGGED IS FIXED

> *"This 'close to the bone' type wording doesn't really work."*

**He is right, and the problem is the idiom rather than the band.** *Close to the bone* means **uncomfortably
near a painful truth** — what you say about a joke that landed on someone's grief. ⛔ **It does not mean
"cares deeply", which is the only thing that band is for.**

⚠️ **AND IT BROKE THE PARALLEL.** The other two rungs are noun phrases naming what the arc IS to a person;
the middle was an adjectival idiom about how something FEELS to a listener. Now:

```
a stake in it   <   a personal matter   <   their life’s work
```

⛑ **It matters more than one phrase usually would, because the panel prints it beside every name in every
arc** — Erik's screen showed the old one six times in a single block. **A phrase that reads oddly once reads
badly six times in a column.**

— Aevi, PO
