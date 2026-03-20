import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { submitApplication } from "@/app/actions";
import { PublicHeader } from "@/components/public-header";
import { ScholarshipApplicationForm } from "@/components/scholarship-application-form";
import { SiteFooter } from "@/components/site-footer";
import { StatusBadge } from "@/components/status-badge";
import { getScholarshipBySlug } from "@/lib/data";
import { editorialMedia } from "@/lib/editorial-media";
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
  "https://my.moneyfusion.net/69458ef3e075f7af6c0d6cd5";

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
      <PublicHeader />
      <main className="detail-shell">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Accueil</Link> / <span>{scholarship.title}</span>
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
                <Link href="/#catalogue" className="button button--secondary">
                  Retour au catalogue
                </Link>
              </div>
            </div>

            <div className="facts-grid">
              <div className="detail-fact">
                <strong>Échéance</strong>
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
                <strong>Durée</strong>
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
                  <span className="eyebrow">Présentation</span>
                  <h2 className="panel-title">À propos du programme</h2>
                </div>
                <p className="muted">{scholarship.description}</p>

                <div>
                  <h3 className="panel-title">Ce que finance la bourse</h3>
                  <ul className="muted">
                    {scholarship.benefits.map((benefit) => (
                      <li key={benefit}>{benefit}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="panel-title">Conditions d&apos;éligibilité</h3>
                  <ul className="muted">
                    {scholarship.eligibility.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="panel-title">Pièces demandées</h3>
                  <ul className="muted">
                    {scholarship.requiredDocuments.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="muted">
                    Des pièces complémentaires académiques peuvent être demandées
                    par l&apos;établissement après une présélection.
                  </p>
                </div>

                <div className="panel">
                  <div>
                    <span className="eyebrow">Source officielle</span>
                    <h3 className="panel-title">{scholarship.officialSource}</h3>
                  </div>
                  <p className="muted">
                    Fiche éditoriale vérifiée le {scholarship.verifiedAt ?? "19/03/2026"} à
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
                    <span className="mini-label">Cadre d&apos;études</span>
                    <strong>Une présentation plus institutionnelle des campus et des établissements.</strong>
                  </figcaption>
                </figure>

                <div className="panel">
                  <div>
                    <span className="eyebrow">Circuit de traitement</span>
                    <h3 className="panel-title">Comment votre dossier est traité</h3>
                  </div>

                  <div className="timeline-item">
                    <span className="step-index">1</span>
                    <div className="timeline-item__body">
                      <strong>Remplissage du dossier</strong>
                      <span className="muted">
                        Le candidat complète d&apos;abord son formulaire et prépare les
                        deux justificatifs obligatoires.
                      </span>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <span className="step-index">2</span>
                    <div className="timeline-item__body">
                      <strong>Paiement puis soumission</strong>
                      <span className="muted">
                        Les frais d&apos;étude de dossier sont réglés après validation du
                        formulaire, avant l&apos;envoi final de la candidature.
                      </span>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <span className="step-index">3</span>
                    <div className="timeline-item__body">
                      <strong>Instruction du dossier</strong>
                      <span className="muted">
                        Vérification des pièces, contrôle administratif et mise à
                        jour du statut de candidature.
                      </span>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <span className="step-index">4</span>
                    <div className="timeline-item__body">
                      <strong>Transmission aux établissements</strong>
                      <span className="muted">
                        L&apos;université ou l&apos;école est notifiée pour poursuivre le
                        processus académique avec le candidat.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <aside className="detail-side" id="formulaire-candidature">
              <section className="detail-side__card">
                <span className="eyebrow">Candidature</span>
                <h2 className="panel-title">Déposer votre dossier en 2 étapes</h2>
                <p className="muted">
                  Étape 1 : remplir le formulaire complet et joindre les pièces.
                  Étape 2 : procéder au paiement, renseigner la référence puis
                  soumettre la candidature.
                </p>
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
