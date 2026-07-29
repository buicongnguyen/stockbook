"use client";

import styles from "./game.module.css";
import type { Bar, Lang, Scenario } from "./game-types";

function linePath(values: number[], xFor: (index: number) => number, yFor: (value: number) => number) {
  return values.map((value, index) => `${index === 0 ? "M" : "L"}${xFor(index).toFixed(1)} ${yFor(value).toFixed(1)}`).join(" ");
}

export default function GameChart({
  scenario,
  lang,
  reveal,
  showVolume,
  showTrend,
}: {
  scenario: Scenario;
  lang: Lang;
  reveal: boolean;
  showVolume: boolean;
  showTrend: boolean;
}) {
  const bars = reveal ? [...scenario.bars, scenario.future] : scenario.bars;
  const width = 760;
  const height = 330;
  const left = 48;
  const right = 22;
  const top = 24;
  const priceBottom = showVolume ? 238 : 284;
  const volumeTop = 254;
  const volumeBottom = 306;
  const trendValues = showTrend && scenario.ma
    ? Object.values(scenario.ma).flatMap((values) => values as number[])
    : [];
  const lows = bars.map((bar: Bar) => bar.low);
  const highs = bars.map((bar: Bar) => bar.high);
  const minPrice = Math.min(...lows, ...trendValues) * 0.985;
  const maxPrice = Math.max(...highs, ...trendValues) * 1.015;
  const maxVolume = Math.max(...bars.map((bar: Bar) => bar.volume));
  const step = (width - left - right) / bars.length;
  const xFor = (index: number) => left + step * index + step / 2;
  const yFor = (value: number) => top + (maxPrice - value) / (maxPrice - minPrice) * (priceBottom - top);
  const volumeY = (value: number) => volumeBottom - value / maxVolume * (volumeBottom - volumeTop);
  const candleWidth = Math.max(5, Math.min(14, step * 0.48));
  const last = bars.at(-1) ?? scenario.future;
  const periodName = scenario.horizon === "daily"
    ? (lang === "en" ? "daily" : "ngày")
    : (lang === "en" ? "quarterly" : "quý");
  const direction = last.close >= last.open
    ? (lang === "en" ? "up" : "tăng")
    : (lang === "en" ? "down" : "giảm");
  const summary = lang === "en"
    ? `${bars.length} ${periodName} price periods. Last close ${last.close.toFixed(2)}, ${direction} from open ${last.open.toFixed(2)}.${showVolume ? ` Volume ${last.volume}.` : ""}`
    : `${bars.length} kỳ giá theo ${periodName}. Giá đóng cửa cuối ${last.close.toFixed(2)}, ${direction} so với giá mở cửa ${last.open.toFixed(2)}.${showVolume ? ` Khối lượng ${last.volume}.` : ""}`;
  const titleId = `chart-title-${scenario.id}-${reveal ? "reveal" : "visible"}`;

  return (
    <figure className={styles.chartFigure}>
      <div className={styles.chartToolbar}>
        <div>
          <span>{scenario.instrument}</span>
          <strong>{lang === "en" ? "Synthetic learning chart" : "Biểu đồ học tập mô phỏng"}</strong>
          <small>{periodName}</small>
        </div>
        <div className={styles.chartLegend} aria-label={lang === "en" ? "Chart legend" : "Chú giải biểu đồ"}>
          <span><i className={styles.upSwatch}/> {lang === "en" ? "Up close" : "Đóng cửa tăng"}</span>
          <span><i className={styles.downSwatch}/> {lang === "en" ? "Down close" : "Đóng cửa giảm"}</span>
          {showVolume && <span><i className={styles.volumeSwatch}/> {lang === "en" ? "Volume" : "Khối lượng"}</span>}
        </div>
      </div>
      <div className={styles.chartScroll} tabIndex={0}>
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={titleId}>
          <title id={titleId}>{summary}</title>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = top + ratio * (priceBottom - top);
            const price = maxPrice - ratio * (maxPrice - minPrice);
            return <g key={ratio}><line className={styles.gridLine} x1={left} x2={width - right} y1={y} y2={y}/><text className={styles.axisText} x={left - 7} y={y + 4} textAnchor="end">{price.toFixed(0)}</text></g>;
          })}
          {showTrend && scenario.ma && <>
            <path className={`${styles.maLine} ${styles.ma20}`} d={linePath(scenario.ma.ma20, xFor, yFor)}/>
            <path className={`${styles.maLine} ${styles.ma50}`} d={linePath(scenario.ma.ma50, xFor, yFor)}/>
            <path className={`${styles.maLine} ${styles.ma200}`} d={linePath(scenario.ma.ma200, xFor, yFor)}/>
            <text className={`${styles.axisText} ${styles.ma20Text}`} x={width - 70} y={yFor(scenario.ma.ma20.at(-1) ?? minPrice) - 5}>MA20</text>
            <text className={`${styles.axisText} ${styles.ma50Text}`} x={width - 70} y={yFor(scenario.ma.ma50.at(-1) ?? minPrice) - 5}>MA50</text>
            <text className={`${styles.axisText} ${styles.ma200Text}`} x={width - 70} y={yFor(scenario.ma.ma200.at(-1) ?? minPrice) - 5}>MA200</text>
          </>}
          {bars.map((bar: Bar, index: number) => {
            const rising = bar.close >= bar.open;
            const x = xFor(index);
            const bodyTop = yFor(Math.max(bar.open, bar.close));
            const bodyHeight = Math.max(2, Math.abs(yFor(bar.open) - yFor(bar.close)));
            const future = reveal && index === bars.length - 1;
            return <g key={index} className={future ? styles.futureCandle : undefined}>
              <line className={rising ? styles.upCandle : styles.downCandle} x1={x} x2={x} y1={yFor(bar.high)} y2={yFor(bar.low)}/>
              <rect className={rising ? styles.upCandle : styles.downCandle} x={x - candleWidth / 2} width={candleWidth} y={bodyTop} height={bodyHeight} rx="1"/>
              {showVolume && <rect className={rising ? styles.upVolume : styles.downVolume} x={x - candleWidth / 2} width={candleWidth} y={volumeY(bar.volume)} height={volumeBottom - volumeY(bar.volume)} rx="1"/>}
              {future && <text className={styles.futureLabel} x={x} y={height - 7} textAnchor="middle">{lang === "en" ? "REVEALED" : "ĐÃ MỞ"}</text>}
            </g>;
          })}
          {!reveal && <g className={styles.fogGate}>
            <rect x={width - right - step * 0.15} y={top} width={step * 0.45} height={priceBottom - top} rx="8"/>
            <text x={width - right - step * 0.02} y={(priceBottom + top) / 2} textAnchor="middle">?</text>
          </g>}
        </svg>
      </div>
      <figcaption>{summary} {reveal
        ? (lang === "en" ? "The outcome candle is now revealed." : "Nến kết quả hiện đã được mở.")
        : (lang === "en" ? "Future candles remain hidden until the decision is committed." : "Nến tương lai được ẩn cho đến khi quyết định được xác nhận.")}</figcaption>
    </figure>
  );
}
