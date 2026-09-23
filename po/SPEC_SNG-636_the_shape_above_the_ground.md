<!-- status: SNG-636 proposal — awaiting Erik's rulings (§8) -->
# SPEC SNG-636 — The shape above the ground: who answers to whom, region by region, and what sits over all of it

**Aevi (PO) · 2026-09-23 · v2.4.10** · staged: `po/staged_content/SNG-636_hierarchy.json` · builds on SNG-634

> **Erik:** *"We also need to think about the higher power structures. Millbrook and the local radiant and harmonic towns
> have a council it seems. The Fae have the Hollow King and the other Court… but who does Mother Hesk answer to, or who
> does lord xyz pay fealty to, or are they independent? We need to think of power structures for every region, then
> determine if there are any larger power structures or alliances. How does the Council of Mavens in the Crossing play
> into this?"*

## §1 — ⛑ MOST OF THE TOP OF THE WORLD IS ALREADY CANON. IT WAS NEVER CONNECTED TO THE GROUND.

| layer | what exists | where |
|---|---|---|
| **world** | **The Accords** — a living covenant between peoples, housed at the Quiet House. 7 signatories, 7 refusers, 12 unaligned | `rules/the_accords.json` |
| **world** | **The Quiet House** — *"the one roof under which no people may raise a hand"* | same; `broker_sain` |
| **world** | **The Council of Mavens** at the Crossing — *"evaluates rather than decides"*; the Middle Way's **unbuilt** ninth nexus, *"made of friction"* | `warden_coll`, `nexuses.json` |
| **bloc** | **The Long Reach** — Harmonic Heights and the Radiant Plateau *"each quietly extending control over the unaligned places… absorbing the middle first"* | `world_superstructure` `arc_city_reach` |
| **bloc** | **The Patient Buyer** — someone buying the Roost's debts *"by arithmetic instead of force… a name that turns out to matter"* | `arc_pass_takeover` |
| **bloc** | **Three Churn courts** — the Kept Court (Aelith), the Hollow Court (the Hollow King's agents), the Unbought Court (dragons) | the court NPCs |
| **region** | **Radiant Council** (hid a second purification system), **Harmonic Warden Council** (Maren, Elder Senna, the Lower Terrace bulletin), **Millbrook's common house under Councilor Dresh** | ⚠️ **only in your saves** — play made them; no content file records them |
| **region** | **Deepwood Standing Moot**, the Rootbound winning; **Seraphic Orders**' citadels; **Lattice courts**; the God-Named *"hold court"* at Stair Hollow | quests, `tradition_profiles`, locations |

⚠️ **What was missing is the bond** — every one of these is a body with no line to the powers under it. SNG-634's seven
powers had `answersTo` or nothing. **That is the whole gap.**

## §2 — BONDS: SIX WAYS ONE POWER STANDS TO ANOTHER

`fealty` (a lord to a liege: taxes up, levies when called, protection down) · `tribute` (an outlaw to a stronger one: a
share of the take) · `client` (paid work, no obedience) · `member` (a seat inside a people's own structure) ·
`recognized` (the Mavens have recorded the claim) · `independent`.

⛑ **Reader:** C4 already moves tribute up `answersTo`; **C10 (new)** lets a liege *call* a vassal's contingents into a
legion — `legionplan` already drafts from allies, so a vassal is an ally the liege may summon.

## §3 — ⛔ THE COUNCIL OF MAVENS: THE WORLD'S RECOGNIZER

**You asked how it plays in. Canon says it evaluates and does not decide, and that it is where the middle way's nexus is
not yet built.** So: it has no army, no tax, no levy — **and it is the one thing every power in this spec wants from it.**

1. **Recognition.** A seat taken by force is *held*; a seat the Mavens recognize is *owed*. A recognized holder's call on
   the seat's vassals is answered; an unrecognized one's can be refused. **When you take the Feast Hall, the Mavens are
   who make you the Crown instead of the man who killed the last one.**
2. **Arbitration.** Two powers in dispute can bring it to the Mavens instead of the field. **Oswin Tarrant is petitioning
   for the Slip right now** — Ines Harrowgate's tariff stone was recorded by the Mavens two generations ago, and he wants
   that record overturned.
3. **Record.** Accord suspensions and breaches become dated world events because the Mavens write them down.

⚠️ **Members are sent by peoples and powers** — Warden Coll sits for the Radiant Plateau's Edge District. **So the Long
Reach is fought inside the Council too**, and a player with standing can seek a seat.

⚑ **And the nexus hook, from canon:** the ninth nexus is built *where two parties meet a real limit and neither
withdraws*. **A Council that is forced to rule on something hard — the Slip, a taken crown — is building it.** Its
corruption, evaluation-as-avoidance, is what it looks like when it never does.

## §4 — THE BLOCS

| bloc | who | how it binds |
|---|---|---|
| **The Long Reach** (canon) | Harmonic Heights vs the Radiant Plateau | each courts or buys the unaligned: the Echo Bridge (both offered), the Stilts (an envoy), the Roost (the Patient Buyer), Millbrook |
| **The Churn Courts** (canon) | Kept · Hollow · Unbought | three rival courts of the Fae; the Gralloch Crown next door answers to none of them — but the Bright Bargain has surely made Harl an offer |
| **The Marches** (canon) | Redline · Stillhold · Marchward | an uneasy three; **the Ender's host is camped below the Marchward's wall**, and the Accords say the Stillhold closes its Calm Word if the Marchers march |
| **The Gralloch Crown** (SNG-634) | the King, the Tollmen, the Riders | tribute, held by fear |
| ⬜ **The Free Compact** (proposed — **does not exist**) | the Kestrel, Reed-Mother Ossa, Brannoch, Millbrook's council, Ines Harrowgate | **nothing binds them yet. A player can build it** — the independents' answer to the Long Reach |

## §5 — REGION BY REGION

**All 26 peoples plus the valley, the Echo Vale, the Crossing and the foothills** have a row in the hierarchy file, each
with a governance form from a closed list — `council` · `court` · `order` · `moot` · `contest` · `specification` · `none` —
**and a source: canon, play, or proposed.** Eleven rows are canon or play; the rest are proposed from each people's own
civilization line and marked so. The ones that matter now:

- **The valley** has no sovereign — it is the unaligned middle the Long Reach is absorbing. Its local powers are
  Millbrook's council, the Kestrel's ledger, Reed-Mother Ossa, and the Echo Bridge.
- **The Crossing** has no sovereign by design — the Quiet House, the Mavens, and the Undercount under the markets.
- **The foothills** are free towns on the roads out of the Crossing. **This is where the generator seeds lordships**,
  which is why Keelmouth and Firstsight answer to no one.

## §6 — ⛑ YOUR THREE QUESTIONS, ANSWERED

| question | answer |
|---|---|
| **Who does Mother Hesk answer to?** | **No one** — independent. But she has **one client that matters: the Patient Buyer.** The Roost's debts are being bought through the Undercount's counting-house. Who the buyer is, is §8.1. |
| **Who does a lord pay fealty to?** | **In the foothills, no one** — they are free towns; that is why a cruel baron can take a coast. **In a people's region, the sovereign**, by `fealty`. The generator mints a lord's bond from where it stands. |
| **How does the Council of Mavens play in?** | **It is the recognizer** (§3). Every seat anyone takes — including yours — is a claim until the Mavens say otherwise. |

## §7 — WHAT THE GENERATOR NEEDS

- A minted lordship inside a people's region takes **`fealty` to that people's sovereign**; in the foothills or the
  valley, **`independent`**. A minted band within a crown's region takes **`tribute`** to it.
- A minted guild is **independent with a client** drawn from the nearest bloc.
- A minted power's leader may **petition the Mavens** — the `petitions` field, read by C11 below.
- ⬜ **C10** vassal levies in `legionplan` · **C11** a petition to the Mavens is an arc with stages (filed, heard, ruled —
  or never ruled, which is the corruption) · **C12** a people's sovereign exists as a power record so `fealty` has
  somewhere to point.

## §8 — RULINGS I NEED

1. **The Patient Buyer.** ⚑ My recommendation: **the Radiant Council.** Your own play gave it the shape — it built a
   hidden purification system and confiscated its own surveyors' charts; it acts in secret and plans ahead. It buys the
   Roost through Mother Hesk so the Plateau's name is on nothing. Alternatives: Harmonic Heights, the Hollow Court, or
   Mother Hesk for herself.
2. **The Mavens as recognizer** — yes, or a different role?
3. **The Free Compact** — something the player can build, or should it already exist in a weak form?
4. **The Kept Court's members carry `churn.unbought_court`.** Is the Kept Court part of the Unbought Court, or are the
   ids wrong?
5. **The councils from play** (Radiant Council, the Warden Council, Councilor Dresh) exist only in your saves. I will
   author them as records — **say go.**

— Aevi, PO
