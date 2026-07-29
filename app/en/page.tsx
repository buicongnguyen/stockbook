import type { Metadata } from "next";
import Home from "../page";

export const metadata: Metadata = {
  title: "Stockbook — Investment Experience",
  description: "A bilingual field guide for disciplined stock investing, risk management, and decision-making.",
  alternates: {
    canonical: "https://buicongnguyen.github.io/stockbook/en/",
    languages: {
      en: "https://buicongnguyen.github.io/stockbook/en/",
      vi: "https://buicongnguyen.github.io/stockbook/vi/",
    },
  },
  openGraph: {
    title: "Stockbook — Investment Experience",
    description: "A bilingual field guide for disciplined stock investing, risk management, and decision-making.",
    url: "https://buicongnguyen.github.io/stockbook/en/",
    images: [{ url: "https://buicongnguyen.github.io/stockbook/og.png", alt: "Stockbook — Think clearly before you risk capital." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stockbook — Investment Experience",
    description: "A bilingual field guide for disciplined stock investing, risk management, and decision-making.",
    images: ["https://buicongnguyen.github.io/stockbook/og.png"],
  },
};

export default function EnglishHome() {
  return <Home localizedLang="en" />;
}
