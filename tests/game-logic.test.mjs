import assert from "node:assert/strict";
import test from "node:test";
import { campaigns, scenarios } from "../app/game/game-data.js";
import {
  advanceStage,
  calculateDecisionScore,
  classifyCapitalChange,
  classifyProcessOutcome,
  createInitialGameState,
  createPortfolio,
  getPosition,
  isCampaignUnlocked,
  portfolioEquity,
  resolveDecision,
  selectCampaign,
  validActions,
  validateGameContent,
} from "../app/game/game-logic.js";
import { clearGameState, loadGameState, saveGameState } from "../app/game/game-storage.js";

function perfectDecision(scenario, action) {
  return {
    action,
    horizon: scenario.horizon,
    evidenceIds: scenario.evidence.filter((item) => item.relevant).map((item) => item.id),
    riskPct: 1,
    stopPrice: scenario.recommendedStop,
    riskEvaluated: scenario.stage >= 10,
  };
}

test("all bilingual game content is structurally valid", () => {
  assert.equal(campaigns.length, 4);
  assert.equal(scenarios.length, 12);
  assert.deepEqual(validateGameContent(), []);
  const practiceDrills = scenarios.flatMap((scenario) => scenario.practice);
  assert.equal(practiceDrills.length, 24);
  assert.equal(new Set(practiceDrills.map((drill) => drill.id)).size, 24);
  assert.ok(scenarios.every((scenario) => scenario.practice.length === 2));
  assert.ok(practiceDrills.every((drill) =>
    drill.prompt.en
    && drill.prompt.vi
    && drill.explanation.en
    && drill.explanation.vi
    && drill.options.length === 3
    && drill.options.filter((option) => option.correct).length === 1
    && drill.options.every((option) => option.label.en && option.label.vi)
  ));
  assert.ok(scenarios.every((scenario) =>
    scenario.review.remember.length === 3
    && scenario.review.remember.every((item) => item.en && item.vi)
  ));
});

test("capital and process outcomes remain independent", () => {
  assert.equal(classifyCapitalChange(10000, 10000), "flat");
  assert.equal(classifyCapitalChange(10000, 10000.01), "gain");
  assert.equal(classifyCapitalChange(10000, 9999.99), "loss");
  assert.deepEqual(classifyProcessOutcome(92, 10000, 9900), {
    process: "strong",
    market: "loss",
    key: "strong-loss",
  });
  assert.deepEqual(classifyProcessOutcome(52, 10000, 10100), {
    process: "weak",
    market: "gain",
    key: "weak-gain",
  });
});

test("valid actions follow the current position", () => {
  const portfolio = createPortfolio("signals");
  assert.deepEqual(validActions(portfolio, "AUR"), ["buy", "wait"]);
  portfolio.positions.AUR = { shares: 10, avgCost: 100 };
  assert.deepEqual(validActions(portfolio, "AUR"), ["add", "hold", "reduce", "sell"]);
});

test("a controlled buy cannot exceed cash or risk budget", () => {
  const scenario = scenarios.find((item) => item.id === "signal-breakout");
  const state = { ...createInitialGameState(), campaignId: "signals", stage: scenario.stage, phase: "analyze" };
  const result = resolveDecision(state, scenario, perfectDecision(scenario, "buy"));
  assert.equal(result.ok, true);
  assert.ok(result.transaction.sharesTraded > 0);
  assert.ok(result.state.portfolio.cash >= 0);
  assert.ok(getPosition(result.state.portfolio, "AUR").shares > 0);
});

test("buying with excessive risk lowers process quality even if the outcome rises", () => {
  const scenario = scenarios.find((item) => item.id === "signal-breakout");
  const disciplined = calculateDecisionScore(scenario, { ...perfectDecision(scenario, "buy"), riskEvaluated: true });
  const reckless = calculateDecisionScore(scenario, { ...perfectDecision(scenario, "buy"), riskPct: 3, riskEvaluated: true });
  assert.ok(disciplined.total > reckless.total);
  assert.equal(scenario.future.close > scenario.future.open, true);
});

test("starter protection is not graded before the Risk Shield is unlocked", () => {
  const scenario = scenarios.find((item) => item.id === "signal-support");
  const score = calculateDecisionScore(scenario, perfectDecision(scenario, "buy"));
  assert.equal("risk" in score.dimensions, false);
});

test("a disciplined stopped trade can score highly while losing money", () => {
  const scenario = scenarios.find((item) => item.id === "risk-sizing");
  const prior = scenarios.filter((item) => item.campaignId !== "risk").map((item) => item.id);
  const state = {
    ...createInitialGameState(),
    campaignId: "risk",
    stage: scenario.stage,
    phase: "analyze",
    portfolio: createPortfolio("risk"),
    completed: prior,
    unlockedTools: ["volume", "trend", "valuation", "risk"],
  };
  const result = resolveDecision(state, scenario, perfectDecision(scenario, "buy"));
  assert.equal(result.ok, true);
  assert.ok(result.score.total >= 90);
  assert.equal(result.transaction.stopped, true);
  assert.ok(result.state.portfolio.realizedPnl < 0);
  assert.equal(getPosition(result.state.portfolio, "SUM").shares, 0);
});

test("an unsupported rumor can rise without becoming a good buy decision", () => {
  const scenario = scenarios.find((item) => item.id === "risk-rumor");
  const waiting = calculateDecisionScore(scenario, perfectDecision(scenario, "wait"));
  const chasing = calculateDecisionScore(scenario, perfectDecision(scenario, "buy"));
  assert.equal(scenario.future.close > scenario.future.open, true);
  assert.ok(waiting.total > chasing.total);
});

test("resolving the same committed attempt twice is rejected", () => {
  const scenario = scenarios[0];
  const state = { ...createInitialGameState(), phase: "analyze" };
  const first = resolveDecision(state, scenario, perfectDecision(scenario, "wait"));
  assert.equal(first.ok, true);
  const second = resolveDecision(first.state, scenario, perfectDecision(scenario, "wait"));
  assert.equal(second.ok, false);
  assert.equal(second.error, "already-resolved");
});

test("campaign transitions reset money but preserve mastery and tools", () => {
  const scenario = scenarios.find((item) => item.id === "signal-breakout");
  let state = createInitialGameState();
  state = {
    ...state,
    stage: scenario.stage,
    mastery: { "signal-candle": 95 },
    unlockedTools: ["volume", "trend"],
    portfolio: { cash: 7300, positions: {}, realizedPnl: -200 },
    phase: "debrief",
  };
  const next = advanceStage(state);
  assert.equal(next.campaignId, "trend");
  assert.equal(next.portfolio.cash, 10000);
  assert.equal(next.mastery["signal-candle"], 95);
  assert.deepEqual(next.unlockedTools, ["volume", "trend"]);
});

test("portfolio equity marks open positions without mutating cash", () => {
  const portfolio = { cash: 5000, positions: { AUR: { shares: 20, avgCost: 100 } }, realizedPnl: 0 };
  assert.equal(portfolioEquity(portfolio, { AUR: 110 }), 7200);
  assert.equal(portfolio.cash, 5000);
});

test("locked campaigns and mismatched scenarios cannot bypass progression", () => {
  const initial = createInitialGameState();
  assert.equal(isCampaignUnlocked(initial, "trend"), false);
  assert.deepEqual(selectCampaign(initial, "trend"), initial);
  const analyzing = { ...initial, phase: "analyze" };
  const mismatched = scenarios.find((item) => item.id === "trend-ma20");
  const result = resolveDecision(analyzing, mismatched, perfectDecision(mismatched, "wait"));
  assert.equal(result.ok, false);
  assert.equal(result.error, "scenario-mismatch");
  assert.deepEqual(advanceStage(analyzing), analyzing);
});

test("all twelve stages can complete in sequence with context-valid actions", () => {
  const preferredActions = {
    "signal-candle": "wait",
    "signal-support": "buy",
    "signal-breakout": "add",
    "trend-ma20": "buy",
    "trend-regime": "sell",
    "trend-false-break": "wait",
    "business-peers": "buy",
    "business-peg": "hold",
    "business-trap": "sell",
    "risk-sizing": "buy",
    "risk-rumor": "wait",
    "risk-protect": "wait",
  };
  let state = selectCampaign(createInitialGameState(), "signals");
  state = { ...state, phase: "analyze" };

  for (const scenario of scenarios) {
    assert.equal(state.campaignId, scenario.campaignId);
    assert.equal(state.stage, scenario.stage);
    const action = preferredActions[scenario.id];
    assert.ok(validActions(state.portfolio, scenario.instrument).includes(action));
    const result = resolveDecision(state, scenario, perfectDecision(scenario, action));
    assert.equal(result.ok, true, scenario.id);
    assert.ok(result.score.total >= 80, `${scenario.id} scored ${result.score.total}`);
    state = advanceStage({ ...result.state, phase: "debrief" });
    if (state.phase !== "completed" && state.phase !== "map") state = { ...state, phase: "analyze" };
    if (state.phase === "map") state = { ...state, phase: "analyze" };
  }

  assert.equal(state.phase, "completed");
  assert.equal(state.completed.length, 12);
});

test("versioned storage saves valid progress and rejects malformed data", () => {
  const values = new Map();
  const storage = {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
    removeItem(key) { values.delete(key); },
  };
  const initial = createInitialGameState();
  const saved = saveGameState({ ...initial, mastery: { "signal-candle": 91 } }, storage);
  assert.ok(saved.savedAt);
  assert.equal(loadGameState(storage).mastery["signal-candle"], 91);

  storage.setItem("stockbook-journey-v1", JSON.stringify({ ...initial, campaignId: "signals", stage: 12 }));
  assert.deepEqual(loadGameState(storage), createInitialGameState());
  assert.deepEqual(clearGameState(storage), createInitialGameState());
});
