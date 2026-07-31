"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { actionCopy, campaigns, horizons, localize, scenarios, toolCopy } from "./game-data.js";
import {
  advanceStage,
  classifyCapitalChange,
  createInitialGameState,
  getPosition,
  getScenario,
  isCampaignUnlocked,
  portfolioEquity,
  resolveDecision,
  riskChoices,
  selectCampaign,
  validActions,
} from "./game-logic.js";
import { clearGameState, loadGameState, saveGameState } from "./game-storage.js";
import GameChart from "./GameChart";
import { DecisionChecklist, LessonReview, StageProgress } from "./GameLearningAids";
import GameOutcomeFeedback from "./GameOutcomeFeedback";
import GameProbabilityReview from "./GameProbabilityReview";
import GameScene from "./GameScene";
import styles from "./game.module.css";
import type { Campaign, GameState, Lang, LocalizedText, Metric, Scenario } from "./game-types";

const achievementCopy = {
  patient: { en: "Patient Observer", vi: "Người Quan Sát Kiên Nhẫn" },
  risk: { en: "Risk Keeper", vi: "Người Giữ Rủi Ro" },
  evidence: { en: "Evidence First", vi: "Bằng Chứng Trước Tiên" },
  independent: { en: "Independent Thinker", vi: "Tư Duy Độc Lập" },
  "calm-exit": { en: "Calm Exit", vi: "Thoát Lệnh Bình Tĩnh" },
  timeframe: { en: "Timeframe Keeper", vi: "Người Giữ Khung Thời Gian" },
};

export default function StockJourneyGame({ lang }: { lang: Lang }) {
  const [state, setState] = useState<GameState>(() => createInitialGameState() as GameState);
  const [ready, setReady] = useState(false);
  const [evidenceIds, setEvidenceIds] = useState<string[]>([]);
  const [action, setAction] = useState("");
  const [horizon, setHorizon] = useState("");
  const [riskPct, setRiskPct] = useState<number | null>(null);
  const [stopPrice, setStopPrice] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const phaseSurfaceRef = useRef<HTMLDivElement>(null);
  const scenario = getScenario(state) as Scenario;
  const campaign = (campaigns.find((item) => item.id === scenario.campaignId) ?? campaigns[0]) as Campaign;
  const t = (value: LocalizedText) => localize(value, lang);
  const numberLocale = lang === "en" ? "en-US" : "vi-VN";
  const currentPrice = scenario.bars.at(-1)?.close ?? scenario.future.close;
  const position = getPosition(state.portfolio, scenario.instrument);
  const markPrice = state.phase === "reveal" || state.phase === "debrief" ? scenario.future.close : currentPrice;
  const equity = portfolioEquity(state.portfolio, { [scenario.instrument]: markPrice });
  const allowedActions = validActions(state.portfolio, scenario.instrument);
  const needsRisk = action === "buy" || action === "add";
  const hasRiskShield = state.unlockedTools.includes("risk");
  const needsRiskInput = needsRisk && hasRiskShield;
  const canCommit = evidenceIds.length > 0 && Boolean(action) && Boolean(horizon)
    && (!needsRisk || (riskPct !== null && stopPrice !== null));
  const campaignScenarios = scenarios.filter((item) => item.campaignId === campaign.id);
  const campaignCompleted = campaignScenarios.filter((item) => state.completed.includes(item.id)).length;
  const averageMastery = useMemo(() => {
    const values = Object.values(state.mastery) as number[];
    return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
  }, [state.mastery]);

  useEffect(() => {
    queueMicrotask(() => {
      const loaded = loadGameState() as GameState;
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setState({ ...loaded, reducedMotion: loaded.reducedMotion || prefersReduced });
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveGameState(state);
  }, [ready, state]);

  useEffect(() => {
    if (!ready) return;
    requestAnimationFrame(() => phaseSurfaceRef.current?.focus({ preventScroll: true }));
  }, [ready, state.phase]);

  function resetDecisionForm() {
    setEvidenceIds([]);
    setAction("");
    setHorizon("");
    setRiskPct(null);
    setStopPrice(null);
    setMessage("");
  }

  function update(next: GameState) {
    setState(next);
  }

  function setPhase(phase: GameState["phase"]) {
    update({ ...state, phase });
  }

  function beginCampaign(campaignId: string) {
    resetDecisionForm();
    update(selectCampaign(state, campaignId) as GameState);
  }

  function toggleEvidence(id: string) {
    setEvidenceIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function chooseAction(nextAction: string) {
    setAction(nextAction);
    if (nextAction === "buy" || nextAction === "add") {
      if (hasRiskShield) {
        setRiskPct(null);
        setStopPrice(null);
      } else {
        setRiskPct(1);
        setStopPrice(scenario.recommendedStop);
      }
    } else {
      setRiskPct(null);
      setStopPrice(null);
    }
  }

  function commitDecision() {
    if (!canCommit) return;
    const result = resolveDecision(state, scenario, {
      evidenceIds,
      action,
      horizon,
      riskPct,
      stopPrice,
      riskEvaluated: hasRiskShield,
    });
    if (!result.ok) {
      setMessage(lang === "en" ? "The decision could not be committed. Review the position and risk plan." : "Không thể xác nhận quyết định. Hãy kiểm tra vị thế và kế hoạch rủi ro.");
      return;
    }
    setMessage(lang === "en" ? "Decision committed. The market outcome is now available." : "Đã xác nhận quyết định. Kết quả thị trường hiện đã sẵn sàng.");
    update(result.state);
  }

  function nextStage() {
    resetDecisionForm();
    update(advanceStage(state) as GameState);
  }

  function resetJourney() {
    const approved = window.confirm(lang === "en"
      ? "Reset the entire journey, portfolio, and mastery?"
      : "Đặt lại toàn bộ hành trình, danh mục và mức độ thành thạo?");
    if (!approved) return;
    resetDecisionForm();
    update(clearGameState() as GameState);
  }

  function campaignUnlocked(index: number) {
    return isCampaignUnlocked(state, campaigns[index]?.id);
  }

  const lastResult = state.lastResult;
  const resultDirection = lastResult
    ? lastResult.equity - lastResult.equityBefore
    : 0;
  const capitalChange = lastResult
    ? classifyCapitalChange(lastResult.equityBefore, lastResult.equity)
    : "flat";
  const showVolume = state.unlockedTools.includes("volume") || scenario.stage >= 2;
  const showTrend = state.unlockedTools.includes("trend") && Boolean(scenario.ma);

  if (!ready) {
    return <section className={styles.root}><div className={styles.loading} role="status">{lang === "en" ? "Opening the journey…" : "Đang mở hành trình…"}</div></section>;
  }

  return (
    <section
      className={styles.root}
      style={{
        "--campaign-accent": campaign.accent,
        "--journey-progress": `${state.completed.length / 12 * 100}%`,
      } as React.CSSProperties}
    >
      <header className={styles.gameHeader}>
        <span className={styles.heroGlow} aria-hidden="true"/>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>{lang === "en" ? "Interactive decision training" : "Huấn luyện quyết định tương tác"}</p>
          <h1>{lang === "en" ? "Stockbook Journey" : "Hành Trình Stockbook"}</h1>
          <p>{lang === "en"
            ? "Protect capital, collect evidence, and learn from uncertain outcomes."
            : "Bảo vệ vốn, thu thập bằng chứng và học từ những kết quả bất định."}</p>
          <div className={styles.heroChips} aria-label={lang === "en" ? "Journey format" : "Cấu trúc hành trình"}>
            <span>{lang === "en" ? "12 market missions" : "12 nhiệm vụ thị trường"}</span>
            <span>{lang === "en" ? "4 skill regions" : "4 khu vực kỹ năng"}</span>
            <span>{lang === "en" ? "Process-scored" : "Chấm điểm quy trình"}</span>
          </div>
        </div>
        <aside className={styles.heroPanel}>
          <div
            className={styles.progressDial}
            role="img"
            aria-label={lang === "en"
              ? `${state.completed.length} of 12 stages completed`
              : `Đã hoàn thành ${state.completed.length} trong 12 chặng`}
          >
            <div><strong>{state.completed.length}</strong><span>/12</span></div>
          </div>
          <div className={styles.heroScore}>
            <span>{lang === "en" ? "Journey mastery" : "Mức thành thạo"}</span>
            <strong>{averageMastery}</strong>
            <small>{lang === "en" ? "Best-process average" : "Điểm quy trình tốt nhất"}</small>
          </div>
          <button className={styles.resetButton} onClick={resetJourney}>{lang === "en" ? "Reset" : "Đặt lại"}</button>
        </aside>
      </header>

      <div className={styles.hud} aria-label={lang === "en" ? "Journey status" : "Trạng thái hành trình"}>
        <article><i aria-hidden="true">$</i><div><span>{lang === "en" ? "Capital bag" : "Túi vốn"}</span><strong>{equity.toLocaleString(numberLocale, { maximumFractionDigits: 0 })}</strong><small>{lang === "en" ? `${state.portfolio.cash.toLocaleString(numberLocale, { maximumFractionDigits: 0 })} cash` : `${state.portfolio.cash.toLocaleString(numberLocale, { maximumFractionDigits: 0 })} tiền mặt`}</small></div></article>
        <article><i aria-hidden="true">↗</i><div><span>{lang === "en" ? "Position" : "Vị thế"}</span><strong>{position.shares} {scenario.instrument}</strong><small>{position.shares ? `${lang === "en" ? "Avg" : "TB"} ${position.avgCost.toFixed(2)}` : (lang === "en" ? "No exposure" : "Không có vị thế")}</small></div></article>
        <article><i aria-hidden="true">✓</i><div><span>{lang === "en" ? "Decision journal" : "Nhật ký quyết định"}</span><strong>{averageMastery}/100</strong><small>{lang === "en" ? `${state.completed.length}/12 stages` : `${state.completed.length}/12 chặng`}</small></div></article>
        <article><i aria-hidden="true">⌖</i><div><span>{lang === "en" ? "Current region" : "Khu vực hiện tại"}</span><strong>{t(campaign.name)}</strong><small>{campaignCompleted}/3</small></div></article>
      </div>

      <nav className={styles.progressRail} aria-label={lang === "en" ? "Campaign progress" : "Tiến trình chiến dịch"}>
        {campaigns.map((item, index) => {
          const unlocked = campaignUnlocked(index);
          const done = scenarios.filter((scenarioItem) => scenarioItem.campaignId === item.id).every((scenarioItem) => state.completed.includes(scenarioItem.id));
          const canSwitchCampaign = state.phase === "map" || state.phase === "completed";
          return <button
            key={item.id}
            style={{ "--campaign-accent": item.accent } as React.CSSProperties}
            className={`${item.id === state.campaignId ? styles.currentCampaign : ""} ${done ? styles.doneCampaign : ""}`}
            disabled={!unlocked || !canSwitchCampaign}
            onClick={() => beginCampaign(item.id)}
            aria-current={item.id === state.campaignId ? "step" : undefined}
          ><span>{done ? "✓" : item.number}</span><b>{t(item.name)}</b></button>;
        })}
      </nav>

      {state.phase !== "map" && state.phase !== "completed" && <StageProgress phase={state.phase} lang={lang}/>}

      <div ref={phaseSurfaceRef} tabIndex={-1} className={styles.phaseSurface}>
      {state.phase === "map" && <section className={styles.mapPanel}>
        <div className={styles.mapIntro}>
          <p className={styles.eyebrow}>{lang === "en" ? "Choose the next region" : "Chọn khu vực tiếp theo"}</p>
          <h2>{lang === "en" ? "Capital changes. Mastery stays." : "Vốn thay đổi. Năng lực ở lại."}</h2>
          <p>{lang === "en"
            ? "Each region starts with a fresh practice account so an unlucky lesson never blocks your education."
            : "Mỗi khu vực bắt đầu với tài khoản luyện tập mới để một bài học không may không bao giờ chặn việc học."}</p>
        </div>
        <div className={styles.campaignGrid}>
          {campaigns.map((item, index) => {
            const unlocked = campaignUnlocked(index);
            const completedCount = scenarios.filter((scenarioItem) => scenarioItem.campaignId === item.id && state.completed.includes(scenarioItem.id)).length;
            return <article
              key={item.id}
              className={!unlocked ? styles.lockedCampaignCard : completedCount === 3 ? styles.completedCampaignCard : ""}
              style={{ "--campaign-accent": item.accent } as React.CSSProperties}
            >
              <span className={styles.campaignNumber}>{String(item.number).padStart(2, "0")}</span>
              <p>{t(item.kicker)}</p>
              <h3>{t(item.name)}</h3>
              <p>{t(item.description)}</p>
              <div className={styles.campaignMeter}><i style={{ width: `${completedCount / 3 * 100}%` }}/></div>
              <div className={styles.campaignStatus}>
                <b>{completedCount}/3</b>
                <span>{!unlocked
                  ? (lang === "en" ? "Locked" : "Đã khóa")
                  : (lang === "en" ? "missions cleared" : "nhiệm vụ hoàn thành")}</span>
              </div>
              <button disabled={!unlocked} onClick={() => beginCampaign(item.id)}>
                {!unlocked ? (lang === "en" ? "Complete prior region" : "Hoàn thành khu vực trước") : completedCount === 3 ? (lang === "en" ? "Replay region" : "Chơi lại khu vực") : (lang === "en" ? "Enter region" : "Vào khu vực")}
              </button>
            </article>;
          })}
        </div>
      </section>}

      {state.phase === "briefing" && <section className={styles.briefing}>
        <GameScene campaign={campaign} scenario={scenario} lang={lang} traveling={false} reducedMotion={state.reducedMotion} equity={equity}/>
        <LessonReview scenario={scenario} lang={lang}/>
        <div className={styles.briefCard}>
          <span>{lang === "en" ? `Stage ${scenario.stage} objective` : `Mục tiêu chặng ${scenario.stage}`}</span>
          <h2>{t(scenario.title)}</h2>
          <p>{t(scenario.objective)}</p>
          <button onClick={() => setPhase("travel")}>{lang === "en" ? "Begin the stage" : "Bắt đầu chặng"} →</button>
        </div>
      </section>}

      {state.phase === "travel" && <section className={styles.travelPanel}>
        <GameScene campaign={campaign} scenario={scenario} lang={lang} traveling={true} reducedMotion={state.reducedMotion} equity={equity}/>
        <div className={styles.travelControls}>
          <p>{state.reducedMotion
            ? (lang === "en" ? "Reduced motion is active." : "Chế độ giảm chuyển động đang bật.")
            : (lang === "en" ? "The next market event is emerging from the fog." : "Sự kiện thị trường tiếp theo đang xuất hiện từ màn sương.")}</p>
          <button onClick={() => setPhase("analyze")}>{lang === "en" ? "Stop and analyze" : "Dừng lại và phân tích"}</button>
        </div>
      </section>}

      {state.phase === "analyze" && <section className={styles.analysis}>
        <GameScene campaign={campaign} scenario={scenario} lang={lang} traveling={false} reducedMotion={state.reducedMotion} equity={equity}/>
        <header className={styles.stageHeader}>
          <div><span>{lang === "en" ? `Stage ${scenario.stage}` : `Chặng ${scenario.stage}`}</span><h2>{t(scenario.title)}</h2><p>{t(scenario.objective)}</p></div>
          <aside><b>{lang === "en" ? "Information cutoff" : "Mốc thông tin"}</b><span>{lang === "en" ? "Through the latest visible close" : "Đến giá đóng cửa gần nhất được hiển thị"}</span></aside>
        </header>
        <LessonReview scenario={scenario} lang={lang}/>
        <article className={styles.eventCard}><span>{lang === "en" ? "Market event" : "Sự kiện thị trường"}</span><p>{t(scenario.event)}</p></article>
        <GameChart scenario={scenario} lang={lang} reveal={false} showVolume={showVolume} showTrend={showTrend}/>
        {scenario.metrics && <div className={styles.metricsGrid}>{scenario.metrics.map((metric: Metric) => <article key={t(metric.label)}><span>{t(metric.label)}</span><strong>{metric.value}</strong></article>)}</div>}
        <div className={styles.decisionGrid}>
          <fieldset className={styles.evidencePanel}>
            <legend><span>01</span>{t(scenario.question)}</legend>
            <p>{lang === "en" ? "Choose only the evidence that deserves weight." : "Chỉ chọn bằng chứng thực sự đáng được cân nhắc."}</p>
            {scenario.evidence.map((item) => <label key={item.id} className={evidenceIds.includes(item.id) ? styles.selectedOption : ""}>
              <input type="checkbox" checked={evidenceIds.includes(item.id)} onChange={() => toggleEvidence(item.id)}/>
              <span>{t(item.label)}</span>
            </label>)}
          </fieldset>
          <div className={styles.planPanel}>
            <fieldset>
              <legend><span>02</span>{lang === "en" ? "Choose the decision horizon" : "Chọn khung thời gian quyết định"}</legend>
              <div className={styles.choiceRow}>{horizons.map((item) => <button key={item.id} className={horizon === item.id ? styles.selectedButton : ""} aria-pressed={horizon === item.id} onClick={() => setHorizon(item.id)}>{t(item.label)}</button>)}</div>
            </fieldset>
            <fieldset>
              <legend><span>03</span>{lang === "en" ? "Choose the action" : "Chọn hành động"}</legend>
              <div className={styles.actionRow}>{allowedActions.map((item) => <button key={item} className={action === item ? styles.selectedButton : ""} aria-pressed={action === item} onClick={() => chooseAction(item)}>{t(actionCopy[item as keyof typeof actionCopy])}</button>)}</div>
            </fieldset>
            {needsRisk && !needsRiskInput && <p className={styles.starterRisk}>{lang === "en" ? `Starter protection applies 1% account risk with invalidation at ${scenario.recommendedStop.toFixed(2)}.` : `Bảo vệ cơ bản áp dụng rủi ro tài khoản 1% với điểm vô hiệu tại ${scenario.recommendedStop.toFixed(2)}.`}</p>}
            {needsRiskInput && <fieldset className={styles.riskPlan}>
              <legend><span>04</span>{lang === "en" ? "Define risk before entry" : "Xác định rủi ro trước khi vào lệnh"}</legend>
              <div><p>{lang === "en" ? "Account risk" : "Rủi ro tài khoản"}</p><div className={styles.choiceRow}>{riskChoices.map((value) => <button key={value} className={riskPct === value ? styles.selectedButton : ""} aria-pressed={riskPct === value} onClick={() => setRiskPct(value)}>{value}%</button>)}</div></div>
              <div><p>{lang === "en" ? "Invalidation / stop" : "Điểm vô hiệu / cắt lỗ"}</p><div className={styles.choiceRow}>{scenario.stopOptions.map((value: number) => <button key={value} className={stopPrice === value ? styles.selectedButton : ""} aria-pressed={stopPrice === value} onClick={() => setStopPrice(value)}>{value.toFixed(2)}</button>)}</div></div>
            </fieldset>}
            <DecisionChecklist
              evidenceDone={evidenceIds.length > 0}
              horizonDone={Boolean(horizon)}
              actionDone={Boolean(action)}
              riskRequired={needsRiskInput}
              riskDone={!needsRiskInput || (riskPct !== null && stopPrice !== null)}
              lang={lang}
            />
            <button className={styles.commitButton} disabled={!canCommit} onClick={commitDecision}>{lang === "en" ? "Commit decision" : "Xác nhận quyết định"}</button>
            <p className={styles.commitNote}>{lang === "en" ? "Profit will not change the decision-quality score." : "Lợi nhuận sẽ không thay đổi điểm chất lượng quyết định."}</p>
          </div>
        </div>
      </section>}

      {state.phase === "reveal" && lastResult && <section className={styles.revealPanel}>
        <p className={styles.eyebrow}>{lang === "en" ? "The market answers" : "Thị trường trả lời"}</p>
        <h2>{capitalChange === "gain"
          ? (lang === "en" ? "Capital increased this stage." : "Vốn tăng trong chặng này.")
          : capitalChange === "loss"
            ? (lang === "en" ? "Capital decreased this stage." : "Vốn giảm trong chặng này.")
            : (lang === "en" ? "Capital held steady this stage." : "Vốn được giữ ổn định trong chặng này.")}</h2>
        <p>{t(scenario.outcome)}</p>
        <GameOutcomeFeedback result={lastResult} lang={lang}/>
        <GameProbabilityReview scenario={scenario} chosenAction={lastResult.action} lang={lang}/>
        <GameChart scenario={scenario} lang={lang} reveal showVolume={showVolume} showTrend={showTrend}/>
        <div className={styles.outcomeStrip}>
          <article><span>{lang === "en" ? "Action" : "Hành động"}</span><strong>{t(actionCopy[lastResult.action as keyof typeof actionCopy])}</strong></article>
          <article><span>{lang === "en" ? "Shares traded" : "Số cổ phiếu giao dịch"}</span><strong>{lastResult.sharesTraded}</strong></article>
          <article><span>{lang === "en" ? "Stage equity change" : "Thay đổi vốn chặng"}</span><strong className={capitalChange === "gain" ? styles.positive : capitalChange === "loss" ? styles.negative : styles.neutral}>{capitalChange === "gain" ? "+" : ""}{resultDirection.toFixed(2)}</strong></article>
          <article><span>{lang === "en" ? "Protective stop" : "Cắt lỗ bảo vệ"}</span><strong>{lastResult.stopped ? (lang === "en" ? "Triggered" : "Đã kích hoạt") : "—"}</strong></article>
        </div>
        <button className={styles.primaryButton} onClick={() => setPhase("debrief")}>{lang === "en" ? "Open the Decision Journal" : "Mở Nhật Ký Quyết Định"} →</button>
      </section>}

      {state.phase === "debrief" && lastResult && <section className={styles.debrief}>
        <header>
          <div><p className={styles.eyebrow}>{lang === "en" ? "Process review" : "Đánh giá quy trình"}</p><h2>{lang === "en" ? "Decision Journal" : "Nhật Ký Quyết Định"}</h2></div>
          <div className={styles.scoreSeal}><strong>{lastResult.score.total}</strong><span>/100</span></div>
        </header>
        <div className={styles.scoreGrid}>
          {Object.entries(lastResult.score.dimensions).map(([key, value]) => {
            const labels: Record<string, { en: string; vi: string }> = {
              evidence: { en: "Evidence", vi: "Bằng chứng" },
              action: { en: "Action", vi: "Hành động" },
              risk: { en: "Risk plan", vi: "Kế hoạch rủi ro" },
              timeframe: { en: "Timeframe", vi: "Khung thời gian" },
              discipline: { en: "Discipline", vi: "Kỷ luật" },
            };
            return <article key={key}><div><span>{labels[key]?.[lang] ?? key}</span><strong>{String(value)}</strong></div><i><b style={{ width: `${value}%` }}/></i></article>;
          })}
        </div>
        <GameOutcomeFeedback result={lastResult} lang={lang} compact/>
        <div className={styles.lessonGrid}>
          <article><span>{lang === "en" ? "What the stage teaches" : "Bài học của chặng"}</span><p>{t(scenario.lesson)}</p></article>
          <article><span>{lang === "en" ? "Book connection" : "Liên kết với sách"}</span><p>{t(scenario.book)}</p><a href={`?page=book&chapter=${scenario.review.bookChapter}&lang=${lang}`}>{lang === "en" ? "Read the related chapter" : "Đọc chương liên quan"} →</a></article>
        </div>
        {scenario.toolUnlock && <article className={styles.unlockCard}>
          <span>{lang === "en" ? "Tool unlocked" : "Công cụ đã mở khóa"}</span>
          <h3>{t(toolCopy[scenario.toolUnlock as keyof typeof toolCopy].name)}</h3>
          <p>{t(toolCopy[scenario.toolUnlock as keyof typeof toolCopy].description)}</p>
        </article>}
        {state.achievements.length > 0 && <div className={styles.achievementRow}><span>{lang === "en" ? "Journal marks" : "Dấu ấn nhật ký"}</span>{state.achievements.map((item) => { const key = item as keyof typeof achievementCopy; return <b key={item}>{achievementCopy[key]?.[lang] ?? item}</b>; })}</div>}
        <button className={styles.primaryButton} onClick={nextStage}>{scenario.stage === 12 ? (lang === "en" ? "Complete the journey" : "Hoàn thành hành trình") : (lang === "en" ? "Travel to the next stage" : "Đi đến chặng tiếp theo")} →</button>
      </section>}

      {state.phase === "completed" && <section className={styles.completedPanel}>
        <div className={styles.completedMark}>✓</div>
        <p className={styles.eyebrow}>{lang === "en" ? "Journey complete" : "Hành trình hoàn thành"}</p>
        <h2>{lang === "en" ? "Capital changed. Your process became stronger." : "Vốn đã thay đổi. Quy trình của bạn đã mạnh hơn."}</h2>
        <p>{lang === "en"
          ? `You completed ${state.completed.length} stages with an average best decision score of ${averageMastery}. Replay a region to strengthen a weak skill without erasing mastery.`
          : `Bạn đã hoàn thành ${state.completed.length} chặng với điểm quyết định tốt nhất trung bình ${averageMastery}. Hãy chơi lại một khu vực để củng cố kỹ năng yếu mà không xóa năng lực đã đạt.`}</p>
        <div className={styles.completedActions}><button className={styles.primaryButton} onClick={() => setPhase("map")}>{lang === "en" ? "Replay a region" : "Chơi lại khu vực"}</button><a href={`?page=framework&lang=${lang}`}>{lang === "en" ? "Review the buying framework" : "Xem lại quy trình mua cổ phiếu"} →</a></div>
      </section>}
      </div>

      <p className={styles.liveMessage} aria-live="polite">{message}</p>
      <footer className={styles.gameDisclaimer}>{lang === "en"
        ? "Synthetic scenarios for education only. This is not investment advice and does not predict future returns."
        : "Kịch bản mô phỏng chỉ nhằm mục đích giáo dục. Đây không phải khuyến nghị đầu tư và không dự đoán lợi nhuận tương lai."}</footer>
    </section>
  );
}
