<!-- status: SNG-664 — Aevi (PO); Erik 2026-09-28 from play; ⬜ CCode, priority with the party bugs (Erik is playing on it) -->
# SPEC SNG-664: a person is minted once, and correctly

**Aevi (PO) · 2026-09-28**

> **Erik** (playing Loki): *"we aren't crisp on our minted people not being duplicated yet. In this case, Loki got the
> generic person, then the named one, and now the same person the GM introduced again... we need to make it so that
> the person gets minted ONCE and correctly."*

## §1 — What happened, measured in Loki's live save

| id | name shown | trueName (minted) | met |
|---|---|---|---|
| `radiant-agent-whistling-woman` | "Radiant authority sent to intercept" (`nameUnknown`) | **Corm Whitlock** | Whistling Woman Post, day 8 |
| `radiant-agent-seraphine-s-hand` | **Vail Langley** (ally, 4) | — | the Made Gate, day 8 |

One woman, three times: (1) a stranger minted at the Post with a descriptor and a trueName; (2) the same agent,
named Vail, as a second record at the Made Gate the same day; (3) tonight the GM opened the Post scene with "a woman
in grey" who turns out to be Vail, introduced as if new. Asked directly, the GM said they're one person, and its own
place history agrees. **Nothing in the engine could have joined them:** `findExistingNpc` matches id, name, aliases,
`trueName` and former ids, and "Radiant authority sent to intercept", "Corm Whitlock" and "Vail Langley" share none
of those. The minted name and the GM's name for her also **disagree** (Corm Whitlock vs Vail Langley), so even a
reveal on the right id would have shown the player a name the fiction never used.

Also in the same save: `syllogist-of-the-margins` ("Unmet yet", trueName Orla Yardley) and `orla-yardley`, the pair
CCODE-514 found. The matcher was fixed going forward; **the existing pair was never merged.** Scan of all 16 saves:
that's the only trueName duplicate left.

## §2 — The rules

1. **Known before new.** Before a stranger is minted, the GM is shown the people this character already knows who
   could plausibly be here: met recently, sent by or answering to a party in this scene, or whose last known place is
   here or on the road here. Each with id, name as known, role, and who they answer to. The instruction: *a person
   the player has met is never introduced as a stranger; write the op against their id.*
2. **The GM must declare an overlap.** When a new person's role or sender overlaps a known one (same power, same
   master, same office: "agent of the High Luminary" and "Radiant authority sent to intercept" both answer to
   Seraphine), the op must carry `sameAs: <id>` or `distinctFrom: [<id>]`. An op with neither is **held**, not
   written: the engine asks the GM once, in the same beat, rather than guessing (a name is a fact; a role overlap is
   a question). `distinctFrom` already exists (CCODE-423).
3. **The mint is the name, until the player has seen one.** A stranger's minted `trueName` is given to the GM with
   the stranger (*"if she gives her name, it is Corm Whitlock"*), so a reveal lands on the mint and the matcher's
   trueName line catches it. **Once the player has seen a name on screen, that name wins**: a later GM name for the
   same id is an alias, and the mint is dropped quietly if the player never saw it.
4. **A known person arriving is written as known.** A scene opener at a place where a known person is present names
   them ("Vail Langley is by the hearth"), never re-describes them as new. The opener reads the same who's-here list
   the side panel shows.
5. **One merge writer.** `mergePeople(character, keepId, dropId, { why })`: the kept record takes the dropped one's
   id into `formerIds`, its names into `aliases`, the higher relationship, the earlier `met`, the union of
   memory/bond log/quest state, and every reference to the dropped id (company, allyOrders, quests, holdings, pledges,
   scene) is re-pointed. Written once, idempotent, and it says so in the news ("You realise the Radiant agent at the
   Post was Vail Langley.").
6. **The player can say so.** A "same person as..." control on a person's card in the People list and in Who's Here,
   listing plausible matches first (same place, same day, overlapping role). Erik spotted this one himself; the game
   should let him fix it in one click, through the one writer.

## §3 — Repairs (reconcile step, both driven on Loki's save)

- `syllogist-of-the-margins` → **`orla-yardley`** (automatic: trueName is an exact match, the CCODE-514 rule).
- `radiant-agent-whistling-woman` → **`radiant-agent-seraphine-s-hand`** (Vail Langley). Not automatic by rule; this
  one is confirmed by Erik in play and by the GM's own place history. Apply it as a named repair for this save, with
  "Corm Whitlock" dropped (the player never saw it).

## §4 — Gates

- The same agent met twice under a descriptor and a name, with an overlapping sender, produces **one** record, or a
  held op with a question, never two records.
- A reveal on a minted stranger shows the minted name (or the name the player has already seen), never a third.
- `mergePeople` re-points every reference; nothing is left pointing at a dropped id (assert over every field that
  holds a person id).
- A scene opener never describes a present, known person as a stranger.
- Across all saves, no two records share a name/trueName after the reconcile step (the scan in §1, as a ratchet at 0).

— Aevi, PO