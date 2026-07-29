import type { Metadata } from "next";
import Home from "../page";

export const metadata: Metadata = {
  title: "Stockbook — Kinh nghiệm đầu tư",
  description: "Cẩm nang song ngữ về đầu tư cổ phiếu có kỷ luật, quản trị rủi ro và ra quyết định.",
  alternates: {
    canonical: "https://buicongnguyen.github.io/stockbook/vi/",
    languages: {
      en: "https://buicongnguyen.github.io/stockbook/en/",
      vi: "https://buicongnguyen.github.io/stockbook/vi/",
    },
  },
  openGraph: {
    title: "Stockbook — Kinh nghiệm đầu tư",
    description: "Cẩm nang song ngữ về đầu tư cổ phiếu có kỷ luật, quản trị rủi ro và ra quyết định.",
    url: "https://buicongnguyen.github.io/stockbook/vi/",
    images: [{ url: "https://buicongnguyen.github.io/stockbook/og.png", alt: "Stockbook — Suy nghĩ rõ ràng trước khi mạo hiểm vốn." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stockbook — Kinh nghiệm đầu tư",
    description: "Cẩm nang song ngữ về đầu tư cổ phiếu có kỷ luật, quản trị rủi ro và ra quyết định.",
    images: ["https://buicongnguyen.github.io/stockbook/og.png"],
  },
};

export default function VietnameseHome() {
  return <Home localizedLang="vi" />;
}
