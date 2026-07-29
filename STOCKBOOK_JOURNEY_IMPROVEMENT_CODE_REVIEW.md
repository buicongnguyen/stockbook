# Stockbook Journey Improvement — Logic and Code Review

Date: 2026-07-30

## Review scope

This review covers:

- all 12 bilingual review guides;
- stage orientation and decision-readiness UI;
- process-versus-outcome classification;
- reveal and debrief feedback;
- mobile containment and pacing;
- bilingual links and number formatting;
- accessibility semantics;
- game content validation and unit tests; and
- GitHub Pages and connected Sites build compatibility.

## Review outcome

No unresolved P0 or P1 findings remain. The implementation preserves the
version 1 saved-state format and does not alter transaction, scoring,
progression, mastery, or campaign-unlock calculations.

## Findings and fixes

| Priority | Finding | Resolution |
| --- | --- | --- |
| P1 | The analysis grid used an intrinsic column wide enough for the 600 px chart, expanding the mobile scene to about 622 px and the body to about 638 px. | Added `minmax(0, 1fr)` containment at phase/grid boundaries, local chart scrolling, and explicit width constraints. Browser verification at a 390 px viewport reports document and body width of 375 px with no overflow. |
| P1 | Zero equity change used the `>= 0` branch and was called a capital increase. | Added a pure gain/flat/loss classifier with a half-cent tolerance and dedicated flat wording. |
| P1 | Stages did not provide retrieval support before the decision. | Added validated bilingual review guides for every stage and an optional native-details drawer in briefing and analysis. |
| P2 | Players could see a disabled commit button but not the missing requirements. | Added a checklist that directly mirrors evidence, timeframe, action, and conditional risk requirements. |
| P2 | Process quality and market outcome were displayed separately but their relationship was implicit. | Added a six-state process/outcome explanation for disciplined win, capital preserved, good loss, lucky win, weak flat, and costly lesson. |
| P2 | The flat outcome strip still displayed `+0.00` in positive styling. | Flat results now display `0.00` with neutral styling. |
| P2 | The revealed chart’s accessible caption still stated that the future candle was hidden. | The caption now switches between hidden and revealed states with matching English and Vietnamese copy. |
| P2 | The repeated analysis scene consumed most of a mobile viewport. | Analysis scenes are compact while briefing and travel retain the full journey scene. |
| P2 | Vietnamese cash sublabels were ungrouped and content links relied on implicit language state. | Cash now uses locale formatting and all game-to-book/framework links include the active language. |
| P2 | CSS list-style removal could weaken list semantics in some accessibility trees. | Added explicit list and list-item roles to stage progress and decision requirements. |
| P3 | The mobile topbar changed to 3vw padding while the navigation shell still compensated for 4vw, creating a small global overflow. | Matched the navigation-shell width and negative margin to the 3vw breakpoint. |

## Logic review

### Review guides

- Review content has no evidence IDs, weights, action scores, risk scores, or
  engine callbacks.
- Each scenario must provide one bilingual concept, exactly three bilingual
  memory rules, one bilingual trap, and a valid book chapter.
- Missing content fails `validateGameContent()` and the test suite.
- The drawer’s open state is not persisted, so it cannot invalidate old saves.

### Decision readiness

- The checklist derives from the same component values used by `canCommit`.
- It does not submit, normalize, or mutate a decision.
- Risk appears only after Risk Shield is unlocked and a buy/add action requires
  player-entered risk.
- Earlier starter protection remains automatic and is not shown as missing.
- The engine still rejects invalid phase, scenario, action, and duplicate
  resolution.

### Process and outcome

- `classifyCapitalChange()` reads only committed before/after equity.
- Changes smaller than half a cent are flat, matching two-decimal display
  precision.
- `classifyProcessOutcome()` uses a documented 75/100 threshold.
- The classifier cannot modify score, cash, positions, mastery, achievements,
  tools, attempts, or progression.
- Strong process plus loss is described as a good loss.
- Weak process plus gain is described as a lucky win.

### Saved-state compatibility

- `GAME_STORAGE_VERSION` remains 1.
- No new persisted field is required.
- Existing journey saves load without migration.
- Switching English and Vietnamese reuses the same state and scenario.

## Design and accessibility review

- Native `<details>` and `<summary>` provide disclosure behavior without custom
  JavaScript state.
- Stage progress exposes the current step with `aria-current="step"`.
- Decision completion uses text, icons, and state—not color alone.
- The process/outcome card uses definition-list semantics for its two axes.
- Chart descriptions now match hidden/revealed visual state.
- The chart remains horizontally scrollable and focusable on mobile.
- The campaign rail remains locally scrollable.
- The document itself has no horizontal scroll at 390 px.
- Vietnamese review copy, headings, market event text, and cash formatting were
  checked in the browser.
- English/Vietnamese switching was checked mid-stage without losing progress.
- No browser console warnings or errors were observed.

## Validation evidence

- `npm run lint`: passed
- `npm test`: passed, 19 tests
- `npm run pages`: passed
- `npm run build`: passed
- Live/local desktop interaction: passed
- Local 390 × 844 interaction: passed
- English/Vietnamese state preservation: passed
- Review drawer keyboard/click behavior: passed
- Mobile body and document overflow check: passed
- `git diff --check`: passed
- Secret/debug-marker scan: passed

## Non-blocking existing issue

Running standalone `tsc --noEmit` still reports the repository’s existing
Cloudflare ambient types in `db/index.ts` and `worker/index.ts`
(`cloudflare:workers`, `Fetcher`, and `D1Database`). No game or page TypeScript
errors remain, and the actual vinext production build succeeds.

## Final assessment

The release is logically safe and materially improves the learning loop:

`review → observe → decide → reveal → compare process with outcome → reflect`

It is ready to commit, push, and deploy after the final clean-tree and full-suite
check.
