"use client";

import { useRef, useState } from "react";
import { countries, getCountryFlag } from "@/lib/countries";

type ScholarshipApplicationFormProps = {
  scholarshipSlug: string;
  success?: string;
  error?: string;
  paymentUrl: string;
  submitAction: (formData: FormData) => void | Promise<void>;
};

export function ScholarshipApplicationForm({
  scholarshipSlug,
  success,
  error,
  paymentUrl,
  submitAction,
}: ScholarshipApplicationFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [paymentHint, setPaymentHint] = useState<string>("");

  function openPayment() {
    const form = formRef.current;

    if (!form) {
      return;
    }

    const requiredBeforePayment = Array.from(
      form.querySelectorAll<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >("[data-payment-required='true']"),
    );

    for (const field of requiredBeforePayment) {
      if (!field.checkValidity()) {
        setPaymentHint(
          "Renseignez d'abord tous les champs obligatoires du formulaire avant d'ouvrir le paiement.",
        );
        field.reportValidity();
        field.focus();
        return;
      }
    }

    setPaymentHint(
      "Formulaire valide. Finalisez maintenant le paiement, puis revenez saisir la reference de paiement et soumettre le dossier.",
    );
    window.open(paymentUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="panel">
      {success ? (
        <div className="notice notice--success">
          Votre dossier a ete depose avec succes. Reference : {success}
        </div>
      ) : null}
      {error ? <div className="notice notice--error">{error}</div> : null}

      <form ref={formRef} action={submitAction} className="application-form">
        <input type="hidden" name="scholarshipSlug" value={scholarshipSlug} />

        <section className="application-step">
          <div className="application-step__header">
            <span className="step-index">1</span>
            <div>
              <h3 className="panel-title">Remplir le formulaire</h3>
              <p className="muted">
                Completez d'abord le dossier de candidature et joignez les deux
                justificatifs obligatoires. Le paiement ne s'ouvre qu'apres cette
                etape.
              </p>
            </div>
          </div>

          <div className="forms-grid">
            <div className="field">
              <label htmlFor="firstName">Prenom</label>
              <input id="firstName" name="firstName" data-payment-required="true" required />
            </div>
            <div className="field">
              <label htmlFor="lastName">Nom</label>
              <input id="lastName" name="lastName" data-payment-required="true" required />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                data-payment-required="true"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="country">Pays de residence</label>
              <select
                id="country"
                name="country"
                defaultValue=""
                data-payment-required="true"
                required
              >
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
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                data-payment-required="true"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="currentLevel">Niveau actuel</label>
              <input
                id="currentLevel"
                name="currentLevel"
                placeholder="Licence 3, Master 1..."
                data-payment-required="true"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="lastInstitution">Dernier etablissement</label>
              <input
                id="lastInstitution"
                name="lastInstitution"
                data-payment-required="true"
                required
              />
            </div>
            <div className="field field--span-2">
              <label htmlFor="phoneCountryCode">Telephone</label>
              <div className="field-row">
                <select
                  id="phoneCountryCode"
                  name="phoneCountryCode"
                  defaultValue=""
                  aria-label="Indicatif pays"
                  data-payment-required="true"
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
                  data-payment-required="true"
                  required
                />
              </div>
              <small>
                Selectionnez l'indicatif du pays puis saisissez le numero local.
              </small>
            </div>
          </div>

          <div className="field">
            <label htmlFor="programChoice">Formation ou parcours vise</label>
            <input
              id="programChoice"
              name="programChoice"
              placeholder="Intitule du programme cible"
              data-payment-required="true"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="portfolioUrl">Lien portfolio / LinkedIn (optionnel)</label>
            <input id="portfolioUrl" name="portfolioUrl" type="url" placeholder="https://" />
          </div>

          <div className="field">
            <label htmlFor="motivation">Motivation</label>
            <textarea
              id="motivation"
              name="motivation"
              placeholder="Expliquez votre projet d'etudes et votre adequation avec cette bourse."
              data-payment-required="true"
              required
            />
          </div>

          <div className="forms-grid">
            <div className="field">
              <label htmlFor="identityDocument">Carte nationale d'identite</label>
              <input
                id="identityDocument"
                name="identityDocument"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                data-payment-required="true"
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
                data-payment-required="true"
                required
              />
            </div>
          </div>

          <div className="field">
            <small>
              Formats acceptes : PDF, JPG, PNG pour les deux justificatifs
              obligatoires du dossier initial.
            </small>
          </div>
        </section>

        <section className="application-step">
          <div className="application-step__header">
            <span className="step-index">2</span>
            <div>
              <h3 className="panel-title">Payer puis soumettre le dossier</h3>
              <p className="muted">
                Une fois le formulaire complete, ouvrez le lien de paiement,
                recuperer votre reference, puis confirmez le paiement pour envoyer
                la candidature.
              </p>
            </div>
          </div>

          <div className="application-step__actions">
            <button
              type="button"
              className="button button--accent"
              onClick={openPayment}
            >
              Proceder au paiement
            </button>
            <span className="payment-note">
              Le lien de paiement ne s'ouvre qu'apres validation du formulaire.
            </span>
          </div>

          {paymentHint ? <p className="payment-note">{paymentHint}</p> : null}

          <div className="field">
            <label htmlFor="paymentReference">Reference de paiement</label>
            <input
              id="paymentReference"
              name="paymentReference"
              placeholder="Ex. MF-2026-001234"
              required
            />
            <small>
              Renseignez la reference affichee apres le paiement afin de finaliser
              l'etude de votre dossier.
            </small>
          </div>

          <label className="consent">
            <input type="checkbox" name="paymentConfirmed" value="yes" />
            <span>
              Je confirme avoir effectue le paiement des frais d'etude de dossier
              via le lien de paiement Vision France.
            </span>
          </label>

          <label className="consent">
            <input type="checkbox" name="consent" value="yes" />
            <span>
              Je certifie l'exactitude des informations transmises et j'autorise
              Vision France a traiter mon dossier pour les besoins de la procedure.
            </span>
          </label>

          <button className="button button--accent button--block" type="submit">
            Soumettre ma candidature
          </button>
        </section>
      </form>
    </section>
  );
}
