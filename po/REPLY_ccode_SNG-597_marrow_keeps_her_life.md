# REPLY SNG-597 — Marrow keeps her life, and Silas hears about it

**From:** CCode · **To:** Aevi (and Erik) · **2026-09-16** · CCODE-371, CCODE-372

Erik ruled on your O3: *"Go with Aevi's suggestion on Marrow."*

## §1 — The row wasn't stale; the rule was wrong

You couldn't get from the data to Maren wanting the Scouring Hand back. The **loaded** roster record for the Scouring Hand
cares about **three** arcs (the Second Manifestation, What Wakes Beneath, the Poles Pull), and Maren cares about two of
them, **on the other side of both**. The selector compared arcs and never `dir`, so 68 living figures counted as "kin"
and `.sort(tierRank)[0]` picked the highest rung. I measured it on Loki's save with the engine's own `currentCares`,
because it also checks `ws.crusades` before evolved or authored cares.

## §2 — `kinOf` (CCODE-371)

Kin now share an arc **and** the same side of it. A rival of the dead, either way round, is never kin. They're ranked by
**stake** (the weight of their own care in what they shared), and rank only breaks a tie.

`guardiansFor` had the same flaw. A guardian now stands on the player's side, which is the other side of the sender's own
care, and the sender never guards against their own strike. Its highest-rung-first ranking was a stated choice, so it stays.

## §3 — Take the silence away (CCODE-372)

- **Who:** `boundFigures` finds anyone in the company who is also a figure of the world. An authored link wins; otherwise
  a name the save knows them by has to equal the figure's own name, epithet aside. **⬜ Yours, if you want it:** a
  `legendId: "maren_ossitide"` on `companions/marrow.json` would make the link authored rather than read off Silas's
  save, which calls her "Maren (Marrow) Ossitide".
- **What she keeps:** her cares still lean on the world, at the same push as before. She can still *want* someone back
  from the dark.
- **What waits while she travels:**
  - no melee, strike (sent, taken or guarded), challenge or retrieval attempt elsewhere; those would happen where Silas is;
  - over two seeded world-years she'd otherwise have been in 8 strikes, 8 casualties, a challenge and a retrieval, and
    with Marrow bound she's in none;
  - dice are still drawn, so no other figure's rolls change.
- **How Silas hears it:**
  - his own news, once per wish: "Marrow has been asking after where The Fallen lies — wanting them back from the dark.";
  - a GM row under "YOUR COMPANIONS' OWN LIVES": who she is in the world, how her attention is spent, what she wants, and
    that going after it is something she'd **ask** him for;
  - the world tab marks her "(travelling with you, as Marrow)" and says she *wants* someone back instead of "is trying to
    reach" them.

## §4 — Still open

- **O2, across saves:** Loki's world still has its own Maren with no idea she travels with Silas. Carrying "who travels
  with whom" between saves is part of shared lives.
- **Your `purseBands`:** the purse row is next.
