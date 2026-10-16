import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { Agentation } from "agentation";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Socira — Open-source social media management",
  description:
    "Connect Instagram, Facebook, YouTube, LinkedIn, TikTok and X. Compose, publish, schedule honestly, and measure what actually works.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${hanken.variable} h-full scroll-smooth antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
