import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
import { StatusBadge } from "@/components/status-badge";
import { submitApplication } from "@/app/actions";
import { countries, getCountryFlag } from "@/lib/countries";
import { getScholarshipBySlug } from "@/lib/data";
import { firstQueryValue, formatDate, getScholarshipStatusMeta } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ScholarshipPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ScholarshipPage({
  params,
  searchParams,
}: ScholarshipPageProps) {
  const { slug } = await params;
  const messages = await searchParams;
  const scholarship = await getScholarshipBySlug(slug);

  if (!scholarship) {
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
                  Postuler maintenant
                </Link>
                <Link href="/#catalogue" className="button button--secondary">
                  Retour au catalogue
                </Link>
              </div>
            </div>

            <div className="facts-grid">
              <div className="detail-fact">
                <strong>Echeance</strong>
                <span>{formatDate(scholarship.deadline)}</span>
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
                  <ul className="muted">
                    {scholarship.benefits.map((benefit) => (
                      <li key={benefit}>{benefit}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="panel-title">Conditions d&apos;eligibilite</h3>
                  <ul className="muted">
                    {scholarship.eligibility.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="panel-title">Pieces demandees</h3>
                  <ul className="muted">
                    {scholarship.requiredDocuments.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="panel">
                  <div>
                    <span className="eyebrow">Circuit de traitement</span>
                    <h3 className="panel-title">Comment votre dossier est traite</h3>
                  </div>
                  <div className="timeline-item">
                    <span className="step-index">1</span>
                    <div className="timeline-item__body">
                      <strong>Depot sur Vision France</strong>
                      <span className="muted">
                        Transmission du formulaire et des justificatifs sur la
                        plateforme.
                      </span>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <span className="step-index">2</span>
                    <div className="timeline-item__body">
                      <strong>Instruction du dossier</strong>
                      <span className="muted">
                        Verification des pieces, analyse du dossier et mise a jour
                        du statut.
                      </span>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <span className="step-index">3</span>
                    <div className="timeline-item__body">
                      <strong>Transmission aux etablissements</strong>
                      <span className="muted">
                        L&apos;universite ou l&apos;ecole est notifiee pour la suite du
                        processus academique.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <aside className="detail-side" id="formulaire-candidature">
              <section className="detail-side__card">
                <span className="eyebrow">Candidature</span>
                <h2 className="panel-title">Deposer votre dossier</h2>
                <p className="muted">
                  Le formulaire ci-dessous enregistre votre candidature et
                  declenche un email de confirmation.
                </p>
              </section>

              <section className="panel">
                {success ? (
                  <div className="notice notice--success">
                    Votre dossier a ete depose avec succes. Reference : {success}
                  </div>
                ) : null}
                {error ? <div className="notice notice--error">{error}</div> : null}

                <form action={submitApplication} className="application-form">
                  <input type="hidden" name="scholarshipSlug" value={scholarship.slug} />

                  <div className="forms-grid">
                    <div className="field">
                      <label htmlFor="firstName">Prenom</label>
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
                      <label htmlFor="country">Pays de residence</label>
                      <select id="country" name="country" defaultValue="" required>
                        <option value="">Choisir votre pays de residence</option>
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
                      <label htmlFor="lastInstitution">Dernier etablissement</label>
                      <input id="lastInstitution" name="lastInstitution" required />
                    </div>
                    <div className="field field--span-2">
                      <label htmlFor="phoneCountryCode">Telephone</label>
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
                          placeholder="Numero de telephone"
                          aria-label="Numero de telephone"
                          required
                        />
                      </div>
                      <small>
                        Selectionnez l&apos;indicatif du pays puis saisissez le numero
                        local.
                      </small>
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="programChoice">Formation ou parcours vise</label>
                    <input
                      id="programChoice"
                      name="programChoice"
                      placeholder="Intitule du programme cible"
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
                      placeholder="Expliquez votre projet d'etudes et votre adequation avec cette bourse."
                      required
                    />
                  </div>

                  <div className="forms-grid">
                    <div className="field">
                      <label htmlFor="identityDocument">
                        Carte Nationale d&apos;identite
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
                      <label htmlFor="lastDegreeDocument">Dernier diplome</label>
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
                      Formats acceptes : PDF, JPG, PNG pour les deux justificatifs
                      obligatoires.
                    </small>
                  </div>

                  <label className="consent">
                    <input type="checkbox" name="consent" value="yes" />
                    <span>
                      Je certifie l&apos;exactitude des informations transmises et
                      j&apos;autorise Vision France a traiter mon dossier pour les
                      besoins de la procedure.
                    </span>
                  </label>

                  <button className="button button--accent button--block" type="submit">
                    Envoyer ma candidature
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
