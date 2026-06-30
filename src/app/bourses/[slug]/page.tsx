import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { submitApplication } from "@/app/actions";
import { JsonLd } from "@/components/json-ld";
import { PublicHeader } from "@/components/public-header";
import { ScholarshipApplicationForm } from "@/components/scholarship-application-form";
import { SiteFooter } from "@/components/site-footer";
import { StatusBadge } from "@/components/status-badge";
import { getScholarshipBySlug } from "@/lib/data";
import { editorialMedia } from "@/lib/editorial-media";
import {
  absoluteUrl,
  buildBreadcrumbList,
  buildScholarshipArticleSchema,
  siteConfig,
} from "@/lib/seo";
import {
  firstQueryValue,
  formatScholarshipDeadline,
  getScholarshipStatusMeta,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

type ScholarshipPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const applicationFeePaymentUrl =
  "https://my.moneyfusion.net/69452984e075f7af6c09d660";

export async function generateMetadata({
  params,
}: ScholarshipPageProps): Promise<Metadata> {
  const { slug } = await params;
  const scholarship = await getScholarshipBySlug(slug);

  if (!scholarship || !scholarship.officialUrl) {
    return {
      title: "Bourse",
    };
  }

  return {
    title: `${scholarship.title} - bourse d'etudes en France`,
    description: scholarship.summary,
    alternates: {
      canonical: `/bourses/${scholarship.slug}`,
    },
    keywords: [
      scholarship.title,
      scholarship.institution,
      scholarship.level,
      "bourse d'etudes en France",
      "etudier en France",
    ],
    openGraph: {
      title: `${scholarship.title} | Vision France`,
      description: scholarship.summary,
      url: `/bourses/${scholarship.slug}`,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "article",
      publishedTime: scholarship.publishedAt,
      modifiedTime: scholarship.updatedAt,
      images: [
        {
          url: absoluteUrl("/editorial/paris-campus.jpg"),
          width: 1600,
          height: 900,
          alt: scholarship.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${scholarship.title} | Vision France`,
      description: scholarship.summary,
      images: [absoluteUrl("/editorial/paris-campus.jpg")],
    },
  };
}

export default async function ScholarshipPage({
  params,
  searchParams,
}: ScholarshipPageProps) {
  const { slug } = await params;
  const messages = await searchParams;
  const scholarship = await getScholarshipBySlug(slug);

  if (!scholarship || !scholarship.officialUrl) {
    notFound();
  }

  const success = firstQueryValue(messages.success);
  const error = firstQueryValue(messages.error);
  const status = getScholarshipStatusMeta(scholarship.status);

  const processSteps = [
    {
      title: "Remplissage du dossier",
      copy: "Le candidat complete d'abord son formulaire et prepare les justificatifs obligatoires.",
    },
    {
      title: "Paiement puis soumission",
      copy: "Les frais d'etude de dossier sont regles apres validation du formulaire, avant l'envoi final de la candidature.",
    },
    {
      title: "Instruction du dossier",
      copy: "Verification des pieces, controle administratif et mise a jour du statut de candidature.",
    },
    {
      title: "Transmission aux etablissements",
      copy: "L'universite ou l'ecole est notifiee pour poursuivre le processus academique avec le candidat.",
    },
  ];

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbList([
            { name: "Accueil", path: "/" },
            { name: "Bourses", path: "/bourses" },
            { name: scholarship.title, path: `/bourses/${scholarship.slug}` },
          ]),
          buildScholarshipArticleSchema(scholarship),
        ]}
      />
      <PublicHeader />
      <main className="vfd-shell">
        <div className="container">
          <nav className="vfd-breadcrumb" aria-label="Fil d'Ariane">
            <Link href="/">Accueil</Link>
            <span className="vfd-breadcrumb__sep">/</span>
            <Link href="/bourses">Bourses</Link>
            <span className="vfd-breadcrumb__sep">/</span>
            <span>{scholarship.title}</span>
          </nav>

          {/* ── Hero ── */}
          <section className="vfd-hero">
            <div className="vfd-hero__badges">
              <StatusBadge label={status.label} tone={status.tone} />
              <span className="vfd-badge vfd-badge--neutral">{scholarship.level}</span>
            </div>

            <p className="vfd-hero__eyebrow">{scholarship.institution}</p>
            <h1 className="vfd-hero__title">{scholarship.title}</h1>
            <p className="vfd-hero__copy">{scholarship.summary}</p>

            <div className="vfd-hero__actions">
              <Link href="#formulaire-candidature" className="vfd-btn vfd-btn--primary">
                Commencer la candidature
              </Link>
              <Link href="/bourses" className="vfd-btn vfd-btn--secondary">
                Retour au catalogue
              </Link>
            </div>

            <div className="vfd-facts">
              <div className="vfd-fact">
                <strong>Echeance</strong>
                <span>{formatScholarshipDeadline(scholarship)}</span>
              </div>
              <div className="vfd-fact">
                <strong>Couverture</strong>
                <span>{scholarship.coverage}</span>
              </div>
              <div className="vfd-fact">
                <strong>Langue</strong>
                <span>{scholarship.language}</span>
              </div>
              <div className="vfd-fact">
                <strong>Duree</strong>
                <span>{scholarship.duration}</span>
              </div>
              <div className="vfd-fact">
                <strong>Lieu</strong>
                <span>{scholarship.location}</span>
              </div>
              <div className="vfd-fact">
                <strong>Public cible</strong>
                <span>{scholarship.audience}</span>
              </div>
            </div>
          </section>

          {/* ── Corps : contenu + sidebar candidature ── */}
          <div className="vfd-grid">
            <article className="vfd-main">
              <section className="vfd-block">
                <span className="vfd-eyebrow">Presentation</span>
                <h2 className="vfd-block__title">A propos du programme</h2>
                <p className="vfd-block__copy">{scholarship.description}</p>
              </section>

              <section className="vfd-block">
                <h3 className="vfd-block__subtitle">Ce que finance la bourse</h3>
                <ul className="vfd-bullets">
                  {scholarship.benefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </section>

              <section className="vfd-block">
                <h3 className="vfd-block__subtitle">Conditions d&apos;eligibilite</h3>
                <ul className="vfd-bullets">
                  {scholarship.eligibility.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="vfd-block">
                <h3 className="vfd-block__subtitle">Pieces demandees</h3>
                <ul className="vfd-bullets">
                  {scholarship.requiredDocuments.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="vfd-block__note">
                  Des pieces complementaires peuvent etre demandees par
                  l&apos;etablissement apres une preselection.
                </p>
              </section>

              {/* Source officielle */}
              <section className="vfd-source-card">
                <span className="vfd-eyebrow">Source officielle</span>
                <h3 className="vfd-source-card__title">{scholarship.officialSource}</h3>
                <p className="vfd-block__note">
                  Fiche editoriale verifiee le {scholarship.verifiedAt ?? "2026-03-19"} a
                  partir de la publication institutionnelle.
                </p>
                <a
                  href={scholarship.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="vfd-btn vfd-btn--secondary"
                >
                  Ouvrir la source officielle
                </a>
              </section>

              {/* Image éditoriale */}
              <figure className="vfd-editorial">
                <Image
                  src={editorialMedia.parisCampus.src}
                  alt={editorialMedia.parisCampus.alt}
                  width={editorialMedia.parisCampus.width}
                  height={editorialMedia.parisCampus.height}
                  className="vfd-editorial__image"
                />
                <figcaption className="vfd-editorial__caption">
                  <span className="vfd-mini-label">Cadre d&apos;etudes</span>
                  <strong>
                    Une presentation plus institutionnelle des campus et des
                    etablissements.
                  </strong>
                </figcaption>
              </figure>

              {/* Circuit de traitement — liste simple sobre */}
              <section className="vfd-process">
                <span className="vfd-eyebrow">Circuit de traitement</span>
                <h3 className="vfd-block__subtitle">Comment votre dossier est traite</h3>

                <ol className="vfd-process__list">
                  {processSteps.map((step, index) => (
                    <li key={step.title} className="vfd-process__item">
                      <span className="vfd-process__index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="vfd-process__body">
                        <strong>{step.title}</strong>
                        <span>{step.copy}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </article>

            <aside className="vfd-side" id="formulaire-candidature">
              <section className="vfd-side-card">
                <span className="vfd-eyebrow">Candidature</span>
                <h2 className="vfd-side-card__title">Deposer votre dossier en 2 etapes</h2>
                <p className="vfd-side-card__copy">
                  Etape 1 : remplir le formulaire complet et joindre les pieces.
                  Etape 2 : proceder au paiement, renseigner la reference puis
                  soumettre la candidature.
                </p>
              </section>

              <section className="vfd-side-card">
                <span className="vfd-eyebrow">Guides associes</span>
                <h2 className="vfd-side-card__title">Preparer Campus France et le visa</h2>
                <p className="vfd-side-card__copy">
                  Cette fiche est desormais reliee aux pages guide qui couvrent le
                  visa etudiant, Campus France et le parcours pour etudier en
                  France.
                </p>
                <div className="vfd-link-stack">
                  <Link href="/guides/campus-france" className="vfd-inline-link">
                    Comprendre Campus France →
                  </Link>
                  <Link href="/guides/visa-etudiant-france" className="vfd-inline-link">
                    Preparer le visa etudiant →
                  </Link>
                  <Link href="/guides/etudier-en-france" className="vfd-inline-link">
                    Planifier ses etudes en France →
                  </Link>
                </div>
              </section>

              <ScholarshipApplicationForm
                scholarshipSlug={scholarship.slug}
                success={success}
                error={error}
                paymentUrl={applicationFeePaymentUrl}
                submitAction={submitApplication}
              />
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}