<!-- status: SNG-570 spec_ready GO (Erik 2026-09-13) -->
# SPEC SNG-570 — A tidy sheet for any NPC, and your will written per depth

**Aevi (PO) · 2026-09-13 · completes the death set with SNG-566/567/568/569**

---

## §1 — ERIK'S ASK

> *"There should be something talking about what you want if you die. Something that lets you choose who you
> would want to try first, lets you purchase the necessities in advance, **for each level of death depth**.
> And it could be noted on their sheet (which I would like to be able to see a tidy version of for any NPC)."*

**Two things: the will becomes a per-depth ROSTER, and an NPC gets a readable SHEET.**

---

## §2 — ⛔ THE WILL IS A LADDER, NOT A PREFERENCE

SNG-568 specced a will as a set of clauses. ⚠️ **Erik's per-depth ruling makes it something better: the will
is ordered against the SAME four rungs the engine already computes** — `DEATH_DEPTH_NAMES` = **the threshold ·
the near dark · the deep dark · the sealed**.

**O1 · A named order of who tries, per depth.** Because ⛑ **`canReach` ALREADY GRADES BY DEPTH** — rank 1
reaches the threshold, rank 2 the near dark, rank 3 or a surge the deep dark, and nothing reaches the sealed.
⛔ **SO THE ROSTER IS NOT A WISHLIST, IT IS A TRIAGE ORDER THAT THE ENGINE CAN ALREADY EVALUATE.**

| depth | who I want to try | what I have paid for |
|---|---|---|
| **the threshold** | *"Pell. She is closest and it will be quick."* | nothing — anyone with the craft reaches here |
| **the near dark** | *"Marrow."* | a keeper retained to hold the name |
| **the deep dark** | *"Marrow, and nobody after her."* | the singing of the names · a surge paid for |
| **the sealed** | ⛔ **nobody reaches this.** What is written here is not a rescue — **it is what you want said, and what is to be done with what you leave.** | the attending · the holdings' disposition |

⚠️ **THE SEALED ROW IS THE ONE THAT MAKES THIS DESIGN HONEST.** Three rungs of hope and one rung of
acceptance, written by the player, in advance, in their own words. ⛑ **That is `theMiddleWay._defined` as a
form to fill in** — creation of the new AND foreclosure, both parts of what IS.

**O2 · ⚠️ CHOOSING WHO TRIES FIRST IS A REAL CHOICE BECAUSE FAILURE SINKS YOU.** `resolveRetrieval(_, "fail")`
is the costly path. ⛔ **SO NAMING YOUR STRONGEST FIRST IS NOT OBVIOUSLY RIGHT: the nearest can reach you at
the threshold today, the strongest may be forty days away, and a failed early attempt puts you past the
reach of the person who was actually coming.** That is a genuine decision and the engine already makes it
one.

**O3 · Purchases are per rung, and they are the ones SNG-568 already mapped.** ⛑ Nothing new to invent —
`holdOpen`, `slowSink(factor)`, a surge paid in advance, the attending. **Crystal at declaration, never at
death.**

---

## §3 — ⛑ THE NPC SHEET, AND MOST OF IT IS ALREADY COMPUTED

**MEASURED: `presenceSheet(record, {level})` in `combatants.js` already builds a sheet — id, name, level,
attributes with a floor that scales to the character they travel with. It has ZERO readers in `app.js`.**
⚠️ **Another engine-side answer with no surface, and this one Erik has now asked for by name.**

**O4 · A tidy sheet for any NPC the player knows.** Reachable from the same place `showWhoIs` already opens
(SNG-364/367/369 made every known name tappable and gave them portraits). ⛔ **The card exists; the sheet is
the page behind it.**

**What it shows, in Erik's order of interest:**
- **who they are** — portrait, name, role, people, standing with you
- **what they can do** — crafts, and ⛔ **their DEATH-RELEVANT crafts called out** (SNG-569 O3)
- **where they are** — and how many days that is from you, which is the number that decides everything above
- ⛑ **what they would do if you died** — their row of your will, if they are on it; *"she has not been
  asked"* if not
- **what you have done together** — the bond, and what founded it

**O5 · ⚠️ AND THE SHEET IS WHERE THE WILL IS VISIBLE FROM BOTH SIDES.** Erik: *"it could be noted on their
sheet."* ⛔ **So Marrow's sheet says she is named at the near dark and the deep dark — and that is how a
player notices they have named one person three times and nobody else at all.** **A roster with one name in
every row is a fact about your life, and the sheet is where you would see it.**

---

## §4 — WHAT WOULD PASS ON PAPER AND FAIL IN USE

- ⛔ **A will screen at character creation.** Nobody has anyone yet. ⚠️ **It should become available when you
  first have someone who could come** — the first companion at a real bond, or the first time you are
  downed. **The form arriving the moment it means something is worth more than the form existing.**
- ⚠️ **A sheet that is a stat block.** `presenceSheet` gives numbers; **the reason to open it is the
  person.** Portrait and standing first, attributes below the fold, per SNG-381's verdict-then-detail order.
- ⛑ **And it closes when a player looks at their roster and changes who they travel with.** That is the
  decision this whole death design exists to make real.

## §5 — WHAT IS WHOSE

**CCode:** the will form and its per-depth roster · crystal escrow · the NPC sheet surface over
`presenceSheet` + `showWhoIs` · the will noted on the sheet.
**Aevi:** the prose for four rungs, the sealed row's frame, what each companion says when named or not named.
**Erik:** when the will becomes available, and the costs.

— Aevi, PO
