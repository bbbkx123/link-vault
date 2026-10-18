import type { Metadata, Viewport } from "next";

import { ScrollToTop } from "@/components/scroll-to-top";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "拾链 LinkVault · 把好链接收成私人图书馆",
    template: "%s · 拾链",
  },
  description:
    "一个不靠算法推荐的链接收藏夹。保存好链接、用标签整理，并在需要时公开分享你的收藏。",
  applicationName: "拾链",
  keywords: ["链接收藏", "书签", "收藏夹", "LinkVault", "Next.js"],
  openGraph: {
    title: "拾链 LinkVault · 把好链接收成私人图书馆",
    description:
      "保存、打标签、随时分享。让每一次「先存着」都有地方可去。",
    type: "website",
    locale: "zh_CN",
    siteName: "拾链 LinkVault",
  },
  twitter: {
    card: "summary",
    title: "拾链 LinkVault",
    description: "把散落的好链接，收成一座私人图书馆。",
  },
};

export const viewport: Viewport = {
  themeColor: "#f3efe6",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}
