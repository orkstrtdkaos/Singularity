# CCode → Aevi — the work order, group 2: all seven · v2.16.0

*2026-09-30. **All seven items are built**, driven in the browser on Erik's own save at 1440px, and gated (§398, §399,
§400, §401). 32/32 suites green, 4,278 checks. The version went to **2.16.0** — the minor moves on the fifth new feature
since 2.15.0, per Erik's rule. One question for you at the end.*

---

## 1 + 5 — one page width

**Measured before touching anything, in the browser:** **51 screen roots across seventeen widths**, from 520 to 1180
pixels, **forty-six of them written inline** as `style="max-width:Npx"`. The nine character tabs alone spanned five:

| | |
|---|---|
| Holdings, Party | 1100 |
| Legion | 980 |
| Jobs | 820 |
| **Bands**, Traits | **760** |
| Chronicle, News | 680 |

That is Erik's *"Bands narrower than Holdings"* exactly — 760 against 1100. And `renderCreate` used **six** widths inside
one flow (660 / 640 / 640 / 620 / 620 / 600 / 560).

**The two roles were already in the CSS and only the numbers were loose** — `.screen` is a card, `.screen-ground` is a
page — so the token went on those two classes and every inline number came out. All nine tabs now measure 1068 with no
side-scroll. There is a **ratchet**: no screen root may carry its width inline again, because a number written at the
call site is a number that drifts, which is how seventeen of them happened.

**The landing screen** was his other half: the hero banner ran to 760 and the player card inside it stopped at **540** —
a 220px step on a single screen. They share one declaration now. The what's-new banner was pinned at 640 under a
1100-wide page; it is the page's width, measured at 1068 against 1068.

⚠️ **One thing that nearly got away.** My sweep's population was `app.js`, and **The World tab paints from its own
module** (`engine/worldtab.js`). It sat at 680 while the other eight moved, and the first "after" measurement I took was
also half-stale — the browser was serving the cached stylesheet, so my numbers came from the old CSS with the new
markup. The ratchet now covers `engine/` too.

## 6 — the hold is a page

It was `.item-detail-modal` — a fixed full-screen overlay — around a sheet capped at **560px**, so six tabs of controls
were read through a letterbox half the page wide. It is a page at the board's width now (**1068**, was 560), in flow,
with *"← All your holdings"* where the ✕ was. All six tabs and every pane are untouched; I drove all six and every
control, and nothing closes under the player's hand.

⛔ **The click-outside-to-close handler went with the backdrop, and had to.** On a page there is no outside — that
handler would have fired on the page's own empty space, which is last week's *"it kicks me back out to the screen behind
it"* re-created by geometry instead of by state.

## 11 — Capacity and Personnel on Party

Moved off Holdings (a page about places) onto Party (a page about people), composed once. And the reword, on his save:

> **At your side** — 3 with you · 6 can stand forward
> **Running things for you** — 3 of 3 · full

*"8 of 3 · full"* was a **true number under a false label**: since CCODE-555 the cap governs forward places, not how many
may travel with you. So it is a second wording, not a replacement — *"Running things for you"* keeps `used of total`,
where the cap really is a ceiling.

## 2 — the abilities panel

**Measured on Erik's save: the list was 7,433px tall in a 900px window.** It has its own scroll at `min(58vh, 640px)`
with sticky group headings — viewport-tied, because a panel pinned at a fixed pixel height is a panel that is wrong on
every screen but the one it was measured on. Below 800px it is a plain block again; a phone has no room to give one
panel 58vh.

## 14 — the Work tab

The tab and the page read **Work**. ⚠️ The **key** stays `jobs` — it is state (the router, every alert that routes by
it) and the label is not, which is the same line the Attack & Defense rename drew.

A charge now reads in three places and is **one record**: on the Work tab where it is given, on the **person's card**
under *"What they are doing for you"*, and — when it names one of your holds — on **that hold** in *Who does what here*.
The gate drives the store and both readers and requires all three to agree, because two copies of one fact is how *"the
legs are being built but no one is at it"* happened in the first place.

## 7 — the Build tab, in one order

**Measured: the pane stated its spots three ways.** A room bar saying *"2 of 2 places taken"*; four blocks below it a
dots line saying *"2 of 2 feature spots — a post on legs · full"*; and the clearing quote's own sentence opening by
restating them again. A loose craft-picker sat in the gap between the first two. **That is what "scattered" means in
practice.** It now reads, once, in your order:

> **ROOM** ●●●●●●● 7 of 7 places taken — a hamlet. Clearing ground adds one more. *Clear a new spot — 18 raw material, ~4 passes with 1 hand*
> *Threshold Post has filled its room and thrived — it could be a village, with 4 more rooms.* **[Name it a village]**
> **PRODUCTION — WHAT THE HOLD MAKES** …

⚠️ The promotion offer and the full-hold refusal lived on the retired block **and nowhere else**, so they came across by
name rather than going with it.

---

## ⛑ Three ways I broke it, all found by driving the real screen

None of these was caught by 32 green suites, and I think that is the useful part of this report:

1. **A temporal dead zone I shipped one version ago.** Item 14's `charged14` was *used* on the line that builds the job
   rows and *declared* six lines below it, so *Who does what here* threw and the whole Build tab rendered blank.
   `node --check` parses it, the scope scan sees a name declared in an enclosing scope, and every suite stayed green —
   because **none of them renders that pane.**
2. **A moved control that left its computation behind.** Moving the craft picker put it in a scope where the nearest
   `crafts` is a joined *string* of `<option>` tags — whose own filter reads `a.id` where an ability record carries
   `abilityId`, so it is empty for every character alive. `crafts.length` was 0, the control rendered **never**, and
   nothing threw. A dead door that looked exactly like a working one.
3. **A measurement taken against a cached stylesheet**, reported above.

§400 gates the first two as claims: every name the job list reads is declared before the line that reads it, and the
craft picker carries its own list.

---

## ⬜ One question, and it is yours

**Item 7: "the craft picker moves onto the feature it applies to."** I could not make this one safely, because
`improveHolding(character, holdId, abilityId)` applies a craft to **the place** — it raises the hold a rung, once per
craft — not to a feature. So there are two readings:

- **(a)** you mean the *Build form's* craft select (*"which of your crafts raised it"*), which is a property of the
  feature being built, and should follow the feature choice rather than sit beside it as a third dropdown; or
- **(b)** you want `improveHolding` to become per-feature, which is a rules change and Erik's to rule.

I have put "Put a craft to it" **with the Build form** — both are things you do to the place — and left the mechanism
alone. Say which you meant and it is a small change either way.

## 3 — the peoples beside the wheel

⚠️ **Measured first, and your grouping does not group.** There are **24 stations and 24 poles — one each** — so "peoples
grouped by pole" gives 24 groups of one, which is the flat list it was meant to replace. Two things in the content really
do group: the wheel's own **twelve axes** (`axisPoles`: dark_light, death_life, violence_peace…), each pairing two
*opposed* poles, which is the circle's own geometry; and **fourteen domains** (Mind, Body, Light, Dark…). **I grouped by
axis** — say the word and it is one line to domains.

The wheel carries the peoples down its side: each row shows how many crafts that people holds, how many are yours (bold)
and how many you could take now (italic); an antipode is struck through with the reason on it. Tap one and the wheel
holds it — through `wheelSelTrads`, the same set the wheel's own chips use, so the sidebar and the circle are one
selection. The counts come from the wheel's own model, so the list and the nodes cannot disagree about what is reachable.

It browses with no points and **says why** rather than looking broken. The abilities panel keeps one line:

> **2 skill points** to spend · *Open the wheel* · *Level Up*

⚠️ **Level Up survived on purpose.** It is not the same act as browsing — it banks points and can widen capacity — so
it sits beside the new door rather than being replaced by it.

Driven on Erik's save at 1440px: 12 axes, 24 peoples, 3 his, 2 struck through, a 236px sidebar beside an 820px wheel, no
side-scroll, no errors; tap holds, tap again releases, and the sidebar survives the re-render.

## What is left

⬜ **Item 10** (group 3) — hands as individual person-rows. Not started, and per your own note I will **measure first**:
which readers take a hand *count* today, and you get that list before the record changes.

Then the 09-29 tail, then the map.

⬜ **Still with you or Erik**, unchanged: the road-hazard escort-wipe inversion and the peoples half of gate stigma
(Erik), which power verb takes a gate (you), whether an inherited or granted feature should be refused by the frame rule
as a built one now is (from this morning's item 9), whether Patrolling should merge like Guarding did, and C2's
`trading_post`-vs-`draws` call.

— CCode
