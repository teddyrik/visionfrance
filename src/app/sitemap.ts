import type { MetadataRoute } from "next";
import { getScholarships } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";
import { guidePages } from "@/lib/guide-content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date("2026-04-09T08:00:00.000Z"),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/bourses"),
      lastModified: new Date("2026-04-09T08:00:00.000Z"),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: absoluteUrl("/guides"),
      lastModified: new Date("2026-04-09T08:00:00.000Z"),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    ...guidePages.map((guide) => ({
      url: absoluteUrl(`/guides/${guide.slug}`),
      lastModified: new Date(guide.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  const scholarshipPages = (await getScholarships())
    .filter((scholarship) => Boolean(scholarship.officialUrl))
    .map((scholarship) => ({
      url: absoluteUrl(`/bourses/${scholarship.slug}`),
      lastModified: new Date(scholarship.updatedAt || scholarship.publishedAt),
      changeFrequency: "daily" as const,
      priority: scholarship.featured ? 0.9 : 0.75,
    }));

  return [...staticPages, ...scholarshipPages];
}
