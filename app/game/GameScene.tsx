"use client";

import styles from "./game.module.css";
import type { Campaign, Lang, LocalizedText, Scenario } from "./game-types";

export default function GameScene({
  campaign,
  scenario,
  lang,
  traveling,
  reducedMotion,
  equity,
}: {
  campaign: Campaign;
  scenario: Scenario;
  lang: Lang;
  traveling: boolean;
  reducedMotion: boolean;
  equity: number;
}) {
  const t = (value: LocalizedText) => value?.[lang] ?? value?.en ?? "";
  const bagScale = Math.max(0.72, Math.min(1.22, 0.9 + (equity - campaign.startCash) / campaign.startCash));
  return (
    <section
      className={`${styles.scene} ${traveling && !reducedMotion ? styles.traveling : ""}`}
      style={{ "--campaign-accent": campaign.accent, "--bag-scale": bagScale } as React.CSSProperties}
      aria-label={lang === "en" ? `Traveling through ${t(campaign.name)}` : `Đang đi qua ${t(campaign.name)}`}
    >
      <div className={styles.sky}>
        <span className={styles.sun}/>
        <span className={styles.cloudOne}/>
        <span className={styles.cloudTwo}/>
      </div>
      <div className={styles.city} aria-hidden="true">
        <i/><i/><i/><i/><i/><i/>
      </div>
      <div className={styles.marketSigns} aria-hidden="true">
        <span>MA20</span><span>P/E</span><span>R:R</span>
      </div>
      <div className={styles.road} aria-hidden="true"><i/><i/><i/><i/><i/></div>
      <div className={styles.traveler} aria-hidden="true">
        <span className={styles.head}/>
        <span className={styles.body}/>
        <span className={styles.arm}/>
        <span className={styles.legOne}/>
        <span className={styles.legTwo}/>
        <span className={styles.bag}><b>$</b></span>
      </div>
      <div className={styles.sceneCaption}>
        <span>{t(campaign.kicker)}</span>
        <strong>{t(campaign.name)}</strong>
        <small>{lang === "en" ? `Stage ${scenario.stage} · ${scenario.instrument}` : `Chặng ${scenario.stage} · ${scenario.instrument}`}</small>
      </div>
      <div className={styles.fog} aria-hidden="true"><span>?</span></div>
    </section>
  );
}
