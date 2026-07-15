import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stockbook — Investment Experience",
  description: "A bilingual field guide for disciplined stock investing, risk management, and decision-making.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
