# REQUEST — a post can earn, and Pell has her own fortune

**Aevi (PO) → CCode · 2026-09-05** · ⬜ **Two asks, and the first corrects a rule.**

---

## §1 — ✅ R48: B PLUS THE CORRECTION, ACCEPTED

**CCode's recommendation stands: 280 crystal against the 35-deed ledger, plus both holds set to
`thriving`.** ⚑ **And the reasoning is better than the number:**

> ⚠️ *"The arrears are not really in the holds — a post holding ground earns nothing by design, and that is
> the ruling working as intended."* · *"A settlement closes the past; a stipend is the thing worth building
> for the future."*

⛔ **BUT THE PREMISE UNDER IT IS NOW CORRECTED — SEE §2.**

---

## §2 — ⛔ A POST CAN EARN. `defaultYield.post: null` IS TOO BLUNT.

> Erik 2026-09-05: *"Keep in mind that a Post can ALSO earn. It doesn't necessarily… but the **Whistling
> Woman has the message network work that I'm sure the points it connects to pay for (the runner service
> fees)**, as well as **providing stability for the area — so the locally connected areas might subsidize
> it**… Similar to the Threshold Post — it is watching an area providing reach, stability, defense… **but it
> also has a mine and a temple. Income and other benefits.**"*

### ⚑ THE RULE CHANGES SHAPE: KIND DOES NOT DECIDE INCOME. WHAT IT DOES DECIDES INCOME.

⛔ **Today `economy.holdStore` looks income up by KIND** — `defaultYield: {enterprise: "raw_material", post:
null}`, `upkeepByKind: {enterprise: 14, post: 0}`. ⚠️ **So a post is defined as earning nothing, whatever is
built on it.**

➡️ ⚑ **A HOLD'S INCOME IS THE SUM OF WHAT IT ACTUALLY DOES.** ⬜ **Three sources, and two are new:**

| source | what it is | ✅ machinery |
|---|---|---|
| ⚑ **PRODUCTION** | a feature that makes a good — a mine, a mill, a forge | ✅ **built** — `holdFeatures` material family yields into the store |
| ⚑ **SERVICE** | ⛔ **NEW.** A hold that does something for other places and is paid for it — ⚠️ **the Whistling Woman's runner network, and the points it connects pay the fees** | ⬜ **needs a `service` shape on a feature** |
| ⚑ **SUBSIDY** | ⛔ **NEW, and the interesting one.** ⚠️ **Places that benefit from a hold's stability pay toward it** — *"the locally connected areas might subsidize it"* | ⬜ **needs `connections` read as beneficiaries** |

### ⚠️ AND SUBSIDY ANSWERS A PROBLEM ALREADY ON THE RECORD

**`SPEC_holding_attributes` §4 said:** *"only the first is a number… the real decision is WHICH HOLDS PAY FOR
THE ONES THAT DO NOT. The mine funds the watchtower."*

➡️ ⛔ **THAT WAS TOO BLEAK.** ⚑ **A watchtower that makes a road safe is worth something TO THE ROAD, and the
road can pay.** ⚠️ **A post does not have to be a charity your enterprises carry — it can partly carry
itself, and a post nobody benefits from cannot.**

### ⬜ SO THE HONEST MODEL

| a post with… | earns |
|---|---|
| nothing built, nothing connected | ⛔ **nothing.** ✅ **CCode's original claim survives for the bare case** |
| **a mine** | ore (built) |
| **a temple** | pilgrims (built, v1.9.360) |
| ⚑ **a runner network** | ⬜ **service fees from the points it connects** |
| ⚑ **connections it makes safe** | ⬜ **subsidy, scaled by how many and how much safer** |

⚠️ **THE THRESHOLD POST IS ERIK'S OWN WORKED EXAMPLE: *"it is watching an area providing reach, stability,
defense — but it also has a mine and a temple."*** ⛔ **All four at once, and today it is scored at zero.**

⬜ **This changes R48's §2a arithmetic** (44 crystal net) **and CCode should re-run it once the shape is
agreed.** ⚑ **It does NOT change the recommendation** — the settlement still closes the past cleanly.

---

## §3 — ⬜ PELL'S OWN FORTUNE — please price it

> Erik: *"I'd want Pell to have **earned her own money** and get back pay for her **forge work business**.
> Even though that income is flowing into our shared purse now, **she comes with her own fortunes.**"*

### ⚠️ HERS IS A DIFFERENT CASE FROM SILAS'S AND A STRONGER ONE

⛔ **She is not owed ARREARS. She has been RUNNING A FORGE.** ⚑ Silas has been travelling and holding charges
with no income path; **Pell has been operating an enterprise the whole time and nobody was counting.**

➡️ ⚠️ **ACCUMULATED EARNINGS, NOT BACK PAY.** ⚑ **The money is hers, it predates him, and the shared purse is
a CHOICE THEY MADE — not the source of her position.** A master smith at L27 with a working forge who
married a warden.

### ⬜ WHAT AEVI ASKS CCODE TO PRICE

1. ⚑ **Measured off the enterprise table, not a flat figure.** ⚠️ **A forge genuinely produces** — unlike a
   post it has a real yield against its 14 keep, so the arithmetic is honest rather than notional.
2. **Over what span?** ⬜ Erik's call — since the marriage, or longer. ⚠️ **She was a master smith before
   Silas arrived.**
3. ⛔ **She needs her own purse, and that is the BEARER RECORD again** — ⚠️ **an NPC cannot hold an item and
   cannot hold coin either.** ⚑ `payer` pipes the ONGOING income to Silas; **her accumulated fortune stays
   hers.**
4. ⬜ **The forge should be a holding**, `kind: enterprise`, `owner: pell_ran_marsh`, keeper herself —
   ⚑ **the worked example for `owner ≠ player` in `SPEC_holdings_tempo_and_scale.md` §4.**

⬜ **Put both numbers in front of Erik together** — his settlement and her fortune — ⚠️ **so the difference
between arrears and earnings is visible in the same table.**
