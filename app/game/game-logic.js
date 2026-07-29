import { campaigns, horizons, scenarios } from "./game-data.js";

export const GAME_STORAGE_VERSION = 1;
export const GAME_STORAGE_KEY = "stockbook-journey-v1";
export const riskChoices = Object.freeze([0.5, 1, 3]);

const roundMoney = (value) => Number(value.toFixed(2));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function createPortfolio(campaignId) {
  const campaign = campaigns.find((item) => item.id === campaignId) ?? campaigns[0];
  return { cash: campaign.startCash, positions: {}, realizedPnl: 0 };
}

export function createInitialGameState() {
  return {
    version: GAME_STORAGE_VERSION,
    phase: "map",
    campaignId: campaigns[0].id,
    stage: 1,
    portfolio: createPortfolio(campaigns[0].id),
    completed: [],
    attempts: {},
    mastery: {},
    unlockedTools: [],
    achievements: [],
    reducedMotion: false,
    savedAt: null,
  };
}

export function isValidGameState(value) {
  if (!value || typeof value !== "object" || value.version !== GAME_STORAGE_VERSION) return false;
  if (!campaigns.some((campaign) => campaign.id === value.campaignId)) return false;
  if (!Number.isInteger(value.stage) || value.stage < 1 || value.stage > scenarios.length) return false;
  if (!scenarios.some((scenario) => scenario.campaignId === value.campaignId && scenario.stage === value.stage)) return false;
  if (!["map", "briefing", "travel", "analyze", "reveal", "debrief", "completed"].includes(value.phase)) return false;
  if (!value.portfolio || !Number.isFinite(value.portfolio.cash) || value.portfolio.cash < 0) return false;
  if (!value.portfolio.positions || typeof value.portfolio.positions !== "object") return false;
  if (!Array.isArray(value.completed) || !Array.isArray(value.unlockedTools) || !Array.isArray(value.achievements)) return false;
  if (!value.attempts || typeof value.attempts !== "object" || !value.mastery || typeof value.mastery !== "object") return false;
  return Object.values(value.portfolio.positions).every((position) =>
    position
    && Number.isInteger(position.shares)
    && position.shares >= 0
    && Number.isFinite(position.avgCost)
    && position.avgCost >= 0
  );
}

export function getScenario(state) {
  return scenarios.find((scenario) =>
    scenario.campaignId === state.campaignId && scenario.stage === state.stage
  ) ?? scenarios[0];
}

export function getPosition(portfolio, instrument) {
  return portfolio.positions[instrument] ?? { shares: 0, avgCost: 0 };
}

export function validActions(portfolio, instrument) {
  const position = getPosition(portfolio, instrument);
  return position.shares > 0 ? ["add", "hold", "reduce", "sell"] : ["buy", "wait"];
}

export function portfolioEquity(portfolio, marks = {}) {
  const positionsValue = Object.entries(portfolio.positions).reduce(
    (sum, [symbol, position]) => sum + position.shares * (marks[symbol] ?? position.avgCost),
    0,
  );
  return roundMoney(portfolio.cash + positionsValue);
}

function scoreEvidence(scenario, selectedEvidence) {
  const selected = new Set(selectedEvidence);
  const relevant = scenario.evidence.filter((item) => item.relevant);
  const totalWeight = relevant.reduce((sum, item) => sum + item.weight, 0);
  const earned = relevant
    .filter((item) => selected.has(item.id))
    .reduce((sum, item) => sum + item.weight, 0);
  const distractorPenalty = scenario.evidence
    .filter((item) => !item.relevant && selected.has(item.id))
    .reduce((sum, item) => sum + item.weight * 12, 0);
  return clamp(totalWeight > 0 ? earned / totalWeight * 100 - distractorPenalty : 0, 0, 100);
}

function scoreRisk(scenario, action, riskPct, stopPrice) {
  if (action !== "buy" && action !== "add") return null;
  if (!Number.isFinite(riskPct) || !Number.isFinite(stopPrice)) return 0;
  const riskScore = riskPct <= 1 ? 60 : riskPct <= 2 ? 30 : 0;
  const stopDistance = Math.abs(stopPrice - scenario.recommendedStop);
  const stopScore = stopDistance < 0.01 ? 40 : stopDistance <= Math.max(0.5, scenario.recommendedStop * 0.02) ? 20 : 0;
  return riskScore + stopScore;
}

export function calculateDecisionScore(scenario, decision) {
  const evidenceScore = scoreEvidence(scenario, decision.evidenceIds ?? []);
  const actionScore = scenario.actionScores[decision.action] ?? 0;
  const riskScore = decision.riskEvaluated === false
    ? null
    : scoreRisk(scenario, decision.action, decision.riskPct, decision.stopPrice);
  const timeframeScore = decision.horizon === scenario.horizon ? 100 : 0;
  const disciplineScore = scenario.disciplineScores[decision.action] ?? 0;

  const dimensions = [
    { key: "evidence", weight: 30, score: evidenceScore },
    { key: "action", weight: 25, score: actionScore },
    { key: "timeframe", weight: 10, score: timeframeScore },
    { key: "discipline", weight: 10, score: disciplineScore },
  ];
  if (riskScore !== null) dimensions.push({ key: "risk", weight: 25, score: riskScore });

  const totalWeight = dimensions.reduce((sum, item) => sum + item.weight, 0);
  const total = Math.round(dimensions.reduce((sum, item) => sum + item.weight * item.score / 100, 0) / totalWeight * 100);

  return {
    total,
    dimensions: Object.fromEntries(dimensions.map((item) => [item.key, Math.round(item.score)])),
  };
}

function applyBuy(portfolio, scenario, riskPct, stopPrice) {
  const currentPrice = scenario.bars.at(-1).close;
  const marks = { [scenario.instrument]: currentPrice };
  const equity = portfolioEquity(portfolio, marks);
  const executionPrice = scenario.future.open;
  const riskPerShare = executionPrice - stopPrice;
  if (!(riskPerShare > 0) || !(riskPct > 0)) return { portfolio, sharesTraded: 0, error: "invalid-risk" };

  const riskBudget = equity * riskPct / 100;
  const riskSizedShares = Math.floor(riskBudget / riskPerShare);
  const feeRate = 0.001;
  const affordableShares = Math.floor(portfolio.cash / (executionPrice * (1 + feeRate)));
  const shares = Math.max(0, Math.min(riskSizedShares, affordableShares));
  if (shares === 0) return { portfolio, sharesTraded: 0, error: "insufficient-cash" };

  const existing = getPosition(portfolio, scenario.instrument);
  const gross = shares * executionPrice;
  const fee = gross * feeRate;
  const totalShares = existing.shares + shares;
  const avgCost = (existing.shares * existing.avgCost + gross + fee) / totalShares;
  const next = {
    ...portfolio,
    cash: roundMoney(portfolio.cash - gross - fee),
    positions: {
      ...portfolio.positions,
      [scenario.instrument]: { shares: totalShares, avgCost: roundMoney(avgCost) },
    },
  };

  if (scenario.autoStop && scenario.future.low <= stopPrice) {
    return applySale(next, scenario, "sell", stopPrice, shares);
  }
  return { portfolio: next, sharesTraded: shares, fee: roundMoney(fee), stopped: false };
}

function applySale(portfolio, scenario, action, price = scenario.future.open, limitShares = null) {
  const existing = getPosition(portfolio, scenario.instrument);
  if (existing.shares <= 0) return { portfolio, sharesTraded: 0, error: "no-position" };
  const requested = action === "reduce" ? Math.max(1, Math.floor(existing.shares / 2)) : existing.shares;
  const shares = Math.min(limitShares ?? requested, existing.shares);
  const gross = shares * price;
  const fee = gross * 0.001;
  const realized = (price - existing.avgCost) * shares - fee;
  const remaining = existing.shares - shares;
  const positions = { ...portfolio.positions };
  if (remaining === 0) delete positions[scenario.instrument];
  else positions[scenario.instrument] = { ...existing, shares: remaining };
  return {
    portfolio: {
      ...portfolio,
      cash: roundMoney(portfolio.cash + gross - fee),
      positions,
      realizedPnl: roundMoney(portfolio.realizedPnl + realized),
    },
    sharesTraded: shares,
    fee: roundMoney(fee),
    stopped: price !== scenario.future.open,
  };
}

export function resolveDecision(state, scenario, decision) {
  if (state.phase !== "analyze") {
    return { ok: false, error: state.phase === "reveal" || state.phase === "debrief" ? "already-resolved" : "invalid-phase" };
  }
  if (scenario.campaignId !== state.campaignId || scenario.stage !== state.stage) {
    return { ok: false, error: "scenario-mismatch" };
  }
  if (!validActions(state.portfolio, scenario.instrument).includes(decision.action)) {
    return { ok: false, error: "invalid-action" };
  }
  const attemptId = `${scenario.id}:${state.attempts[scenario.id] ?? 0}`;
  if (state.lastResolvedAttemptId === attemptId) return { ok: false, error: "already-resolved" };

  let transaction = { portfolio: state.portfolio, sharesTraded: 0 };
  if (decision.action === "buy" || decision.action === "add") {
    transaction = applyBuy(state.portfolio, scenario, decision.riskPct, decision.stopPrice);
    if (transaction.error) return { ok: false, error: transaction.error };
  } else if (decision.action === "sell" || decision.action === "reduce") {
    transaction = applySale(state.portfolio, scenario, decision.action);
    if (transaction.error) return { ok: false, error: transaction.error };
  }

  const score = calculateDecisionScore(scenario, decision);
  const marks = { [scenario.instrument]: scenario.future.close };
  const equity = portfolioEquity(transaction.portfolio, marks);
  const equityBefore = portfolioEquity(state.portfolio, { [scenario.instrument]: scenario.bars.at(-1).close });
  const previousBest = state.mastery[scenario.id] ?? 0;
  const unlockedTools = scenario.toolUnlock
    ? [...new Set([...state.unlockedTools, scenario.toolUnlock])]
    : state.unlockedTools;
  const achievements = new Set(state.achievements);
  if (decision.action === "wait" && score.total >= 80) achievements.add("patient");
  if (
    (state.unlockedTools.includes("risk") || scenario.stage >= 10)
    && (decision.action === "buy" || decision.action === "add")
    && decision.riskPct <= 1
    && score.total >= 80
  ) achievements.add("risk");
  if (score.dimensions.evidence >= 90) achievements.add("evidence");
  if (scenario.id === "risk-rumor" && (decision.action === "wait" || decision.action === "reduce")) achievements.add("independent");
  if ((decision.action === "sell" || decision.action === "reduce") && score.total >= 85) achievements.add("calm-exit");
  if (score.dimensions.timeframe === 100 && score.total >= 80) achievements.add("timeframe");

  return {
    ok: true,
    attemptId,
    score,
    equity,
    transaction,
    state: {
      ...state,
      phase: "reveal",
      portfolio: transaction.portfolio,
      completed: [...new Set([...state.completed, scenario.id])],
      attempts: { ...state.attempts, [scenario.id]: (state.attempts[scenario.id] ?? 0) + 1 },
      mastery: { ...state.mastery, [scenario.id]: Math.max(previousBest, score.total) },
      unlockedTools,
      achievements: [...achievements],
      lastResolvedAttemptId: attemptId,
      lastResult: {
        scenarioId: scenario.id,
        action: decision.action,
        score,
        equity,
        equityBefore,
        sharesTraded: transaction.sharesTraded,
        stopped: Boolean(transaction.stopped),
        realizedPnl: transaction.portfolio.realizedPnl,
      },
      savedAt: new Date().toISOString(),
    },
  };
}

export function advanceStage(state) {
  if (state.phase !== "debrief") return state;
  const campaign = campaigns.find((item) => item.id === state.campaignId) ?? campaigns[0];
  const campaignScenarios = scenarios.filter((item) => item.campaignId === campaign.id);
  const currentIndex = campaignScenarios.findIndex((item) => item.stage === state.stage);
  if (currentIndex < campaignScenarios.length - 1) {
    return { ...state, stage: campaignScenarios[currentIndex + 1].stage, phase: "travel", lastResolvedAttemptId: null, lastResult: null };
  }
  const campaignIndex = campaigns.findIndex((item) => item.id === campaign.id);
  if (campaignIndex < campaigns.length - 1) {
    const nextCampaign = campaigns[campaignIndex + 1];
    const first = scenarios.find((item) => item.campaignId === nextCampaign.id);
    return {
      ...state,
      campaignId: nextCampaign.id,
      stage: first.stage,
      portfolio: createPortfolio(nextCampaign.id),
      phase: "map",
      lastResolvedAttemptId: null,
      lastResult: null,
    };
  }
  return { ...state, phase: "completed", lastResolvedAttemptId: null };
}

export function selectCampaign(state, campaignId) {
  const campaign = campaigns.find((item) => item.id === campaignId);
  if (!campaign || !isCampaignUnlocked(state, campaignId)) return state;
  const first = scenarios.find((item) => item.campaignId === campaignId);
  return {
    ...state,
    campaignId,
    stage: first.stage,
    portfolio: createPortfolio(campaignId),
    phase: "briefing",
    lastResolvedAttemptId: null,
    lastResult: null,
  };
}

export function isCampaignUnlocked(state, campaignId) {
  const campaignIndex = campaigns.findIndex((item) => item.id === campaignId);
  if (campaignIndex < 0) return false;
  if (campaignIndex === 0) return true;
  const previousCampaign = campaigns[campaignIndex - 1];
  const previousLast = scenarios.filter((item) => item.campaignId === previousCampaign.id).at(-1);
  return previousLast ? state.completed.includes(previousLast.id) : false;
}

export function validateGameContent() {
  const errors = [];
  const ids = new Set();
  for (const scenario of scenarios) {
    if (ids.has(scenario.id)) errors.push(`Duplicate scenario id: ${scenario.id}`);
    ids.add(scenario.id);
    if (!campaigns.some((campaign) => campaign.id === scenario.campaignId)) errors.push(`Unknown campaign: ${scenario.id}`);
    if (!horizons.some((horizon) => horizon.id === scenario.horizon)) errors.push(`Unknown horizon: ${scenario.id}`);
    if (!scenario.title.en || !scenario.title.vi || !scenario.lesson.en || !scenario.lesson.vi) errors.push(`Missing translation: ${scenario.id}`);
    if (!scenario.evidence.some((item) => item.relevant)) errors.push(`No relevant evidence: ${scenario.id}`);
    for (const item of scenario.evidence) {
      if (!item.label.en || !item.label.vi) errors.push(`Missing evidence translation: ${scenario.id}:${item.id}`);
    }
    for (const bar of [...scenario.bars, scenario.future]) {
      if (bar.high < Math.max(bar.open, bar.close) || bar.low > Math.min(bar.open, bar.close) || bar.volume < 0) {
        errors.push(`Invalid OHLCV: ${scenario.id}`);
        break;
      }
    }
    if (scenario.autoStop && scenario.future.high >= scenario.bars.at(-1).close * 1.08 && scenario.future.low <= scenario.recommendedStop) {
      errors.push(`Ambiguous stop/target ordering: ${scenario.id}`);
    }
  }
  return errors;
}
