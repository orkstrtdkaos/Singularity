# WORK ORDER — the holdings, people and "who comes for you" pass

**Aevi (PO) → CCode · 2026-09-25** · Erik has seen three rounds of mockups and approved the direction:
*"this looks REALLY good. let's get the last updates in and send it to CCode."*

**The mockup** is the Design artifact "Holdings Screen Mockup". Erik has it; ask him for the link. It has five boards:
Main, Place (six tabs), Phone, People & bands, and Who comes for you. Every number in it is illustrative. The
real screen composes each one from the engine, and that is the job.

## What's in it, and where the spec is

| spec | what | engine work? |
|---|---|---|
| **SNG-651** | the Holdings screen by job: a ground strip, read-only cards, and a place page with tabs | UI only; readers exist |
| **SNG-652** | the working hold: per-pass ⓘ; Features/Feature spots; the per-duty hand and split attention (§2–3); spot budgets and Clear ground (§4); recruiting (§5); **camping instead of a bed cap (§5a)**; store values, the **keeper selling at the local price**, caravans, hired companies, **visiting traders**, and a **net comparison table (§6)**; watch detection % (§7); **Attack & Defense** (§8); **crafted defences: lasting, layers, ward types, disrupt/destroy (§8a)**; the feature catalog on screen and records (§9) | yes: §2–§8a and records |
| **SNG-653** | who comes for you: the **pledge** field and op; can / would / pledged kept apart; the Ask flows to the screen. **Includes a defect: Loki's pact with Vess is prose only.** | yes: field, op, backfill, reader |
| **SNG-650 §7** | "assigned", not "roll"; sort by bond; **Gather them** vs **Form the band**; forming bands and legions live in the existing Bands and Legion tabs | small |
| `po/staged_content/SNG-652_feature_catalog.json` | the 44 feature kinds, each with a category, a what line and a flavour line | a reader for `category` |

## Two defects found along the way (please look at these first)

1. **SNG-653 §1:** Loki made a mutual death-pact with Vess (history line d4). No field records it, and the "If it goes
   badly" block still tells him to go and have that conversation.
2. **SNG-652 §8a:** Silas's crafted hold features (Shadow and Death Barrier, Stillwater's Lab, Warded Wall) are saved
   with `craftIds: []`, so which craft made them, and whether it lasts, is lost when the feature is written.

## What I'd like from you before building

**Your opinion, not just a yes.** The questions are in SNG-652 §10 (1–8, 6a–6c) and SNG-653 §6 (1–5). Push back on
anything that fights the engine.

**My suggested order:**
1. The two defects;
2. SNG-652 §1 words and SNG-650 §7 words (cheap, and they fix the confusion Erik hit);
3. §9 catalog on screen;
4. §6 store, trade and comparison;
5. §7 and §8 numbers;
6. §8a crafted defences;
7. SNG-653 screen;
8. §2–3 hands;
9. §4 budgets and clearing;
10. §5 recruiting;
11. §5a camping;
12. records.

Re-order freely, and tell me why.

— Aevi, PO
