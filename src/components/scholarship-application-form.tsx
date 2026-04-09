"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { countries, getCountryFlag } from "@/lib/countries";
import { PAYMENT_SUCCESS_MESSAGE_TYPE } from "@/lib/payment";

type ScholarshipApplicationFormProps = {
  scholarshipSlug: string;
  success?: string;
  error?: string;
  paymentUrl: string;
  submitAction: (formData: FormData) => void | Promise<void>;
};

type PaymentState = "idle" | "opened" | "approved";

function getPaymentStorageKey(scholarshipSlug: string) {
  return `vision-france-payment:${scholarshipSlug}`;
}

function buildPopupFeatures() {
  const width = 540;
  const height = 860;
  const left = Math.max(0, Math.round((window.screen.width - width) / 2));
  const top = Math.max(0, Math.round((window.screen.height - height) / 2));

  return [
    "popup=yes",
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    "resizable=yes",
    "scrollbars=yes",
  ].join(",");
}

export function ScholarshipApplicationForm({
  scholarshipSlug,
  success,
  error,
  paymentUrl,
  submitAction,
}: ScholarshipApplicationFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const paymentPopupRef = useRef<Window | null>(null);
  const paymentReferenceInputRef = useRef<HTMLInputElement>(null);
  const [paymentHint, setPaymentHint] = useState("");
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [paymentReference, setPaymentReference] = useState("");

  const paymentApproved = paymentState === "approved";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storageKey = getPaymentStorageKey(scholarshipSlug);

    if (success) {
      window.sessionStorage.removeItem(storageKey);
      setPaymentState("idle");
      setPaymentReference("");
      setPaymentHint("");
      return;
    }

    const cachedValue = window.sessionStorage.getItem(storageKey);

    if (!cachedValue) {
      return;
    }

    try {
      const parsed = JSON.parse(cachedValue) as {
        paymentApproved?: boolean;
        paymentReference?: string;
      };

      if (parsed.paymentApproved) {
        setPaymentState("approved");
        setPaymentReference(parsed.paymentReference ?? "");
        setPaymentHint(
          "Paiement deja confirme. Vous pouvez finaliser la soumission du dossier.",
        );
      }
    } catch {
      window.sessionStorage.removeItem(storageKey);
    }
  }, [scholarshipSlug, success]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    function handlePaymentSuccess(event: MessageEvent) {
      if (event.origin !== window.location.origin) {
        return;
      }

      const data = event.data as {
        type?: string;
        paymentReference?: string;
      };

      if (data?.type !== PAYMENT_SUCCESS_MESSAGE_TYPE) {
        return;
      }

      const nextReference = data.paymentReference?.trim() ?? "";

      setPaymentState("approved");
      setPaymentReference(nextReference);
      setPaymentHint(
        "Paiement approuve. Verifiez la reference puis soumettez votre dossier.",
      );

      window.sessionStorage.setItem(
        getPaymentStorageKey(scholarshipSlug),
        JSON.stringify({
          paymentApproved: true,
          paymentReference: nextReference,
        }),
      );

      paymentPopupRef.current = null;

      requestAnimationFrame(() => {
        paymentReferenceInputRef.current?.focus();
      });
    }

    window.addEventListener("message", handlePaymentSuccess);

    return () => window.removeEventListener("message", handlePaymentSuccess);
  }, [scholarshipSlug]);

  useEffect(() => {
    if (typeof window === "undefined" || !paymentApproved) {
      return;
    }

    window.sessionStorage.setItem(
      getPaymentStorageKey(scholarshipSlug),
      JSON.stringify({
        paymentApproved: true,
        paymentReference,
      }),
    );
  }, [paymentApproved, paymentReference, scholarshipSlug]);

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

    const popupUrl = `/paiement?paymentUrl=${encodeURIComponent(paymentUrl)}`;
    const popup = window.open(
      popupUrl,
      "vision-france-payment",
      buildPopupFeatures(),
    );

    if (!popup) {
      setPaymentHint(
        "Le navigateur a bloque la pop-up de paiement. Autorisez les pop-ups puis relancez le paiement.",
      );
      return;
    }

    paymentPopupRef.current = popup;
    popup.focus();

    if (!paymentApproved) {
      setPaymentState("opened");
    }

    setPaymentHint(
      paymentApproved
        ? "La pop-up de paiement est rouverte. Si une nouvelle reference vous est fournie, validez a nouveau l'ecran de succes pour la mettre a jour."
        : "La fenetre de paiement est ouverte. Une fois le paiement termine, validez l'ecran de succes pour approuver la soumission du dossier.",
    );
  }

  function handlePaymentReferenceChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;
    setPaymentReference(nextValue);
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
        {paymentApproved ? (
          <input type="hidden" name="paymentConfirmed" value="yes" />
        ) : null}

        <section className="application-step">
          <div className="application-step__header">
            <span className="step-index">1</span>
            <div>
              <h3 className="panel-title">Remplir le formulaire</h3>
              <p className="muted">
                Completez d&apos;abord le dossier de candidature et joignez les deux
                justificatifs obligatoires. Le paiement ne s&apos;ouvre qu&apos;apres cette
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
                Selectionnez l&apos;indicatif du pays puis saisissez le numero local.
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
              <label htmlFor="identityDocument">Carte nationale d&apos;identite</label>
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
                Une fois le formulaire complete, ouvrez le paiement dans la pop-up
                Vision France. Lorsque l&apos;ecran de paiement reussi apparait,
                validez la reference pour approuver la soumission.
              </p>
            </div>
          </div>

          <div className="application-step__actions">
            <button
              type="button"
              className="button button--accent"
              onClick={openPayment}
            >
              {paymentApproved ? "Reouvrir le paiement" : "Proceder au paiement"}
            </button>
            <span className="payment-note">
              Le paiement s&apos;ouvre dans une pop-up securisee apres validation du
              formulaire.
            </span>
          </div>

          {paymentState === "opened" ? (
            <div className="payment-status-card">
              <strong>Paiement en cours</strong>
              <p className="payment-note">
                Terminez le paiement dans la fenetre ouverte, puis validez l&apos;ecran
                de succes pour revenir ici avec la reference.
              </p>
            </div>
          ) : null}

          {paymentApproved ? (
            <div className="payment-status-card payment-status-card--success">
              <strong>Paiement approuve</strong>
              <p className="payment-note">
                La soumission est maintenant autorisee. Verifiez la reference puis
                envoyez le dossier.
              </p>
            </div>
          ) : null}

          {paymentHint ? <p className="payment-note">{paymentHint}</p> : null}

          <div className="field">
            <label htmlFor="paymentReference">Reference de paiement</label>
            <input
              ref={paymentReferenceInputRef}
              id="paymentReference"
              name="paymentReference"
              placeholder="Ex. MF-2026-001234"
              value={paymentReference}
              onChange={handlePaymentReferenceChange}
              required
            />
            <small>
              La reference est rapatriee depuis l&apos;ecran de succes du paiement. Vous
              pouvez la corriger ici si necessaire.
            </small>
          </div>

          <label className="consent">
            <input type="checkbox" name="consent" value="yes" />
            <span>
              Je certifie l&apos;exactitude des informations transmises et j&apos;autorise
              Vision France a traiter mon dossier pour les besoins de la procedure.
            </span>
          </label>

          <button
            className="button button--accent button--block"
            type="submit"
            disabled={!paymentApproved}
          >
            Soumettre ma candidature
          </button>
        </section>
      </form>
    </section>
  );
}
