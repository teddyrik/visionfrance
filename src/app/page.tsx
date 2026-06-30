import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GuideGrid } from "@/components/guide-grid";
import { JsonLd } from "@/components/json-ld";
import { PublicHeader } from "@/components/public-header";
import { ScholarshipCatalogue } from "@/components/scholarship-catalogue";
import { SiteFooter } from "@/components/site-footer";
import { StatusBadge } from "@/components/status-badge";
import { getScholarships } from "@/lib/data";
import { editorialMedia } from "@/lib/editorial-media";
import {
  absoluteUrl,
  buildItemListSchema,
  buildWebPageSchema,
  siteConfig,
} from "@/lib/seo";
import { filterScholarships, firstQueryValue } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bourses d'etudes en France, Campus France et visa etudiant",
  description:
    "Vision France centralise les bourses d'etudes en France, les guides Campus France, le visa etudiant et les conseils utiles pour etudier en France.",
  alternates: {
    canonical: "/",
  },
  keywords: siteConfig.keywords,
  openGraph: {
    title: "Vision France | Bourses d'etudes, Campus France et visa etudiant",
    description:
      "Un hub editorial pour trouver des bourses d'etudes en France et comprendre Campus France, le visa etudiant et le projet d'etudes.",
    url: "/",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
    images: [
      {
        url: absoluteUrl("/editorial/paris-campus.jpg"),
        width: 1600,
        height: 900,
        alt: "Vision France",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vision France | Bourses d'etudes, Campus France et visa etudiant",
    description:
      "Catalogue de bourses d'etudes en France et guides Campus France, visa etudiant et etudes en France.",
    images: [absoluteUrl("/editorial/paris-campus.jpg")],
  },
};

const partners = [
  {
    name: "Institut francais",
    website: "https://www.institutfrancais.com/fr",
    logo: "/partners/institut-francais.svg",
  },
  {
    name: "Fondation Alliance Francaise",
    website: "https://www.fondation-alliancefr.org/",
    logo: "/partners/fondation-alliance-francaise.svg",
  },
  {
    name: "AEFE",
    website: "https://aefe.gouv.fr/fr",
    logo: "/partners/aefe.svg",
  },
  {
    name: "Atout France",
    website: "https://www.atout-france.fr/",
    logo: "/partners/atout-france.svg",
  },
  {
    name: "Etudiant.gouv.fr",
    website: "https://www.etudiant.gouv.fr/fr",
    logo: "/partners/etudiant-gouv.svg",
  },
] as const;

type StatusTone = "blue" | "green" | "amber" | "red" | "slate";

type ValueProp = {
  mark: string;
  title: string;
  description: string;
};

const valueProps: ValueProp[] = [
  {
    mark: "C",
    title: "Catalogue verifie",
    description:
      "Fiches detaillees, criteres d'eligibilite, echeance claire et lien direct vers la source officielle de chaque bourse.",
  },
  {
    mark: "G",
    title: "Guides Campus France & visa",
    description:
      "Des pages dediees pour comprendre Campus France, le visa etudiant et les etapes pour etudier en France.",
  },
  {
    mark: "S",
    title: "Suivi de dossier",
    description:
      "Un formulaire unique, un statut visible a chaque etape et une transmission directe aux etablissements partenaires.",
  },
];

type DossierStage = {
  id: string;
  code: string;
  title: string;
  description: string;
  badgeLabel: string;
  tone: StatusTone;
};

const dossierStages: DossierStage[] = [
  {
    id: "depot",
    code: "01",
    title: "Depot du dossier",
    description:
      "Le candidat choisit une bourse, ouvre le formulaire associe et transmet un dossier complet.",
    badgeLabel: "Recu",
    tone: "blue",
  },
  {
    id: "instruction",
    code: "02",
    title: "Instruction Vision France",
    description:
      "L'equipe verifie les pieces, qualifie le dossier et envoie un email de confirmation.",
    badgeLabel: "En instruction",
    tone: "amber",
  },
  {
    id: "preselection",
    code: "03",
    title: "Preselection",
    description:
      "Les dossiers complets et eligibles sont retenus pour la suite de la procedure.",
    badgeLabel: "Preselection",
    tone: "amber",
  },
  {
    id: "transmission",
    code: "04",
    title: "Transmission a l'etablissement",
    description:
      "L'universite ou l'ecole partenaire recoit le dossier pour poursuivre l'instruction.",
    badgeLabel: "Transmis",
    tone: "blue",
  },
  {
    id: "decision",
    code: "05",
    title: "Decision finale",
    description:
      "Le candidat est informe par email du statut final de sa candidature.",
    badgeLabel: "Decision",
    tone: "slate",
  },
];

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const filters = await searchParams;
  const scholarships = (await getScholarships()).filter((item) => Boolean(item.officialUrl));
  const verifiedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
  const query = firstQueryValue(filters.q) ?? "";
  const level = firstQueryValue(filters.level) ?? "";
  const status = firstQueryValue(filters.status) ?? "";
  const filteredScholarships = filterScholarships(scholarships, {
    query,
    level,
    status,
  });

  const stats = {
    institutions: new Set(scholarships.map((item) => item.institution)).size,
    openScholarships: scholarships.filter((item) => item.status !== "closed").length,
    officialSources: scholarships.filter((item) => item.officialUrl).length,
    featured: scholarships.filter((item) => item.featured).length,
  };

  return (
    <>
      <JsonLd
        data={[
          buildWebPageSchema(
            "/",
            "Vision France",
            "Hub editorial sur les bourses d'etudes en France, Campus France et le visa etudiant.",
          ),
          buildItemListSchema(
            "Bourses d'etudes mises en avant",
            scholarships.slice(0, 8).map((item) => ({
              name: item.title,
              path: `/bourses/${item.slug}`,
            })),
          ),
        ]}
      />
      <PublicHeader />
      <main className="vf-home">
        {/* ---------- Hero ---------- */}
        <section className="vf-hero">
          <div className="container vf-hero__inner">
            <div className="vf-hero__lead">
              <span className="eyebrow vf-hero__eyebrow">Vision France</span>
              <h1 className="vf-hero__title">
                Trouvez votre bourse d&apos;etudes en France et{" "}
                <span className="vf-hero__title-accent">suivez votre dossier</span> jusqu&apos;a
                la decision.
              </h1>
              <p className="vf-hero__copy">
                Catalogue de bourses, guides Campus France et visa etudiant, et un
                parcours de candidature suivi de bout en bout &mdash; reunis sur une
                seule plateforme.
              </p>

              <div className="vf-hero__actions">
                <Link href="/bourses" className="button button--primary">
                  Explorer les bourses
                </Link>
                <Link href="/guides" className="button button--secondary">
                  Lire les guides
                </Link>
              </div>

              <ul className="vf-hero__points">
                <li>
                  <b>01</b> Catalogue verifie sur les sources officielles
                </li>
                <li>
                  <b>02</b> Guides Campus France et visa etudiant
                </li>
                <li>
                  <b>03</b> Statut du dossier suivi par email, a chaque etape
                </li>
              </ul>
            </div>

            <div className="vf-hero__visual">
              <figure className="vf-hero__photo vf-hero__photo--main">
                <Image
                  src={editorialMedia.studentFocus.src}
                  alt={editorialMedia.studentFocus.alt}
                  width={editorialMedia.studentFocus.width}
                  height={editorialMedia.studentFocus.height}
                  priority
                />
              </figure>

              <figure className="vf-hero__photo vf-hero__photo--secondary">
                <Image
                  src={editorialMedia.parisUniversity.src}
                  alt={editorialMedia.parisUniversity.alt}
                  width={editorialMedia.parisUniversity.width}
                  height={editorialMedia.parisUniversity.height}
                />
              </figure>

              <article className="vf-hero__seal">
                <span className="vf-hero__seal-label">Catalogue verifie</span>
                <strong className="vf-hero__seal-date">{verifiedDate}</strong>
                <p>
                  Fiches mises a jour a partir des publications officielles des
                  universites et ecoles partenaires.
                </p>
              </article>

              <div className="vf-hero__stats">
                <div className="vf-stat">
                  <strong>{stats.openScholarships}</strong>
                  <span>appels actifs</span>
                </div>
                <div className="vf-stat">
                  <strong>{stats.institutions}</strong>
                  <span>etablissements</span>
                </div>
                <div className="vf-stat">
                  <strong>{stats.officialSources}</strong>
                  <span>sources officielles</span>
                </div>
                <div className="vf-stat">
                  <strong>{stats.featured}</strong>
                  <span>a la une</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Value props ---------- */}
        <section className="section vf-values">
          <div className="container">
            <div className="section__head">
              <div>
                <span className="eyebrow">Pourquoi Vision France</span>
                <h2 className="section-title">
                  Un seul endroit pour la bourse, le dossier et le suivi
                </h2>
              </div>
              <p className="section-copy">
                Trois piliers structurent la plateforme, du premier clic jusqu&apos;a
                la decision de l&apos;etablissement.
              </p>
            </div>

            <div className="vf-values__grid">
              {valueProps.map((item) => (
                <article key={item.title} className="vf-value-card">
                  <span className="vf-value-card__mark" aria-hidden="true">
                    {item.mark}
                  </span>
                  <div>
                    <h3 className="panel-title">{item.title}</h3>
                    <p className="muted">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Partners ---------- */}
        <section className="vf-partners">
          <div className="container">
            <div className="section__head">
              <div>
                <span className="eyebrow">Partenaires institutionnels</span>
                <h2 className="section-title">
                  Les organismes qui accompagnent Vision France
                </h2>
              </div>
              <p className="section-copy">
                Des acteurs publics et institutionnels engages pour la visibilite
                des bourses, l&apos;orientation et la coordination des parcours
                etudiants.
              </p>
            </div>

            <div className="vf-partners__row">
              {partners.map((partner) => (
                <a
                  key={partner.website}
                  href={partner.website}
                  className="vf-partner"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={partner.logo} alt={`Logo ${partner.name}`} />
                  <span>{partner.name}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <ScholarshipCatalogue
          eyebrow="Catalogue public"
          title="Bourses actuellement publiees pour les candidates et candidats internationaux"
          description="Un catalogue editorial structure, lisible et professionnel, avec source officielle, echeance claire et parcours de candidature centralise."
          verifiedDate={verifiedDate}
          filteredScholarships={filteredScholarships}
          query={query}
          level={level}
          status={status}
          emptyMessage="Aucun programme ne correspond aux filtres actuels."
        />

        <GuideGrid
          eyebrow="Guides pratiques"
          title="Campus France, visa etudiant et etudier en France"
          description="Ces pages renforcent le champ semantique du site et repondent a des intentions de recherche complementaires a celles du catalogue."
          sectionId="guides"
        />

        {/* ---------- Dossier tracker (signature element) ---------- */}
        <section className="section vf-tracker" id="processus">
          <div className="container">
            <div className="section__head">
              <div>
                <span className="eyebrow">Suivi de dossier</span>
                <h2 className="section-title">
                  Cinq etapes, un seul tableau de suivi
                </h2>
              </div>
              <p className="section-copy">
                Chaque dossier suit le meme circuit, du depot jusqu&apos;a la
                decision de l&apos;etablissement.
              </p>
            </div>

            <ol className="vf-tracker__rail">
              {dossierStages.map((stage) => (
                <li key={stage.id} className="vf-tracker__stage">
                  <span className="vf-tracker__node" aria-hidden="true">
                    {stage.code}
                  </span>
                  <div className="vf-tracker__card">
                    <StatusBadge label={stage.badgeLabel} tone={stage.tone} />
                    <h3 className="panel-title">{stage.title}</h3>
                    <p className="muted">{stage.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Communication ---------- */}
        <section className="vf-comms" id="suivi">
          <div className="container">
            <div className="section__head">
              <div>
                <span className="eyebrow">Communication</span>
                <h2 className="section-title">
                  Le candidat est informe a chaque etape
                </h2>
              </div>
            </div>

            <div className="vf-comms__grid">
              <article className="vf-comms__card">
                <h3 className="panel-title">Mails automatiques</h3>
                <p className="muted">
                  Confirmation de depot, passage en instruction, transmission et
                  decision finale, par email.
                </p>
              </article>
              <article className="vf-comms__card">
                <h3 className="panel-title">Statuts visibles</h3>
                <p className="muted">
                  Le statut du dossier (recu, en instruction, preselection,
                  transmission, decision) reste consultable.
                </p>
              </article>
              <article className="vf-comms__card">
                <h3 className="panel-title">Etablissements informes</h3>
                <p className="muted">
                  Les ecoles et universites partenaires recoivent le dossier au
                  bon moment pour poursuivre la procedure.
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />

    </>
  );
}