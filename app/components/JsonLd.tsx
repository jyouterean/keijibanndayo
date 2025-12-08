export function JsonLd() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "軽貨物掲示板",
    alternateName: ["軽貨物掲示板", "軽貨物 掲示板", "軽貨物案件掲示板"],
    url: "https://keijiban.example.com",
    description:
      "軽貨物ドライバーと荷主・元請けをつなぐ日本最大級の無料掲示板。全国の軽貨物配送案件、求人情報を投稿・検索できます。",
    inLanguage: "ja-JP",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://keijiban.example.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  }

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "軽貨物掲示板",
    url: "https://keijiban.example.com",
    logo: "https://keijiban.example.com/logo.png",
    description: "軽貨物運送業界の案件情報・求人情報を共有する無料掲示板プラットフォーム",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Japanese"],
    },
  }

  const forumSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "軽貨物掲示板",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
    description:
      "軽貨物の案件情報・求人情報を投稿・閲覧できる無料掲示板。ドライバーと荷主のマッチングプラットフォーム。",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      ratingCount: "100",
    },
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "軽貨物掲示板",
        item: "https://keijiban.example.com",
      },
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "軽貨物掲示板とは何ですか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "軽貨物掲示板は、軽貨物ドライバーと荷主・元請けをつなぐ無料の掲示板です。全国の軽貨物配送案件や求人情報を自由に投稿・閲覧できます。",
        },
      },
      {
        "@type": "Question",
        name: "利用料金はかかりますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "完全無料でご利用いただけます。アカウント登録も任意で、ニックネームのみで投稿・閲覧が可能です。",
        },
      },
      {
        "@type": "Question",
        name: "どのような案件が投稿されていますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "宅配便、企業配送、スポット便など、さまざまな軽貨物配送案件が投稿されています。料金や概要も掲載されているため、条件に合った案件を探せます。",
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(forumSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  )
}
