import Link from "next/link";
import { notFound } from "next/navigation";
import { submitApplication } from "@/app/actions";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
import { StatusBadge } from "@/components/status-badge";
import { countries, getCountryFlag } from "@/lib/countries";
import { getScholarshipBySlug } from "@/lib/data";
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
  const loadedScholarship = await getScholarshipBySlug(slug);

  if (!loadedScholarship || !loadedScholarship.officialUrl) {
    notFound();
  }

  const scholarship = loadedScholarship;
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
                    Des pièces complémentaires académiques peuvent être demandées par
                    l&apos;établissement après une présélection.
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

                <div className="panel">
                  <div>
                    <span className="eyebrow">Circuit de traitement</span>
                    <h3 className="panel-title">Comment votre dossier est traité</h3>
                  </div>

                  <div className="timeline-item">
                    <span className="step-index">1</span>
                    <div className="timeline-item__body">
                      <strong>Paiement des frais d&apos;étude</strong>
                      <span className="muted">
                        Le règlement des frais d&apos;étude de dossier s&apos;effectue avant
                        toute soumission de candidature.
                      </span>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <span className="step-index">2</span>
                    <div className="timeline-item__body">
                      <strong>Dépôt sur Vision France</strong>
                      <span className="muted">
                        Transmission du formulaire, de la référence de paiement et des
                        justificatifs obligatoires sur la plateforme.
                      </span>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <span className="step-index">3</span>
                    <div className="timeline-item__body">
                      <strong>Instruction du dossier</strong>
                      <span className="muted">
                        Vérification des pièces, contrôle administratif et mise à jour
                        du statut de candidature.
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
                  Étape 1 : procéder au paiement des frais d&apos;étude de dossier.
                  Étape 2 : soumettre le formulaire complet avec la référence de
                  paiement et les documents justificatifs.
                </p>
              </section>

              <section className="panel">
                {success ? (
                  <div className="notice notice--success">
                    Votre dossier a été déposé avec succès. Référence : {success}
                  </div>
                ) : null}
                {error ? <div className="notice notice--error">{error}</div> : null}

                <form action={submitApplication} className="application-form">
                  <input type="hidden" name="scholarshipSlug" value={scholarship.slug} />

                  <section className="application-step">
                    <div className="application-step__header">
                      <span className="step-index">1</span>
                      <div>
                        <h3 className="panel-title">Payer l&apos;étude de dossier</h3>
                        <p className="muted">
                          Le paiement s&apos;ouvre dans un nouvel onglet via MoneyFusion.
                          Après le règlement, revenez sur cette page pour renseigner la
                          référence de paiement.
                        </p>
                      </div>
                    </div>

                    <div className="application-step__actions">
                      <a
                        href={applicationFeePaymentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="button button--accent"
                      >
                        Procéder au paiement
                      </a>
                      <span className="payment-note">
                        Lien de paiement de démonstration pour l&apos;étude de dossier.
                      </span>
                    </div>
                  </section>

                  <section className="application-step">
                    <div className="application-step__header">
                      <span className="step-index">2</span>
                      <div>
                        <h3 className="panel-title">Soumettre le dossier</h3>
                        <p className="muted">
                          Le dossier n&apos;est enregistré qu&apos;après confirmation du
                          paiement et contrôle des deux justificatifs obligatoires.
                        </p>
                      </div>
                    </div>
                  </section>

                  <div className="field">
                    <label htmlFor="paymentReference">Référence de paiement</label>
                    <input
                      id="paymentReference"
                      name="paymentReference"
                      placeholder="Ex. MF-2026-001234"
                      required
                    />
                    <small>
                      Renseignez la référence affichée après le paiement afin de
                      finaliser l&apos;étude de votre dossier.
                    </small>
                  </div>

                  <div className="forms-grid">
                    <div className="field">
                      <label htmlFor="firstName">Prénom</label>
                      <input id="firstName" name="firstName" required />
                    </div>
                    <div className="field">
                      <label htmlFor="lastName">Nom</label>
                      <input id="lastName" name="lastName" required />
                    </div>
                    <div className="field">
                      <label htmlFor="email">Email</label>
                      <input id="email" name="email" type="email" required />
                    </div>
                    <div className="field">
                      <label htmlFor="country">Pays de résidence</label>
                      <select id="country" name="country" defaultValue="" required>
                        <option value="">Choisir votre pays de résidence</option>
                        {countries.map((country) => (
                          <option key={country.code} value={country.name}>
                            {getCountryFlag(country.code)} {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="birthDate">Date de naissance</label>
                      <input id="birthDate" name="birthDate" type="date" required />
                    </div>
                    <div className="field">
                      <label htmlFor="currentLevel">Niveau actuel</label>
                      <input
                        id="currentLevel"
                        name="currentLevel"
                        placeholder="Licence 3, Master 1..."
                        required
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="lastInstitution">Dernier établissement</label>
                      <input id="lastInstitution" name="lastInstitution" required />
                    </div>
                    <div className="field field--span-2">
                      <label htmlFor="phoneCountryCode">Téléphone</label>
                      <div className="field-row">
                        <select
                          id="phoneCountryCode"
                          name="phoneCountryCode"
                          defaultValue=""
                          aria-label="Indicatif pays"
                          required
                        >
                          <option value="">Drapeau et indicatif</option>
                          {countries.map((country) => (
                            <option
                              key={`${country.code}-dial`}
                              value={`${getCountryFlag(country.code)} ${country.dialCode}`}
                            >
                              {getCountryFlag(country.code)} {country.name} ({country.dialCode})
                            </option>
                          ))}
                        </select>
                        <input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          placeholder="Numéro de téléphone"
                          aria-label="Numéro de téléphone"
                          required
                        />
                      </div>
                      <small>
                        Sélectionnez l&apos;indicatif du pays puis saisissez le numéro
                        local.
                      </small>
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="programChoice">Formation ou parcours visé</label>
                    <input
                      id="programChoice"
                      name="programChoice"
                      placeholder="Intitulé du programme cible"
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="portfolioUrl">Lien portfolio / LinkedIn (optionnel)</label>
                    <input
                      id="portfolioUrl"
                      name="portfolioUrl"
                      type="url"
                      placeholder="https://"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="motivation">Motivation</label>
                    <textarea
                      id="motivation"
                      name="motivation"
                      placeholder="Expliquez votre projet d'études et votre adéquation avec cette bourse."
                      required
                    />
                  </div>

                  <div className="forms-grid">
                    <div className="field">
                      <label htmlFor="identityDocument">
                        Carte nationale d&apos;identité
                      </label>
                      <input
                        id="identityDocument"
                        name="identityDocument"
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        required
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="lastDegreeDocument">Dernier diplôme</label>
                      <input
                        id="lastDegreeDocument"
                        name="lastDegreeDocument"
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        required
                      />
                    </div>
                  </div>

                  <div className="field">
                    <small>
                      Formats acceptés : PDF, JPG, PNG pour les deux justificatifs
                      obligatoires du dossier initial.
                    </small>
                  </div>

                  <label className="consent">
                    <input type="checkbox" name="paymentConfirmed" value="yes" />
                    <span>
                      Je confirme avoir effectué le paiement des frais d&apos;étude de
                      dossier via le lien de paiement Vision France.
                    </span>
                  </label>

                  <label className="consent">
                    <input type="checkbox" name="consent" value="yes" />
                    <span>
                      Je certifie l&apos;exactitude des informations transmises et
                      j&apos;autorise Vision France à traiter mon dossier pour les besoins
                      de la procédure.
                    </span>
                  </label>

                  <button className="button button--accent button--block" type="submit">
                    Soumettre ma candidature
                  </button>
                </form>
              </section>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
