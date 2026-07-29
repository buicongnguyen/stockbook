const text = (en, vi) => Object.freeze({ en, vi });

const option = (id, en, vi, correct = false) =>
  Object.freeze({ id, label: text(en, vi), correct });

const drill = (id, promptEn, promptVi, options, explanationEn, explanationVi) =>
  Object.freeze({
    id,
    prompt: text(promptEn, promptVi),
    options: Object.freeze(options),
    explanation: text(explanationEn, explanationVi),
  });

export const practiceByScenario = Object.freeze({
  "signal-candle": Object.freeze([
    drill(
      "lower-wick-context",
      "After a decline, price forms a long lower wick at an established support zone. What can you observe?",
      "Sau một nhịp giảm, giá tạo bóng nến dưới dài tại vùng hỗ trợ đã được xác lập. Bạn có thể quan sát điều gì?",
      [
        option("rejection", "Lower prices were rejected during the session", "Mức giá thấp hơn bị từ chối trong phiên", true),
        option("guaranteed-bottom", "The final market bottom is guaranteed", "Đáy cuối cùng của thị trường đã được bảo đảm"),
        option("ignore-level", "The location of the candle does not matter", "Vị trí xuất hiện của cây nến không quan trọng"),
      ],
      "The wick reports rejection at a meaningful location. It does not prove that the decline has ended.",
      "Bóng nến cho thấy sự từ chối tại một vị trí có ý nghĩa. Nó không chứng minh nhịp giảm đã kết thúc.",
    ),
    drill(
      "doji-midrange",
      "A small doji appears in the middle of a trading range on average volume. What is the disciplined conclusion?",
      "Một nến doji nhỏ xuất hiện giữa vùng đi ngang với khối lượng trung bình. Kết luận có kỷ luật là gì?",
      [
        option("instant-buy", "Buy because every doji predicts a rally", "Mua vì mọi nến doji đều dự báo tăng giá"),
        option("need-context", "It shows indecision; wait for context or confirmation", "Nó cho thấy sự do dự; cần chờ bối cảnh hoặc xác nhận", true),
        option("instant-sell", "Sell because every doji predicts a decline", "Bán vì mọi nến doji đều dự báo giảm giá"),
      ],
      "A doji is a description of balance, not a direction signal by itself.",
      "Doji mô tả trạng thái cân bằng, không tự nó tạo ra tín hiệu về hướng đi.",
    ),
  ]),
  "signal-support": Object.freeze([
    drill(
      "support-close-below",
      "Price touches a familiar support area but closes clearly below it. What matters most?",
      "Giá chạm vùng hỗ trợ quen thuộc nhưng đóng cửa rõ ràng bên dưới. Điều gì quan trọng nhất?",
      [
        option("touch-enough", "The intraday touch confirms support", "Việc chạm vùng trong phiên đã xác nhận hỗ trợ"),
        option("failed-hold", "The zone failed to hold on a closing basis", "Vùng hỗ trợ không giữ được giá khi đóng cửa", true),
        option("line-guarantee", "Support cannot break twice", "Hỗ trợ không thể bị phá vỡ hai lần"),
      ],
      "A close below the zone is stronger evidence than a temporary intraday touch.",
      "Phiên đóng cửa dưới vùng là bằng chứng mạnh hơn một lần chạm tạm thời trong ngày.",
    ),
    drill(
      "support-zone-plan",
      "Several rebounds occurred between 48 and 50. Why is an invalidation below 48 more useful than an exact 49 line?",
      "Nhiều nhịp hồi xuất hiện trong vùng 48 đến 50. Vì sao điểm vô hiệu dưới 48 hữu ích hơn một đường chính xác tại 49?",
      [
        option("zone-demand", "It respects the observed demand zone and defines failure", "Nó tôn trọng vùng cầu đã quan sát và xác định khi nào vùng thất bại", true),
        option("more-shares", "It always permits buying more shares", "Nó luôn cho phép mua nhiều cổ phiếu hơn"),
        option("no-loss", "It guarantees that the trade cannot lose", "Nó bảo đảm giao dịch không thể thua lỗ"),
      ],
      "Zones describe repeated behavior. Invalidation belongs beyond the structure that supports the idea.",
      "Vùng giá mô tả hành vi lặp lại. Điểm vô hiệu nên nằm ngoài cấu trúc đang hỗ trợ ý tưởng.",
    ),
  ]),
  "signal-breakout": Object.freeze([
    drill(
      "breakout-volume",
      "Price closes 3% above resistance while volume is twice its recent average. Which clue strengthens the breakout?",
      "Giá đóng cửa cao hơn kháng cự 3% trong khi khối lượng gấp đôi mức trung bình gần đây. Dấu hiệu nào củng cố cú bứt phá?",
      [
        option("participation", "Expanded participation accompanies price acceptance", "Mức độ tham gia tăng đi cùng sự chấp nhận mức giá mới", true),
        option("round-number", "The resistance level was a round number", "Mức kháng cự là một con số tròn"),
        option("social-posts", "The ticker is popular on social media", "Mã cổ phiếu đang phổ biến trên mạng xã hội"),
      ],
      "A strong close plus expanding participation is more credible than price crossing a line alone.",
      "Phiên đóng cửa mạnh cùng mức độ tham gia tăng đáng tin hơn việc giá chỉ vượt qua một đường.",
    ),
    drill(
      "breakout-thin",
      "Price spikes above resistance on thin volume and closes back inside the range. What is the safer reading?",
      "Giá xuyên lên trên kháng cự với khối lượng thấp rồi đóng cửa trở lại trong vùng đi ngang. Cách đọc an toàn hơn là gì?",
      [
        option("confirmed", "The breakout is fully confirmed", "Cú bứt phá đã được xác nhận hoàn toàn"),
        option("failure-risk", "Acceptance is weak and failure risk is elevated", "Sự chấp nhận mức giá mới yếu và rủi ro thất bại cao", true),
        option("volume-irrelevant", "Volume never matters around breakouts", "Khối lượng không bao giờ quan trọng quanh vùng bứt phá"),
      ],
      "The market did not hold the new area, and participation did not confirm the move.",
      "Thị trường không giữ được vùng giá mới và mức độ tham gia không xác nhận biến động.",
    ),
  ]),
  "trend-ma20": Object.freeze([
    drill(
      "orderly-pullback",
      "Price pulls back toward a rising MA20 on lighter volume while higher lows remain intact. What does this resemble?",
      "Giá điều chỉnh về MA20 đang đi lên với khối lượng thấp hơn trong khi các đáy cao dần vẫn còn. Điều này giống trạng thái nào?",
      [
        option("orderly", "An orderly pullback inside an uptrend", "Một nhịp điều chỉnh có trật tự trong xu hướng tăng", true),
        option("automatic-failure", "Automatic failure because price approached MA20", "Thất bại tự động vì giá tiến gần MA20"),
        option("bear-proof", "Proof that a bear market has started", "Bằng chứng thị trường giá xuống đã bắt đầu"),
      ],
      "Slope, structure, and participation together provide the useful context.",
      "Độ dốc, cấu trúc và mức độ tham gia kết hợp lại mới tạo ra bối cảnh hữu ích.",
    ),
    drill(
      "ma20-break-volume",
      "MA20 is flat and price closes sharply below it on heavy volume. Which interpretation deserves more weight?",
      "MA20 đi ngang và giá đóng cửa mạnh bên dưới với khối lượng lớn. Cách diễn giải nào đáng được chú ý hơn?",
      [
        option("healthy-touch", "Every MA20 break is a healthy pullback", "Mọi lần phá MA20 đều là nhịp điều chỉnh lành mạnh"),
        option("trend-warning", "Trend quality may be deteriorating", "Chất lượng xu hướng có thể đang suy yếu", true),
        option("ignore-close", "Only the intraday high matters", "Chỉ mức cao nhất trong phiên mới quan trọng"),
      ],
      "A flat average, decisive close, and heavy participation form a warning—not an automatic buy point.",
      "Đường trung bình đi ngang, phiên đóng cửa dứt khoát và khối lượng lớn tạo thành cảnh báo, không phải điểm mua tự động.",
    ),
  ]),
  "trend-regime": Object.freeze([
    drill(
      "short-rally-long-weak",
      "Price rises above MA20 but remains below a falling MA200. How should the larger regime be described?",
      "Giá tăng lên trên MA20 nhưng vẫn nằm dưới MA200 đang giảm. Trạng thái lớn hơn nên được mô tả thế nào?",
      [
        option("full-bull", "A confirmed long-term bull regime", "Một trạng thái tăng dài hạn đã được xác nhận"),
        option("countertrend", "A short-term rally inside a weak long-term structure", "Một nhịp hồi ngắn hạn trong cấu trúc dài hạn yếu", true),
        option("no-timeframes", "Timeframes are irrelevant", "Khung thời gian không liên quan"),
      ],
      "Short-term strength can coexist with long-term weakness.",
      "Sức mạnh ngắn hạn có thể tồn tại đồng thời với sự yếu kém dài hạn.",
    ),
    drill(
      "aligned-averages",
      "MA20 is above MA50, MA50 is above MA200, and all three are rising. What does this alignment indicate?",
      "MA20 nằm trên MA50, MA50 nằm trên MA200 và cả ba đều đi lên. Sự sắp xếp này cho thấy điều gì?",
      [
        option("healthy-regime", "A healthier trend regime, but not a guaranteed profit", "Trạng thái xu hướng lành mạnh hơn nhưng không bảo đảm lợi nhuận", true),
        option("guaranteed-profit", "Every purchase must be profitable", "Mọi giao dịch mua đều phải có lãi"),
        option("valuation-proof", "The stock is automatically undervalued", "Cổ phiếu tự động được định giá thấp"),
      ],
      "Alignment describes trend health. It does not replace entry, valuation, or risk analysis.",
      "Sự sắp xếp mô tả sức khỏe xu hướng. Nó không thay thế phân tích điểm vào, định giá hoặc rủi ro.",
    ),
  ]),
  "trend-false-break": Object.freeze([
    drill(
      "lost-breakout",
      "A stock breaks out above 60, then closes at 58.5 on heavy volume. Which fact changed the setup?",
      "Một cổ phiếu bứt phá trên 60 rồi đóng cửa tại 58,5 với khối lượng lớn. Dữ kiện nào đã làm thay đổi mẫu hình?",
      [
        option("lost-level", "Price lost the level that justified the breakout", "Giá mất mức đã làm cơ sở cho cú bứt phá", true),
        option("old-high", "The stock once traded above 60", "Cổ phiếu từng giao dịch trên 60"),
        option("hope", "The original idea still feels exciting", "Ý tưởng ban đầu vẫn tạo cảm giác hấp dẫn"),
      ],
      "The close below the breakout level is evidence that the original premise may be invalid.",
      "Phiên đóng cửa dưới mức bứt phá là bằng chứng luận điểm ban đầu có thể đã mất hiệu lực.",
    ),
    drill(
      "reclaim-needs-proof",
      "After a failed breakout, price briefly moves back above the level on low volume. What is the disciplined response?",
      "Sau cú bứt phá thất bại, giá tạm thời quay lại trên mức đó với khối lượng thấp. Phản ứng có kỷ luật là gì?",
      [
        option("assume-fixed", "Assume the failure is completely repaired", "Cho rằng thất bại đã được khắc phục hoàn toàn"),
        option("seek-acceptance", "Look for sustained acceptance and renewed participation", "Tìm sự chấp nhận bền vững và mức độ tham gia được khôi phục", true),
        option("double-risk", "Double position risk immediately", "Tăng gấp đôi rủi ro vị thế ngay lập tức"),
      ],
      "A brief reclaim can be useful, but it needs confirmation before the setup regains credibility.",
      "Việc lấy lại mức giá trong thời gian ngắn có thể hữu ích, nhưng cần xác nhận trước khi mẫu hình lấy lại độ tin cậy.",
    ),
  ]),
  "business-peers": Object.freeze([
    drill(
      "unrelated-pe",
      "A software company trades at 28× earnings while a regulated utility trades at 14×. Is the software company automatically expensive?",
      "Một công ty phần mềm giao dịch ở mức P/E 28 lần trong khi doanh nghiệp điện được quản lý ở mức 14 lần. Công ty phần mềm có tự động đắt không?",
      [
        option("yes-number", "Yes, because 28 is larger than 14", "Có, vì 28 lớn hơn 14"),
        option("peer-context", "No; industry economics, growth, and quality must be compared", "Không; cần so sánh đặc điểm ngành, tăng trưởng và chất lượng", true),
        option("pe-useless", "P/E can never be used", "P/E không bao giờ có thể sử dụng"),
      ],
      "Multiples across unrelated industries often reflect different growth, stability, and capital needs.",
      "Bội số giữa các ngành không liên quan thường phản ánh khác biệt về tăng trưởng, độ ổn định và nhu cầu vốn.",
    ),
    drill(
      "cheap-peer-debt",
      "Two direct peers trade at 18× and 25× earnings. The 18× company has slower growth and much higher debt. What is the right conclusion?",
      "Hai doanh nghiệp cùng ngành giao dịch ở mức P/E 18 và 25 lần. Doanh nghiệp 18 lần tăng trưởng chậm hơn và nợ cao hơn nhiều. Kết luận đúng là gì?",
      [
        option("automatic-bargain", "The 18× company is automatically the bargain", "Doanh nghiệp 18 lần tự động là món hời"),
        option("discount-reason", "The discount may reflect weaker fundamentals", "Mức chiết khấu có thể phản ánh nền tảng yếu hơn", true),
        option("debt-irrelevant", "Debt is irrelevant to valuation", "Nợ không liên quan đến định giá"),
      ],
      "A lower multiple is a question to investigate, not a complete investment thesis.",
      "Bội số thấp hơn là câu hỏi cần điều tra, không phải một luận điểm đầu tư hoàn chỉnh.",
    ),
  ]),
  "business-peg": Object.freeze([
    drill(
      "premium-growth-quality",
      "Company A trades at 40× earnings with 45% durable growth and strong free cash flow. Company B trades at 25× with 8% growth. What matters?",
      "Công ty A giao dịch ở mức P/E 40 lần với tăng trưởng bền vững 45% và dòng tiền tự do mạnh. Công ty B ở mức 25 lần với tăng trưởng 8%. Điều gì quan trọng?",
      [
        option("lower-always", "The lower P/E always wins", "P/E thấp hơn luôn tốt hơn"),
        option("growth-quality", "Evaluate the premium beside growth durability and cash conversion", "Đánh giá mức phần bù cùng độ bền tăng trưởng và khả năng chuyển đổi thành tiền", true),
        option("growth-only", "Growth makes every price acceptable", "Tăng trưởng khiến mọi mức giá đều chấp nhận được"),
      ],
      "A premium may be justified in part, but growth quality and purchase price both still matter.",
      "Mức phần bù có thể được biện minh một phần, nhưng chất lượng tăng trưởng và giá mua vẫn đều quan trọng.",
    ),
    drill(
      "low-peg-poor-cash",
      "A stock has PEG of 0.8, but growth came from one acquisition and free cash flow is negative. What should you do?",
      "Một cổ phiếu có PEG 0,8 nhưng tăng trưởng đến từ một thương vụ mua lại và dòng tiền tự do âm. Bạn nên làm gì?",
      [
        option("buy-peg", "Buy because PEG below 1 is sufficient", "Mua vì PEG dưới 1 là đủ"),
        option("verify-quality", "Investigate whether growth is repeatable and cash-generative", "Kiểm tra tăng trưởng có thể lặp lại và tạo tiền hay không", true),
        option("ignore-cash", "Ignore cash flow when growth is high", "Bỏ qua dòng tiền khi tăng trưởng cao"),
      ],
      "PEG compresses several assumptions into one number and cannot judge growth quality.",
      "PEG nén nhiều giả định vào một con số và không thể đánh giá chất lượng tăng trưởng.",
    ),
  ]),
  "business-trap": Object.freeze([
    drill(
      "low-pe-deterioration",
      "A stock trades at 7× trailing earnings while sales fall, debt rises, and free cash flow turns negative. What might the low P/E mean?",
      "Một cổ phiếu giao dịch ở mức P/E quá khứ 7 lần trong khi doanh thu giảm, nợ tăng và dòng tiền tự do chuyển âm. P/E thấp có thể mang ý nghĩa gì?",
      [
        option("certain-bargain", "A certain bargain", "Một món hời chắc chắn"),
        option("deterioration", "The market may be pricing business deterioration", "Thị trường có thể đang phản ánh sự suy yếu của doanh nghiệp", true),
        option("guaranteed-rebound", "A rebound is guaranteed", "Một nhịp hồi được bảo đảm"),
      ],
      "Cheap-looking trailing earnings can hide a weakening future earnings base.",
      "Lợi nhuận quá khứ có vẻ rẻ có thể che giấu nền lợi nhuận tương lai đang suy yếu.",
    ),
    drill(
      "asset-discount",
      "A company trades below book value with positive cash flow and low debt, but its industry is shrinking. What is still needed?",
      "Một doanh nghiệp giao dịch dưới giá trị sổ sách, có dòng tiền dương và nợ thấp, nhưng ngành đang thu hẹp. Vẫn cần điều gì?",
      [
        option("nothing", "Nothing; price-to-book alone completes the thesis", "Không cần gì; P/B đã hoàn tất luận điểm"),
        option("asset-quality", "Check asset quality, earning power, and a path to realizing value", "Kiểm tra chất lượng tài sản, sức tạo lợi nhuận và con đường hiện thực hóa giá trị", true),
        option("ignore-industry", "Ignore industry decline", "Bỏ qua sự suy giảm của ngành"),
      ],
      "An asset discount can be real, but value needs usable assets, earning power, or a credible catalyst.",
      "Chiết khấu tài sản có thể là thật, nhưng giá trị cần tài sản hữu dụng, sức tạo lợi nhuận hoặc chất xúc tác đáng tin.",
    ),
  ]),
  "risk-sizing": Object.freeze([
    drill(
      "calculate-shares",
      "An account has 20,000, risk is limited to 1%, entry is 50, and stop is 46. What is the risk-sized position?",
      "Tài khoản có 20.000, rủi ro giới hạn 1%, giá vào 50 và cắt lỗ 46. Quy mô vị thế theo rủi ro là bao nhiêu?",
      [
        option("50", "50 shares", "50 cổ phiếu", true),
        option("200", "200 shares", "200 cổ phiếu"),
        option("500", "500 shares", "500 cổ phiếu"),
      ],
      "Risk budget is 200 and risk per share is 4, so 200 ÷ 4 = 50 shares before fees and affordability limits.",
      "Ngân sách rủi ro là 200 và rủi ro mỗi cổ phiếu là 4, nên 200 ÷ 4 = 50 cổ phiếu trước phí và giới hạn sức mua.",
    ),
    drill(
      "wider-stop",
      "The logical stop widens from 2 to 5 per share while account risk stays fixed. What should happen to share count?",
      "Điểm cắt lỗ hợp lý nới từ 2 lên 5 mỗi cổ phiếu trong khi rủi ro tài khoản giữ nguyên. Số cổ phiếu nên thay đổi thế nào?",
      [
        option("increase", "Increase", "Tăng"),
        option("same", "Stay the same", "Giữ nguyên"),
        option("decrease", "Decrease", "Giảm", true),
      ],
      "A wider stop means more risk per share, so fewer shares keep total risk controlled.",
      "Điểm dừng xa hơn nghĩa là rủi ro mỗi cổ phiếu lớn hơn, vì vậy cần ít cổ phiếu hơn để kiểm soát tổng rủi ro.",
    ),
  ]),
  "risk-rumor": Object.freeze([
    drill(
      "anonymous-takeover",
      "An anonymous post says a takeover will be announced tomorrow and price spikes. What deserves the most weight?",
      "Một bài đăng ẩn danh nói thương vụ thâu tóm sẽ được công bố ngày mai và giá tăng vọt. Điều gì đáng được chú ý nhất?",
      [
        option("post-speed", "How quickly the post is being shared", "Tốc độ bài đăng được chia sẻ"),
        option("official-source", "A verifiable filing or company announcement", "Hồ sơ công bố hoặc thông báo doanh nghiệp có thể kiểm chứng", true),
        option("price-proof", "The price spike proves the claim", "Giá tăng chứng minh lời khẳng định"),
      ],
      "Market behavior can show excitement, but only credible sources can verify the claim.",
      "Hành vi thị trường có thể cho thấy sự phấn khích, nhưng chỉ nguồn đáng tin mới xác minh được lời khẳng định.",
    ),
    drill(
      "confirmed-guidance",
      "Management raises guidance in a filed report and explains the drivers on an earnings call. How is this different from a rumor?",
      "Ban lãnh đạo nâng dự báo trong báo cáo đã công bố và giải thích nguyên nhân trong cuộc gọi kết quả kinh doanh. Điều này khác tin đồn thế nào?",
      [
        option("traceable", "The information is attributable and can be checked", "Thông tin có nguồn chịu trách nhiệm và có thể kiểm tra", true),
        option("guaranteed-return", "It guarantees a positive return", "Nó bảo đảm lợi nhuận dương"),
        option("no-risk-plan", "It removes the need for a risk plan", "Nó loại bỏ nhu cầu lập kế hoạch rủi ro"),
      ],
      "Verified information improves the evidence base but never removes price, valuation, or risk uncertainty.",
      "Thông tin đã xác minh cải thiện nền tảng bằng chứng nhưng không loại bỏ bất định về giá, định giá hoặc rủi ro.",
    ),
  ]),
  "risk-protect": Object.freeze([
    drill(
      "thesis-breaks",
      "The thesis required rising revenue and stable margins. Revenue falls for two quarters, margins contract, debt rises, and support breaks. What changed?",
      "Luận điểm yêu cầu doanh thu tăng và biên lợi nhuận ổn định. Doanh thu giảm hai quý, biên lợi nhuận co lại, nợ tăng và hỗ trợ bị phá. Điều gì đã thay đổi?",
      [
        option("price-only", "Only the share price changed", "Chỉ giá cổ phiếu thay đổi"),
        option("multi-evidence", "Business, trend, and risk evidence now contradict the thesis", "Bằng chứng doanh nghiệp, xu hướng và rủi ro hiện mâu thuẫn với luận điểm", true),
        option("cheaper", "The lower price automatically improves the thesis", "Giá thấp hơn tự động cải thiện luận điểm"),
      ],
      "Several independent facts now violate the original conditions. The purchase price is not a reason to ignore them.",
      "Nhiều dữ kiện độc lập hiện vi phạm điều kiện ban đầu. Giá mua không phải lý do để bỏ qua chúng.",
    ),
    drill(
      "price-down-thesis-intact",
      "Price falls 8% with the broad market, but the business thesis, trend invalidation, and position risk remain intact. What is the disciplined next step?",
      "Giá giảm 8% cùng thị trường chung, nhưng luận điểm doanh nghiệp, điểm vô hiệu xu hướng và rủi ro vị thế vẫn còn nguyên. Bước tiếp theo có kỷ luật là gì?",
      [
        option("panic", "Exit automatically because price is red", "Thoát tự động vì giá đang giảm"),
        option("reassess-plan", "Reassess against the predefined thesis and risk plan", "Đánh giá lại theo luận điểm và kế hoạch rủi ro đã định", true),
        option("double", "Double the position without new evidence", "Tăng gấp đôi vị thế mà không có bằng chứng mới"),
      ],
      "Price movement prompts review, but the decision should follow predefined evidence and risk—not color alone.",
      "Biến động giá yêu cầu đánh giá lại, nhưng quyết định phải theo bằng chứng và rủi ro đã định, không chỉ theo màu giá.",
    ),
  ]),
});
