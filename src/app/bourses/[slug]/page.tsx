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
      <main className="detail-shell">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Accueil</Link> / <Link href="/bourses">Bourses</Link> /{" "}
            <span>{scholarship.title}</span>
          </div>

          <section className="detail-hero">
            <div className="action-row">
              <StatusBadge label={status.label} tone={status.tone} />
              <span className="status-badge" data-tone="slate">
                {scholarship.level}
              </span>
            </div>

            <div style={{ marginTop: "1rem", display: "grid", gap: "1rem" }}>
              <div>
                <p className="mini-label">{scholarship.institution}</p>
                <h1 className="detail-title">{scholarship.title}</h1>
              </div>

              <p className="hero-copy">{scholarship.summary}</p>

              <div className="action-row">
                <Link href="#formulaire-candidature" className="button button--primary">
                  Commencer la candidature
                </Link>
                <Link href="/bourses" className="button button--secondary">
                  Retour au catalogue
                </Link>
              </div>
            </div>

            <div className="facts-grid">
              <div className="detail-fact">
                <strong>Echeance</strong>
                <span>{formatScholarshipDeadline(scholarship)}</span>
              </div>
              <div className="detail-fact">
                <strong>Couverture</strong>
                <span>{scholarship.coverage}</span>
              </div>
              <div className="detail-fact">
                <strong>Langue</strong>
                <span>{scholarship.language}</span>
              </div>
              <div className="detail-fact">
                <strong>Duree</strong>
                <span>{scholarship.duration}</span>
              </div>
              <div className="detail-fact">
                <strong>Lieu</strong>
                <span>{scholarship.location}</span>
              </div>
              <div className="detail-fact">
                <strong>Public cible</strong>
                <span>{scholarship.audience}</span>
              </div>
            </div>
          </section>

          <div className="detail-grid" style={{ marginTop: "1.5rem" }}>
            <article className="panel">
              <div className="application-form">
                <div>
                  <span className="eyebrow">Presentation</span>
                  <h2 className="panel-title">A propos du programme</h2>
                </div>
                <p className="muted">{scholarship.description}</p>

                <div>
                  <h3 className="panel-title">Ce que finance la bourse</h3>
                  <ul className="muted guide-bullets">
                    {scholarship.benefits.map((benefit) => (
                      <li key={benefit}>{benefit}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="panel-title">Conditions d'eligibilite</h3>
                  <ul className="muted guide-bullets">
                    {scholarship.eligibility.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="panel-title">Pieces demandees</h3>
                  <ul className="muted guide-bullets">
                    {scholarship.requiredDocuments.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="muted">
                    Des pieces complementaires peuvent etre demandees par
                    l'etablissement apres une preselection.
                  </p>
                </div>

                <div className="panel">
                  <div>
                    <span className="eyebrow">Source officielle</span>
                    <h3 className="panel-title">{scholarship.officialSource}</h3>
                  </div>
                  <p className="muted">
                    Fiche editoriale verifiee le {scholarship.verifiedAt ?? "2026-03-19"} a
                    partir de la publication institutionnelle.
                  </p>
                  <a
                    href={scholarship.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="button button--secondary"
                  >
                    Ouvrir la source officielle
                  </a>
                </div>

                <figure className="detail-editorial">
                  <Image
                    src={editorialMedia.parisCampus.src}
                    alt={editorialMedia.parisCampus.alt}
                    width={editorialMedia.parisCampus.width}
                    height={editorialMedia.parisCampus.height}
                    className="detail-editorial__image"
                  />
                  <figcaption className="detail-editorial__caption">
                    <span className="mini-label">Cadre d'etudes</span>
                    <strong>
                      Une presentation plus institutionnelle des campus et des
                      etablissements.
                    </strong>
                  </figcaption>
                </figure>

                <div className="panel">
                  <div>
                    <span className="eyebrow">Circuit de traitement</span>
                    <h3 className="panel-title">Comment votre dossier est traite</h3>
                  </div>

                  <div className="timeline-item">
                    <span className="step-index">1</span>
                    <div className="timeline-item__body">
                      <strong>Remplissage du dossier</strong>
                      <span className="muted">
                        Le candidat complete d'abord son formulaire et prepare les
                        justificatifs obligatoires.
                      </span>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <span className="step-index">2</span>
                    <div className="timeline-item__body">
                      <strong>Paiement puis soumission</strong>
                      <span className="muted">
                        Les frais d'etude de dossier sont regles apres validation du
                        formulaire, avant l'envoi final de la candidature.
                      </span>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <span className="step-index">3</span>
                    <div className="timeline-item__body">
                      <strong>Instruction du dossier</strong>
                      <span className="muted">
                        Verification des pieces, controle administratif et mise a
                        jour du statut de candidature.
                      </span>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <span className="step-index">4</span>
                    <div className="timeline-item__body">
                      <strong>Transmission aux etablissements</strong>
                      <span className="muted">
                        L'universite ou l'ecole est notifiee pour poursuivre le
                        processus academique avec le candidat.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <aside className="detail-side" id="formulaire-candidature">
              <section className="detail-side__card">
                <span className="eyebrow">Candidature</span>
                <h2 className="panel-title">Deposer votre dossier en 2 etapes</h2>
                <p className="muted">
                  Etape 1 : remplir le formulaire complet et joindre les pieces.
                  Etape 2 : proceder au paiement, renseigner la reference puis
                  soumettre la candidature.
                </p>
              </section>

              <section className="detail-side__card">
                <span className="eyebrow">Guides associes</span>
                <h2 className="panel-title">Preparer Campus France et le visa</h2>
                <p className="muted">
                  Cette fiche est desormais reliee aux pages guide qui couvrent le
                  visa etudiant, Campus France et le parcours pour etudier en
                  France.
                </p>
                <div className="guide-link-stack">
                  <Link href="/guides/campus-france" className="inline-link">
                    Comprendre Campus France
                  </Link>
                  <Link href="/guides/visa-etudiant-france" className="inline-link">
                    Preparer le visa etudiant
                  </Link>
                  <Link href="/guides/etudier-en-france" className="inline-link">
                    Planifier ses etudes en France
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
