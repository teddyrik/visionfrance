import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideGrid } from "@/components/guide-grid";
import { JsonLd } from "@/components/json-ld";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
import { getGuideBySlug, guidePages } from "@/lib/guide-content";
import {
  absoluteUrl,
  buildArticleSchema,
  buildBreadcrumbList,
  siteConfig,
} from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const dynamicParams = false;

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return guidePages.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return {
      title: "Guide",
    };
  }

  return {
    title: guide.seoTitle,
    description: guide.description,
    alternates: {
      canonical: `/guides/${guide.slug}`,
    },
    keywords: guide.keywords,
    openGraph: {
      title: `${guide.seoTitle} | Vision France`,
      description: guide.description,
      url: `/guides/${guide.slug}`,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "article",
      images: [
        {
          url: absoluteUrl("/editorial/student-laptop.jpg"),
          width: 1600,
          height: 900,
          alt: guide.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${guide.seoTitle} | Vision France`,
      description: guide.description,
      images: [absoluteUrl("/editorial/student-laptop.jpg")],
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbList([
            { name: "Accueil", path: "/" },
            { name: "Guides", path: "/guides" },
            { name: guide.title, path: `/guides/${guide.slug}` },
          ]),
          buildArticleSchema({
            path: `/guides/${guide.slug}`,
            title: guide.seoTitle,
            description: guide.description,
            datePublished: guide.publishedAt,
            dateModified: guide.updatedAt,
            imagePath: "/editorial/student-laptop.jpg",
            keywords: guide.keywords,
          }),
        ]}
      />
      <PublicHeader />
      <main className="detail-shell">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Accueil</Link> / <Link href="/guides">Guides</Link> /{" "}
            <span>{guide.title}</span>
          </div>

          <section className="detail-hero">
            <div className="action-row">
              <span className="status-badge" data-tone="blue">
                {guide.readingLabel}
              </span>
              <span className="status-badge" data-tone="green">
                Mis a jour le {formatDate(guide.updatedAt)}
              </span>
            </div>

            <div style={{ marginTop: "1rem", display: "grid", gap: "1rem" }}>
              <div>
                <p className="mini-label">{guide.eyebrow}</p>
                <h1 className="detail-title">{guide.title}</h1>
              </div>

              <p className="hero-copy">{guide.summary}</p>

              <div className="action-row">
                <Link href="/bourses" className="button button--primary">
                  Voir les bourses d&apos;etudes
                </Link>
                <Link href="/guides" className="button button--secondary">
                  Tous les guides
                </Link>
              </div>

              <div className="action-row">
                {guide.keywords.slice(0, 3).map((keyword) => (
                  <span key={keyword} className="status-badge" data-tone="slate">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="section" style={{ paddingTop: "1.5rem" }}>
            <div className="guide-stack">
              {guide.sections.map((section) => (
                <article key={section.title} className="panel">
                  <h2 className="panel-title">{section.title}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="muted">
                      {paragraph}
                    </p>
                  ))}
                  {section.bullets ? (
                    <ul className="muted guide-bullets">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="section__head">
              <div>
                <span className="eyebrow">FAQ</span>
                <h2 className="section-title">Questions frequentes</h2>
              </div>
              <p className="section-copy">
                Ces reponses consolident les termes recherches autour de{" "}
                {guide.title.toLowerCase()} et du projet d&apos;etudes en France.
              </p>
            </div>

            <div className="guide-grid">
              {guide.faq.map((item) => (
                <article key={item.question} className="panel guide-faq-card">
                  <h3 className="panel-title">{item.question}</h3>
                  <p className="muted">{item.answer}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="card-grid">
              <article className="panel">
                <span className="eyebrow">Catalogue</span>
                <h2 className="panel-title">
                  Relier ce guide aux bourses d&apos;etudes en France
                </h2>
                <p className="muted">
                  Le maillage interne entre guides et catalogue renforce le
                  positionnement du domaine sur l&apos;ensemble du parcours
                  international.
                </p>
                <Link href="/bourses" className="inline-link">
                  Ouvrir le catalogue des bourses
                </Link>
              </article>
              <article className="panel">
                <span className="eyebrow">Accueil</span>
                <h2 className="panel-title">Revenir au hub principal</h2>
                <p className="muted">
                  Depuis la page d&apos;accueil, Google et les utilisateurs retrouvent
                  les acces vers le catalogue, les guides et les fiches detail.
                </p>
                <Link href="/" className="inline-link">
                  Retour a l&apos;accueil Vision France
                </Link>
              </article>
            </div>
          </section>

          <GuideGrid
            eyebrow="Guides complementaires"
            title="Continuer sur des intentions proches"
            description="Ces pages relient les themes Campus France, visa et etudier en France pour renforcer la couverture editoriale."
            includeSectionWrapper={false}
            excludeSlugs={[guide.slug]}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
