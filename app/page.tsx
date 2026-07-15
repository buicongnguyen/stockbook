"use client";

import { useEffect, useState } from "react";

type Lang = "en" | "vi";
type Page = "home" | "book" | "framework" | "strategies" | "tools";
type Block = { type: "p" | "li" | "h3" | "h4"; text: string };
type Chapter = { id: string; number: number; title: string; blocks: Block[] };
type Book = { language: Lang; title: string; chapters: Chapter[] };

function BookBlock({ block }: { block: Block }) {
  if (block.type === "h3") return <h2 className="section-heading">{block.text}</h2>;
  if (block.type === "h4") return <h3 className="subsection-heading">{block.text}</h3>;

  const isSection = /^\d+\.\d+\.?\s/.test(block.text);
  const isNumberedItem = /^\d+\)\s/.test(block.text);
  const isGroup = /^[-]\s*(Nhóm|Group)\b/i.test(block.text);
  const isFormula = /(?:^|\s)(?:P\/E|P\/B|PEG|EV\/EBITDA|EV|EBITDA|ROE|ROA|EPS|FCF|D\/E|Current Ratio|Quick Ratio|Stop-loss price|Giá cắt lỗ|Position size|Quy mô vị thế|Drawdown|Sharpe Ratio|GDP|Kelly|DRIP)\s*(?:\([^)]*\))?\s*=/.test(block.text);

  if (isSection) return <h2 className="section-heading inferred">{block.text}</h2>;
  if (isGroup) return <h3 className="group-heading">{block.text.replace(/^[-]\s*/, "")}</h3>;
  if (isNumberedItem) return <h3 className="numbered-heading">{block.text}</h3>;

  if (block.type === "li") {
    const label = block.text.match(/^([^:]{2,55}:)\s*(.*)$/);
    return <p className="book-bullet">{label ? <><strong>{label[1]}</strong> {label[2]}</> : block.text}</p>;
  }

  return <p className={isFormula ? "formula-block" : undefined}>{block.text}</p>;
}

const copy = {
  en: {
    brand: "Stockbook", nav: ["Home", "Book", "Framework", "Strategies", "Tools"],
    eyebrow: "A practical investing field guide",
    hero: "Think clearly before you risk capital.",
    sub: "A bilingual learning site built from Investment Experience—turning market lessons, risk rules, and trading psychology into a repeatable process.",
    read: "Read the book", framework: "Open buying framework", bookTitle: "Investment Experience",
    bookIntro: "Five chapters on mistakes, analysis, strategy, risk, execution, and investor psychology.",
    previous: "Previous", next: "Next", download: "Download English PDF", chapter: "Chapter",
    flowTitle: "Stock-buying decision framework", flowIntro: "A disciplined idea must survive every gate before it becomes a position.",
    strategiesTitle: "Choose a strategy before choosing a stock", toolsTitle: "Risk tools",
    disclaimer: "Educational content only. This site does not provide investment advice.", quote: "Protect capital first. Opportunity comes again.",
  },
  vi: {
    brand: "Sổ tay Chứng khoán", nav: ["Trang chủ", "Sách", "Quy trình", "Chiến lược", "Công cụ"],
    eyebrow: "Cẩm nang đầu tư thực chiến",
    hero: "Suy nghĩ rõ ràng trước khi mạo hiểm vốn.",
    sub: "Trang học tập song ngữ từ cuốn Kinh nghiệm đầu tư—biến bài học thị trường, nguyên tắc rủi ro và tâm lý giao dịch thành một quy trình có thể lặp lại.",
    read: "Đọc sách", framework: "Mở quy trình mua cổ phiếu", bookTitle: "Kinh nghiệm đầu tư",
    bookIntro: "Năm chương về sai lầm, phân tích, chiến lược, rủi ro, thực thi và tâm lý nhà đầu tư.",
    previous: "Trước", next: "Sau", download: "Tải PDF tiếng Việt", chapter: "Chương",
    flowTitle: "Quy trình ra quyết định mua cổ phiếu", flowIntro: "Một ý tưởng đầu tư kỷ luật phải vượt qua mọi cổng kiểm tra trước khi trở thành vị thế.",
    strategiesTitle: "Chọn chiến lược trước khi chọn cổ phiếu", toolsTitle: "Công cụ quản trị rủi ro",
    disclaimer: "Nội dung chỉ nhằm mục đích giáo dục, không phải khuyến nghị đầu tư.", quote: "Bảo vệ vốn trước tiên. Cơ hội rồi sẽ lại đến.",
  },
};

const strategies = {
  en: [
    ["Value investing", "Buy below conservative intrinsic value with a margin of safety.", "Years"],
    ["Growth investing", "Prioritize durable revenue, earnings, and competitive-advantage growth.", "Months–years"],
    ["Swing trading", "Trade defined price and volume setups inside a healthy trend.", "Days–weeks"],
    ["Day trading", "Intraday execution requiring strict rules, liquidity, and experience.", "Minutes–hours"],
    ["Dividend investing", "Focus on sustainable distributions backed by free cash flow.", "Years"],
    ["Index / ETF", "Use broad diversification and disciplined asset allocation.", "Years"],
  ],
  vi: [
    ["Đầu tư giá trị", "Mua thấp hơn giá trị nội tại thận trọng với biên an toàn.", "Nhiều năm"],
    ["Đầu tư tăng trưởng", "Ưu tiên tăng trưởng doanh thu, lợi nhuận và lợi thế cạnh tranh bền vững.", "Vài tháng–nhiều năm"],
    ["Swing trading", "Giao dịch mẫu hình giá và khối lượng rõ ràng trong xu hướng khỏe.", "Vài ngày–vài tuần"],
    ["Day trading", "Giao dịch trong ngày đòi hỏi quy tắc chặt chẽ, thanh khoản và kinh nghiệm.", "Phút–giờ"],
    ["Đầu tư cổ tức", "Tập trung vào cổ tức bền vững được hỗ trợ bởi dòng tiền tự do.", "Nhiều năm"],
    ["Chỉ số / ETF", "Đa dạng hóa rộng và phân bổ tài sản có kỷ luật.", "Nhiều năm"],
  ],
};

const flow = {
  en: [
    ["1", "Market", "Is the general market in a healthy, confirmed uptrend?", "No → hold cash and watch"],
    ["2", "Business", "Are growth, profitability, cash flow, debt, and valuation acceptable?", "No → reject"],
    ["3", "Setup", "Are trend, relative strength, price structure, and volume aligned?", "No → wait"],
    ["4", "Risk", "Define entry, invalidation, stop, and at least 2:1 reward-to-risk.", "Weak R:R → pass"],
    ["5", "Size", "Risk budget ÷ risk per share. Check concentration and correlation.", "Too large → reduce"],
    ["6", "Execute", "Enter only at the planned trigger; never average down after invalidation.", "Stop hit → exit"],
    ["7", "Review", "Trail winners, record the trade, emotion, and rule compliance.", "Feed lessons back"],
  ],
  vi: [
    ["1", "Thị trường", "Thị trường chung có trong xu hướng tăng khỏe và được xác nhận?", "Không → giữ tiền mặt"],
    ["2", "Doanh nghiệp", "Tăng trưởng, lợi nhuận, dòng tiền, nợ và định giá có đạt yêu cầu?", "Không → loại bỏ"],
    ["3", "Mẫu hình", "Xu hướng, sức mạnh tương đối, cấu trúc giá và khối lượng có đồng thuận?", "Không → chờ"],
    ["4", "Rủi ro", "Xác định điểm mua, điểm vô hiệu, cắt lỗ và lợi nhuận/rủi ro tối thiểu 2:1.", "R:R yếu → bỏ qua"],
    ["5", "Quy mô", "Ngân sách rủi ro ÷ rủi ro mỗi cổ phiếu. Kiểm tra tập trung và tương quan.", "Quá lớn → giảm"],
    ["6", "Thực thi", "Chỉ mua tại điểm kích hoạt đã định; không trung bình giá xuống sau khi sai.", "Chạm stop → thoát"],
    ["7", "Đánh giá", "Dời stop theo xu hướng, ghi nhật ký, cảm xúc và mức tuân thủ.", "Đưa bài học trở lại"],
  ],
};

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [page, setPage] = useState<Page>("home");
  const [book, setBook] = useState<Book | null>(null);
  const [chapter, setChapter] = useState(0);
  const [account, setAccount] = useState(100000);
  const [riskPct, setRiskPct] = useState(1);
  const [entry, setEntry] = useState(50);
  const [stop, setStop] = useState(47);
  const [target, setTarget] = useState(58);
  const t = copy[lang];

  useEffect(() => {
    const saved = localStorage.getItem("stockbook-language") as Lang | null;
    if (saved === "vi" || saved === "en") queueMicrotask(() => setLang(saved));
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    localStorage.setItem("stockbook-language", lang);
    document.documentElement.lang = lang;
    fetch(`./content/investment-experience-${lang}.json`, { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error(`Could not load ${lang} book content`);
        return r.json();
      })
      .then(setBook)
      .catch(error => {
        if (error.name !== "AbortError") console.error(error);
      });
    return () => controller.abort();
  }, [lang]);

  const riskBudget = account * riskPct / 100;
  const riskPerShare = Math.max(entry - stop, 0);
  const shares = riskPerShare ? Math.floor(riskBudget / riskPerShare) : 0;
  const rr = riskPerShare ? (target - entry) / riskPerShare : 0;

  function navigate(next: Page) { setPage(next); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function changeLanguage(next: Lang) { setChapter(0); setLang(next); }

  return <main>
    <header className="topbar">
      <button className="brand" onClick={() => navigate("home")}><span className="brand-mark">S</span>{t.brand}</button>
      <nav>{(["home", "book", "framework", "strategies", "tools"] as Page[]).map((item, i) =>
        <button key={item} className={page === item ? "active" : ""} onClick={() => navigate(item)}>{t.nav[i]}</button>)}</nav>
      <div className="language" aria-label="Language">
        <button className={lang === "en" ? "selected" : ""} onClick={() => changeLanguage("en")}>EN</button>
        <button className={lang === "vi" ? "selected" : ""} onClick={() => changeLanguage("vi")}>VI</button>
      </div>
    </header>

    {page === "home" && <>
      <section className="hero">
        <div><p className="eyebrow">{t.eyebrow}</p><h1>{t.hero}</h1><p className="lede">{t.sub}</p>
          <div className="actions"><button className="primary" onClick={() => navigate("book")}>{t.read}</button><button className="secondary" onClick={() => navigate("framework")}>{t.framework} →</button></div>
        </div>
        <div className="hero-card"><p className="folio">01 — 05</p><h2>{t.bookTitle}</h2><p>{t.bookIntro}</p><div className="rule"/><p className="quote">“{t.quote}”</p></div>
      </section>
      <section className="principles"><article><span>01</span><h3>{lang === "en" ? "Filter the market" : "Lọc thị trường"}</h3><p>{lang === "en" ? "A good stock cannot escape a hostile market forever." : "Cổ phiếu tốt không thể mãi thoát khỏi một thị trường xấu."}</p></article><article><span>02</span><h3>{lang === "en" ? "Define the risk" : "Xác định rủi ro"}</h3><p>{lang === "en" ? "Know the exit and position size before entering." : "Biết điểm thoát và quy mô vị thế trước khi mua."}</p></article><article><span>03</span><h3>{lang === "en" ? "Review the process" : "Đánh giá quy trình"}</h3><p>{lang === "en" ? "Judge decisions by rule compliance, not one outcome." : "Đánh giá quyết định bằng mức tuân thủ, không chỉ một kết quả."}</p></article></section>
    </>}

    {page === "book" && <section className="reader-shell">
      <aside><p className="eyebrow">{t.bookTitle}</p>{book?.chapters.map((item, i) => <button key={item.id} className={chapter === i ? "current" : ""} onClick={() => {setChapter(i); window.scrollTo(0,0)}}><span>{String(i + 1).padStart(2,"0")}</span>{item.title.replace(/^(Chapter|Chương)\s+\d+\s*:\s*/i, "")}</button>)}</aside>
      <article className="book-page">{book && <><p className="chapter-label">{t.chapter} {book.chapters[chapter].number} / 5</p><h1>{book.chapters[chapter].title}</h1><div className="book-rule"/>{book.chapters[chapter].blocks.map((block, i) => <BookBlock block={block} key={i}/>)}<div className="chapter-nav"><button disabled={chapter === 0} onClick={() => setChapter(chapter - 1)}>← {t.previous}</button><a href={`./downloads/${lang === "en" ? "Kinh%20nghiệm_Luan_June%202026_English.pdf" : "Kinh%20nghiệm_Luan_June%202026.pdf"}`}>{t.download}</a><button disabled={chapter === 4} onClick={() => setChapter(chapter + 1)}>{t.next} →</button></div></>}</article>
    </section>}

    {page === "framework" && <section className="content-page"><p className="eyebrow">Decision system</p><h1>{t.flowTitle}</h1><p className="lede narrow">{t.flowIntro}</p><div className="flow">{flow[lang].map((step, i) => <div className="flow-wrap" key={step[0]}><article className="flow-node"><span>{step[0]}</span><div><h3>{step[1]}</h3><p>{step[2]}</p><small>{step[3]}</small></div></article>{i < flow[lang].length - 1 && <div className="connector">↓</div>}</div>)}</div></section>}

    {page === "strategies" && <section className="content-page"><p className="eyebrow">Strategy library</p><h1>{t.strategiesTitle}</h1><div className="strategy-grid">{strategies[lang].map((s, i) => <article key={s[0]}><span>{String(i + 1).padStart(2,"0")}</span><h2>{s[0]}</h2><p>{s[1]}</p><small>{s[2]}</small></article>)}</div></section>}

    {page === "tools" && <section className="content-page"><p className="eyebrow">Calculators</p><h1>{t.toolsTitle}</h1><div className="tools-grid"><article className="tool"><h2>{lang === "en" ? "Position size" : "Quy mô vị thế"}</h2><label>{lang === "en" ? "Account value" : "Giá trị tài khoản"}<input type="number" value={account} onChange={e => setAccount(+e.target.value)}/></label><label>{lang === "en" ? "Risk per trade (%)" : "Rủi ro mỗi giao dịch (%)"}<input type="number" step="0.1" value={riskPct} onChange={e => setRiskPct(+e.target.value)}/></label><label>{lang === "en" ? "Entry price" : "Giá mua"}<input type="number" value={entry} onChange={e => setEntry(+e.target.value)}/></label><label>{lang === "en" ? "Stop price" : "Giá cắt lỗ"}<input type="number" value={stop} onChange={e => setStop(+e.target.value)}/></label><div className="result"><span>{lang === "en" ? "Maximum shares" : "Số cổ phiếu tối đa"}</span><strong>{shares.toLocaleString()}</strong><small>{lang === "en" ? `Capital at risk: ${riskBudget.toLocaleString()}` : `Vốn chịu rủi ro: ${riskBudget.toLocaleString()}`}</small></div></article>
      <article className="tool"><h2>{lang === "en" ? "Reward-to-risk" : "Lợi nhuận / rủi ro"}</h2><label>{lang === "en" ? "Entry price" : "Giá mua"}<input type="number" value={entry} onChange={e => setEntry(+e.target.value)}/></label><label>{lang === "en" ? "Stop price" : "Giá cắt lỗ"}<input type="number" value={stop} onChange={e => setStop(+e.target.value)}/></label><label>{lang === "en" ? "Target price" : "Giá mục tiêu"}<input type="number" value={target} onChange={e => setTarget(+e.target.value)}/></label><div className={`result ${rr >= 2 ? "good" : "warn"}`}><span>Reward : Risk</span><strong>{Number.isFinite(rr) ? rr.toFixed(2) : "0.00"} : 1</strong><small>{rr >= 2 ? (lang === "en" ? "Meets the 2:1 minimum" : "Đạt mức tối thiểu 2:1") : (lang === "en" ? "Below the 2:1 minimum" : "Dưới mức tối thiểu 2:1")}</small></div></article></div></section>}

    <footer><span>{t.brand}</span><p>{t.disclaimer}</p><span>2026</span></footer>
  </main>;
}
