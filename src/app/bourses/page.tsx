import type { Metadata } from "next";
import Link from "next/link";
import { GuideGrid } from "@/components/guide-grid";
import { JsonLd } from "@/components/json-ld";
import { PublicHeader } from "@/components/public-header";
import { ScholarshipCatalogue } from "@/components/scholarship-catalogue";
import { SiteFooter } from "@/components/site-footer";
import { getScholarships } from "@/lib/data";
import {
  absoluteUrl,
  buildBreadcrumbList,
  buildCollectionPageSchema,
  siteConfig,
} from "@/lib/seo";
import { filterScholarships, firstQueryValue } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bourses d'etudes en France 2026",
  description:
    "Catalogue Vision France des bourses d'etudes en France avec dates limites, niveaux, sources officielles et conseils pour etudier en France.",
  alternates: {
    canonical: "/bourses",
  },
  keywords: [
    "bourses d'etudes en France",
    "bourse etudiant France",
    "scholarships in France",
    "master France scholarship",
  ],
  openGraph: {
    title: "Bourses d'etudes en France 2026 | Vision France",
    description:
      "Consultez un catalogue editorialise de bourses d'etudes en France avec liens officiels, niveaux et echeances.",
    url: "/bourses",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
    images: [
      {
        url: absoluteUrl("/editorial/paris-university.jpg"),
        width: 1600,
        height: 900,
        alt: "Bourses d'etudes en France - Vision France",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bourses d'etudes en France 2026 | Vision France",
    description:
      "Vision France reference les bourses d'etudes en France et les parcours utiles pour etudier en France.",
    images: [absoluteUrl("/editorial/paris-university.jpg")],
  },
};

type ScholarshipsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ScholarshipsPage({
  searchParams,
}: ScholarshipsPageProps) {
  const filters = await searchParams;
  const scholarships = (await getScholarships()).filter((item) => Boolean(item.officialUrl));
  const query = firstQueryValue(filters.q) ?? "";
  const level = firstQueryValue(filters.level) ?? "";
  const status = firstQueryValue(filters.status) ?? "";
  const filteredScholarships = filterScholarships(scholarships, {
    query,
    level,
    status,
  });
  const verifiedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const stats = {
    openScholarships: scholarships.filter((item) => item.status !== "closed").length,
    institutions: new Set(scholarships.map((item) => item.institution)).size,
    featured: scholarships.filter((item) => item.featured).length,
    doctorate: scholarships.filter((item) => item.level.includes("Doctorat")).length,
  };

  const collectionItems = (filteredScholarships.length > 0
    ? filteredScholarships
    : scholarships
  )
    .slice(0, 12)
    .map((item) => ({
      name: item.title,
      path: `/bourses/${item.slug}`,
    }));

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbList([
            { name: "Accueil", path: "/" },
            { name: "Bourses d'etudes en France", path: "/bourses" },
          ]),
          buildCollectionPageSchema(
            "/bourses",
            "Bourses d'etudes en France",
            "Catalogue Vision France des bourses d'etudes en France.",
            collectionItems,
          ),
        ]}
      />
      <PublicHeader />
      <main className="detail-shell">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Accueil</Link> / <span>Bourses d'etudes en France</span>
          </div>

          <section className="detail-hero">
            <div className="action-row">
              <span className="status-badge" data-tone="blue">
                Catalogue SEO
              </span>
              <span className="status-badge" data-tone="green">
                Sources officielles
              </span>
            </div>

            <div style={{ marginTop: "1rem", display: "grid", gap: "1rem" }}>
              <div>
                <p className="mini-label">Vision France</p>
                <h1 className="detail-title">Bourses d&apos;etudes en France</h1>
              </div>

              <p className="hero-copy">
                Cette page cible les requetes autour des bourses d&apos;etudes en
                France avec un catalogue editorialise, des fiches detaillees, des
                dates limites claires et des liens vers les sources
                institutionnelles.
              </p>

              <div className="action-row">
                <Link href="#catalogue-bourses" className="button button--primary">
                  Parcourir le catalogue
                </Link>
                <Link href="/guides" className="button button--secondary">
                  Voir les guides Campus France et visa
                </Link>
              </div>
            </div>
          </section>

          <section className="section" style={{ paddingTop: "1.5rem" }}>
            <div className="stats-grid">
              <article className="stat-card">
                <span className="stat-card__label">Appels actifs</span>
                <strong className="stat-card__number">{stats.openScholarships}</strong>
              </article>
              <article className="stat-card">
                <span className="stat-card__label">Etablissements</span>
                <strong className="stat-card__number">{stats.institutions}</strong>
              </article>
              <article className="stat-card">
                <span className="stat-card__label">Programmes mis en avant</span>
                <strong className="stat-card__number">{stats.featured}</strong>
              </article>
              <article className="stat-card">
                <span className="stat-card__label">Parcours doctoraux</span>
                <strong className="stat-card__number">{stats.doctorate}</strong>
              </article>
            </div>
          </section>

          <ScholarshipCatalogue
            eyebrow="Catalogue officiel"
            title="Programmes consultables pour les etudiants internationaux"
            description="Filtrez les bourses d'etudes en France par niveau, disponibilite et mots-clés pour identifier rapidement les appels pertinents."
            verifiedDate={verifiedDate}
            filteredScholarships={filteredScholarships}
            query={query}
            level={level}
            status={status}
            emptyMessage="Aucun programme ne correspond aux filtres actuels."
            sectionId="catalogue-bourses"
            includeSectionWrapper={false}
          />

          <section className="section">
            <div className="card-grid">
              <article className="panel">
                <span className="eyebrow">Parcours complet</span>
                <h2 className="panel-title">
                  Une page bourses seule ne suffit pas pour viser Google
                </h2>
                <p className="muted">
                  Pour remonter sur les requetes strategiques, Vision France doit
                  couvrir aussi Campus France, le visa etudiant, le budget et les
                  etapes pour etudier en France. Les guides ci-dessous renforcent
                  cette couverture semantique.
                </p>
              </article>
              <article className="panel">
                <span className="eyebrow">Indexation</span>
                <h2 className="panel-title">Le catalogue est desormais maille</h2>
                <p className="muted">
                  Chaque fiche bourse, le sitemap, le fichier robots et les pages
                  guide sont relies entre eux pour donner un signal de site plus
                  complet aux moteurs.
                </p>
              </article>
            </div>
          </section>
        </div>

        <GuideGrid
          eyebrow="Guides associes"
          title="Renforcer les requetes Campus France, visa et etudier en France"
          description="Ces pages visent les intentions complementaires qui nourrissent aussi le classement du catalogue sur les recherches education et mobilite."
        />
      </main>
      <SiteFooter />
    </>
  );
}
