import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "K-Verified — 한국인이 인증한 곳만",
  description: "해외 구글 리뷰에서 한국인 리뷰만 필터링하여 검증된 장소를 찾아주는 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
