# Stockbook Journey — Product Evaluation and Improvement Plan

Date: 2026-07-30

## 1. Evaluation summary

The current Stockbook site has a distinctive editorial identity, clear bilingual
navigation, useful reference material, and a game whose scoring correctly
separates decision quality from profit. The game is already more educational
than a conventional price-prediction quiz because it asks the player to choose
evidence, timeframe, action, and risk before revealing the market.

The next release should improve memory, orientation, feedback accuracy, and
mobile pacing rather than add more market mechanics.

### What already works well

- The book, decision frameworks, tools, and game feel like one product.
- English and Vietnamese content use the same information architecture.
- The game uses synthetic scenarios and clearly states its educational purpose.
- Evidence, action, timeframe, and risk are graded independently.
- Wait and hold are meaningful choices.
- The outcome is hidden until the decision is committed.
- The Decision Journal explains the lesson and links back to the book.
- Keyboard focus, chart descriptions, reduced-motion behavior, and native
  controls provide a good accessibility baseline.
- No browser console errors were found during the live audit.

### Findings from the live audit

| Priority | Finding | Why it matters |
| --- | --- | --- |
| P1 | Every stage begins practice without a concise concept review. | A learner can recognize a term in the book yet fail to retrieve the rule while making a decision. |
| P1 | The mobile analysis layout expands to about 638 px inside a 375 px content area. | The scene and market event are clipped, and the user can lose context while scrolling. |
| P1 | A zero equity change is labelled “Capital increased this stage.” | The feedback is mathematically incorrect and weakens trust in the simulator. |
| P2 | The large journey scene repeats above every decision and consumes most of a mobile viewport. | The visual story is appealing, but the actual learning task is pushed too far down the page. |
| P2 | The disabled commit button does not summarize which decision inputs remain incomplete. | A new player may not know whether evidence, timeframe, action, or risk is missing. |
| P2 | The debrief shows process scores and P/L but does not explicitly name their relationship. | “Good loss” and “lucky win” are central lessons and should be immediately visible. |
| P2 | Vietnamese cash sublabels use ungrouped numbers, and game-to-book links do not always preserve language explicitly. | These are small inconsistencies in an otherwise strong bilingual experience. |
| P3 | The four campaign tabs are horizontally scrollable on mobile but have limited progress context inside a stage. | A compact stage-phase indicator would make the long interaction easier to understand. |

## 2. Recommended product changes

### A. Add a stage-specific review drawer

Every one of the 12 stages will include an expandable **Review the lesson**
drawer in English and Vietnamese. It will contain:

- the concept in one sentence;
- three short rules to remember;
- one common trap;
- a link to the relevant book chapter; and
- an explicit note that the review teaches the method without revealing the
  correct action.

The drawer will be available in both the stage briefing and analysis screen.
It will be collapsed by default so experienced players can continue quickly.

### B. Add stage-phase orientation

A compact four-step indicator will map the current interaction:

1. Observe
2. Decide
3. Outcome
4. Review

This is presentation state derived from the existing game phase. It will not be
stored and cannot diverge from saved progress.

### C. Make decision completion visible

The analysis screen will show a small completion checklist for:

- evidence;
- timeframe;
- action; and
- risk plan, only when risk input is required.

The commit button remains protected by the existing validation, but the player
can see exactly what is missing.

### D. Teach the process/outcome matrix

The reveal and debrief screens will classify the result using two independent
axes:

- process quality: disciplined or needs work; and
- market result: gain, flat, or loss.

Examples include **Disciplined win**, **Good loss**, **Capital preserved**, and
**Lucky win**. This label is explanatory only; it must not change scoring,
portfolio math, unlocks, or progression.

### E. Repair mobile containment and shorten the path to the decision

- Constrain the phase surface, analysis grid, chart, and scene to the viewport.
- Keep horizontal scrolling inside the chart and campaign rail only.
- Use a compact scene on analysis screens while preserving the larger scene
  during briefing and travel.
- Keep the decision-completion summary and commit action visible and readable
  on narrow screens.
- Preserve the existing desktop editorial composition.

### F. Finish bilingual and navigation consistency

- Format Vietnamese and English cash values with their locale.
- Preserve the active language in book and framework links.
- Add bilingual accessible labels to the new review and progress UI.
- Ensure the new copy uses natural Vietnamese financial terminology.

## 3. Scope boundaries

This release will not add:

- live prices, broker connections, or third-party APIs;
- user accounts or cloud synchronization;
- public leaderboards;
- new campaigns beyond the existing 12 stages;
- an answer-revealing hint system;
- random outcomes; or
- financial recommendations.

These boundaries keep the release focused on learning quality and reliability.

## 4. Implementation phases

### Phase 1 — Learning review model and content

- [x] Extend the scenario model with a bilingual review guide.
- [x] Author concept, memory rules, common trap, and book chapter for all 12
  stages.
- [x] Validate that every guide has complete English and Vietnamese content.
- [x] Add tests that reject missing or incomplete review content.

**Phase logic check**

- Review text explains general principles and does not identify the scenario’s
  preferred action or relevant evidence IDs.
- The content is static educational material and cannot influence scoring.
- Chapter numbers are data, not conditionals inferred from campaign names.

### Phase 2 — Review drawer and stage orientation

- [x] Build a reusable native-details review drawer.
- [x] Display it in stage briefing and analysis.
- [x] Add the four-step stage-phase indicator.
- [x] Preserve keyboard navigation and visible focus.

**Phase logic check**

- The current step is derived solely from `state.phase`.
- Opening or closing a drawer does not enter saved game state.
- Language changes re-render the same stage and do not reset progress.

### Phase 3 — Decision guidance

- [x] Add an input-completion checklist.
- [x] Include risk only when the stage actually requires player-entered risk.
- [x] Keep engine validation as the source of truth for committing decisions.
- [x] Announce missing requirements without revealing the recommended action.

**Phase logic check**

- The checklist mirrors `canCommit`; it does not create a second validation
  path.
- Starter risk before Risk Shield remains automatic and is not shown as an
  incomplete input.
- A decision still cannot be committed twice.

### Phase 4 — Outcome and debrief clarity

- [x] Add a pure gain/flat/loss classifier with a stable numerical tolerance.
- [x] Add a process/outcome classification based on the committed score.
- [x] Correct flat-capital wording.
- [x] Show an explanatory process/outcome card in reveal and debrief.
- [x] Add unit tests for good loss, disciplined win, lucky win, and flat capital.

**Phase logic check**

- Classification is read-only presentation derived from the committed result.
- The process threshold is fixed and documented.
- A profitable weak decision is never described as disciplined.
- A losing strong decision is never described as a failure.

### Phase 5 — Responsive pacing and bilingual polish

- [x] Remove mobile horizontal page overflow.
- [x] Keep chart and campaign rail overflow locally scrollable.
- [x] Compress the repeated analysis scene on desktop and mobile.
- [x] Format cash sublabels by locale.
- [x] Preserve language in all game-to-content links.
- [x] Review Vietnamese line wrapping and terminology.

**Phase logic check**

- Responsive changes do not remove information or controls.
- The chart remains horizontally scrollable rather than being illegibly scaled.
- Compact scenes retain the traveler, campaign, stage, and instrument context.

### Phase 6 — Final review and validation

- [x] Run unit, rendered-content, build, export, and lint checks.
- [x] Exercise the game in English and Vietnamese.
- [x] Test desktop and 390 px mobile layouts.
- [x] Check keyboard focus, disabled/selected states, and reduced-motion behavior.
- [x] Inspect the final diff for unintended files or secrets.
- [x] Record code-review findings and fixes.

### Phase 7 — Release

- [x] Commit the exact validated source with a detailed message.
- [x] Push through the configured GitHub SSH remote.
- [x] Deploy the same commit to the connected Sites project.
- [x] Verify GitHub Pages and Sites production status.

## 5. Overall plan logic review

### State and progression

The proposal does not change the saved-state schema or portfolio engine. Review
drawers are local browser disclosure state, the phase indicator is derived, and
outcome labels are derived from the immutable committed result. Existing saves
remain compatible.

### Scoring integrity

No review content contains action answers. The scoring engine remains the only
authority for evidence, action, risk, timeframe, discipline, mastery, and
achievements. The new result classification consumes the score but cannot
modify it.

### Learning design

The sequence supports retrieval practice:

`review principle → inspect evidence → commit decision → observe outcome → compare process with outcome`

The drawer is optional, so it helps novices without forcing experienced users
through extra screens. The process/outcome card reinforces the book’s central
lesson that one profitable trade does not prove a good process and one losing
trade does not prove a bad process.

### Mobile behavior

The repair contains intrinsic widths at the phase and chart boundaries. Only
the chart and campaign rail may scroll horizontally. The document itself must
not become wider than the viewport.

### Accessibility

Native `<details>` and `<summary>` provide keyboard and screen-reader behavior
without custom disclosure state. The phase indicator uses list semantics and
`aria-current`. Completion requirements are text, not color alone.

### Failure and compatibility analysis

- Missing review data will fail validation and tests.
- Existing local saves do not need migration because no persisted field changes.
- If browser storage is unavailable, the existing in-memory fallback remains.
- If CSS container queries or newer layout features are unavailable, the plan
  relies only on existing media-query support.
- The GitHub Pages static export and the connected Cloudflare-compatible build
  use the same source and must both pass before release.

## 6. Acceptance criteria

The release is complete when:

- all 12 stages expose accurate bilingual review drawers;
- no review drawer reveals the preferred action;
- the current stage phase is always clear;
- incomplete decision requirements are visible;
- zero equity change is described as flat or preserved, never as an increase;
- good losses and lucky wins are explicitly distinguished;
- the 390 px mobile document has no horizontal page overflow;
- the decision screen reaches its learning content faster;
- language-specific links and number formatting remain consistent;
- all automated and browser checks pass;
- the reviewed source is committed, pushed through SSH, and deployed.
