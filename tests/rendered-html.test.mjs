import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildContentUrl, buildRouteSearch, calculateMetrics, readRoute } from "../app/stockbook-logic.js";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

const validInputs = {
  account: 100000,
  riskPct: 1,
  entry: 50,
  stop: 47,
  target: 58,
  stockPrice: 50,
  eps: 4,
  bvps: 25,
  growth: 12,
  netIncome: 120,
  averageEquity: 600,
  shareholdersEquity: 600,
  assets: 1000,
  cfo: 180,
  capex: 60,
  debt: 300,
};

test("server-renders the Stockbook home page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Stockbook — Investment Experience<\/title>/i);
  assert.match(html, /Think clearly before you risk capital/);
  assert.match(html, /Primary navigation/);
  assert.match(html, /<nav[^>]*>[\s\S]*?<a /i);
  assert.match(html, /og-journey\.png/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview|SkeletonPreview/i);
});

test("server-renders localized Vietnamese metadata and content", async () => {
  const response = await render("/vi");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Stockbook — Kinh nghiệm đầu tư<\/title>/i);
  assert.match(html, /Suy nghĩ rõ ràng trước khi mạo hiểm vốn/);
  assert.match(html, /Cẩm nang song ngữ về đầu tư cổ phiếu có kỷ luật/);
});

test("route state is shareable and preserves unrelated query parameters", () => {
  assert.equal(readRoute("?page=game&lang=vi").page, "game");
  assert.deepEqual(readRoute("?page=tools&lang=vi&chapter=99"), {
    page: "tools",
    lang: "vi",
    chapter: 4,
  });
  assert.deepEqual(readRoute("?page=unknown", "vi"), {
    page: "home",
    lang: "vi",
    chapter: 0,
  });
  assert.equal(
    buildRouteSearch("?review=10405de", "book", "vi", 2),
    "?review=10405de&page=book&lang=vi&chapter=3",
  );
  assert.equal(buildRouteSearch("?review=10405de&chapter=4", "home", "en"), "?review=10405de");
  assert.equal(buildContentUrl("/stockbook/", "en"), "/stockbook/content/investment-experience-en.json");
  assert.equal(buildContentUrl("/stockbook/vi/", "vi"), "/stockbook/content/investment-experience-vi.json");
});

test("calculators return values only for meaningful inputs", () => {
  const valid = calculateMetrics(validInputs);
  assert.equal(valid.positionValid, true);
  assert.equal(valid.shares, 333);
  assert.equal(valid.rewardRisk, 8 / 3);
  assert.equal(valid.pe, 12.5);
  assert.equal(valid.debtToEquity, 0.5);

  const buyingPowerLimited = calculateMetrics({
    ...validInputs,
    entry: 100,
    stop: 99.99,
  });
  assert.equal(buyingPowerLimited.shares, 1000);
  assert.equal(buyingPowerLimited.positionValue, 100000);
  assert.equal(buyingPowerLimited.capitalLimited, true);

  const averageEquityChanged = calculateMetrics({ ...validInputs, averageEquity: 300 });
  assert.equal(averageEquityChanged.roe, 40);
  assert.equal(averageEquityChanged.debtToEquity, 0.5);

  const shareholderEquityChanged = calculateMetrics({ ...validInputs, shareholdersEquity: 300 });
  assert.equal(shareholderEquityChanged.roe, 20);
  assert.equal(shareholderEquityChanged.debtToEquity, 1);

  const invalid = calculateMetrics({
    ...validInputs,
    account: -100000,
    eps: 0,
    averageEquity: 0,
    shareholdersEquity: 0,
    capex: -60,
  });
  assert.equal(invalid.positionValid, false);
  assert.equal(invalid.shares, null);
  assert.equal(invalid.riskBudget, null);
  assert.equal(invalid.pe, null);
  assert.equal(invalid.peg, null);
  assert.equal(invalid.roe, null);
  assert.equal(invalid.fcf, null);
  assert.equal(invalid.debtToEquity, null);
});

test("deployment and accessibility safeguards stay enabled", async () => {
  const [page, css, gameCss, game, gameChart, learningAids, outcomeFeedback, probabilityReview, workflow] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/game/game.module.css", import.meta.url), "utf8"),
    readFile(new URL("../app/game/StockJourneyGame.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/game/GameChart.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/game/GameLearningAids.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/game/GameOutcomeFeedback.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/game/GameProbabilityReview.tsx", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8"),
  ]);

  assert.match(page, /aria-current=\{page === item \? "page"/);
  assert.match(page, /strategy-map" role="group"/);
  assert.match(page, /aria-pressed=\{strategyIndex === index\}/);
  assert.match(css, /\.diagram-scroll\s*\{/);
  assert.match(css, /\.result\.invalid\s*\{/);
  assert.match(gameCss, /prefers-reduced-motion/);
  assert.match(gameCss, /grid-template-columns:minmax\(0,1fr\)/);
  assert.match(gameCss, /\.heroPanel\s*\{/);
  assert.match(gameCss, /@media \(max-width:580px\)/);
  assert.match(gameCss, /Compact density/);
  assert.match(gameCss, /min-height:190px/);
  assert.match(gameCss, /\.hud article \{ min-height:70px/);
  assert.match(gameCss, /\.scene \{ height:clamp\(220px,27vw,320px\)/);
  assert.match(gameCss, /\.probabilitySeal \{ display:none/);
  assert.match(gameChart, /const height = 280/);
  assert.match(game, /"--journey-progress"/);
  assert.match(game, /className=\{styles\.progressDial\}/);
  assert.match(game, /className=\{styles\.campaignStatus\}/);
  assert.match(learningAids, /<details className=\{styles\.lessonReview\}>/);
  assert.match(learningAids, /aria-current=\{index === current \? "step"/);
  assert.match(learningAids, /scenario\.practice\.map/);
  assert.match(learningAids, /aria-pressed=\{chosen\}/);
  assert.match(learningAids, /role="status"/);
  assert.match(outcomeFeedback, /Process × outcome/);
  assert.match(game, /<GameProbabilityReview/);
  assert.match(probabilityReview, /Highest-probability choice/);
  assert.match(probabilityReview, /Your choice/);
  assert.match(probabilityReview, /not a market forecast or guarantee/);
  assert.match(probabilityReview, /actionProbabilityReview/);
  assert.match(page, /<StockJourneyGame lang=\{lang\}/);
  assert.match(workflow, /run:\s*npm test/);
});
