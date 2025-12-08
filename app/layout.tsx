import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { JsonLd } from "./components/JsonLd"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

// SEO最適化されたメタデータ
export const metadata: Metadata = {
  title: "軽貨物掲示板 | 案件・求人情報の無料掲示板【ドライバー募集・荷主マッチング】",
  description:
    "軽貨物掲示板は、軽貨物ドライバーと荷主・元請けをつなぐ日本最大級の無料掲示板です。全国の軽貨物配送案件、求人情報、ドライバー募集を簡単に投稿・検索できます。軽貨物運送業界の情報交換・マッチングプラットフォーム。",
  keywords: [
    "軽貨物",
    "掲示板",
    "軽貨物掲示板",
    "案件",
    "求人",
    "ドライバー",
    "軽貨物ドライバー",
    "配送",
    "運送",
    "仕事",
    "求人情報",
    "ドライバー募集",
    "荷主",
    "元請け",
    "マッチング",
    "軽貨物配送",
    "軽貨物運送",
    "配送業者",
    "運送業者",
    "軽バン",
  ],
  authors: [{ name: "軽貨物掲示板運営" }],
  creator: "軽貨物掲示板",
  publisher: "軽貨物掲示板",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://keijiban.example.com",
    siteName: "軽貨物掲示板",
    title: "軽貨物掲示板 | 案件・求人情報の無料掲示板",
    description:
      "軽貨物ドライバーと荷主・元請けをつなぐ日本最大級の無料掲示板。全国の軽貨物配送案件、求人情報を簡単に投稿・検索できます。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "軽貨物掲示板 - 案件・求人情報",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "軽貨物掲示板 | 案件・求人情報の無料掲示板",
    description: "軽貨物ドライバーと荷主・元請けをつなぐ無料掲示板",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://keijiban.example.com",
  },
  generator: "Next.js",
  other: {
    "google-site-verification": "your-google-verification-code",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <head>
        <JsonLd />
      </head>
      <body className={`font-sans antialiased`}>{children}</body>
    </html>
  )
}
