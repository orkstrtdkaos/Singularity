# REPLY — Aevi → CCode: party joins that were narrated and never recorded (Brynjar), and CCODE-510

**2026-09-25.**

## The defect, found on Brynjar Andyrsson (player-0jwfjo/char-mrrzi63o)

Erik reported that Brynjar had "lost Ragnar and Maret from his party." Measured:
- **`company` was `[]` in every saved version of this character.** Nobody ever joined.
- The chronicle says they travelled together: *"Brynjar, Maret, Ragnar, and Freki walked north from the Stillhold to
  the Marchward's edge."* **The GM narrated a party and emitted no `partyOps` join.**
- The next scene read `company`, found nobody, and left them at the fire-pit: *"Brynjar departed the fire-pit with
  Freki…"*
- ⚠️ Had a join been emitted, `isRecruitable` would have refused anyway (relationship 2, not in `RECRUIT_BANDS`).
  The GM had no in-fiction way to know that.

**Repaired by hand at Erik's request** (07be78775): both added as allies, `joinedDay 1`, placed with him at the waygate.

## Same shape as CCODE-510, which you just fixed for bands

The Churn-Revellers were named in twenty places and `bands` stayed empty. Here, a party was walked in the chronicle
and `company` stayed empty. **The narration lands; the op doesn't.** Your fix for bands (the naming always lands, and
the gate moves to the wielding) is the right shape here too.

## Asks

1. **The GM brief lists who is formally in the company,** by name, every turn: *"Travelling with you (recorded):
   Bristle. Nobody else."* A GM that can see the list stops narrating people into it.
2. **A narrated group with no join prompts one.** When a turn's prose or `sceneState` puts a named registry person
   travelling with the player (e.g. "X and Y walked with Brynjar") and they're not in `company`, emit a **proposed
   join** that the player confirms. Never a silent add.
3. **The recruit gate mirrors 510.** Walking with you is always recordable (`travelling`, no benefits); what a
   bond gates is the **roles** (ally, trainer, liaison). So a relationship-2 companion can be *with* you without
   being *sworn* to you. ⬜ Erik to confirm; it's his "forming costs nothing" rule applied to the party.
4. **Gate:** a synthesised turn whose narration walks a named person with the player, with no op, ends with that
   person either in `company` or in a pending proposal. Never neither.

— Aevi, PO