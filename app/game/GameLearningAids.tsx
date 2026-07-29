"use client";

import { useState } from "react";
import { localize } from "./game-data.js";
import styles from "./game.module.css";
import type { GameState, Lang, LocalizedText, Scenario } from "./game-types";

const stepCopy = {
  observe: { en: "Observe", vi: "Quan sát" },
  decide: { en: "Decide", vi: "Quyết định" },
  outcome: { en: "Outcome", vi: "Kết quả" },
  review: { en: "Review", vi: "Ôn tập" },
} as const;

const phaseStep: Record<GameState["phase"], number> = {
  map: 0,
  briefing: 0,
  travel: 0,
  analyze: 1,
  reveal: 2,
  debrief: 3,
  completed: 3,
};

export function StageProgress({ phase, lang }: { phase: GameState["phase"]; lang: Lang }) {
  const current = phaseStep[phase];
  const steps = Object.entries(stepCopy) as [keyof typeof stepCopy, LocalizedText][];

  return (
    <ol className={styles.stageProgress} role="list" aria-label={lang === "en" ? "Current stage progress" : "Tiến trình chặng hiện tại"}>
      {steps.map(([key, label], index) => (
        <li
          key={key}
          role="listitem"
          className={`${index < current ? styles.completedStep : ""} ${index === current ? styles.activeStep : ""}`}
          aria-current={index === current ? "step" : undefined}
        >
          <span>{index < current ? "✓" : index + 1}</span>
          <b>{localize(label, lang)}</b>
        </li>
      ))}
    </ol>
  );
}

export function LessonReview({ scenario, lang }: { scenario: Scenario; lang: Lang }) {
  const t = (value: LocalizedText) => localize(value, lang);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const answeredCount = scenario.practice.filter((drill) => Boolean(answers[drill.id])).length;

  return (
    <details className={styles.lessonReview}>
      <summary>
        <span>
          <b>{lang === "en" ? "Review the lesson" : "Ôn lại bài học"}</b>
          <small>{lang === "en" ? "Concept · 3 rules · 2 practice examples" : "Khái niệm · 3 quy tắc · 2 ví dụ thực hành"}</small>
        </span>
        <i aria-hidden="true">+</i>
      </summary>
      <div className={styles.reviewBody}>
        <article>
          <span>{lang === "en" ? "Core concept" : "Khái niệm cốt lõi"}</span>
          <p>{t(scenario.review.concept)}</p>
        </article>
        <article>
          <span>{lang === "en" ? "Remember" : "Cần nhớ"}</span>
          <ol>
            {scenario.review.remember.map((item, index) => <li key={`${scenario.id}-review-${index}`}>{t(item)}</li>)}
          </ol>
        </article>
        <article className={styles.trapCard}>
          <span>{lang === "en" ? "Common trap" : "Lỗi thường gặp"}</span>
          <p>{t(scenario.review.trap)}</p>
        </article>
        <section className={styles.practiceSection} aria-labelledby={`practice-title-${scenario.id}`}>
          <header>
            <div>
              <span>{lang === "en" ? "Extra practice" : "Thực hành bổ sung"}</span>
              <h3 id={`practice-title-${scenario.id}`}>{lang === "en" ? "Try two more examples" : "Làm thêm hai ví dụ"}</h3>
            </div>
            <b>{answeredCount}/{scenario.practice.length} {lang === "en" ? "answered" : "đã trả lời"}</b>
          </header>
          <div className={styles.practiceGrid}>
            {scenario.practice.map((drill, drillIndex) => {
              const selectedId = answers[drill.id];
              const selected = drill.options.find((item) => item.id === selectedId);
              const correctOption = drill.options.find((item) => item.correct);
              return (
                <article key={drill.id} className={styles.practiceCard}>
                  <span>{lang === "en" ? "Example" : "Ví dụ"} {drillIndex + 1}</span>
                  <h4 id={`practice-prompt-${scenario.id}-${drill.id}`}>{t(drill.prompt)}</h4>
                  <div role="group" aria-labelledby={`practice-prompt-${scenario.id}-${drill.id}`}>
                    {drill.options.map((item) => {
                      const chosen = selectedId === item.id;
                      const revealCorrect = Boolean(selectedId) && item.correct;
                      const revealIncorrect = chosen && !item.correct;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`${chosen ? styles.practiceSelected : ""} ${revealCorrect ? styles.practiceCorrect : ""} ${revealIncorrect ? styles.practiceIncorrect : ""}`}
                          aria-pressed={chosen}
                          onClick={() => setAnswers((current) => ({ ...current, [drill.id]: item.id }))}
                        >
                          <i aria-hidden="true">{revealCorrect ? "✓" : revealIncorrect ? "×" : "○"}</i>
                          <span>{t(item.label)}</span>
                        </button>
                      );
                    })}
                  </div>
                  {selected && <p className={`${styles.practiceFeedback} ${selected.correct ? styles.correctFeedback : styles.retryFeedback}`} role="status">
                    <strong>{selected.correct
                      ? (lang === "en" ? "Correct." : "Chính xác.")
                      : (lang === "en" ? "Not quite—compare the evidence." : "Chưa đúng—hãy so sánh lại bằng chứng.")}</strong>{" "}
                    {!selected.correct && correctOption && <>
                      {lang === "en" ? "Best answer: " : "Đáp án phù hợp nhất: "}
                      <b>{t(correctOption.label)}.</b>{" "}
                    </>}
                    {t(drill.explanation)}
                  </p>}
                </article>
              );
            })}
          </div>
        </section>
        <footer>
          <p>{lang === "en"
            ? "This review teaches the method without revealing the preferred action."
            : "Phần ôn tập hướng dẫn phương pháp mà không tiết lộ hành động được ưu tiên."}</p>
          <a href={`?page=book&chapter=${scenario.review.bookChapter}&lang=${lang}`}>
            {lang === "en" ? "Open the related book chapter" : "Mở chương sách liên quan"} →
          </a>
        </footer>
      </div>
    </details>
  );
}

export function DecisionChecklist({
  evidenceDone,
  horizonDone,
  actionDone,
  riskRequired,
  riskDone,
  lang,
}: {
  evidenceDone: boolean;
  horizonDone: boolean;
  actionDone: boolean;
  riskRequired: boolean;
  riskDone: boolean;
  lang: Lang;
}) {
  const items = [
    { key: "evidence", done: evidenceDone, en: "Evidence", vi: "Bằng chứng" },
    { key: "horizon", done: horizonDone, en: "Timeframe", vi: "Khung thời gian" },
    { key: "action", done: actionDone, en: "Action", vi: "Hành động" },
    ...(riskRequired ? [{ key: "risk", done: riskDone, en: "Risk plan", vi: "Kế hoạch rủi ro" }] : []),
  ];
  const missing = items.filter((item) => !item.done).map((item) => item[lang]);

  return (
    <div className={styles.decisionChecklist} role="group" aria-label={lang === "en" ? "Decision requirements" : "Yêu cầu quyết định"}>
      <div>
        <b>{lang === "en" ? "Decision ready?" : "Quyết định đã sẵn sàng?"}</b>
        <span aria-live="polite">{missing.length
          ? `${lang === "en" ? "Remaining" : "Còn thiếu"}: ${missing.join(" · ")}`
          : (lang === "en" ? "All required inputs are complete." : "Đã hoàn thành mọi thông tin bắt buộc.")}</span>
      </div>
      <ul role="list">
        {items.map((item, index) => (
          <li key={item.key} role="listitem" className={item.done ? styles.requirementDone : ""}>
            <i aria-hidden="true">{item.done ? "✓" : index + 1}</i>
            <span>{item[lang]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
