"use client";

import { useEffect, useState } from "react";

type Lang = "en" | "vi";
type Theme = "light" | "dark";
type FlowStyle = "gates" | "pipeline" | "cycle";
type Page = "home" | "book" | "framework" | "cycles" | "terminology" | "strategies" | "tools";
type Block = { type: "p" | "li" | "h3" | "h4"; text: string };
type Chapter = { id: string; number: number; title: string; blocks: Block[] };
type Book = { language: Lang; title: string; chapters: Chapter[] };

function normalizeBook(raw: Book): Book {
  return {...raw, chapters: raw.chapters.map(chapter => ({...chapter, blocks: chapter.blocks.flatMap(block => {
    if (block.type !== "p" || block.text.length < 180) return [block];
    const parts = block.text.split(/\s+(?=(?:\d+\.\d+\.?\s|\d+\)\s|[-]\s*(?:Group|Nhóm)\b))/g);
    return parts.map(text => ({...block, text}));
  })}))};
}

function splitHeadingText(text: string) {
  if (text.length <= 180) return [text, ""];
  const bodyStart = /\s(?=(?:The (?:stock market|market|mistake|tragedy|business|company|biggest|core|electronic)|When (?:you|a |the )|Many (?:people|investors|new )|This (?:is|means|strategy|school)|It (?:is|shows|means)|Investors\b|Looking\b|Every\b|Drawn\b|Developed\b|Human psychology\b|Initially\b|Remember\b|Suppose\b|For example\b|In reality\b|If (?:you|every)|You (?:need|will|are|should|can)|Going\b|Your\b|Choosing\b|Buying\b|Seeing\b|Diversifying\b|After\b|Following\b|Brokers\b|During\b|Newcomers\b|Using\b|At the end\b|Earn\b|Making\b|Watching\b|Thị trường\b|Sai lầm\b|Khi bạn\b|Nhiều (?:người|nhà đầu tư)|Đây là\b|Điều này\b|Ví dụ\b|Trong thực tế\b))/g;
  bodyStart.lastIndex = Math.min(25, text.length);
  const match = bodyStart.exec(text);
  if (!match || match.index > 220) return [text, ""];
  return [text.slice(0, match.index).trim(), text.slice(match.index).trim()];
}

function CalcField({ label, value, onChange, step = "any" }: { label: string; value: number; onChange: (value: number) => void; step?: string }) {
  return <label>{label}<input type="number" step={step} value={value} onChange={event => onChange(+event.target.value)}/></label>;
}

function blockOutlineLevel(block: Block) {
  if (block.type === "h3" || /^\d+\.\d+\.?\s/.test(block.text)) return 1;
  if (block.type === "h4" || /^\d+\)\s/.test(block.text) || /^[-]\s*(Nhóm|Group)\b/i.test(block.text)) return 2;
  return 0;
}

function BookBlock({ block, index }: { block: Block; index: number }) {
  const anchor = `book-item-${index}`;
  const [heading, headingBody] = splitHeadingText(block.text);
  if (block.type === "h3") return <><h2 id={anchor} className="section-heading scroll-anchor">{heading}</h2>{headingBody && <p>{headingBody}</p>}</>;
  if (block.type === "h4") return <><h3 id={anchor} className="subsection-heading scroll-anchor">{heading}</h3>{headingBody && <p>{headingBody}</p>}</>;

  const isSection = /^\d+\.\d+\.?\s/.test(block.text);
  const isNumberedItem = /^\d+\)\s/.test(block.text);
  const isGroup = /^[-]\s*(Nhóm|Group)\b/i.test(block.text);
  const isFormula = /(?:^|\s)(?:P\/E|P\/B|PEG|EV\/EBITDA|EV|EBITDA|ROE|ROA|EPS|FCF|D\/E|Current Ratio|Quick Ratio|Stop-loss price|Giá cắt lỗ|Position size|Quy mô vị thế|Drawdown|Sharpe Ratio|GDP|Kelly|DRIP)\s*(?:\([^)]*\))?\s*=/.test(block.text);

  if (isSection) return <><h2 id={anchor} className="section-heading inferred scroll-anchor">{heading}</h2>{headingBody && <p>{headingBody}</p>}</>;
  if (isGroup) return <><h3 id={anchor} className="group-heading scroll-anchor">{heading.replace(/^[-]\s*/, "")}</h3>{headingBody && <p>{headingBody}</p>}</>;
  if (isNumberedItem) return <><h3 id={anchor} className="numbered-heading scroll-anchor">{heading}</h3>{headingBody && <p>{headingBody}</p>}</>;

  if (block.type === "li") {
    const label = block.text.match(/^([^:]{2,55}:)\s*(.*)$/);
    return <p className="book-bullet">{label ? <><strong>{label[1]}</strong> {label[2]}</> : block.text}</p>;
  }

  return <p className={isFormula ? "formula-block" : undefined}>{block.text}</p>;
}

const copy = {
  en: {
    brand: "Stockbook", nav: ["Home", "Book", "Framework", "Market cycles", "Terminology", "Strategies", "Tools"],
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
    brand: "Sổ tay Chứng khoán", nav: ["Trang chủ", "Sách", "Quy trình", "Chu kỳ", "Thuật ngữ", "Chiến lược", "Công cụ"],
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

const marketCycles = {
  en: [
    { season:"Spring", phase:"Early cycle", economy:"Growth turns positive and accelerates. Credit conditions ease, inventories are low, and corporate profits begin to rebound.", sectors:"Consumer discretionary · Financials · Real estate · Industrials · Information technology", action:"Look for confirmed market strength and improving earnings. Keep position risk defined because recovery signals can fail.", color:"cycle-early" },
    { season:"Summer", phase:"Mid-cycle", economy:"Growth stays positive but moderates. Credit is available, profitability is healthy, and monetary policy becomes more neutral.", sectors:"Information technology · Industrials · Select growth industries", action:"Favor quality growth and leaders with strong relative strength. Expect corrections even inside a healthy expansion.", color:"cycle-mid" },
    { season:"Autumn", phase:"Late cycle", economy:"Growth remains positive but slows. Inflation, interest rates, inventories, and pressure on profit margins may rise.", sectors:"Energy · Materials · Health care · Consumer staples · Utilities", action:"Raise the quality bar, reduce excessive leverage, and watch for weakening breadth or earnings revisions.", color:"cycle-late" },
    { season:"Winter", phase:"Recession", economy:"Economic activity and profits contract, credit becomes scarce, and rates often fall as policy becomes more supportive.", sectors:"Consumer staples · Utilities · Health care · Defensive businesses", action:"Protect capital, avoid forced trades, and prepare a watchlist for the next recovery rather than trying to predict the exact bottom.", color:"cycle-recession" },
  ],
  vi: [
    { season:"Mùa xuân", phase:"Đầu chu kỳ", economy:"Tăng trưởng chuyển sang dương và tăng tốc. Tín dụng nới lỏng, tồn kho thấp và lợi nhuận doanh nghiệp bắt đầu phục hồi.", sectors:"Tiêu dùng không thiết yếu · Tài chính · Bất động sản · Công nghiệp · Công nghệ thông tin", action:"Tìm sức mạnh thị trường đã được xác nhận và lợi nhuận cải thiện. Luôn xác định rủi ro vì tín hiệu phục hồi có thể thất bại.", color:"cycle-early" },
    { season:"Mùa hè", phase:"Giữa chu kỳ", economy:"Tăng trưởng vẫn dương nhưng chậm lại. Tín dụng thuận lợi, khả năng sinh lời khỏe và chính sách tiền tệ dần trung lập.", sectors:"Công nghệ thông tin · Công nghiệp · Các ngành tăng trưởng chọn lọc", action:"Ưu tiên doanh nghiệp tăng trưởng chất lượng và cổ phiếu dẫn dắt có sức mạnh tương đối. Vẫn phải chuẩn bị cho các nhịp điều chỉnh.", color:"cycle-mid" },
    { season:"Mùa thu", phase:"Cuối chu kỳ", economy:"Tăng trưởng còn dương nhưng giảm tốc. Lạm phát, lãi suất, tồn kho và áp lực lên biên lợi nhuận có thể tăng.", sectors:"Năng lượng · Vật liệu · Y tế · Tiêu dùng thiết yếu · Tiện ích", action:"Nâng tiêu chuẩn chất lượng, giảm đòn bẩy quá mức và theo dõi độ rộng thị trường hoặc dự báo lợi nhuận suy yếu.", color:"cycle-late" },
    { season:"Mùa đông", phase:"Suy thoái", economy:"Hoạt động kinh tế và lợi nhuận co lại, tín dụng khan hiếm; lãi suất thường giảm khi chính sách chuyển sang hỗ trợ.", sectors:"Tiêu dùng thiết yếu · Tiện ích · Y tế · Doanh nghiệp phòng thủ", action:"Bảo vệ vốn, tránh giao dịch ép buộc và chuẩn bị danh sách theo dõi cho kỳ phục hồi tiếp theo thay vì đoán chính xác đáy.", color:"cycle-recession" },
  ],
};

const terminology = {
  en: {
    market: [
      ["Priced in", "The market price already reflects a widely expected event or piece of information. Good news can arrive without another price rise if investors expected it earlier."],
      ["ATH", "All-time high: the highest price the security or index has reached in its available trading history."],
      ["Bull market", "A broadly rising market with optimistic sentiment; a 20% rise in a broad index is a commonly used threshold."],
      ["Bear market", "A broadly declining market with pessimistic sentiment; a 20% fall in a broad index is a commonly used threshold."],
      ["Correction", "A meaningful decline from a recent high that is smaller than the conventional bear-market threshold."],
      ["Drawdown", "The percentage decline from a portfolio or security’s previous peak to a later trough."],
      ["Volatility", "The size and frequency of price changes. Higher volatility means a wider range of possible outcomes, not only losses."],
      ["Liquidity", "How easily shares can be traded without substantially moving the price."],
    ],
    trading: [
      ["Bid", "The highest displayed price a buyer is currently willing to pay."],
      ["Ask", "The lowest displayed price a seller is currently willing to accept."],
      ["Spread", "The difference between the ask and bid prices; wider spreads generally increase trading friction."],
      ["Market order", "An instruction to trade at the best currently available price. Execution is prioritized, but the final price is not guaranteed."],
      ["Limit order", "An instruction to trade only at a specified price or better. Price is controlled, but execution is not guaranteed."],
      ["Stop order", "An order that activates after a specified stop price is reached and then generally becomes a market order."],
      ["Support", "A price area where buying demand has previously been strong enough to slow or reverse a decline."],
      ["Resistance", "A price area where selling supply has previously been strong enough to slow or reverse an advance."],
      ["Breakout", "A move beyond an established support, resistance, or chart boundary, ideally confirmed by participation such as volume."],
      ["Long / Short", "Long means owning or gaining from a rise. Short generally means selling borrowed shares in expectation of buying them back lower."],
    ],
    options: [
      ["Call", "A contract giving its buyer the right, but not the obligation, to buy the underlying at the strike price before or at expiration, depending on contract style."],
      ["Put", "A contract giving its buyer the right, but not the obligation, to sell the underlying at the strike price before or at expiration, depending on contract style."],
      ["Strike price", "The contract price at which the option holder may buy with a call or sell with a put."],
      ["Premium", "The price paid by the option buyer and received by the option seller."],
      ["Expiration", "The date after which the option contract ceases to exist."],
      ["ITM / ATM / OTM", "In-, at-, or out-of-the-money describes the relationship between the underlying price and strike price."],
      ["Intrinsic value", "The amount an option is in-the-money. Only in-the-money options have intrinsic value."],
      ["Time value", "The portion of the premium above intrinsic value, reflecting time and uncertainty before expiration."],
      ["Implied volatility", "The market’s forward-looking volatility assumption embedded in option prices; it does not predict direction."],
    ],
  },
  vi: {
    market: [
      ["Priced in (đã phản ánh vào giá)", "Giá thị trường đã phản ánh một sự kiện hoặc thông tin được kỳ vọng rộng rãi. Tin tốt xuất hiện chưa chắc làm giá tăng thêm nếu nhà đầu tư đã dự đoán trước."],
      ["ATH", "All-time high: mức giá cao nhất mà cổ phiếu hoặc chỉ số từng đạt trong lịch sử giao dịch hiện có."],
      ["Thị trường bò", "Thị trường tăng diện rộng với tâm lý lạc quan; mức tăng 20% của chỉ số rộng thường được dùng làm ngưỡng tham khảo."],
      ["Thị trường gấu", "Thị trường giảm diện rộng với tâm lý bi quan; mức giảm 20% của chỉ số rộng thường được dùng làm ngưỡng tham khảo."],
      ["Điều chỉnh", "Một nhịp giảm đáng kể từ đỉnh gần nhất nhưng nhỏ hơn ngưỡng thị trường gấu thông thường."],
      ["Drawdown", "Tỷ lệ giảm từ đỉnh trước đó của danh mục hoặc cổ phiếu xuống đáy sau đó."],
      ["Biến động", "Độ lớn và tần suất thay đổi giá. Biến động cao nghĩa là phạm vi kết quả rộng hơn, không chỉ đồng nghĩa với thua lỗ."],
      ["Thanh khoản", "Mức độ dễ dàng mua bán cổ phiếu mà không làm giá thay đổi đáng kể."],
    ],
    trading: [
      ["Bid (giá mua)", "Mức giá hiển thị cao nhất mà người mua hiện sẵn sàng trả."],
      ["Ask (giá bán)", "Mức giá hiển thị thấp nhất mà người bán hiện sẵn sàng chấp nhận."],
      ["Spread", "Chênh lệch giữa giá ask và bid; spread rộng thường làm tăng chi phí giao dịch."],
      ["Lệnh thị trường", "Lệnh giao dịch tại mức giá tốt nhất đang có. Ưu tiên khớp lệnh nhưng không bảo đảm giá cuối cùng."],
      ["Lệnh giới hạn", "Lệnh chỉ giao dịch tại mức giá chỉ định hoặc tốt hơn. Kiểm soát giá nhưng không bảo đảm được khớp."],
      ["Lệnh dừng", "Lệnh được kích hoạt khi giá chạm mức dừng, sau đó thường chuyển thành lệnh thị trường."],
      ["Hỗ trợ", "Vùng giá nơi lực mua trước đây đủ mạnh để làm chậm hoặc đảo chiều nhịp giảm."],
      ["Kháng cự", "Vùng giá nơi lực bán trước đây đủ mạnh để làm chậm hoặc đảo chiều nhịp tăng."],
      ["Breakout (phá vỡ)", "Giá vượt khỏi hỗ trợ, kháng cự hoặc biên đồ thị; thường đáng tin hơn khi có khối lượng xác nhận."],
      ["Long / Short", "Long là sở hữu hoặc hưởng lợi khi giá tăng. Short thường là bán cổ phiếu vay mượn với kỳ vọng mua lại ở giá thấp hơn."],
    ],
    options: [
      ["Call", "Hợp đồng cho người mua quyền, nhưng không bắt buộc, mua tài sản cơ sở tại giá thực hiện trước hoặc vào ngày đáo hạn tùy loại hợp đồng."],
      ["Put", "Hợp đồng cho người mua quyền, nhưng không bắt buộc, bán tài sản cơ sở tại giá thực hiện trước hoặc vào ngày đáo hạn tùy loại hợp đồng."],
      ["Giá thực hiện", "Mức giá hợp đồng mà người nắm giữ quyền chọn có thể mua bằng call hoặc bán bằng put."],
      ["Phí quyền chọn", "Số tiền người mua quyền chọn trả và người bán quyền chọn nhận."],
      ["Ngày đáo hạn", "Ngày mà sau đó hợp đồng quyền chọn chấm dứt tồn tại."],
      ["ITM / ATM / OTM", "Trong tiền, hòa vốn giá thực hiện hoặc ngoài tiền mô tả quan hệ giữa giá tài sản cơ sở và giá thực hiện."],
      ["Giá trị nội tại", "Phần giá trị mà quyền chọn đang ở trạng thái ITM. Chỉ quyền chọn ITM có giá trị nội tại."],
      ["Giá trị thời gian", "Phần phí quyền chọn vượt giá trị nội tại, phản ánh thời gian và bất định trước đáo hạn."],
      ["Biến động hàm ý", "Giả định biến động tương lai được thị trường phản ánh trong giá quyền chọn; nó không dự đoán hướng giá."],
    ],
  },
};

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<Theme>("light");
  const [flowStyle, setFlowStyle] = useState<FlowStyle>("gates");
  const [cyclePhase, setCyclePhase] = useState(0);
  const [page, setPage] = useState<Page>("home");
  const [book, setBook] = useState<Book | null>(null);
  const [chapter, setChapter] = useState(0);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [account, setAccount] = useState(100000);
  const [riskPct, setRiskPct] = useState(1);
  const [entry, setEntry] = useState(50);
  const [stop, setStop] = useState(47);
  const [target, setTarget] = useState(58);
  const [stockPrice, setStockPrice] = useState(50);
  const [eps, setEps] = useState(4);
  const [bvps, setBvps] = useState(25);
  const [growth, setGrowth] = useState(12);
  const [netIncome, setNetIncome] = useState(120);
  const [equity, setEquity] = useState(600);
  const [assets, setAssets] = useState(1000);
  const [cfo, setCfo] = useState(180);
  const [capex, setCapex] = useState(60);
  const [debt, setDebt] = useState(300);
  const t = copy[lang];

  useEffect(() => {
    const saved = localStorage.getItem("stockbook-language") as Lang | null;
    if (saved === "vi" || saved === "en") queueMicrotask(() => setLang(saved));
    const savedTheme = localStorage.getItem("stockbook-theme") as Theme | null;
    const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    queueMicrotask(() => setTheme(savedTheme === "dark" || savedTheme === "light" ? savedTheme : preferredTheme));
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("stockbook-theme", theme);
  }, [theme]);
  useEffect(() => {
    const controller = new AbortController();
    localStorage.setItem("stockbook-language", lang);
    document.documentElement.lang = lang;
    fetch(`./content/investment-experience-${lang}.json`, { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error(`Could not load ${lang} book content`);
        return r.json();
      })
      .then((raw: Book) => setBook(normalizeBook(raw)))
      .catch(error => {
        if (error.name !== "AbortError") console.error(error);
      });
    return () => controller.abort();
  }, [lang]);

  const riskBudget = account * riskPct / 100;
  const riskPerShare = Math.max(entry - stop, 0);
  const shares = riskPerShare ? Math.floor(riskBudget / riskPerShare) : 0;
  const rr = riskPerShare ? (target - entry) / riskPerShare : 0;
  const pe = eps ? stockPrice / eps : 0;
  const pb = bvps ? stockPrice / bvps : 0;
  const peg = growth ? pe / growth : 0;
  const roe = equity ? netIncome / equity * 100 : 0;
  const roa = assets ? netIncome / assets * 100 : 0;
  const fcf = cfo - capex;
  const debtToEquity = equity ? debt / equity : 0;
  const activeChapter = book?.chapters[chapter];
  const outline = activeChapter?.blocks.map((block, index) => ({ block, index, level: blockOutlineLevel(block) })).filter(item => item.level) ?? [];

  function navigate(next: Page) { setPage(next); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function changeLanguage(next: Lang) { setChapter(0); setLang(next); }

  return <main>
    <header className="topbar">
      <button className="brand" onClick={() => navigate("home")}><span className="brand-mark">S</span>{t.brand}</button>
      <nav>{(["home", "book", "framework", "cycles", "terminology", "strategies", "tools"] as Page[]).map((item, i) =>
        <button key={item} className={page === item ? "active" : ""} onClick={() => navigate(item)}>{t.nav[i]}</button>)}</nav>
      <div className="header-controls"><button className="theme-toggle" aria-label={theme === "light" ? (lang === "en" ? "Use dark mode" : "Dùng chế độ tối") : (lang === "en" ? "Use light mode" : "Dùng chế độ sáng")} title={theme === "light" ? (lang === "en" ? "Dark mode" : "Chế độ tối") : (lang === "en" ? "Light mode" : "Chế độ sáng")} onClick={() => setTheme(current => current === "light" ? "dark" : "light")}><span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span></button><div className="language" aria-label="Language">
        <button className={lang === "en" ? "selected" : ""} onClick={() => changeLanguage("en")}>EN</button>
        <button className={lang === "vi" ? "selected" : ""} onClick={() => changeLanguage("vi")}>VI</button>
      </div>
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
      <aside className={`chapter-tree ${outlineOpen ? "open" : ""}`}><button className="tree-toggle" aria-expanded={outlineOpen} onClick={() => setOutlineOpen(value => !value)}><span>{lang === "en" ? "Chapter outline" : "Mục lục chương"}</span><b aria-hidden="true">{outlineOpen ? "−" : "+"}</b></button><div className="tree-body"><p className="eyebrow">{t.bookTitle}</p>{book?.chapters.map((item, i) => <div className="tree-chapter" key={item.id}><button className={chapter === i ? "current" : ""} aria-expanded={chapter === i} onClick={() => {setChapter(i); window.scrollTo(0,0)}}><span>{String(i + 1).padStart(2,"0")}</span>{item.title.replace(/^(Chapter|Chương)\s+\d+\s*:\s*/i, "")}</button>{chapter === i && <div className="tree-children">{outline.map(({block, index, level}) => { const [label] = splitHeadingText(block.text); return <button className={`tree-item level-${level}`} key={index} title={label} onClick={() => {document.getElementById(`book-item-${index}`)?.scrollIntoView({behavior:"smooth", block:"start"}); setOutlineOpen(false)}}><span aria-hidden="true">{level === 1 ? "▾" : "—"}</span>{label.replace(/^[-]\s*/, "")}</button>})}</div>}</div>)}</div></aside>
      <article className="book-page">{book && <><p className="chapter-label">{t.chapter} {book.chapters[chapter].number} / 5</p><h1>{book.chapters[chapter].title}</h1><div className="book-rule"/>{book.chapters[chapter].blocks.map((block, i) => <BookBlock block={block} index={i} key={i}/>)}<div className="chapter-nav"><button disabled={chapter === 0} onClick={() => setChapter(chapter - 1)}>← {t.previous}</button><a href={`./downloads/${lang === "en" ? "Kinh%20nghiệm_Luan_June%202026_English.pdf" : "Kinh%20nghiệm_Luan_June%202026.pdf"}`}>{t.download}</a><button disabled={chapter === 4} onClick={() => setChapter(chapter + 1)}>{t.next} →</button></div></>}</article>
    </section>}

    {page === "framework" && <section className="content-page framework-page"><p className="eyebrow">{lang === "en" ? "Decision system" : "Hệ thống quyết định"}</p><h1>{t.flowTitle}</h1><p className="lede narrow">{t.flowIntro}</p><div className="flow-style-switch" aria-label={lang === "en" ? "Flow diagram style" : "Kiểu sơ đồ quy trình"}>{(["gates","pipeline","cycle"] as FlowStyle[]).map((style, index) => <button key={style} className={flowStyle === style ? "selected" : ""} aria-pressed={flowStyle === style} onClick={() => setFlowStyle(style)}>{lang === "en" ? ["Decision gates","Quick pipeline","Learning cycle"][index] : ["Cổng quyết định","Quy trình nhanh","Chu trình học hỏi"][index]}</button>)}</div>
      {flowStyle === "gates" && <><div className="graph-legend"><span><i className="yes-dot"/> {lang === "en" ? "Pass: continue" : "Đạt: tiếp tục"}</span><span><i className="no-dot"/> {lang === "en" ? "Fail: protect capital" : "Không đạt: bảo vệ vốn"}</span></div><div className="decision-graph" role="img" aria-label={lang === "en" ? "Stock-buying thought process from market analysis through review" : "Quy trình suy nghĩ khi mua cổ phiếu từ phân tích thị trường đến đánh giá"}>{flow[lang].map((step, i) => <div className="decision-row" key={step[0]}><div className="decision-spine"><span className="step-number">{step[0]}</span>{i < flow[lang].length - 1 && <span className="yes-path"><b>{lang === "en" ? "YES" : "CÓ"}</b>↓</span>}</div><article className="decision-node"><small>{lang === "en" ? `Gate ${step[0]}` : `Cổng ${step[0]}`}</small><h3>{step[1]}</h3><p>{step[2]}</p></article><div className="no-path"><span>{lang === "en" ? "NO" : "KHÔNG"} →</span><strong>{step[3].replace(/^(No|Không)\s*→\s*/i, "")}</strong></div></div>)}<div className="feedback-loop"><span>↺</span><p><strong>{lang === "en" ? "Learn and repeat" : "Học hỏi và lặp lại"}</strong><br/>{lang === "en" ? "The journal updates your filters, rules, and next decision." : "Nhật ký cập nhật bộ lọc, quy tắc và quyết định tiếp theo."}</p></div></div></>}
      {flowStyle === "pipeline" && <div className="pipeline-graph" role="img" aria-label={lang === "en" ? "Compact seven-step stock decision pipeline" : "Quy trình quyết định cổ phiếu bảy bước thu gọn"}>{flow[lang].map((step, i) => <div className="pipeline-wrap" key={step[0]}><article><span>{step[0]}</span><h3>{step[1]}</h3><p>{step[2]}</p><small>{step[3]}</small></article>{i < flow[lang].length - 1 && <b aria-hidden="true">→</b>}</div>)}</div>}
      {flowStyle === "cycle" && <div className="cycle-graph" role="img" aria-label={lang === "en" ? "Observe, plan, act, and learn investment cycle" : "Chu trình đầu tư quan sát, lập kế hoạch, hành động và học hỏi"}><article className="cycle-observe"><span>01</span><h3>{lang === "en" ? "Observe" : "Quan sát"}</h3><p>{flow[lang][0][1]} · {flow[lang][1][1]}</p></article><i>→</i><article className="cycle-plan"><span>02</span><h3>{lang === "en" ? "Plan" : "Lập kế hoạch"}</h3><p>{flow[lang][2][1]} · {flow[lang][3][1]} · {flow[lang][4][1]}</p></article><i>↓</i><article className="cycle-learn"><span>04</span><h3>{lang === "en" ? "Learn" : "Học hỏi"}</h3><p>{flow[lang][6][2]}</p></article><i>←</i><article className="cycle-act"><span>03</span><h3>{lang === "en" ? "Act" : "Hành động"}</h3><p>{flow[lang][5][2]}</p></article><i>↑</i><div className="cycle-core"><strong>{lang === "en" ? "Protect capital" : "Bảo vệ vốn"}</strong><small>{lang === "en" ? "Discipline over prediction" : "Kỷ luật hơn dự đoán"}</small></div></div>}
    </section>}

    {page === "cycles" && <section className="content-page cycles-page"><p className="eyebrow">{lang === "en" ? "Market seasons" : "Các mùa của thị trường"}</p><h1>{lang === "en" ? "How the stock-market cycle changes the decision" : "Chu kỳ thị trường thay đổi quyết định như thế nào"}</h1><p className="lede narrow">{lang === "en" ? "The economy does not move in a straight line. Use this map to connect growth, credit, profits, sector leadership, and risk posture." : "Nền kinh tế không vận động theo đường thẳng. Sơ đồ này kết nối tăng trưởng, tín dụng, lợi nhuận, nhóm ngành dẫn dắt và cách quản trị rủi ro."}</p>
      <div className="market-cycle-chart" role="img" aria-label={lang === "en" ? "Four-phase business and stock market cycle" : "Chu kỳ kinh tế và chứng khoán gồm bốn giai đoạn"}>
        <svg viewBox="0 0 1000 310" aria-hidden="true"><path className="cycle-axis" d="M40 250H960"/><path className="cycle-wave" d="M40 235 C150 235 170 75 285 75 S410 155 510 155 S620 55 735 90 S850 260 960 235"/>{marketCycles[lang].map((phase,index) => { const points=[[120,190],[360,110],[690,78],[890,220]][index]; return <g key={phase.phase} className={cyclePhase === index ? "active" : ""}><circle cx={points[0]} cy={points[1]} r="13"/><text x={points[0]} y={points[1]-28} textAnchor="middle">{phase.season}</text><text x={points[0]} y={points[1]+38} textAnchor="middle">{phase.phase}</text></g>})}</svg>
        <div className="cycle-phase-tabs">{marketCycles[lang].map((phase,index) => <button key={phase.phase} className={`${phase.color} ${cyclePhase === index ? "selected" : ""}`} aria-pressed={cyclePhase === index} onClick={() => setCyclePhase(index)}><span>{phase.season}</span><strong>{phase.phase}</strong></button>)}</div>
      </div>
      <article className={`cycle-detail ${marketCycles[lang][cyclePhase].color}`}><header><span>{String(cyclePhase + 1).padStart(2,"0")}</span><div><small>{marketCycles[lang][cyclePhase].season}</small><h2>{marketCycles[lang][cyclePhase].phase}</h2></div></header><div className="cycle-detail-grid"><section><h3>{lang === "en" ? "Economic pattern" : "Đặc điểm kinh tế"}</h3><p>{marketCycles[lang][cyclePhase].economy}</p></section><section><h3>{lang === "en" ? "Historical sector tendency" : "Xu hướng ngành trong lịch sử"}</h3><p>{marketCycles[lang][cyclePhase].sectors}</p></section><section><h3>{lang === "en" ? "Decision posture" : "Cách ra quyết định"}</h3><p>{marketCycles[lang][cyclePhase].action}</p></section></div></article>
      <p className="cycle-caution">{lang === "en" ? "Cycles are a framework, not a clock: phase lengths vary, markets often anticipate the economy, and no sector leads every cycle." : "Chu kỳ là khung phân tích, không phải đồng hồ: độ dài mỗi giai đoạn khác nhau, thị trường thường đi trước nền kinh tế và không ngành nào luôn dẫn dắt."}</p>
      <div className="cycle-sources"><span>{lang === "en" ? "Research:" : "Nguồn nghiên cứu:"}</span><a href="https://www.fidelity.com/viewpoints/investing-ideas/sector-investing-business-cycle" target="_blank" rel="noreferrer">Fidelity business cycle</a><a href="https://www.fidelity.com/learning-center/trading-investing/markets-sectors/intro-sector-rotation-strats" target="_blank" rel="noreferrer">Fidelity sector rotation</a><a href="https://www.schwab.com/learn/story/what-are-stock-sectors" target="_blank" rel="noreferrer">Schwab sectors</a></div>
    </section>}

    {page === "terminology" && <section className="content-page terminology-page"><p className="eyebrow">{lang === "en" ? "Market language" : "Ngôn ngữ thị trường"}</p><h1>{lang === "en" ? "Stock terminology, shown on the chart" : "Thuật ngữ chứng khoán trên biểu đồ"}</h1><p className="lede narrow">{lang === "en" ? "Learn what traders mean when they say a move is priced in, a stock reached ATH, the market turned bearish, or an option is a call or put." : "Hiểu ý nghĩa khi nhà giao dịch nói thông tin đã phản ánh vào giá, cổ phiếu đạt ATH, thị trường chuyển sang gấu hoặc quyền chọn là call hay put."}</p>
      <div className="term-chart" role="img" aria-label={lang === "en" ? "Annotated stock price chart demonstrating common market terminology" : "Biểu đồ giá cổ phiếu minh họa các thuật ngữ thị trường phổ biến"}><svg viewBox="0 0 1000 390" aria-hidden="true"><path className="term-grid" d="M55 80H960M55 180H960M55 280H960"/><path className="price-path" d="M55 300 C120 285 150 250 205 258 S280 205 340 215 S410 125 485 112 S555 130 615 75 S670 95 705 90 S760 180 805 205 S870 260 945 285"/><path className="support-line" d="M55 300H945"/><path className="resistance-line" d="M205 215H575"/><circle cx="615" cy="75" r="9"/><text x="615" y="48" textAnchor="middle">ATH</text><text x="160" y="335">{lang === "en" ? "Bull trend" : "Xu hướng bò"}</text><text x="820" y="330">{lang === "en" ? "Bear trend" : "Xu hướng gấu"}</text><text x="385" y="200">{lang === "en" ? "Resistance" : "Kháng cự"}</text><text x="65" y="292">{lang === "en" ? "Support" : "Hỗ trợ"}</text><path className="breakout-mark" d="M470 165L505 120"/><text x="430" y="158">{lang === "en" ? "Breakout" : "Phá vỡ"}</text><path className="event-line" d="M705 90V245"/><text x="715" y="240">{lang === "en" ? "Good news arrives" : "Tin tốt xuất hiện"}</text><text x="715" y="260">{lang === "en" ? "but was priced in" : "nhưng đã phản ánh vào giá"}</text></svg></div>
      <div className="options-explainer"><div><p className="eyebrow">{lang === "en" ? "Options at expiration" : "Quyền chọn khi đáo hạn"}</p><h2>{lang === "en" ? "Long call and long put payoff" : "Lợi nhuận của mua call và mua put"}</h2><p>{lang === "en" ? "Example strike = 100 and premium = 5. The buyer’s maximum loss is the premium in these simplified diagrams." : "Ví dụ giá thực hiện = 100 và phí = 5. Trong sơ đồ đơn giản này, khoản lỗ tối đa của người mua là phí quyền chọn."}</p></div><svg viewBox="0 0 800 330" role="img" aria-label={lang === "en" ? "Long call and long put profit at expiration" : "Lợi nhuận mua call và mua put khi đáo hạn"}><path className="payoff-axis" d="M55 165H755M400 35V290"/><path className="call-payoff" d="M70 200H400L730 55"/><path className="put-payoff" d="M70 55L400 200H730"/><path className="zero-line" d="M55 165H755"/><text x="710" y="45">CALL</text><text x="75" y="45">PUT</text><text x="410" y="318">{lang === "en" ? "Strike 100" : "Giá thực hiện 100"}</text><text x="650" y="155">{lang === "en" ? "Profit" : "Lãi"}</text><text x="650" y="220">{lang === "en" ? "Premium loss" : "Lỗ phí"}</text></svg></div>
      <div className="term-groups">{(["market","trading","options"] as const).map(group => <section key={group}><h2>{lang === "en" ? {market:"Market and price",trading:"Trading and orders",options:"Options"}[group] : {market:"Thị trường và giá",trading:"Giao dịch và lệnh",options:"Quyền chọn"}[group]}</h2><div className="term-grid-cards">{terminology[lang][group].map(term => <article key={term[0]}><h3>{term[0]}</h3><p>{term[1]}</p></article>)}</div></section>)}</div>
      <p className="term-warning">{lang === "en" ? "Options and short selling can involve substantial risk. These diagrams explain terminology and are not trading recommendations." : "Quyền chọn và bán khống có thể có rủi ro lớn. Các sơ đồ chỉ giải thích thuật ngữ, không phải khuyến nghị giao dịch."}</p>
      <div className="cycle-sources"><span>{lang === "en" ? "Definitions:" : "Nguồn định nghĩa:"}</span><a href="https://www.investor.gov/introduction-investing/investing-basics/glossary" target="_blank" rel="noreferrer">Investor.gov glossary</a><a href="https://www.finra.org/investors/investing/investment-products/stocks/order-types" target="_blank" rel="noreferrer">FINRA order types</a><a href="https://www.optionseducation.org/optionsoverview/options-basics" target="_blank" rel="noreferrer">Options Industry Council</a></div>
    </section>}

    {page === "strategies" && <section className="content-page"><p className="eyebrow">Strategy library</p><h1>{t.strategiesTitle}</h1><div className="strategy-grid">{strategies[lang].map((s, i) => <article key={s[0]}><span>{String(i + 1).padStart(2,"0")}</span><h2>{s[0]}</h2><p>{s[1]}</p><small>{s[2]}</small></article>)}</div></section>}

    {page === "tools" && <section className="content-page tools-page"><p className="eyebrow">{lang === "en" ? "Calculators" : "Máy tính"}</p><h1>{t.toolsTitle}</h1><p className="lede narrow">{lang === "en" ? "Use the book’s core formulas to test valuation, business quality, cash flow, and trade risk." : "Dùng các công thức cốt lõi trong sách để kiểm tra định giá, chất lượng doanh nghiệp, dòng tiền và rủi ro giao dịch."}</p><div className="tools-grid">
      <article className="tool"><p className="tool-kind">{lang === "en" ? "Risk" : "Rủi ro"}</p><h2>{lang === "en" ? "Position size" : "Quy mô vị thế"}</h2><CalcField label={lang === "en" ? "Account value" : "Giá trị tài khoản"} value={account} onChange={setAccount}/><CalcField label={lang === "en" ? "Risk per trade (%)" : "Rủi ro mỗi giao dịch (%)"} value={riskPct} onChange={setRiskPct} step="0.1"/><CalcField label={lang === "en" ? "Entry price" : "Giá mua"} value={entry} onChange={setEntry}/><CalcField label={lang === "en" ? "Stop price" : "Giá cắt lỗ"} value={stop} onChange={setStop}/><div className="result"><span>{lang === "en" ? "Maximum shares" : "Số cổ phiếu tối đa"}</span><strong>{shares.toLocaleString()}</strong><small>{lang === "en" ? `Capital at risk: ${riskBudget.toLocaleString()}` : `Vốn chịu rủi ro: ${riskBudget.toLocaleString()}`}</small></div></article>
      <article className="tool"><p className="tool-kind">{lang === "en" ? "Trade plan" : "Kế hoạch giao dịch"}</p><h2>{lang === "en" ? "Reward-to-risk" : "Lợi nhuận / rủi ro"}</h2><CalcField label={lang === "en" ? "Entry price" : "Giá mua"} value={entry} onChange={setEntry}/><CalcField label={lang === "en" ? "Stop price" : "Giá cắt lỗ"} value={stop} onChange={setStop}/><CalcField label={lang === "en" ? "Target price" : "Giá mục tiêu"} value={target} onChange={setTarget}/><div className={`result ${rr >= 2 ? "good" : "warn"}`}><span>Reward : Risk</span><strong>{Number.isFinite(rr) ? rr.toFixed(2) : "0.00"} : 1</strong><small>{rr >= 2 ? (lang === "en" ? "Meets the 2:1 minimum" : "Đạt mức tối thiểu 2:1") : (lang === "en" ? "Below the 2:1 minimum" : "Dưới mức tối thiểu 2:1")}</small></div></article>
      <article className="tool"><p className="tool-kind">{lang === "en" ? "Valuation" : "Định giá"}</p><h2>{lang === "en" ? "P/E, P/B and PEG" : "P/E, P/B và PEG"}</h2><CalcField label={lang === "en" ? "Stock price" : "Giá cổ phiếu"} value={stockPrice} onChange={setStockPrice}/><CalcField label="EPS" value={eps} onChange={setEps}/><CalcField label="BVPS" value={bvps} onChange={setBvps}/><CalcField label={lang === "en" ? "EPS growth (%)" : "Tăng trưởng EPS (%)"} value={growth} onChange={setGrowth}/><div className="metric-results"><span>P/E<strong>{pe.toFixed(2)}</strong></span><span>P/B<strong>{pb.toFixed(2)}</strong></span><span>PEG<strong>{peg.toFixed(2)}</strong></span></div></article>
      <article className="tool"><p className="tool-kind">{lang === "en" ? "Profitability" : "Khả năng sinh lời"}</p><h2>ROE &amp; ROA</h2><CalcField label={lang === "en" ? "Net income" : "Lợi nhuận ròng"} value={netIncome} onChange={setNetIncome}/><CalcField label={lang === "en" ? "Average equity" : "Vốn chủ sở hữu bình quân"} value={equity} onChange={setEquity}/><CalcField label={lang === "en" ? "Average assets" : "Tổng tài sản bình quân"} value={assets} onChange={setAssets}/><div className="metric-results two"><span>ROE<strong>{roe.toFixed(2)}%</strong></span><span>ROA<strong>{roa.toFixed(2)}%</strong></span></div></article>
      <article className="tool"><p className="tool-kind">{lang === "en" ? "Cash and leverage" : "Tiền mặt và đòn bẩy"}</p><h2>{lang === "en" ? "FCF and debt" : "FCF và nợ"}</h2><CalcField label={lang === "en" ? "Operating cash flow" : "Dòng tiền hoạt động"} value={cfo} onChange={setCfo}/><CalcField label={lang === "en" ? "Capital expenditure" : "Chi tiêu vốn"} value={capex} onChange={setCapex}/><CalcField label={lang === "en" ? "Total debt" : "Tổng nợ"} value={debt} onChange={setDebt}/><CalcField label={lang === "en" ? "Shareholders’ equity" : "Vốn chủ sở hữu"} value={equity} onChange={setEquity}/><div className="metric-results two"><span>FCF<strong>{fcf.toLocaleString()}</strong></span><span>D/E<strong>{debtToEquity.toFixed(2)}</strong></span></div></article>
    </div></section>}

    <footer><span>{t.brand}</span><p>{t.disclaimer}</p><span>2026</span></footer>
  </main>;
}
