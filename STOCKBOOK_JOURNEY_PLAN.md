# Stockbook Journey — Implementation Plan

Status: approved for implementation  
Product: bilingual Stockbook learning game  
Languages: English and Vietnamese  
Delivery: existing responsive Stockbook website, GitHub Pages, and Sites hosting

## 1. Product objective

Stockbook Journey is a short, story-led market simulator that teaches investors how to analyze evidence, control risk, and make disciplined decisions.

The player is a traveler moving through a changing market landscape. The traveler carries:

- a **Capital Bag**, representing cash and current investments; and
- a **Decision Journal**, representing durable knowledge, discipline, and skill mastery.

Market profit and educational mastery are deliberately separate. A disciplined decision can lose money, while an impulsive decision can temporarily make money. The game must explain that distinction after every stage.

The game is educational only. It must not provide personalized investment advice, recommend current securities, imply guaranteed returns, or encourage frequent trading.

## 2. Design principles

1. **Process before profit** — Educational scoring uses only information available when the player makes the decision.
2. **Waiting is a decision** — `Wait` and `Hold` must be useful, scoreable actions.
3. **Timeframes stay explicit** — Daily chart signals, quarterly fundamentals, and multi-year valuation are never presented as if they share the same clock.
4. **Market outcomes remain independent** — Player actions affect the portfolio and narrative response, never future market prices.
5. **Risk is part of the decision** — Buying or adding requires a valid size and risk plan in advanced stages.
6. **No irreversible learning failure** — A poor portfolio result cannot lock the player out of lessons.
7. **Progress is functional** — Unlocks provide useful analysis tools rather than random rewards.
8. **Bilingual logic is shared** — Prices, scoring, state, and scenario IDs are language-neutral; only copy is localized.
9. **Accessible by default** — Keyboard, touch, reduced motion, text summaries, and non-color-only signals are required.
10. **Small, deterministic MVP** — Authored scenarios and local progress precede live APIs, accounts, social rankings, or procedural markets.

## 3. Player experience

### 3.1 World and progression

The journey contains four regions:

1. **Signal Alley / Phố Tín Hiệu**
2. **Trend Bridge / Cầu Xu Hướng**
3. **Business Quarter / Khu Doanh Nghiệp**
4. **Risk Summit / Đỉnh Quản Trị Rủi Ro**

The market is represented through moving scenery, changing weather, crowds, price signposts, and event cards. Travel animation is short, decorative, skippable, and paused during analysis.

The player unlocks these functional tools:

| Tool | Learning function |
| --- | --- |
| Volume Lens | Reveals volume and unusual activity |
| Trend Compass | Enables MA20, MA50, and MA200 overlays |
| Valuation Ledger | Opens P/E, PEG, ROE, cash-flow, and debt comparisons |
| Risk Shield | Enables position sizing, stop, and reward-to-risk planning |
| Decision Journal | Records attempts, mastery, strengths, and weak skills |

### 3.2 Stage loop

1. Show the journey map and next learning objective.
2. Play a three-to-five-second travel transition, or skip it.
3. Pause at a market event.
4. State the timeframe and information cutoff.
5. Let the player inspect the chart, metrics, and available news.
6. Ask the player to identify the strongest evidence.
7. Offer actions valid for the current position.
8. If exposure changes, collect the position-size and risk plan.
9. Commit the decision.
10. Reveal the predetermined market outcome.
11. Update cash, shares, realized profit/loss, and total equity.
12. Score the decision process independently from profit.
13. Explain the result and link to the related book lesson.
14. Save progress and continue.

### 3.3 Valid actions

| Position state | Valid actions |
| --- | --- |
| No position | Buy, Wait |
| Existing long position | Add, Hold, Reduce, Sell |

The MVP excludes short selling, leverage, margin, options, real money, and broker integration.

## 4. Curriculum and scenarios

Each campaign has its own practice bankroll. Mastery persists globally, but money resets at the beginning of each campaign. This keeps unrelated lesson outcomes from blocking progression.

### Campaign 1 — Signal Alley

| Stage | Interaction | Learning objective |
| --- | --- | --- |
| 1. The First Candle | Identify body, wick, open, and close | A candle describes one period; it does not guarantee the next |
| 2. The Price Floor | Select a support zone | Support is a zone supported by repeated behavior, not an exact magic line |
| 3. The Noisy Breakout | Rank breakout evidence and Buy or Wait | Volume and close quality help confirm or weaken a breakout |

Unlock: Volume Lens

### Campaign 2 — Trend Bridge

| Stage | Interaction | Learning objective |
| --- | --- | --- |
| 4. Follow the Road | Read price around MA20 | Moving averages require trend and timeframe context |
| 5. Three Moving Paths | Classify price versus MA20/50/200 | Short-, medium-, and long-term regimes can disagree |
| 6. The False Bridge | Plan around a breakout and invalidation | Confirmation and an exit condition matter more than prediction |

Unlock: Trend Compass

### Campaign 3 — Business Quarter

| Stage | Interaction | Learning objective |
| --- | --- | --- |
| 7. Cheap Compared With What? | Compare same-sector companies | P/E comparisons across unrelated industries are misleading |
| 8. The Expensive Grower | Balance P/E and growth | PEG adds context but cannot replace business analysis |
| 9. The Value Trap | Inspect ROE, cash flow, debt, and earnings | Low P/E can hide a deteriorating company |

Unlock: Valuation Ledger

### Campaign 4 — Risk Summit

| Stage | Interaction | Learning objective |
| --- | --- | --- |
| 10. Cross the Risk Gap | Choose entry, stop, and size | Position size follows account risk, not conviction alone |
| 11. The Rumor Crowd | Evaluate an unsupported rumor | FOMO and popularity are not evidence |
| 12. Protect the Bag | Combine trend, fundamentals, and risk | A complete decision includes invalidation and review |

Unlock: Risk Shield and completed Decision Journal

### 4.1 Mirror-outcome requirement

The curriculum must include:

- one disciplined decision that makes money;
- one disciplined decision that loses within its planned risk;
- one impulsive decision that loses; and
- one impulsive decision that happens to make money.

The decision score must remain consistent with the quality of the process, not the result.

## 5. Financial model

### 5.1 Portfolio invariants

- Cash cannot become negative.
- Share quantity cannot become negative.
- The player cannot buy more than available cash permits.
- The player cannot sell more shares than currently owned.
- Waiting and holding create no transaction.
- A committed decision can resolve only once.
- Every scenario outcome is deterministic.

### 5.2 Core formulas

```text
total equity = cash + sum(shares × current price)

risk budget = total equity × risk percentage

risk per share = entry price − stop price

risk-sized shares = floor(risk budget ÷ risk per share)

affordable shares = floor(cash ÷ execution price)

maximum shares = min(risk-sized shares, affordable shares)
```

### 5.3 Timing

Normal daily scenarios show information through Day T's close. A market decision executes at Day T+1's open unless the scenario explicitly defines a conditional breakout trigger.

The content validator must reject a bar in which stop and target are both touched when the intraday ordering is unknown.

## 6. Decision scoring

The educational score is calculated from:

| Dimension | Weight |
| --- | ---: |
| Relevant evidence | 30 |
| Context-appropriate action | 25 |
| Position size and risk plan | 25 |
| Timeframe consistency | 10 |
| Discipline and rule compliance | 10 |

Inapplicable dimensions are removed and the score is normalized to 100.

Scenario rubrics may accept more than one defensible action. Selecting every evidence option must not produce a perfect score; distractors reduce evidence quality.

Profit, loss, speed, trade count, and animation use do not affect mastery.

## 7. Engagement without harmful gamification

The game may reward:

- identifying strong evidence;
- waiting when evidence is weak;
- following a predefined exit;
- keeping account risk within limits;
- rejecting rumors;
- respecting the chosen timeframe; and
- improving a previous decision score.

The game must not use:

- confetti after a trade;
- slot-machine sounds;
- random reward boxes;
- calendar streak pressure;
- rewards based on trade count;
- public profit leaderboards;
- urgency notifications; or
- claims that a chart pattern predicts a guaranteed result.

Achievements are skill labels such as Patient Observer, Risk Keeper, Evidence First, Calm Exit, and Timeframe Keeper.

## 8. State model

The local saved state contains:

```text
schema version
active campaign
active stage
current game phase
cash
positions
committed decision
resolved attempt IDs
completed scenario IDs
mastery by skill
unlocked tools
language-neutral settings
last saved time
```

The game phases are:

```text
map → briefing → travel → analyze → decide → risk-plan
→ committed → reveal → debrief → completed
```

Only valid transitions are allowed. Storage is validated and versioned. Invalid storage resets safely. Language and theme switches preserve the active attempt.

## 9. Bilingual content model

Scenario data is split into:

- language-neutral market data and scoring rules;
- English copy; and
- Vietnamese copy.

Automated validation requires:

- identical scenario IDs;
- identical evidence IDs;
- identical action rubric IDs;
- identical book-reference IDs; and
- complete English and Vietnamese text for every user-visible field.

Vietnamese copy must use the website's Vietnamese-capable font and be visually checked for diacritics, overflow, and line wrapping.

## 10. Responsive and accessible behavior

### Desktop

- Landscape journey scene with the traveler held near the left side.
- Portfolio and mastery HUD above the scene.
- Chart and evidence panel side by side where space permits.
- Decision controls below the evidence.

### Mobile

- Compact HUD.
- Short journey scene.
- Chart below the scene.
- Expandable evidence cards.
- Full-width decision controls.
- No precision-only drag requirement; numeric or button alternatives are provided.

### Accessibility

- Minimum 44-pixel touch targets.
- Keyboard-operable controls.
- Visible focus states.
- Reduced-motion mode.
- Text summaries for charts.
- Candles distinguished by direction labels and shape as well as color.
- Status announcements for committed decisions and revealed results.
- No sound required to understand the game.

## 11. Source structure

```text
app/game/
  StockJourneyGame.tsx
  GameChart.tsx
  GameScene.tsx
  DecisionPanel.tsx
  game-data.js
  game-logic.js
  game-storage.js
  game.module.css

tests/
  game-logic.test.mjs
  game-content.test.mjs
```

The game is integrated as the existing site's `game` page without a broad refactor of unrelated pages. Progress uses browser storage; no database, authentication, or live market API is required.

## 12. Implementation phases

### Phase 1 — Specification and integration contract

- [x] Record the approved plan.
- [x] Add the `game` page ID and bilingual navigation.
- [x] Add the isolated game module shell.
- [x] Preserve language, theme, and static navigation behavior.

Exit criteria: the empty game surface renders in both languages without breaking existing pages.

### Phase 2 — Data, financial engine, scoring, and persistence

- [x] Define the 12 language-neutral scenarios.
- [x] Define complete English and Vietnamese content.
- [x] Implement portfolio transitions.
- [x] Implement process scoring.
- [x] Implement state-machine guards.
- [x] Implement versioned local persistence.
- [x] Add financial and content-validation tests.

Exit criteria: no valid sequence can create negative cash, negative shares, future-data scoring, duplicate resolution, or missing translation.

### Phase 3 — Three-stage Signal Alley vertical slice

- [x] Build the journey scene and HUD.
- [x] Build chart and evidence interactions.
- [x] Build valid actions and decision commitment.
- [x] Build reveal, portfolio update, and debrief.
- [x] Build tool unlock and progress map.
- [x] Complete stages 1–3.

Exit criteria: Campaign 1 is fully playable in English and Vietnamese on desktop and mobile.

### Phase 4 — Full curriculum

- [x] Complete Trend Bridge.
- [x] Complete Business Quarter.
- [x] Complete Risk Summit.
- [x] Add mirror outcomes.
- [x] Add achievements and mastery summaries.
- [x] Add replay and reset controls.

Exit criteria: all 12 stages are playable, explainable, replayable, and deterministic.

### Phase 5 — Quality and accessibility

- [x] Validate responsive layout.
- [x] Validate keyboard and touch use.
- [x] Validate reduced motion.
- [x] Validate chart text alternatives.
- [x] Validate bilingual typography and overflow.
- [x] Validate save/resume and language switching.
- [x] Run all existing and new automated checks.

Exit criteria: no critical accessibility, financial, navigation, persistence, or responsive defect remains.

### Phase 6 — Independent review and remediation

- [x] Review architecture and separation of concerns.
- [x] Review financial invariants and scoring.
- [x] Review educational claims and timeframes.
- [x] Review interaction design and ethical rewards.
- [x] Review localization and accessibility.
- [x] Fix every confirmed finding.
- [x] Run final regression validation.

Exit criteria: review findings are resolved or explicitly documented as deferred, with no high-severity issue remaining.

### Phase 7 — Publish

- [x] Inspect the final diff and intended commit scope.
- [x] Commit with a detailed message.
- [x] Push the completed source.
- [x] Deploy the exact validated version.
- [x] Verify the deployment reaches a successful state.

## 13. Release acceptance criteria

The implementation is complete when:

- all 12 stages work in English and Vietnamese;
- process scoring is independent from portfolio outcome;
- at least one losing good decision and one profitable bad decision are demonstrated;
- `Wait` and `Hold` are meaningful actions;
- no calculation permits impossible cash or share states;
- reload and language switching preserve a committed attempt;
- all chart interactions have an accessible alternative;
- mobile and desktop layouts remain usable;
- existing Stockbook pages and calculators continue to work;
- automated tests, build, and static export pass;
- code review findings are fixed;
- the final source is committed and pushed; and
- the validated site is deployed successfully.

## 14. Deferred features

These are intentionally outside the first release:

- live prices and broker APIs;
- real-money trading;
- accounts and cross-device synchronization;
- public leaderboards;
- social trading;
- leverage, short selling, and options;
- procedurally generated markets;
- personalized recommendations; and
- AI-generated trade advice.
