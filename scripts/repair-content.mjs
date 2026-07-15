import fs from "node:fs";
import path from "node:path";

const contentDir = path.resolve(process.cwd(), "public", "content");

const repairs = {
  en: [
    [/P\/E = Current stock price EPS \(Earnings Per Share\)/g, "P/E = Current stock price ÷ EPS (Earnings Per Share)"],
    [/P\/E = Current stock price BVPS \(Book value per share\)/g, "P/B = Current stock price ÷ BVPS (Book value per share)"],
    [/PEG = P\/E Growth rate over the years \(%\)/g, "PEG = P/E ratio ÷ annual EPS growth rate (%)"],
    [/PEG = P\/E g In which:/g, "PEG = P/E ratio ÷ g. In which:"],
    [/Coefficient = EV \(Enterprise Value\) EBITDA \(Earnings before interest, taxes and depreciation\)/g, "EV/EBITDA = Enterprise Value ÷ Earnings before interest, taxes, depreciation and amortization"],
    [/EV = Market capitalization \+ Total debt Cash and cash equivalents/g, "EV = Market capitalization + Total debt - Cash and cash equivalents"],
    [/EBITDA = Profit before tax \+ Interest expense \+ Depreciation expense/g, "EBITDA = Net income + Interest + Taxes + Depreciation + Amortization"],
    [/ROE = Net profit \(Profit after tax\) x 100% Average equity/g, "ROE = Net income ÷ Average shareholders’ equity × 100%"],
    [/ROA = Net profit \(Profit after tax\) x 100% Average total assets/g, "ROA = Net income ÷ Average total assets × 100%"],
    [/Gross profit margin = \(Revenue - Cost of goods sold\) \/ Revenue x 100% Revenue/g, "Gross profit margin = (Revenue - Cost of goods sold) ÷ Revenue × 100%."],
    [/Operating profit margin = Operating profit \(EBIT\) x 100% Revenue/g, "Operating profit margin = EBIT ÷ Revenue × 100%."],
    [/Net profit margin = Profit after tax x 100% Revenue/g, "Net profit margin = Net income ÷ Revenue × 100%."],
    [/EPS = Net profit after tax \(excluding preferred stock dividends\) Number of outstanding shares/g, "EPS = (Net income - Preferred dividends) ÷ Weighted-average shares outstanding"],
    [/FCF = Cash flow from operating activities \(CFO\) Fixed capital expenditure \(CapEx\)/g, "FCF = Cash flow from operations (CFO) - Capital expenditure (CapEx)"],
    [/D\/E = Total liabilities \(or Total loans\) Equity/g, "D/E = Total debt ÷ Shareholders’ equity"],
    [/Interest coverage ratio = Profit before interest and tax \(EBIT\) Loan interest expenses/g, "Interest coverage ratio = EBIT ÷ Interest expense."],
    [/Current Ratio = Current assets Short-term debt/g, "Current Ratio = Current assets ÷ Current liabilities."],
    [/Quick Ratio = Cash & Cash Equivalents \+ Short-term investments \+ Short-term receivables Short-term debt/g, "Quick Ratio = (Cash + Short-term investments + Accounts receivable) ÷ Current liabilities."],
    [/Stop-loss position = Entry price \(2×ATR\)/g, "Stop-loss price = Entry price - (2 × ATR)"],
    [/Number of shares = Maximum loss amount \(2,000,000 VND\) Stop loss distance per share \(2,000 VND\)/g, "Number of shares = Maximum permitted loss (2,000,000 VND) ÷ Risk per share (2,000 VND)"],
    [/Drawdown \(%\) = Highest value Lowest low value x 100% Peak value/g, "Drawdown (%) = (Peak portfolio value - Trough portfolio value) ÷ Peak portfolio value × 100%"],
    [/Sharpe Ratio = Portfolio return Risk-free rate Standard Deviation \(Volatility of the portfolio\)/g, "Sharpe Ratio = (Portfolio return - Risk-free rate) ÷ Portfolio return standard deviation"],
    [/GDP =(?=\s|$)/g, "GDP = C + I + G + (X - M)"],
    [/Connections = N\(N 1\) 2/g, "Connections = N(N - 1) ÷ 2"],
    [/f\* = W \(1 W\)\/R/g, "f* = W - (1 - W) ÷ R"],
    [/f\* =W \(1 W\)\/R/g, "f* = W - (1 - W) ÷ R"],
    [/f\* = 0\.55 \(1-0\.55\)\/1\.8 0\.55=0\.30/g, "f* = 0.55 - (1 - 0.55) ÷ 1.8 = 0.30"],
    [/DRIP Return = \(1 \+ div_yield \+ price_growth\)/g, "DRIP cumulative return = (1 + dividend yield + price growth)^n - 1"],
  ],
  vi: [
    [/P\/E = Giá cổ phiếu hiện tại EPS \(Lợi nhuận trên mỗi cổ phiếu\)/g, "P/E = Giá cổ phiếu hiện tại ÷ EPS (Lợi nhuận trên mỗi cổ phiếu)"],
    [/P\/E = Giá cổ phiếu hiện tại BVPS \(Giá trị sổ sách trên mỗi cổ phiếu\)/g, "P/B = Giá cổ phiếu hiện tại ÷ BVPS (Giá trị sổ sách trên mỗi cổ phiếu)"],
    [/PEG = P\/E Tốc độ tăng trưởng lợi nhuận hàng năm \(%\)/g, "PEG = P/E ÷ Tốc độ tăng trưởng EPS hàng năm (%)"],
    [/PEG = P\/E g Trong đó:/g, "PEG = P/E ÷ g. Trong đó:"],
    [/Hệ số = EV \(Enterprise Value giá trị doanh nghiệp\) EBITDA \(Lợi nhuận trước lãi vay, thuế và khấu hao\)/g, "EV/EBITDA = Giá trị doanh nghiệp ÷ Lợi nhuận trước lãi vay, thuế và khấu hao"],
    [/EV = Vốn hóa thị trường \+ Tổng nợ Tiền mặt và các khoản tương đương tiền/g, "EV = Vốn hóa thị trường + Tổng nợ - Tiền mặt và các khoản tương đương tiền"],
    [/EBITDA = Lợi nhuận trước thuế \+ Chi phí lãi vay \+ Chi phí khấu hao/g, "EBITDA = Lợi nhuận ròng + Lãi vay + Thuế + Khấu hao tài sản hữu hình và vô hình"],
    [/ROE = Lợi nhuận ròng \(Lợi nhuận sau thuế\) x 100% Vốn chủ sở hữu bình quân/g, "ROE = Lợi nhuận ròng ÷ Vốn chủ sở hữu bình quân × 100%"],
    [/ROA = Lợi nhuận ròng \(Lợi nhuận sau thuế\) x 100% Tổng tài sản bình quân/g, "ROA = Lợi nhuận ròng ÷ Tổng tài sản bình quân × 100%"],
    [/Biên lợi nhuận gộp = Doanh thu Giá vốn hàng bán x 100% Doanh thu/g, "Biên lợi nhuận gộp = (Doanh thu - Giá vốn hàng bán) ÷ Doanh thu × 100%."],
    [/Biên lợi nhuận hoạt động = Lợi nhuận từ hoạt động kinh doanh \(EBIT\) x 100% Doanh thu/g, "Biên lợi nhuận hoạt động = EBIT ÷ Doanh thu × 100%."],
    [/Biên lợi nhuận ròng = Lợi nhuận sau thuế x 100% Doanh thu/g, "Biên lợi nhuận ròng = Lợi nhuận sau thuế ÷ Doanh thu × 100%."],
    [/EPS = Lợi nhuận ròng sau thuế \(trừ cổ tức cổ phiếu ưu đãi\) Số lượng cổ phiếu đang lưu hành/g, "EPS = (Lợi nhuận ròng - Cổ tức ưu đãi) ÷ Số cổ phiếu lưu hành bình quân"],
    [/FCF = Dòng tiền từ hoạt động kinh doanh \(CFO\) Chi phí vốn đầu tư cố định \(CapEx\)/g, "FCF = Dòng tiền từ hoạt động kinh doanh (CFO) - Chi tiêu vốn (CapEx)"],
    [/D\/E = Tổng nợ phải trả \(hoặc Tổng nợ vay\) Vốn chủ sở hữu/g, "D/E = Tổng nợ vay ÷ Vốn chủ sở hữu"],
    [/Hệ số thanh toán lãi vay = Lơi nhuận trước thuế và lãi vay \(EBIT\) Chi phí lãi vay/g, "Hệ số thanh toán lãi vay = EBIT ÷ Chi phí lãi vay"],
    [/Current Ratio = Tài sản ngắn hạn Nợ ngắn hạn/g, "Current Ratio = Tài sản ngắn hạn ÷ Nợ ngắn hạn."],
    [/Quick Ratio = Tiền & Tương đương tiền \+ Đầu tư ngắn hạn \+ Phải thu ngắn hạn Nợ ngắn hạn/g, "Quick Ratio = (Tiền + Đầu tư ngắn hạn + Phải thu ngắn hạn) ÷ Nợ ngắn hạn."],
    [/Vị trí Stop-loss = Giá vào lệnh \(2×ATR\)/g, "Giá Stop-loss = Giá vào lệnh - (2 × ATR)"],
    [/Số lượng cổ phiếu = Số tiền chịu lỗ tối đa \(2\.000\.000 đ\) Khoảng cách cắt lỗ trên mỗi cổ phiếu \(2\.000 đ\)/g, "Số lượng cổ phiếu = Số tiền chịu lỗ tối đa (2.000.000 đ) ÷ Rủi ro trên mỗi cổ phiếu (2.000 đ)"],
    [/Drawdown \(%\) = Giá trị đỉnh Giá trị đáy thấp nhất x 100% Giá trị đỉnh/g, "Drawdown (%) = (Giá trị đỉnh - Giá trị đáy) ÷ Giá trị đỉnh × 100%"],
    [/Sharpe Ratio = Lợi nhuận danh mục Lãi suất phi rủi ro Độ lệch chuẩn \(Mức độ biến động của danh mục\)/g, "Sharpe Ratio = (Lợi nhuận danh mục - Lãi suất phi rủi ro) ÷ Độ lệch chuẩn lợi nhuận danh mục"],
    [/GDP =(?=\s|$)/g, "GDP = C + I + G + (X - M)"],
    [/Connections = N\(N 1\) 2/g, "Connections = N(N - 1) ÷ 2"],
    [/f\* = W \(1 W\)\/R/g, "f* = W - (1 - W) ÷ R"],
    [/f\* =W \(1 W\)\/R/g, "f* = W - (1 - W) ÷ R"],
    [/f\* = 0\.55 \(1-0\.55\)\/1\.8 0\.55=0\.30/g, "f* = 0,55 - (1 - 0,55) ÷ 1,8 = 0,30"],
    [/DRIP Return = \(1 \+ div_yield \+ price_growth\)/g, "Lợi nhuận DRIP lũy kế = (1 + tỷ suất cổ tức + tăng trưởng giá)^n - 1"],
    [/ế ≥ 0 \(ù ã \) v\(x\) = λ\( x\) ế < 0 \(ù ỗ \)/g, "v(x) = x^α nếu x ≥ 0; v(x) = -λ(-x)^β nếu x < 0"],
  ],
};

for (const lang of ["en", "vi"]) {
  const file = path.join(contentDir, `investment-experience-${lang}.json`);
  const book = JSON.parse(fs.readFileSync(file, "utf8"));
  if (lang === "vi") {
    book.chapters[0].title = "Chương 1: Các “tội lỗi nguyên thuỷ” trong đầu tư chứng khoán";
    if (book.chapters[0].blocks[0]?.text === "đầu tư chứng khoán") book.chapters[0].blocks.shift();
  } else {
    book.chapters[0].title = "Chapter 1: The Original Sins of Stock Investing";
    book.chapters[0].blocks[0].text = book.chapters[0].blocks[0].text.replace(/^stock investment\s*/i, "");
  }
  for (const chapter of book.chapters) {
    for (const block of chapter.blocks) {
      for (const [pattern, replacement] of repairs[lang]) block.text = block.text.replace(pattern, replacement);
    }
  }
  fs.writeFileSync(file, JSON.stringify(book));
}
