"use client";

import { useEffect, useState } from "react";

type Lang = "en" | "vi";
type Theme = "light" | "dark";
type FlowStyle = "gates" | "pipeline" | "cycle";
type Page = "home" | "book" | "framework" | "cycles" | "macro" | "terminology" | "strategies" | "tools";
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
    brand: "Stockbook", nav: ["Home", "Book", "Framework", "Market cycles", "Fed & macro", "Terminology", "Strategies", "Tools"],
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
    brand: "Sổ tay Chứng khoán", nav: ["Trang chủ", "Sách", "Quy trình", "Chu kỳ", "Fed & Vĩ mô", "Thuật ngữ", "Chiến lược", "Công cụ"],
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

const strategyProfiles = {
  en: [
    { name:"Value investing", horizon:"Years", workload:"Moderate research", benefit:"May provide a margin of safety when price is genuinely below conservative business value. Mature value companies may also return cash through dividends.", risk:"A cheap-looking company can be a value trap. The market may remain pessimistic for years, the business can deteriorate, or the valuation estimate can be wrong.", fit:"Patient investors willing to read financial statements and tolerate long periods of underperformance.", rules:"Require balance-sheet strength, durable cash flow, a clear valuation range, diversification, and a thesis review when facts change.", x:38, y:38 },
    { name:"Growth investing", horizon:"Years", workload:"Moderate–high research", benefit:"Participation in companies whose revenue, earnings, and addressable markets may compound faster than the broader market.", risk:"High expectations are embedded in valuation. Slower growth, higher rates, competition, or execution mistakes can cause sharp price declines.", fit:"Long-horizon investors who can tolerate volatility and distinguish durable growth from temporary excitement.", rules:"Verify revenue quality, margins, cash flow, competitive advantage, valuation, and position concentration.", x:48, y:56 },
    { name:"Swing trading", horizon:"Days–weeks", workload:"Frequent monitoring", benefit:"Attempts to capture shorter price swings without requiring continuous minute-by-minute trading. It may complement a separate long-term portfolio.", risk:"Overnight gaps, false breakouts, stop slippage, transaction costs, and repeated small losses. More opportunities also mean more exposure to mistakes.", fit:"Experienced traders with defined setups, sufficient risk capital, and time to review charts and positions daily.", rules:"Trade liquid securities, follow the broader trend, define entry/stop/target first, limit position risk, and journal every setup.", x:70, y:68 },
    { name:"Day trading", horizon:"Minutes–hours", workload:"Full-time intensity", benefit:"Positions are normally closed the same day, reducing overnight gap exposure. Liquid markets can offer frequent setups and rapid feedback.", risk:"Regulators warn of large and immediate losses, substantial costs, emotional stress, execution failures, and losses beyond the initial investment when leverage or short selling is used.", fit:"Only highly experienced traders with dedicated risk capital, robust execution knowledge, and the ability to monitor markets continuously.", rules:"Never use living, emergency, education, or retirement money. Start with simulation, avoid leverage until proven, cap loss per trade and per day, use liquid instruments, and stop when discipline breaks.", x:90, y:94 },
    { name:"Dividend investing", horizon:"Years", workload:"Periodic research", benefit:"Potential cash income that can be spent or reinvested, allowing shares and future distributions to compound.", risk:"Dividends are not guaranteed. High yield can signal business stress; cuts, inflation, taxes, interest rates, and sector concentration can reduce results.", fit:"Long-term investors seeking income who still evaluate total return and business quality.", rules:"Check payout ratio, free cash flow, debt, dividend history, earnings resilience, valuation, and sector diversification.", x:30, y:34 },
    { name:"Index / ETF", horizon:"Years", workload:"Low–moderate", benefit:"Broad funds can provide diversification, transparent exposure, lower research burden, and a simple vehicle for regular investing.", risk:"Diversification does not prevent market loss. Narrow or leveraged ETFs can be concentrated; fees, tracking difference, spreads, and premiums or discounts also matter.", fit:"Investors seeking a repeatable core strategy aligned with goals, risk tolerance, and asset allocation.", rules:"Understand the index, holdings, concentration, costs, liquidity, tax treatment, and whether the fund is broad, thematic, leveraged, or inverse.", x:20, y:24 },
  ],
  vi: [
    { name:"Đầu tư giá trị", horizon:"Nhiều năm", workload:"Nghiên cứu vừa phải", benefit:"Có thể tạo biên an toàn khi giá thực sự thấp hơn giá trị doanh nghiệp thận trọng. Doanh nghiệp giá trị trưởng thành cũng có thể trả cổ tức.", risk:"Cổ phiếu tưởng rẻ có thể là bẫy giá trị. Thị trường có thể bi quan nhiều năm, doanh nghiệp suy yếu hoặc ước tính định giá sai.", fit:"Nhà đầu tư kiên nhẫn, sẵn sàng đọc báo cáo tài chính và chịu được thời gian dài kém hiệu quả.", rules:"Yêu cầu bảng cân đối khỏe, dòng tiền bền vững, vùng định giá rõ, đa dạng hóa và đánh giá lại khi dữ kiện thay đổi.", x:38, y:38 },
    { name:"Đầu tư tăng trưởng", horizon:"Nhiều năm", workload:"Nghiên cứu vừa–cao", benefit:"Tham gia vào doanh nghiệp có doanh thu, lợi nhuận và thị trường mục tiêu có thể tăng nhanh hơn thị trường chung.", risk:"Định giá đã phản ánh kỳ vọng cao. Tăng trưởng chậm, lãi suất cao, cạnh tranh hoặc thực thi kém có thể làm giá giảm mạnh.", fit:"Nhà đầu tư dài hạn chịu được biến động và phân biệt được tăng trưởng bền vững với sự hưng phấn tạm thời.", rules:"Xác minh chất lượng doanh thu, biên lợi nhuận, dòng tiền, lợi thế cạnh tranh, định giá và mức tập trung vị thế.", x:48, y:56 },
    { name:"Swing trading", horizon:"Vài ngày–vài tuần", workload:"Theo dõi thường xuyên", benefit:"Cố gắng nắm bắt dao động ngắn hạn mà không cần giao dịch từng phút. Có thể bổ sung cho danh mục dài hạn tách biệt.", risk:"Khoảng trống giá qua đêm, phá vỡ giả, trượt giá stop, chi phí và chuỗi lỗ nhỏ. Nhiều cơ hội cũng tạo thêm cơ hội mắc lỗi.", fit:"Nhà giao dịch có kinh nghiệm, vốn chịu rủi ro riêng và thời gian xem biểu đồ, vị thế mỗi ngày.", rules:"Chỉ giao dịch tài sản thanh khoản, đi theo xu hướng lớn, xác định mua/stop/mục tiêu trước, giới hạn rủi ro và ghi nhật ký.", x:70, y:68 },
    { name:"Day trading", horizon:"Phút–giờ", workload:"Cường độ toàn thời gian", benefit:"Vị thế thường được đóng trong ngày, giảm rủi ro gap qua đêm. Thị trường thanh khoản có thể tạo nhiều mẫu hình và phản hồi nhanh.", risk:"Cơ quan quản lý cảnh báo về thua lỗ lớn tức thời, chi phí cao, căng thẳng tâm lý, lỗi khớp lệnh và lỗ vượt vốn ban đầu khi dùng đòn bẩy hoặc bán khống.", fit:"Chỉ phù hợp với người rất có kinh nghiệm, có vốn rủi ro riêng, hiểu hệ thống khớp lệnh và theo dõi thị trường liên tục.", rules:"Không dùng tiền sinh hoạt, khẩn cấp, học tập hoặc hưu trí. Bắt đầu bằng mô phỏng, tránh đòn bẩy khi chưa chứng minh được hệ thống, giới hạn lỗ mỗi lệnh và mỗi ngày.", x:90, y:94 },
    { name:"Đầu tư cổ tức", horizon:"Nhiều năm", workload:"Nghiên cứu định kỳ", benefit:"Dòng tiền tiềm năng có thể dùng hoặc tái đầu tư để số cổ phiếu và khoản phân phối tương lai tiếp tục tích lũy.", risk:"Cổ tức không được bảo đảm. Lợi suất cao có thể báo hiệu khó khăn; cắt cổ tức, lạm phát, thuế, lãi suất và tập trung ngành làm giảm kết quả.", fit:"Nhà đầu tư dài hạn cần thu nhập nhưng vẫn đánh giá tổng lợi nhuận và chất lượng doanh nghiệp.", rules:"Kiểm tra tỷ lệ chi trả, FCF, nợ, lịch sử cổ tức, độ bền lợi nhuận, định giá và đa dạng ngành.", x:30, y:34 },
    { name:"Chỉ số / ETF", horizon:"Nhiều năm", workload:"Thấp–vừa", benefit:"Quỹ rộng có thể tạo đa dạng hóa, minh bạch, giảm gánh nặng nghiên cứu và thuận tiện cho đầu tư định kỳ.", risk:"Đa dạng hóa không ngăn được lỗ thị trường. ETF hẹp hoặc đòn bẩy có thể tập trung; phí, sai lệch bám chỉ số, spread và premium/discount cũng quan trọng.", fit:"Nhà đầu tư cần chiến lược lõi lặp lại được, phù hợp mục tiêu, khả năng chịu rủi ro và phân bổ tài sản.", rules:"Hiểu chỉ số, danh mục, mức tập trung, chi phí, thanh khoản, thuế và quỹ là rộng, chuyên đề, đòn bẩy hay nghịch đảo.", x:20, y:24 },
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

const macroScenarios = {
  en: [
    { name:"Hot economy", inputs:"Inflation rising · Labor market tight", fed:"Restrictive bias: raise rates or keep them high for longer", stocks:"Higher discount rates and borrowing costs can pressure valuations, especially rate-sensitive growth stocks. Strong earnings may partly offset this.", gold:"Higher real yields can increase gold’s opportunity cost, but inflation fear or geopolitical demand may offset the pressure.", tone:"macro-hot" },
    { name:"Soft landing", inputs:"Inflation falling · Employment stable", fed:"Neutral to gradual easing if inflation continues toward target", stocks:"Falling inflation without a sharp earnings decline can support valuations and broader risk appetite.", gold:"Lower expected real yields can help, although calmer risk conditions may reduce safe-haven demand.", tone:"macro-soft" },
    { name:"Recession risk", inputs:"Inflation subdued · Unemployment rising", fed:"Easing bias: lower rates to support demand and employment", stocks:"Rate cuts may support valuation, but weak profits and recession risk can dominate first. Markets often react before economic data turns.", gold:"Lower real yields and risk aversion can support gold, though currency and liquidity conditions still matter.", tone:"macro-weak" },
    { name:"Stagflation", inputs:"Inflation high · Employment weakening", fed:"Policy conflict: price stability and employment risks pull in opposite directions", stocks:"High rates plus weak growth can pressure both valuations and earnings, making selection and risk control especially important.", gold:"Inflation and risk concerns may support gold, while high real yields can work in the opposite direction.", tone:"macro-stag" },
  ],
  vi: [
    { name:"Kinh tế quá nóng", inputs:"Lạm phát tăng · Thị trường lao động thắt chặt", fed:"Thiên hướng thắt chặt: tăng lãi suất hoặc giữ cao lâu hơn", stocks:"Lãi suất chiết khấu và chi phí vay cao có thể gây áp lực lên định giá, đặc biệt với cổ phiếu tăng trưởng nhạy cảm lãi suất. Lợi nhuận khỏe có thể bù đắp một phần.", gold:"Lợi suất thực cao làm tăng chi phí cơ hội nắm giữ vàng, nhưng lo ngại lạm phát hoặc nhu cầu trú ẩn có thể bù lại.", tone:"macro-hot" },
    { name:"Hạ cánh mềm", inputs:"Lạm phát giảm · Việc làm ổn định", fed:"Trung lập hoặc giảm dần nếu lạm phát tiếp tục về mục tiêu", stocks:"Lạm phát giảm mà lợi nhuận không suy yếu mạnh có thể hỗ trợ định giá và khẩu vị rủi ro.", gold:"Kỳ vọng lợi suất thực giảm có thể hỗ trợ vàng, dù môi trường ít rủi ro hơn có thể làm giảm nhu cầu trú ẩn.", tone:"macro-soft" },
    { name:"Rủi ro suy thoái", inputs:"Lạm phát thấp · Thất nghiệp tăng", fed:"Thiên hướng nới lỏng: giảm lãi suất để hỗ trợ nhu cầu và việc làm", stocks:"Giảm lãi suất có thể hỗ trợ định giá, nhưng lợi nhuận yếu và rủi ro suy thoái có thể chi phối trước. Thị trường thường phản ứng trước dữ liệu kinh tế.", gold:"Lợi suất thực giảm và tâm lý né rủi ro có thể hỗ trợ vàng, nhưng đồng USD và thanh khoản vẫn quan trọng.", tone:"macro-weak" },
    { name:"Đình lạm", inputs:"Lạm phát cao · Việc làm suy yếu", fed:"Xung đột chính sách: ổn định giá và rủi ro việc làm kéo theo hai hướng", stocks:"Lãi suất cao cùng tăng trưởng yếu có thể gây áp lực lên cả định giá và lợi nhuận, khiến chọn lọc và quản trị rủi ro đặc biệt quan trọng.", gold:"Lo ngại lạm phát và rủi ro có thể hỗ trợ vàng, trong khi lợi suất thực cao tác động theo hướng ngược lại.", tone:"macro-stag" },
  ],
};

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<Theme>("light");
  const [flowStyle, setFlowStyle] = useState<FlowStyle>("gates");
  const [cyclePhase, setCyclePhase] = useState(0);
  const [macroScenario, setMacroScenario] = useState(0);
  const [strategyIndex, setStrategyIndex] = useState(0);
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
      <nav>{(["home", "book", "framework", "cycles", "macro", "terminology", "strategies", "tools"] as Page[]).map((item, i) =>
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

    {page === "macro" && <section className="content-page macro-page"><p className="eyebrow">{lang === "en" ? "Macro transmission" : "Cơ chế truyền dẫn vĩ mô"}</p><h1>{lang === "en" ? "Fed rates, inflation, jobs, stocks, and gold" : "Lãi suất Fed, lạm phát, việc làm, cổ phiếu và vàng"}</h1><p className="lede narrow">{lang === "en" ? "The Fed reacts to inflation and employment, while markets react to both the decision and what it reveals about the economy. The relationships are conditional, not mechanical." : "Fed phản ứng với lạm phát và việc làm, còn thị trường phản ứng với cả quyết định lẫn thông tin quyết định đó tiết lộ về nền kinh tế. Các quan hệ có điều kiện, không máy móc."}</p>
      <div className="macro-flow" role="img" aria-label={lang === "en" ? "Inflation and employment feed into Fed policy, financial conditions, stocks and gold" : "Lạm phát và việc làm tác động đến chính sách Fed, điều kiện tài chính, cổ phiếu và vàng"}><div className="macro-inputs"><article><span>CPI / PCE</span><h3>{lang === "en" ? "Inflation" : "Lạm phát"}</h3><p>{lang === "en" ? "Price pressure and expectations" : "Áp lực giá và kỳ vọng"}</p></article><article><span>NFP / U-3</span><h3>{lang === "en" ? "Employment" : "Việc làm"}</h3><p>{lang === "en" ? "Jobs, unemployment, wages" : "Việc làm, thất nghiệp, tiền lương"}</p></article></div><div className="macro-arrow">↓</div><article className="fed-node"><span>FOMC</span><h2>{lang === "en" ? "Federal Reserve decision" : "Quyết định của Fed"}</h2><p>{lang === "en" ? "Maximum employment + price stability" : "Việc làm tối đa + ổn định giá"}</p></article><div className="macro-arrow">↓</div><article className="conditions-node"><h3>{lang === "en" ? "Rates and financial conditions" : "Lãi suất và điều kiện tài chính"}</h3><p>{lang === "en" ? "Borrowing costs · Discount rates · Dollar · Credit · Liquidity · Real yields" : "Chi phí vay · Lãi suất chiết khấu · USD · Tín dụng · Thanh khoản · Lợi suất thực"}</p></article><div className="macro-arrow split">↙ ↓ ↘</div><div className="macro-outcomes"><article><h3>{lang === "en" ? "Stocks" : "Cổ phiếu"}</h3><p>{lang === "en" ? "Valuation, earnings, risk premium" : "Định giá, lợi nhuận, phần bù rủi ro"}</p></article><article><h3>{lang === "en" ? "Economy and jobs" : "Kinh tế và việc làm"}</h3><p>{lang === "en" ? "Demand, investment, hiring" : "Nhu cầu, đầu tư, tuyển dụng"}</p></article><article><h3>{lang === "en" ? "Gold" : "Vàng"}</h3><p>{lang === "en" ? "Real yields, dollar, inflation, risk" : "Lợi suất thực, USD, lạm phát, rủi ro"}</p></article></div></div>
      <div className="macro-scenarios"><p className="eyebrow">{lang === "en" ? "Choose a scenario" : "Chọn kịch bản"}</p><div className="macro-tabs">{macroScenarios[lang].map((scenario,index) => <button key={scenario.name} className={macroScenario === index ? "selected" : ""} aria-pressed={macroScenario === index} onClick={() => setMacroScenario(index)}>{scenario.name}</button>)}</div><article className={`macro-scenario ${macroScenarios[lang][macroScenario].tone}`}><header><span>{macroScenarios[lang][macroScenario].inputs}</span><h2>{macroScenarios[lang][macroScenario].name}</h2></header><div><section><h3>FED</h3><p>{macroScenarios[lang][macroScenario].fed}</p></section><section><h3>{lang === "en" ? "STOCKS" : "CỔ PHIẾU"}</h3><p>{macroScenarios[lang][macroScenario].stocks}</p></section><section><h3>{lang === "en" ? "GOLD" : "VÀNG"}</h3><p>{macroScenarios[lang][macroScenario].gold}</p></section></div></article></div>
      <div className="macro-definitions"><article><h3>CPI</h3><p>{lang === "en" ? "BLS measure of average price change for a representative consumer basket." : "Thước đo BLS về mức thay đổi giá trung bình của một rổ hàng hóa và dịch vụ tiêu dùng đại diện."}</p></article><article><h3>PCE</h3><p>{lang === "en" ? "The inflation index used for the Fed’s 2% longer-run goal." : "Chỉ số lạm phát được Fed sử dụng cho mục tiêu dài hạn 2%."}</p></article><article><h3>{lang === "en" ? "Unemployment rate" : "Tỷ lệ thất nghiệp"}</h3><p>{lang === "en" ? "Unemployed people as a percentage of the labor force—not the entire population." : "Số người thất nghiệp tính theo phần trăm lực lượng lao động, không phải toàn bộ dân số."}</p></article><article><h3>{lang === "en" ? "Real yield" : "Lợi suất thực"}</h3><p>{lang === "en" ? "A yield after accounting for inflation expectations; an important opportunity-cost input for gold." : "Lợi suất sau khi tính đến kỳ vọng lạm phát; một yếu tố chi phí cơ hội quan trọng đối với vàng."}</p></article></div>
      <p className="macro-warning">{lang === "en" ? "A rate cut is not automatically bullish and a rate hike is not automatically bearish. Markets price expectations in advance, and the reason for the policy change can matter more than the change itself." : "Giảm lãi suất không tự động đồng nghĩa tăng giá và tăng lãi suất không tự động đồng nghĩa giảm giá. Thị trường phản ánh kỳ vọng trước, và nguyên nhân thay đổi chính sách có thể quan trọng hơn bản thân thay đổi."}</p>
      <div className="cycle-sources"><span>{lang === "en" ? "Research:" : "Nguồn nghiên cứu:"}</span><a href="https://www.federalreserve.gov/monetarypolicy/monetary-policy-what-are-its-goals-how-does-it-work.htm" target="_blank" rel="noreferrer">Federal Reserve</a><a href="https://www.bls.gov/cpi/questions-and-answers.htm" target="_blank" rel="noreferrer">BLS CPI</a><a href="https://www.bls.gov/cps/definitions.htm" target="_blank" rel="noreferrer">BLS employment</a><a href="https://www.gold.org/goldhub/research/gold-and-us-interest-rates-reality-check" target="_blank" rel="noreferrer">World Gold Council</a></div>
    </section>}

    {page === "terminology" && <section className="content-page terminology-page"><p className="eyebrow">{lang === "en" ? "Market language" : "Ngôn ngữ thị trường"}</p><h1>{lang === "en" ? "Stock terminology, shown on the chart" : "Thuật ngữ chứng khoán trên biểu đồ"}</h1><p className="lede narrow">{lang === "en" ? "Learn what traders mean when they say a move is priced in, a stock reached ATH, the market turned bearish, or an option is a call or put." : "Hiểu ý nghĩa khi nhà giao dịch nói thông tin đã phản ánh vào giá, cổ phiếu đạt ATH, thị trường chuyển sang gấu hoặc quyền chọn là call hay put."}</p>
      <div className="term-chart" role="img" aria-label={lang === "en" ? "Annotated stock price chart demonstrating common market terminology" : "Biểu đồ giá cổ phiếu minh họa các thuật ngữ thị trường phổ biến"}><svg viewBox="0 0 1000 390" aria-hidden="true"><path className="term-grid" d="M55 80H960M55 180H960M55 280H960"/><path className="price-path" d="M55 300 C120 285 150 250 205 258 S280 205 340 215 S410 125 485 112 S555 130 615 75 S670 95 705 90 S760 180 805 205 S870 260 945 285"/><path className="support-line" d="M55 300H945"/><path className="resistance-line" d="M205 215H575"/><circle cx="615" cy="75" r="9"/><text x="615" y="48" textAnchor="middle">ATH</text><text x="160" y="335">{lang === "en" ? "Bull trend" : "Xu hướng bò"}</text><text x="820" y="330">{lang === "en" ? "Bear trend" : "Xu hướng gấu"}</text><text x="385" y="200">{lang === "en" ? "Resistance" : "Kháng cự"}</text><text x="65" y="292">{lang === "en" ? "Support" : "Hỗ trợ"}</text><path className="breakout-mark" d="M470 165L505 120"/><text x="430" y="158">{lang === "en" ? "Breakout" : "Phá vỡ"}</text><path className="event-line" d="M705 90V245"/><text x="715" y="240">{lang === "en" ? "Good news arrives" : "Tin tốt xuất hiện"}</text><text x="715" y="260">{lang === "en" ? "but was priced in" : "nhưng đã phản ánh vào giá"}</text></svg></div>
      <div className="options-explainer"><div><p className="eyebrow">{lang === "en" ? "Options at expiration" : "Quyền chọn khi đáo hạn"}</p><h2>{lang === "en" ? "Long call and long put payoff" : "Lợi nhuận của mua call và mua put"}</h2><p>{lang === "en" ? "Example strike = 100 and premium = 5. The buyer’s maximum loss is the premium in these simplified diagrams." : "Ví dụ giá thực hiện = 100 và phí = 5. Trong sơ đồ đơn giản này, khoản lỗ tối đa của người mua là phí quyền chọn."}</p></div><svg viewBox="0 0 800 330" role="img" aria-label={lang === "en" ? "Long call and long put profit at expiration" : "Lợi nhuận mua call và mua put khi đáo hạn"}><path className="payoff-axis" d="M55 165H755M400 35V290"/><path className="call-payoff" d="M70 200H400L730 55"/><path className="put-payoff" d="M70 55L400 200H730"/><path className="zero-line" d="M55 165H755"/><text x="710" y="45">CALL</text><text x="75" y="45">PUT</text><text x="410" y="318">{lang === "en" ? "Strike 100" : "Giá thực hiện 100"}</text><text x="650" y="155">{lang === "en" ? "Profit" : "Lãi"}</text><text x="650" y="220">{lang === "en" ? "Premium loss" : "Lỗ phí"}</text></svg></div>
      <div className="term-groups">{(["market","trading","options"] as const).map(group => <section key={group}><h2>{lang === "en" ? {market:"Market and price",trading:"Trading and orders",options:"Options"}[group] : {market:"Thị trường và giá",trading:"Giao dịch và lệnh",options:"Quyền chọn"}[group]}</h2><div className="term-grid-cards">{terminology[lang][group].map(term => <article key={term[0]}><h3>{term[0]}</h3><p>{term[1]}</p></article>)}</div></section>)}</div>
      <p className="term-warning">{lang === "en" ? "Options and short selling can involve substantial risk. These diagrams explain terminology and are not trading recommendations." : "Quyền chọn và bán khống có thể có rủi ro lớn. Các sơ đồ chỉ giải thích thuật ngữ, không phải khuyến nghị giao dịch."}</p>
      <div className="cycle-sources"><span>{lang === "en" ? "Definitions:" : "Nguồn định nghĩa:"}</span><a href="https://www.investor.gov/introduction-investing/investing-basics/glossary" target="_blank" rel="noreferrer">Investor.gov glossary</a><a href="https://www.finra.org/investors/investing/investment-products/stocks/order-types" target="_blank" rel="noreferrer">FINRA order types</a><a href="https://www.optionseducation.org/optionsoverview/options-basics" target="_blank" rel="noreferrer">Options Industry Council</a></div>
    </section>}

    {page === "strategies" && <section className="content-page strategy-page"><p className="eyebrow">{lang === "en" ? "Strategy library" : "Thư viện chiến lược"}</p><h1>{t.strategiesTitle}</h1><p className="lede narrow">{lang === "en" ? "A strategy is not only an entry technique. Compare the holding period, workload, potential advantage, failure mode, and safeguards before risking capital." : "Chiến lược không chỉ là kỹ thuật vào lệnh. Hãy so sánh thời gian nắm giữ, công sức, lợi thế tiềm năng, cách thất bại và hàng rào bảo vệ trước khi mạo hiểm vốn."}</p>
      <div className="strategy-map" role="img" aria-label={lang === "en" ? "Investment strategies compared by workload and risk complexity" : "So sánh chiến lược đầu tư theo công sức và độ phức tạp rủi ro"}><div className="map-y">{lang === "en" ? "Higher risk / complexity" : "Rủi ro / phức tạp cao hơn"} ↑</div><div className="map-plot">{strategyProfiles[lang].map((profile,index) => <button key={profile.name} className={strategyIndex === index ? "selected" : ""} style={{left:`${profile.x}%`,bottom:`${profile.y}%`}} onClick={() => setStrategyIndex(index)} aria-label={`${profile.name}: ${profile.horizon}`}><span>{index + 1}</span>{profile.name}</button>)}</div><div className="map-x">→ {lang === "en" ? "More time and monitoring" : "Nhiều thời gian và theo dõi hơn"}</div></div>
      <div className="strategy-tabs">{strategyProfiles[lang].map((profile,index) => <button key={profile.name} className={strategyIndex === index ? "selected" : ""} aria-pressed={strategyIndex === index} onClick={() => setStrategyIndex(index)}>{profile.name}</button>)}</div>
      <article className={`strategy-detail ${strategyIndex === 3 ? "day-trade-detail" : ""}`}><header><span>{String(strategyIndex + 1).padStart(2,"0")}</span><div><small>{strategyProfiles[lang][strategyIndex].horizon} · {strategyProfiles[lang][strategyIndex].workload}</small><h2>{strategyProfiles[lang][strategyIndex].name}</h2></div></header><div className="strategy-detail-grid"><section><h3>{lang === "en" ? "Potential benefit" : "Lợi ích tiềm năng"}</h3><p>{strategyProfiles[lang][strategyIndex].benefit}</p></section><section><h3>{lang === "en" ? "Main risks" : "Rủi ro chính"}</h3><p>{strategyProfiles[lang][strategyIndex].risk}</p></section><section><h3>{lang === "en" ? "Who it may fit" : "Có thể phù hợp với ai"}</h3><p>{strategyProfiles[lang][strategyIndex].fit}</p></section><section><h3>{lang === "en" ? "Minimum safeguards" : "Hàng rào tối thiểu"}</h3><p>{strategyProfiles[lang][strategyIndex].rules}</p></section></div></article>
      {strategyIndex === 3 && <div className="day-trade-warning"><strong>{lang === "en" ? "Day trading is not a shortcut." : "Day trading không phải đường tắt."}</strong><p>{lang === "en" ? "FINRA says it can be extremely risky and generally is not appropriate for people with limited resources, limited experience, or low risk tolerance. Leverage and short selling can produce losses beyond the original amount invested." : "FINRA cho biết day trading có thể cực kỳ rủi ro và nhìn chung không phù hợp với người có nguồn lực hạn chế, ít kinh nghiệm hoặc khả năng chịu rủi ro thấp. Đòn bẩy và bán khống có thể gây lỗ vượt số vốn ban đầu."}</p></div>}
      <div className="strategy-sources cycle-sources"><span>{lang === "en" ? "Research:" : "Nguồn nghiên cứu:"}</span><a href="https://www.finra.org/rules-guidance/rulebooks/finra-rules/2270" target="_blank" rel="noreferrer">FINRA day trading risks</a><a href="https://www.investor.gov/additional-resources/spotlight/formerdirectorlorischock-directors-take/thinking-day-trading-know-risks" target="_blank" rel="noreferrer">Investor.gov day trading</a><a href="https://www.schwab.com/learn/story/swing-trading-strategies" target="_blank" rel="noreferrer">Schwab swing trading</a><a href="https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-24" target="_blank" rel="noreferrer">Investor.gov ETFs</a></div>
    </section>}

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
