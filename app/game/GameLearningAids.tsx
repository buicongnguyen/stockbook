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

  return (
    <details className={styles.lessonReview}>
      <summary>
        <span>
          <b>{lang === "en" ? "Review the lesson" : "Ôn lại bài học"}</b>
          <small>{lang === "en" ? "Concept · 3 rules · common trap" : "Khái niệm · 3 quy tắc · lỗi thường gặp"}</small>
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
