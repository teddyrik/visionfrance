import type { Metadata } from "next";
import Link from "next/link";
import { GuideGrid } from "@/components/guide-grid";
import { JsonLd } from "@/components/json-ld";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
import { guidePages } from "@/lib/guide-content";
import {
  absoluteUrl,
  buildBreadcrumbList,
  buildCollectionPageSchema,
  siteConfig,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Guides pour etudier en France",
  description:
    "Guides Vision France pour Campus France, le visa etudiant et le parcours complet pour etudier en France.",
  alternates: {
    canonical: "/guides",
  },
  keywords: [
    "Campus France",
    "visa etudiant France",
    "etudier en France",
    "etudier a l'etranger",
  ],
  openGraph: {
    title: "Guides pour etudier en France | Vision France",
    description:
      "Campus France, visa etudiant, budget, admission et bourses: Vision France structure le parcours complet.",
    url: "/guides",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
    images: [
      {
        url: absoluteUrl("/editorial/student-laptop.jpg"),
        width: 1600,
        height: 900,
        alt: "Guides Vision France pour etudier en France",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Guides pour etudier en France | Vision France",
    description:
      "Des guides pratiques sur Campus France, le visa etudiant et les etapes pour etudier en France.",
    images: [absoluteUrl("/editorial/student-laptop.jpg")],
  },
};

export default function GuidesPage() {
  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbList([
            { name: "Accueil", path: "/" },
            { name: "Guides", path: "/guides" },
          ]),
          buildCollectionPageSchema(
            "/guides",
            "Guides Vision France",
            "Guides pratiques pour etudier en France, preparer Campus France et le visa etudiant.",
            guidePages.map((guide) => ({
              name: guide.title,
              path: `/guides/${guide.slug}`,
            })),
          ),
        ]}
      />
      <PublicHeader />
      <main className="detail-shell">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Accueil</Link> / <span>Guides</span>
          </div>

          <section className="detail-hero">
            <div className="action-row">
              <span className="status-badge" data-tone="blue">
                Hub editorial
              </span>
              <span className="status-badge" data-tone="green">
                Intentions SEO
              </span>
            </div>

            <div style={{ marginTop: "1rem", display: "grid", gap: "1rem" }}>
              <div>
                <p className="mini-label">Vision France</p>
                <h1 className="detail-title">Guides pour etudier en France</h1>
              </div>

              <p className="hero-copy">
                Cette section consolide les requetes autour de Campus France, du
                visa etudiant et du projet d&apos;etudes en France. Elle sert aussi
                de maillage interne vers le catalogue des bourses d&apos;etudes en
                France.
              </p>

              <div className="action-row">
                <Link href="/bourses" className="button button--primary">
                  Voir le catalogue des bourses
                </Link>
                <Link href="/" className="button button--secondary">
                  Retour a l&apos;accueil
                </Link>
              </div>
            </div>
          </section>

          <section className="section" style={{ paddingTop: "1.5rem" }}>
            <div className="card-grid">
              <article className="panel">
                <span className="eyebrow">Couverture semantique</span>
                <h2 className="panel-title">Trois pages pour capter plus large</h2>
                <p className="muted">
                  Une bonne indexation sur Google repose aussi sur des pages
                  distinctes par intention: financement, procedure Campus France
                  et visa etudiant.
                </p>
              </article>
              <article className="panel">
                <span className="eyebrow">Maillage interne</span>
                <h2 className="panel-title">Chaque guide renvoie vers les bourses</h2>
                <p className="muted">
                  Le but est d&apos;augmenter la pertinence globale du domaine sur le
                  parcours etudier en France, pas seulement sur un mot-clé isole.
                </p>
              </article>
            </div>
          </section>

          <GuideGrid
            eyebrow="Guides cibles"
            title="Pages publiees pour Google et les utilisateurs"
            description="Chaque guide est redige pour une intention precise et relie aux pages principales du site."
            includeSectionWrapper={false}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
