export type Lang = "en" | "vi";
export type LocalizedText = Readonly<{ en: string; vi: string }>;
export type Horizon = "daily" | "quarterly" | "years";
export type Action = "buy" | "add" | "wait" | "hold" | "reduce" | "sell";
export type ToolId = "volume" | "trend" | "valuation" | "risk" | "journal";

export type Bar = {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Evidence = {
  id: string;
  label: LocalizedText;
  weight: number;
  relevant: boolean;
};

export type Metric = {
  label: LocalizedText;
  value: string;
};

export type MovingAverages = {
  ma20: number[];
  ma50: number[];
  ma200: number[];
};

export type ReviewGuide = {
  concept: LocalizedText;
  remember: LocalizedText[];
  trap: LocalizedText;
  bookChapter: number;
};

export type PracticeOption = {
  id: string;
  label: LocalizedText;
  correct: boolean;
};

export type PracticeDrill = {
  id: string;
  prompt: LocalizedText;
  options: PracticeOption[];
  explanation: LocalizedText;
};

export type Scenario = {
  id: string;
  campaignId: string;
  stage: number;
  instrument: string;
  horizon: Horizon;
  title: LocalizedText;
  objective: LocalizedText;
  event: LocalizedText;
  question: LocalizedText;
  review: ReviewGuide;
  practice: PracticeDrill[];
  evidence: Evidence[];
  bars: Bar[];
  future: Bar;
  stopOptions: number[];
  recommendedStop: number;
  actionScores: Record<Action, number>;
  disciplineScores: Record<Action, number>;
  lesson: LocalizedText;
  outcome: LocalizedText;
  book: LocalizedText;
  metrics?: Metric[];
  ma?: MovingAverages;
  autoStop?: boolean;
  toolUnlock?: ToolId;
};

export type Campaign = {
  id: string;
  number: number;
  instrument: string;
  startCash: number;
  name: LocalizedText;
  kicker: LocalizedText;
  description: LocalizedText;
  accent: string;
};

export type Position = { shares: number; avgCost: number };
export type Portfolio = {
  cash: number;
  positions: Record<string, Position>;
  realizedPnl: number;
};

export type Score = {
  total: number;
  dimensions: Record<string, number>;
};

export type LastResult = {
  scenarioId: string;
  action: Action;
  score: Score;
  equity: number;
  equityBefore: number;
  sharesTraded: number;
  stopped: boolean;
  realizedPnl: number;
};

export type GameState = {
  version: number;
  phase: "map" | "briefing" | "travel" | "analyze" | "reveal" | "debrief" | "completed";
  campaignId: string;
  stage: number;
  portfolio: Portfolio;
  completed: string[];
  attempts: Record<string, number>;
  mastery: Record<string, number>;
  unlockedTools: ToolId[];
  achievements: string[];
  reducedMotion: boolean;
  savedAt: string | null;
  lastResolvedAttemptId?: string | null;
  lastResult?: LastResult | null;
};
