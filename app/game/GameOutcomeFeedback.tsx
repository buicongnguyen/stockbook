import { classifyProcessOutcome, STRONG_PROCESS_SCORE } from "./game-logic.js";
import styles from "./game.module.css";
import type { Lang, LastResult, LocalizedText } from "./game-types";

const resultCopy: Record<string, { title: LocalizedText; description: LocalizedText }> = {
  "strong-gain": {
    title: { en: "Disciplined win", vi: "Chiến thắng có kỷ luật" },
    description: {
      en: "The process was strong and the market was favorable. Repeat the process—not the profit.",
      vi: "Quy trình vững và thị trường thuận lợi. Hãy lặp lại quy trình, không chạy theo lợi nhuận.",
    },
  },
  "strong-flat": {
    title: { en: "Capital preserved", vi: "Vốn được bảo toàn" },
    description: {
      en: "A disciplined decision kept capital steady. Doing nothing can be an active risk decision.",
      vi: "Quyết định có kỷ luật giữ vốn ổn định. Không giao dịch vẫn có thể là một quyết định quản trị rủi ro chủ động.",
    },
  },
  "strong-loss": {
    title: { en: "Good loss", vi: "Khoản lỗ tốt" },
    description: {
      en: "The process was strong even though the market moved against it. Controlled losses are part of survival.",
      vi: "Quy trình vẫn vững dù thị trường đi ngược kỳ vọng. Khoản lỗ có kiểm soát là một phần của việc tồn tại.",
    },
  },
  "weak-gain": {
    title: { en: "Lucky win", vi: "Chiến thắng nhờ may mắn" },
    description: {
      en: "The market paid this time, but the process needs work. Profit does not validate a weak decision.",
      vi: "Thị trường mang lại lợi nhuận lần này, nhưng quy trình cần cải thiện. Lợi nhuận không hợp thức hóa quyết định yếu.",
    },
  },
  "weak-flat": {
    title: { en: "Flat result, unfinished process", vi: "Kết quả đi ngang, quy trình chưa hoàn thiện" },
    description: {
      en: "Capital held steady, but the decision process left avoidable gaps. Repair those gaps before the next trade.",
      vi: "Vốn không đổi, nhưng quy trình quyết định còn những khoảng trống có thể tránh. Hãy sửa chúng trước giao dịch tiếp theo.",
    },
  },
  "weak-loss": {
    title: { en: "Costly lesson", vi: "Bài học phải trả giá" },
    description: {
      en: "Both process and outcome were weak. Focus on the first missed rule rather than trying to win the money back.",
      vi: "Cả quy trình lẫn kết quả đều yếu. Hãy tập trung vào quy tắc đầu tiên bị bỏ qua thay vì cố gỡ lại tiền.",
    },
  },
};

const marketCopy = {
  gain: { en: "Market gain", vi: "Thị trường có lãi" },
  flat: { en: "Capital flat", vi: "Vốn không đổi" },
  loss: { en: "Market loss", vi: "Thị trường thua lỗ" },
} as const;

export default function GameOutcomeFeedback({ result, lang, compact = false }: { result: LastResult; lang: Lang; compact?: boolean }) {
  const classification = classifyProcessOutcome(result.score.total, result.equityBefore, result.equity);
  const copy = resultCopy[classification.key] ?? resultCopy["weak-flat"];
  const processLabel = classification.process === "strong"
    ? (lang === "en" ? "Disciplined process" : "Quy trình có kỷ luật")
    : (lang === "en" ? "Process needs work" : "Quy trình cần cải thiện");
  const marketKey = classification.market === "gain" || classification.market === "loss"
    ? classification.market
    : "flat";
  const marketLabel = marketCopy[marketKey][lang];

  return (
    <article className={`${styles.processOutcomeCard} ${compact ? styles.compactOutcomeCard : ""}`}>
      <div>
        <span>{lang === "en" ? "Process × outcome" : "Quy trình × kết quả"}</span>
        <h3>{copy.title[lang]}</h3>
        <p>{copy.description[lang]}</p>
      </div>
      <dl>
        <div>
          <dt>{lang === "en" ? "Process" : "Quy trình"}</dt>
          <dd>{processLabel} · {result.score.total}/100</dd>
        </div>
        <div>
          <dt>{lang === "en" ? "Market" : "Thị trường"}</dt>
          <dd>{marketLabel}</dd>
        </div>
      </dl>
      <small>{lang === "en"
        ? `A disciplined process is ${STRONG_PROCESS_SCORE}/100 or higher.`
        : `Quy trình có kỷ luật đạt từ ${STRONG_PROCESS_SCORE}/100 trở lên.`}</small>
    </article>
  );
}
