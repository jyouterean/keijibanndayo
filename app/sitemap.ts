import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://keijiban.example.com",
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: "https://keijiban.example.com/projects",
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: "https://keijiban.example.com/chat",
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
  ]
}
