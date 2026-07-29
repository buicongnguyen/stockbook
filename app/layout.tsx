import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://buicongnguyen.github.io/stockbook/"),
  title: "Stockbook — Investment Experience",
  description: "A bilingual field guide for disciplined stock investing, risk management, and decision-making.",
  icons: { icon: "/favicon.svg" },
  alternates: {
    canonical: "./en/",
    languages: {
      en: "./en/",
      vi: "./vi/",
    },
  },
  openGraph: {
    type: "website",
    siteName: "Stockbook",
    title: "Stockbook — Investment Experience",
    description: "A bilingual field guide for disciplined stock investing, risk management, and decision-making.",
    url: "./en/",
    images: [{ url: "https://buicongnguyen.github.io/stockbook/og-journey.png", alt: "Stockbook Journey — Process before profit." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stockbook — Investment Experience",
    description: "A bilingual field guide for disciplined stock investing, risk management, and decision-making.",
    images: ["https://buicongnguyen.github.io/stockbook/og-journey.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>;
}
