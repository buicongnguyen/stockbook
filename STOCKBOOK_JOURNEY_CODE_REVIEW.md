# Stockbook Journey — Code Review

Review scope: game architecture, financial logic, scoring, persistence, curriculum, localization, accessibility, responsive design, existing-site integration, static export, and deployment readiness.

Review status: completed and remediated  
Open high-severity findings: none

## Findings and resolutions

| Priority | Finding | Risk | Resolution |
| --- | --- | --- | --- |
| P1 | The HUD marked open positions with the pre-reveal price after an outcome | Portfolio value could disagree with the revealed result | Reveal and debrief phases now mark the position with the revealed price |
| P1 | Campaign tabs could restart an active campaign without confirmation | A player could lose in-progress portfolio state accidentally | Campaign switching is disabled while a stage is active |
| P1 | The engine accepted a scenario object that did not match the saved campaign and stage | A caller could bypass the intended curriculum state | Scenario/campaign/stage matching is enforced before resolution |
| P1 | Stage advancement was callable outside the debrief phase | A caller could skip unresolved stages | The engine advances only from a completed debrief |
| P1 | Locked campaigns were protected only by the interface | Direct engine use could bypass progression | Campaign unlock rules now live in the shared engine and UI |
| P1 | Early stages graded detailed risk controls before the Risk Shield was unlocked | The journal credited a skill the player did not perform | Starter protection still caps risk, but the risk dimension is omitted until the tool is unlocked |
| P1 | Existing positions in Signal Alley had weak action rubrics at later stages | A player who bought earlier could not receive a high score for holding or adding appropriately | Action and discipline rubrics now account for both flat and invested states |
| P2 | Daily wording was used for fundamental scenarios with quarterly or multi-year horizons | The visualization could mix incompatible timeframes | Chart summaries now label daily and quarterly learning periods from scenario context |
| P2 | Rising and falling candles depended primarily on color | Low-vision and color-blind users could miss direction | Rising candles are hollow, falling candles are filled, and text summaries state direction |
| P2 | Phase changes did not move keyboard or screen-reader focus | The active content could be difficult to discover after a transition | Programmatic focus moves to the new phase surface |
| P2 | The complete game bundle loaded on every Stockbook page | Unrelated reading pages paid the game download cost | The game is lazy-loaded only when the Journey page is selected |
| P2 | Browser-storage writes could throw if storage was unavailable or full | Progress saving could crash the interaction | Storage writes fail safely without interrupting the game |
| P2 | Saved state allowed a campaign/stage combination that did not exist | Corrupt storage could restore an invalid route | State validation now verifies campaign, stage, phase, arrays, attempts, mastery, cash, and positions |
| P2 | Risk achievements could unlock before the risk curriculum | Progress labels could misstate mastery | Risk Keeper now requires the risk tool or a Risk Summit stage |
| P3 | The timeframe achievement listed in the plan was missing | The implemented reward set did not fully match the specification | Timeframe Keeper is now awarded for a strong, horizon-consistent decision |

## Financial and educational review

- Portfolio cash and share quantities cannot become negative.
- Buying is limited by both account risk and available cash.
- Selling and reducing are unavailable without a position.
- A committed attempt cannot be resolved twice.
- Player actions never alter future market prices.
- Process scoring uses evidence, action, timeframe, discipline, and applicable risk planning.
- Profit and loss do not change the decision-quality score.
- A disciplined stopped trade can score highly while losing.
- An unsupported rumor can rise while the decision to chase it scores poorly.
- Campaign bankrolls reset while durable mastery and tools persist.
- Daily, quarterly, and multi-year decisions are identified separately.
- Every scenario is synthetic and explicitly described as educational.

## Localization review

- All 12 scenarios have English and Vietnamese title, objective, event, evidence, lesson, outcome, and book-reference copy.
- Evidence and action IDs are language-neutral.
- Numeric market data and scoring rules are shared.
- Content validation rejects missing core translations.
- The existing Vietnamese-capable Source Serif assets remain in use.
- No malformed encoding marker was found in the game source.

## Accessibility and responsive review

- All primary actions have keyboard-operable native controls.
- Touch controls use at least 44-pixel target sizing.
- Programmatic focus follows phase changes.
- Status changes use a polite live region.
- Charts include an accessible title and text summary.
- Future data is labeled and remains visually hidden until commitment.
- Candle direction uses fill treatment as well as color.
- Chart containers are keyboard-focusable when horizontal scrolling is needed.
- Reduced-motion preferences disable journey animation.
- Mobile layouts stack decisions, metrics, scores, and outcomes without hiding actions.
- Risk choices always have button alternatives; no precision drag is required.

## Validation completed

- ESLint passes.
- The production build passes.
- All existing site tests pass.
- New engine, scoring, state, storage, and content tests pass.
- A pure-engine test completes all 12 stages in sequence with context-valid actions.
- Static GitHub Pages export passes.
- The game is emitted as a separate lazy-loaded client chunk.
- No whitespace error is reported by `git diff --check`.

## Known project-level note

Running TypeScript directly across the entire repository reports pre-existing Cloudflare worker ambient-type errors in `db/index.ts` and `worker/index.ts`. The new game files themselves pass the TypeScript check; the production build, lint, and automated test suite all pass.

