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
      <main className="vfb-shell">
        <div className="container">
          <nav className="vfb-breadcrumb" aria-label="Fil d'Ariane">
            <Link href="/">Accueil</Link>
            <span className="vfb-breadcrumb__sep">/</span>
            <span>Bourses d&apos;etudes en France</span>
          </nav>

          {/* ── Hero sobre & institutionnel ── */}
          <section className="vfb-hero">
            <div className="vfb-hero__badges">
              <span className="vfb-badge vfb-badge--navy">Catalogue SEO</span>
              <span className="vfb-badge vfb-badge--gold">Sources officielles</span>
            </div>

            <p className="vfb-hero__eyebrow">Vision France</p>
            <h1 className="vfb-hero__title">Bourses d&apos;etudes en France</h1>

            <p className="vfb-hero__copy">
              Cette page cible les requetes autour des bourses d&apos;etudes en France
              avec un catalogue editorialise, des fiches detaillees, des dates
              limites claires et des liens vers les sources institutionnelles.
            </p>

            <div className="vfb-hero__actions">
              <Link href="#catalogue-bourses" className="vfb-btn vfb-btn--primary">
                Parcourir le catalogue
              </Link>
              <Link href="/guides" className="vfb-btn vfb-btn--secondary">
                Voir les guides Campus France et visa
              </Link>
            </div>
          </section>

          {/* ── Stats — grille simple, cartes blanches sobres ── */}
          <section className="vfb-stats" aria-label="Chiffres cles du catalogue">
            <article className="vfb-stat-card">
              <strong className="vfb-stat-card__number">{stats.openScholarships}</strong>
              <span className="vfb-stat-card__label">Appels actifs</span>
            </article>
            <article className="vfb-stat-card">
              <strong className="vfb-stat-card__number">{stats.institutions}</strong>
              <span className="vfb-stat-card__label">Etablissements</span>
            </article>
            <article className="vfb-stat-card">
              <strong className="vfb-stat-card__number">{stats.featured}</strong>
              <span className="vfb-stat-card__label">Programmes mis en avant</span>
            </article>
            <article className="vfb-stat-card">
              <strong className="vfb-stat-card__number">{stats.doctorate}</strong>
              <span className="vfb-stat-card__label">Parcours doctoraux</span>
            </article>
          </section>

          <ScholarshipCatalogue
            eyebrow="Catalogue officiel"
            title="Programmes consultables pour les etudiants internationaux"
            description="Filtrez les bourses d'etudes en France par niveau, disponibilite et mots-cles pour identifier rapidement les appels pertinents."
            verifiedDate={verifiedDate}
            filteredScholarships={filteredScholarships}
            query={query}
            level={level}
            status={status}
            emptyMessage="Aucun programme ne correspond aux filtres actuels."
            sectionId="catalogue-bourses"
            includeSectionWrapper={false}
          />

          {/* ── Panels editoriaux ── */}
          <section className="vfb-editorial">
            <article className="vfb-editorial-card">
              <span className="vfb-editorial-card__eyebrow">Parcours complet</span>
              <h2 className="vfb-editorial-card__title">
                Une page bourses seule ne suffit pas pour viser Google
              </h2>
              <p className="vfb-editorial-card__copy">
                Pour remonter sur les requetes strategiques, Vision France doit
                couvrir aussi Campus France, le visa etudiant, le budget et les
                etapes pour etudier en France. Les guides ci-dessous renforcent
                cette couverture semantique.
              </p>
            </article>
            <article className="vfb-editorial-card">
              <span className="vfb-editorial-card__eyebrow">Indexation</span>
              <h2 className="vfb-editorial-card__title">Le catalogue est desormais maille</h2>
              <p className="vfb-editorial-card__copy">
                Chaque fiche bourse, le sitemap, le fichier robots et les pages
                guide sont relies entre eux pour donner un signal de site plus
                complet aux moteurs.
              </p>
            </article>
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