import type { Metadata } from "next";
import "@fontsource-variable/noto-sans-kr";
import "./globals.css";

export const metadata: Metadata = {
  title: "NursiHub | 지역사회간호학 실습 포털",
  description: "지역사회간호학 임상실습을 위한 공지사항, 퀴즈, 자료 포털",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
      </head>
      <body className="min-h-full bg-slate-50 text-slate-800">{children}</body>
    </html>
  );
}
