// engine/version.js — ONE SOURCE OF TRUTH FOR THE BUILD VERSION.
//
// ⛔ WHY IT IS ITS OWN MODULE. The version stamps four things that must agree or a returning player runs a mixture of two builds:
// `index.html`'s stylesheet and app.js query strings, the import map that versions all 111 engine modules, and the query the
// content loader puts on every authored file it fetches. It lived in app.js alone, so `state.js` — which loads the entire content
// pack — could not reach it, and app.js could not be reached by a generator without parsing it.
//
// ⚠️ MEASURED, NOT THEORISED: verifying v1.9.470 in the browser, the page fetched the new app.js and served a CACHED `quests.js`
// beside it — *"The requested module './quests.js' does not provide an export named 'creditQuestGiver'"* — and then, with the
// modules pinned, served a cached `tier_signals.json` so Dara read level 7 where the engine says 14. Two halves of one defect:
// the code and the content both have to be versioned, and app.js was already doing it for the five files it fetches itself.
//
// ⛑ BUMP IT HERE AND NOWHERE ELSE. `scripts/module_map.mjs` stamps index.html from this value and its `--check` fails the ship
// when they disagree.
export const APP_VERSION = "1.9.478";
