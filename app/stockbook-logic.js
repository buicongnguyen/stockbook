export const pageIds = Object.freeze([
  "home",
  "book",
  "framework",
  "cycles",
  "macro",
  "terminology",
  "strategies",
  "research",
  "tools",
  "game",
]);

export function readRoute(search, fallbackLang = "en") {
  const params = new URLSearchParams(search);
  const pageValue = params.get("page");
  const langValue = params.get("lang");
  const chapterValue = Number.parseInt(params.get("chapter") ?? "1", 10);

  return {
    page: pageIds.includes(pageValue) ? pageValue : "home",
    lang: langValue === "vi" || langValue === "en" ? langValue : fallbackLang,
    chapter: Number.isFinite(chapterValue) ? Math.max(0, Math.min(4, chapterValue - 1)) : 0,
  };
}

export function buildRouteSearch(currentSearch, page, lang, chapter = 0) {
  const params = new URLSearchParams(currentSearch);

  if (page === "home") params.delete("page");
  else params.set("page", page);

  if (lang === "en") params.delete("lang");
  else params.set("lang", lang);

  if (page === "book" && chapter > 0) params.set("chapter", String(chapter + 1));
  else params.delete("chapter");

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function buildContentUrl(pathname, lang) {
  const basePath = pathname.replace(/(?:en|vi)\/?$/, "");
  return `${basePath}content/investment-experience-${lang}.json`;
}

export function calculateMetrics(input) {
  const positionValid = input.account > 0
    && input.riskPct > 0
    && input.riskPct <= 100
    && input.entry > 0
    && input.stop >= 0
    && input.stop < input.entry;
  const rewardRiskValid = input.entry > 0
    && input.stop >= 0
    && input.stop < input.entry
    && input.target > input.entry;
  const riskPerShare = positionValid || rewardRiskValid ? input.entry - input.stop : null;
  const riskBudget = positionValid ? input.account * input.riskPct / 100 : null;
  const riskSizedShares = positionValid && riskBudget !== null && riskPerShare !== null
    ? Math.floor(riskBudget / riskPerShare)
    : null;
  const affordableShares = positionValid ? Math.floor(input.account / input.entry) : null;
  const shares = riskSizedShares !== null && affordableShares !== null
    ? Math.min(riskSizedShares, affordableShares)
    : null;

  return {
    positionValid,
    rewardRiskValid,
    riskBudget,
    riskSizedShares,
    affordableShares,
    shares,
    positionValue: shares !== null ? shares * input.entry : null,
    capitalLimited: shares !== null && riskSizedShares !== null && shares < riskSizedShares,
    rewardRisk: rewardRiskValid && riskPerShare !== null
      ? (input.target - input.entry) / riskPerShare
      : null,
    pe: input.stockPrice > 0 && input.eps > 0 ? input.stockPrice / input.eps : null,
    pb: input.stockPrice > 0 && input.bvps > 0 ? input.stockPrice / input.bvps : null,
    peg: input.stockPrice > 0 && input.eps > 0 && input.growth > 0
      ? (input.stockPrice / input.eps) / input.growth
      : null,
    roe: input.averageEquity > 0 ? input.netIncome / input.averageEquity * 100 : null,
    roa: input.assets > 0 ? input.netIncome / input.assets * 100 : null,
    fcf: input.capex >= 0 ? input.cfo - input.capex : null,
    debtToEquity: input.debt >= 0 && input.shareholdersEquity > 0
      ? input.debt / input.shareholdersEquity
      : null,
  };
}
