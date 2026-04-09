import type { Scholarship } from "@/lib/types";

export const siteConfig = {
  name: "Vision France",
  shortName: "Vision France",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.visionfrance.org").replace(
    /\/$/,
    "",
  ),
  locale: "fr_FR",
  description:
    "Vision France reference les bourses d'etudes en France, les etapes Campus France, le visa etudiant et les conseils utiles pour etudier en France.",
  keywords: [
    "bourses d'etudes en France",
    "bourse etudiant France",
    "visa etudiant France",
    "Campus France",
    "etudier en France",
    "etudier a l'etranger",
    "scholarships in France",
    "master en France",
  ],
};

type BreadcrumbItem = {
  name: string;
  path?: string;
};

type ListItem = {
  name: string;
  path: string;
};

type ArticleSchemaInput = {
  path: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  keywords?: string[];
  imagePath?: string;
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: "fr-FR",
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/bourses?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl("/globe.svg"),
    description: siteConfig.description,
    areaServed: "International",
    knowsAbout: siteConfig.keywords,
  };
}

export function buildWebPageSchema(path: string, name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: "fr-FR",
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export function buildItemListSchema(name: string, items: ListItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

export function buildCollectionPageSchema(
  path: string,
  name: string,
  description: string,
  items: ListItem[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: "fr-FR",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: absoluteUrl(item.path),
      })),
    },
  };
}

export function buildBreadcrumbList(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  };
}

export function buildArticleSchema({
  path,
  title,
  description,
  datePublished,
  dateModified,
  keywords = [],
  imagePath = "/editorial/paris-campus.jpg",
}: ArticleSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: absoluteUrl(path),
    inLanguage: "fr-FR",
    image: [absoluteUrl(imagePath)],
    datePublished,
    dateModified,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/globe.svg"),
      },
    },
    keywords,
  };
}

export function buildScholarshipArticleSchema(scholarship: Scholarship) {
  return buildArticleSchema({
    path: `/bourses/${scholarship.slug}`,
    title: scholarship.title,
    description: scholarship.summary,
    datePublished: scholarship.publishedAt,
    dateModified: scholarship.updatedAt,
    imagePath: "/editorial/paris-university.jpg",
    keywords: [
      scholarship.title,
      scholarship.institution,
      scholarship.level,
      "bourses d'etudes en France",
      "etudier en France",
    ],
  });
}
