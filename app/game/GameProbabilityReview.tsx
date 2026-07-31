import { actionCopy, localize } from "./game-data.js";
import { actionProbabilityReview } from "./game-logic.js";
import styles from "./game.module.css";
import type { Action, ActionProbability, Lang, Scenario } from "./game-types";

type Props = {
  scenario: Scenario;
  chosenAction: Action;
  lang: Lang;
};

export default function GameProbabilityReview({ scenario, chosenAction, lang }: Props) {
  const choices = actionProbabilityReview(scenario, chosenAction) as ActionProbability[];
  const highest = choices[0];
  if (!highest) return null;

  const actionLabel = (action: Action) => localize(actionCopy[action], lang);

  return <section className={styles.probabilityReview} aria-labelledby="probability-review-title">
    <header className={styles.probabilityHeader}>
      <div>
        <p className={styles.eyebrow}>{lang === "en" ? "Evidence-weighted choice review" : "Đánh giá lựa chọn theo bằng chứng"}</p>
        <h3 id="probability-review-title">{lang === "en"
          ? `Highest-probability choice: ${actionLabel(highest.action)}`
          : `Lựa chọn có xác suất cao nhất: ${actionLabel(highest.action)}`}</h3>
        <p>{lang === "en"
          ? `The game estimates a ${highest.probability}% scenario-fit probability for this choice.`
          : `Trò chơi ước tính lựa chọn này có xác suất phù hợp với kịch bản là ${highest.probability}%.`}</p>
      </div>
      <strong className={styles.probabilitySeal} aria-label={`${highest.probability}%`}>
        {highest.probability}<small>%</small>
      </strong>
    </header>

    <ol className={styles.probabilityList} aria-label={lang === "en" ? "Choices ranked by probability" : "Các lựa chọn xếp theo xác suất"}>
      {choices.map((choice, index) => {
        const isChosen = choice.action === chosenAction;
        return <li className={index === 0 ? styles.probabilityTop : ""} key={choice.action}>
          <div className={styles.probabilityRow}>
            <span className={styles.probabilityRank}>{index + 1}</span>
            <strong>{actionLabel(choice.action)}</strong>
            <span className={styles.probabilityBadges}>
              {index === 0 && <em>{lang === "en" ? "Highest" : "Cao nhất"}</em>}
              {isChosen && <em className={styles.probabilityChosen}>{lang === "en" ? "Your choice" : "Lựa chọn của bạn"}</em>}
            </span>
            <b>{choice.probability}%</b>
          </div>
          <div className={styles.probabilityTrack} aria-hidden="true"><i style={{ width: `${choice.probability}%` }}/></div>
        </li>;
      })}
    </ol>

    <footer className={styles.probabilityNote}>
      <strong>{lang === "en" ? "How it is estimated" : "Cách ước tính"}</strong>
      <span>{lang === "en"
        ? "Action quality 70% + discipline 30%, normalized across the choices available when you committed. Learning estimate only—not a market forecast or guarantee."
        : "Chất lượng hành động 70% + kỷ luật 30%, được chuẩn hóa trên các lựa chọn có sẵn khi bạn xác nhận. Chỉ là ước tính phục vụ học tập—không phải dự báo thị trường hay bảo đảm."}</span>
    </footer>
  </section>;
}
