# HANDOFF SNG-632 — Seven spectrum pushes dropped in Erik's save this morning, and the prompt is why

**Aevi (PO) → CCode · 2026-09-19 · from the dev report, not from a gate**

---

## §1 — ⛔ WHAT THE SAVE SAYS

`data/dev/report-player-s9z9u1-char-mrhs8286.json`, written 06:33 this morning. **Seven `axesDropped`, every one
refused as *not a number*:**

```
spectrumId = concrete_abstract      ×2
spectrumId = mechanical_spiritual   ×2
spectrumId = death_life             ×1
spectrumId = space_time             ×1
spectrumId = order_chaos            ×1
```

⚠️ **The key is literally `spectrumId` and the value is the axis name.** The model is filling the placeholder as
a field rather than substituting for it.

## §2 — ⛑ AND THE PROMPT INVITES IT

`gm.js:1230` — and read it beside its neighbours:

```
"attribute":    "physical|mental|social|practical"
"subAttribute": "strength|agility|reason|insight|presence|rapport|craft|wits"
"axes":         {"spectrumId": -1..1}
"difficulty":   "very easy|easy|normal|hard|very hard"
```

⛔ **EVERY OTHER CLOSED VOCABULARY ON THAT LINE IS ENUMERATED IN PLACE. The axes are the only one where the legal
values live 3 lines away** (`gm.js:1233`) and the slot itself shows a word that looks exactly like a field name.

⬜ **The ask is one line:** `"axes": {"chaos_order": -1..1}` — a real id in the example, so the shape is
unambiguous, the same way `attribute` shows real values rather than `"attributeId"`.

## §3 — ⚠️ AND TWO CORRECTIONS I OWE, BECAUSE I GOT THIS WRONG TWICE BEFORE CHECKING

**I said the GM had invented `space_time`.** It had not — `space_time` is in the offered list AND on 36
locations. ⛑ **I said `order_chaos` was the model constructing a name backwards.** It was not: **`order_chaos`
was in the authored world**, five locations and a craft, and the GM read it off the corpus correctly.

⛔ **THE REVERSED AXIS WAS MINE, NOT THE MODEL'S** — and `order_chaos` had **zero readers in the engine**, so
every value written under it was inert. Renamed to `chaos_order` across six files, **sign preserved**:
`poleIntensity` already derived `order` straight from it, so Plainstead's `0.25` always meant *mildly ordered*,
which is what a town of square stone on a swept grid should read as.

## §4 — ⬜ AND ONE FOR ERIK RATHER THAN EITHER OF US

The world carries **15** spectrum axes. The GM is offered **12**. After the rename, two are authored, unoffered
and unread:

- **`individual_collective`** — 15 files
- **`tradition_innovation`** — 8 files

⚠️ **These are not typos** — they are coherent axes with real content behind them, and they are invisible to
both the engine and the GM. **Either they are design awaiting implementation, or they are two more inert axes
like the one I just closed.** Erik's call, not a cleanup.

— Aevi, PO
