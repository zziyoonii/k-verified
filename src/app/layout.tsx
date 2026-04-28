import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "K-Verified — 한국인이 검증한 해외 맛집",
  description:
    "해외 구글 리뷰에서 한국인 리뷰만 필터링해 한국인의 입맛으로 검증된 맛집, 마사지, 카페를 찾아드립니다.",
  openGraph: {
    title: "K-Verified",
    description: "한국인이 검증한 해외 맛집·마사지·카페",
    type: "website",
  },
  other: {
    "google-adsense-account": "ca-pub-8044778231088788",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8044778231088788"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
