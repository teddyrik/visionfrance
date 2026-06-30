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
type PaymentDialogStep = "payment" | "success";

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

function shouldUseEmbeddedPaymentFlow() {
  const mobileMedia = window.matchMedia("(max-width: 820px)").matches;
  const mobileUserAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(
    window.navigator.userAgent,
  );
  return mobileMedia || mobileUserAgent;
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
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentDialogStep, setPaymentDialogStep] =
    useState<PaymentDialogStep>("payment");
  const [paymentDialogReference, setPaymentDialogReference] = useState("");
  const [paymentDialogError, setPaymentDialogError] = useState("");

  const paymentApproved = paymentState === "approved";

  function persistApprovedPayment(nextReference: string) {
    window.sessionStorage.setItem(
      getPaymentStorageKey(scholarshipSlug),
      JSON.stringify({ paymentApproved: true, paymentReference: nextReference }),
    );
  }

  function focusPaymentReferenceField() {
    requestAnimationFrame(() => {
      paymentReferenceInputRef.current?.focus();
    });
  }

  function markPaymentApproved(nextReference: string) {
    setPaymentState("approved");
    setPaymentReference(nextReference);
    setPaymentHint("Paiement approuve. Verifiez la reference puis soumettez votre dossier.");
    persistApprovedPayment(nextReference);
    setPaymentDialogOpen(false);
    setPaymentDialogStep("payment");
    setPaymentDialogReference("");
    setPaymentDialogError("");
    focusPaymentReferenceField();
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storageKey = getPaymentStorageKey(scholarshipSlug);

    if (success) {
      window.sessionStorage.removeItem(storageKey);
      setPaymentState("idle");
      setPaymentReference("");
      setPaymentHint("");
      setPaymentDialogOpen(false);
      setPaymentDialogStep("payment");
      setPaymentDialogReference("");
      setPaymentDialogError("");
      return;
    }

    const cachedValue = window.sessionStorage.getItem(storageKey);
    if (!cachedValue) return;

    try {
      const parsed = JSON.parse(cachedValue) as {
        paymentApproved?: boolean;
        paymentReference?: string;
      };
      if (parsed.paymentApproved) {
        setPaymentState("approved");
        setPaymentReference(parsed.paymentReference ?? "");
        setPaymentHint("Paiement deja confirme. Vous pouvez finaliser la soumission du dossier.");
      }
    } catch {
      window.sessionStorage.removeItem(storageKey);
    }
  }, [scholarshipSlug, success]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function handlePaymentSuccess(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; paymentReference?: string };
      if (data?.type !== PAYMENT_SUCCESS_MESSAGE_TYPE) return;
      paymentPopupRef.current = null;
      markPaymentApproved(data.paymentReference?.trim() ?? "");
    }

    window.addEventListener("message", handlePaymentSuccess);
    return () => window.removeEventListener("message", handlePaymentSuccess);
  }, [scholarshipSlug]);

  useEffect(() => {
    if (typeof window === "undefined" || !paymentApproved) return;
    persistApprovedPayment(paymentReference);
  }, [paymentApproved, paymentReference, scholarshipSlug]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const previousOverflow = document.body.style.overflow;
    if (paymentDialogOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [paymentDialogOpen]);

  function openEmbeddedPayment(message: string) {
    if (!paymentApproved) setPaymentState("opened");
    setPaymentDialogStep("payment");
    setPaymentDialogReference(paymentReference);
    setPaymentDialogError("");
    setPaymentDialogOpen(true);
    setPaymentHint(message);
  }

  function openPayment() {
    const form = formRef.current;
    if (!form) return;

    const requiredBeforePayment = Array.from(
      form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        "[data-payment-required='true']",
      ),
    );

    for (const field of requiredBeforePayment) {
      if (!field.checkValidity()) {
        setPaymentHint("Renseignez d'abord tous les champs obligatoires du formulaire avant d'ouvrir le paiement.");
        field.reportValidity();
        field.focus();
        return;
      }
    }

    if (shouldUseEmbeddedPaymentFlow()) {
      openEmbeddedPayment(
        paymentApproved
          ? "Le paiement est rouvert dans la modale integree. Validez a nouveau l'ecran de succes si une nouvelle reference vous est fournie."
          : "Le paiement s'affiche maintenant dans la modale integree. Une fois termine, passez a l'ecran de succes pour approuver la soumission.",
      );
      return;
    }

    const popupUrl = `/paiement?paymentUrl=${encodeURIComponent(paymentUrl)}`;
    const popup = window.open(popupUrl, "vision-france-payment", buildPopupFeatures());

    if (!popup) {
      openEmbeddedPayment("Le navigateur a bloque la pop-up. Le paiement est ouvert dans la modale integree a la page.");
      return;
    }

    paymentPopupRef.current = popup;
    popup.focus();
    if (!paymentApproved) setPaymentState("opened");
    setPaymentHint(
      paymentApproved
        ? "La fenetre de paiement est rouverte. Si une nouvelle reference vous est fournie, validez a nouveau l'ecran de succes pour la mettre a jour."
        : "La fenetre de paiement est ouverte. Une fois le paiement termine, validez l'ecran de succes pour approuver la soumission du dossier.",
    );
  }

  function closePaymentDialog() {
    setPaymentDialogOpen(false);
    setPaymentDialogStep("payment");
    setPaymentDialogError("");
    if (!paymentApproved && paymentState === "opened") {
      setPaymentHint("Le paiement a ete ferme avant validation. Reouvrez-le pour terminer puis approuver la soumission.");
    }
  }

  function showPaymentSuccessStep() {
    setPaymentDialogStep("success");
    setPaymentDialogReference(paymentReference);
    setPaymentDialogError("");
  }

  function approvePaymentFromDialog() {
    const normalizedReference = paymentDialogReference.trim();
    if (!normalizedReference) {
      setPaymentDialogError("Renseignez la reference affichee apres votre paiement pour continuer.");
      return;
    }
    markPaymentApproved(normalizedReference);
  }

  function handlePaymentReferenceChange(event: ChangeEvent<HTMLInputElement>) {
    setPaymentReference(event.target.value);
  }

  return (
    <>
      <div className="saf-shell">
        {/* ── Notices globales ── */}
        {success && (
          <div className="saf-notice saf-notice--success" role="status">
            <span className="saf-notice__icon">✓</span>
            <span>Votre dossier a ete depose avec succes. Reference&nbsp;: <strong>{success}</strong></span>
          </div>
        )}
        {error && (
          <div className="saf-notice saf-notice--error" role="alert">
            <span className="saf-notice__icon">!</span>
            <span>{error}</span>
          </div>
        )}

        <form ref={formRef} action={submitAction} className="saf-form">
          <input type="hidden" name="scholarshipSlug" value={scholarshipSlug} />
          {paymentApproved && (
            <input type="hidden" name="paymentConfirmed" value="yes" />
          )}

          {/* ════════════════════════════════
              ÉTAPE 1 — Formulaire
          ════════════════════════════════ */}
          <div className="saf-step">
            <div className="saf-step__aside">
              <div className="saf-step__node">
                <span className="saf-step__num">01</span>
              </div>
              <div className="saf-step__rail" aria-hidden="true" />
            </div>

            <div className="saf-step__body">
              <header className="saf-step__header">
                <h2 className="saf-step__title">Remplir le formulaire</h2>
                <p className="saf-step__desc">
                  Completez le dossier et joignez les deux justificatifs obligatoires.
                  Le paiement ne s&apos;ouvre qu&apos;apres cette etape.
                </p>
              </header>

              <div className="saf-fields-grid">
                <div className="saf-field">
                  <label className="saf-label" htmlFor="firstName">Prenom</label>
                  <input className="saf-input" id="firstName" name="firstName" data-payment-required="true" required />
                </div>
                <div className="saf-field">
                  <label className="saf-label" htmlFor="lastName">Nom</label>
                  <input className="saf-input" id="lastName" name="lastName" data-payment-required="true" required />
                </div>
                <div className="saf-field">
                  <label className="saf-label" htmlFor="email">Adresse email</label>
                  <input className="saf-input" id="email" name="email" type="email" data-payment-required="true" required />
                </div>
                <div className="saf-field">
                  <label className="saf-label" htmlFor="country">Pays de residence</label>
                  <select className="saf-input" id="country" name="country" defaultValue="" data-payment-required="true" required>
                    <option value="">Choisir votre pays</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.name}>
                        {getCountryFlag(country.code)} {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="saf-field">
                  <label className="saf-label" htmlFor="birthDate">Date de naissance</label>
                  <input className="saf-input" id="birthDate" name="birthDate" type="date" data-payment-required="true" required />
                </div>
                <div className="saf-field">
                  <label className="saf-label" htmlFor="currentLevel">Niveau actuel</label>
                  <input className="saf-input" id="currentLevel" name="currentLevel" placeholder="Licence 3, Master 1…" data-payment-required="true" required />
                </div>
                <div className="saf-field">
                  <label className="saf-label" htmlFor="lastInstitution">Dernier etablissement</label>
                  <input className="saf-input" id="lastInstitution" name="lastInstitution" data-payment-required="true" required />
                </div>

                <div className="saf-field saf-field--wide">
                  <label className="saf-label" htmlFor="phoneCountryCode">Telephone</label>
                  <div className="saf-phone-row">
                    <select className="saf-input saf-input--dial" id="phoneCountryCode" name="phoneCountryCode" defaultValue="" aria-label="Indicatif pays" data-payment-required="true" required>
                      <option value="">Indicatif</option>
                      {countries.map((country) => (
                        <option key={`${country.code}-dial`} value={`${getCountryFlag(country.code)} ${country.dialCode}`}>
                          {getCountryFlag(country.code)} {country.name} ({country.dialCode})
                        </option>
                      ))}
                    </select>
                    <input className="saf-input" id="phoneNumber" name="phoneNumber" type="tel" placeholder="Numero local" aria-label="Numero de telephone" data-payment-required="true" required />
                  </div>
                  <span className="saf-hint">Selectionnez l&apos;indicatif puis saisissez le numero local.</span>
                </div>
              </div>

              <div className="saf-field saf-field--stack">
                <label className="saf-label" htmlFor="programChoice">Formation ou parcours vise</label>
                <input className="saf-input" id="programChoice" name="programChoice" placeholder="Intitule du programme cible" data-payment-required="true" required />
              </div>

              <div className="saf-field saf-field--stack">
                <label className="saf-label" htmlFor="portfolioUrl">
                  Lien portfolio / LinkedIn
                  <span className="saf-label__opt">optionnel</span>
                </label>
                <input className="saf-input" id="portfolioUrl" name="portfolioUrl" type="url" placeholder="https://" />
              </div>

              <div className="saf-field saf-field--stack">
                <label className="saf-label" htmlFor="motivation">Lettre de motivation</label>
                <textarea className="saf-input saf-input--textarea" id="motivation" name="motivation" placeholder="Expliquez votre projet d'etudes et votre adequation avec cette bourse." data-payment-required="true" required />
              </div>

              <div className="saf-fields-grid saf-fields-grid--docs">
                <div className="saf-field">
                  <label className="saf-label" htmlFor="identityDocument">Carte nationale d&apos;identite</label>
                  <label className="saf-file-drop" htmlFor="identityDocument">
                    <span className="saf-file-drop__icon">📄</span>
                    <span className="saf-file-drop__text">Glisser ou <u>choisir un fichier</u></span>
                    <span className="saf-hint">PDF, JPG, PNG</span>
                    <input className="saf-file-input" id="identityDocument" name="identityDocument" type="file" accept=".pdf,.png,.jpg,.jpeg" data-payment-required="true" required />
                  </label>
                </div>
                <div className="saf-field">
                  <label className="saf-label" htmlFor="lastDegreeDocument">Dernier diplome</label>
                  <label className="saf-file-drop" htmlFor="lastDegreeDocument">
                    <span className="saf-file-drop__icon">🎓</span>
                    <span className="saf-file-drop__text">Glisser ou <u>choisir un fichier</u></span>
                    <span className="saf-hint">PDF, JPG, PNG</span>
                    <input className="saf-file-input" id="lastDegreeDocument" name="lastDegreeDocument" type="file" accept=".pdf,.png,.jpg,.jpeg" data-payment-required="true" required />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════
              ÉTAPE 2 — Paiement & soumission
          ════════════════════════════════ */}
          <div className="saf-step saf-step--last">
            <div className="saf-step__aside">
              <div className={`saf-step__node ${paymentApproved ? "saf-step__node--done" : ""}`}>
                <span className="saf-step__num">02</span>
              </div>
            </div>

            <div className="saf-step__body">
              <header className="saf-step__header">
                <h2 className="saf-step__title">Paiement &amp; soumission</h2>
                <p className="saf-step__desc">
                  Une fois le formulaire complete, ouvrez le paiement. Sur mobile,
                  il s&apos;affiche directement dans la page.
                </p>
              </header>

              {/* Bouton paiement */}
              <div className="saf-pay-row">
                <button type="button" className={`saf-btn saf-btn--pay ${paymentApproved ? "saf-btn--pay-reopen" : ""}`} onClick={openPayment}>
                  {paymentApproved ? (
                    <><span className="saf-btn__icon">↩</span> Reouvrir le paiement</>
                  ) : (
                    <><span className="saf-btn__icon">💳</span> Proceder au paiement</>
                  )}
                </button>
                <span className="saf-hint">Ouverture dans une fenetre adaptee au mobile et au desktop.</span>
              </div>

              {/* Statut paiement */}
              {paymentState === "opened" && !paymentApproved && (
                <div className="saf-pay-status saf-pay-status--pending">
                  <div className="saf-pay-status__dot" />
                  <div>
                    <strong>Paiement en cours</strong>
                    <p>Terminez le paiement dans la fenetre affichee, puis validez l&apos;ecran de succes pour revenir ici avec la reference.</p>
                  </div>
                </div>
              )}

              {paymentApproved && (
                <div className="saf-pay-status saf-pay-status--approved">
                  <div className="saf-pay-status__dot" />
                  <div>
                    <strong>Paiement approuve</strong>
                    <p>La soumission est maintenant autorisee. Verifiez la reference ci-dessous puis envoyez le dossier.</p>
                  </div>
                </div>
              )}

              {paymentHint && (
                <p className="saf-pay-hint">{paymentHint}</p>
              )}

              {/* Référence de paiement */}
              <div className="saf-field saf-field--stack">
                <label className="saf-label" htmlFor="paymentReference">Reference de paiement</label>
                <input
                  ref={paymentReferenceInputRef}
                  className={`saf-input saf-input--ref ${paymentApproved ? "saf-input--ref-ok" : ""}`}
                  id="paymentReference"
                  name="paymentReference"
                  placeholder="Ex. MF-2026-001234"
                  value={paymentReference}
                  onChange={handlePaymentReferenceChange}
                  required
                />
                <span className="saf-hint">Rapatriee depuis l&apos;ecran de succes. Vous pouvez la corriger si necessaire.</span>
              </div>

              {/* Consentement */}
              <label className="saf-consent">
                <input className="saf-consent__checkbox" type="checkbox" name="consent" value="yes" required />
                <span className="saf-consent__text">
                  Je certifie l&apos;exactitude des informations transmises et j&apos;autorise Vision France
                  a traiter mon dossier pour les besoins de la procedure.
                </span>
              </label>

              {/* Bouton soumettre */}
              <button
                className="saf-btn saf-btn--submit"
                type="submit"
                disabled={!paymentApproved}
              >
                {paymentApproved ? "Soumettre ma candidature →" : "En attente du paiement"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ════════════════════════════════
          MODALE PAIEMENT
      ════════════════════════════════ */}
      {paymentDialogOpen && (
        <div className="saf-modal" role="dialog" aria-modal="true">
          <div className="saf-modal__backdrop" onClick={closePaymentDialog} />
          <div className="saf-modal__sheet">
            <div className="saf-modal__header">
              <div>
                <span className="saf-modal__eyebrow">
                  {paymentDialogStep === "payment" ? "Etape paiement" : "Confirmation"}
                </span>
                <h2 className="saf-modal__title">
                  {paymentDialogStep === "payment"
                    ? "Finaliser le paiement"
                    : "Approuver la soumission"}
                </h2>
              </div>
              <button type="button" className="saf-modal__close" onClick={closePaymentDialog} aria-label="Fermer">
                ✕
              </button>
            </div>

            {paymentDialogStep === "payment" ? (
              <>
                <p className="saf-hint saf-hint--modal">
                  Le paiement reste dans la page pour fonctionner proprement sur mobile.
                  Quand MoneyFusion affiche la fin du paiement, passez a l&apos;ecran de succes.
                </p>
                <div className="saf-iframe-wrap">
                  <iframe
                    src={paymentUrl}
                    title="Paiement MoneyFusion"
                    className="saf-iframe"
                    allow="payment *"
                  />
                </div>
                <div className="saf-modal__actions">
                  <a href={paymentUrl} target="_blank" rel="noreferrer" className="saf-btn saf-btn--ghost">
                    Ouvrir dans le navigateur
                  </a>
                  <button type="button" className="saf-btn saf-btn--accent" onClick={showPaymentSuccessStep}>
                    J&apos;ai termine le paiement →
                  </button>
                </div>
              </>
            ) : (
              <div className="saf-modal__success">
                <div className="saf-modal__success-icon">✓</div>
                <p className="saf-hint saf-hint--modal">
                  Saisissez la reference affichee par MoneyFusion pour approuver la soumission du dossier.
                </p>

                <div className="saf-field saf-field--stack">
                  <label className="saf-label" htmlFor="dialogPaymentReference">Reference de paiement</label>
                  <input
                    className="saf-input saf-input--ref"
                    id="dialogPaymentReference"
                    value={paymentDialogReference}
                    onChange={(event) => setPaymentDialogReference(event.target.value)}
                    placeholder="Ex. MF-2026-001234"
                    autoFocus
                    required
                  />
                  <span className="saf-hint">Injectee automatiquement dans le formulaire principal.</span>
                </div>

                {paymentDialogError && (
                  <div className="saf-notice saf-notice--error" role="alert">
                    <span className="saf-notice__icon">!</span>
                    <span>{paymentDialogError}</span>
                  </div>
                )}

                <div className="saf-modal__actions">
                  <button type="button" className="saf-btn saf-btn--ghost" onClick={() => setPaymentDialogStep("payment")}>
                    ← Retour au paiement
                  </button>
                  <button type="button" className="saf-btn saf-btn--accent" onClick={approvePaymentFromDialog}>
                    Approuver la soumission →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        /* ─── Tokens ─────────────────────────────── */
        .saf-shell {
          --saf-navy:    #081d49;
          --saf-rouge:   #c21f37;
          --saf-gold:    #a9802f;
          --saf-ink:     #16243f;
          --saf-muted:   #4f6282;
          --saf-paper:   #faf7f1;
          --saf-line:    rgba(22,36,63,0.13);
          --saf-line-strong: rgba(22,36,63,0.22);
          --saf-success: #17744c;
          --saf-success-soft: #e7f8ef;
          --saf-danger:  #b31526;
          --saf-danger-soft: #ffe8eb;
          --saf-radius:  14px;

          display: block;
          max-width: 760px;
        }

        /* ─── Form shell ─────────────────────────── */
        .saf-form {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* ─── Steps ──────────────────────────────── */
        .saf-step {
          display: grid;
          grid-template-columns: 3rem 1fr;
          gap: 0 1.5rem;
        }

        .saf-step__aside {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 0.15rem;
        }

        .saf-step__node {
          width: 2.6rem;
          height: 2.6rem;
          border-radius: 999px;
          background: var(--saf-navy);
          border: 2px solid var(--saf-gold);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }

        .saf-step__node--done {
          background: var(--saf-success);
          border-color: var(--saf-success);
        }

        .saf-step__num {
          font-family: "IBM Plex Mono", monospace;
          font-size: 0.72rem;
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.04em;
        }

        .saf-step__rail {
          flex: 1;
          width: 2px;
          background: linear-gradient(180deg, var(--saf-gold) 0%, var(--saf-line) 100%);
          margin: 0.5rem 0;
          border-radius: 2px;
        }

        .saf-step__body {
          padding-bottom: 3rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .saf-step--last .saf-step__body {
          padding-bottom: 1rem;
        }

        /* ─── Step header ────────────────────────── */
        .saf-step__header {
          padding-top: 0.2rem;
        }

        .saf-step__title {
          margin: 0 0 0.35rem;
          font-family: "Source Serif 4", Georgia, serif;
          font-size: 1.55rem;
          font-weight: 600;
          color: var(--saf-navy);
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .saf-step__desc {
          margin: 0;
          font-size: 0.9rem;
          color: var(--saf-muted);
          line-height: 1.6;
        }

        /* ─── Fields grid ────────────────────────── */
        .saf-fields-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .saf-fields-grid--docs {
          gap: 1rem;
        }

        .saf-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .saf-field--wide {
          grid-column: span 2;
        }

        .saf-field--stack {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        /* ─── Labels ─────────────────────────────── */
        .saf-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--saf-ink);
        }

        .saf-label__opt {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: var(--saf-muted);
          text-transform: none;
          border: 1px solid var(--saf-line);
          border-radius: 4px;
          padding: 0.05rem 0.35rem;
        }

        /* ─── Inputs ─────────────────────────────── */
        .saf-input {
          width: 100%;
          border: 1px solid var(--saf-line-strong);
          border-radius: var(--saf-radius);
          padding: 0.82rem 1rem;
          background: #fff;
          color: var(--saf-ink);
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
          appearance: none;
        }

        .saf-input:focus {
          border-color: var(--saf-navy);
          box-shadow: 0 0 0 3px rgba(8,29,73,0.09);
        }

        .saf-input--textarea {
          min-height: 120px;
          resize: vertical;
          line-height: 1.6;
        }

        .saf-input--ref {
          font-family: "IBM Plex Mono", monospace;
          letter-spacing: 0.04em;
          font-size: 0.9rem;
        }

        .saf-input--ref-ok {
          border-color: var(--saf-success);
          background: var(--saf-success-soft);
          color: var(--saf-success);
        }

        .saf-input--ref-ok:focus {
          box-shadow: 0 0 0 3px rgba(23,116,76,0.12);
        }

        .saf-input--dial {
          max-width: 220px;
          flex-shrink: 0;
        }

        /* ─── Phone row ──────────────────────────── */
        .saf-phone-row {
          display: flex;
          gap: 0.6rem;
        }

        .saf-phone-row .saf-input:last-child {
          flex: 1;
        }

        /* ─── Hint text ──────────────────────────── */
        .saf-hint {
          font-size: 0.78rem;
          color: var(--saf-muted);
          line-height: 1.5;
        }

        .saf-hint--modal {
          font-size: 0.88rem;
          margin: 0;
        }

        /* ─── File drop zone ─────────────────────── */
        .saf-file-drop {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          padding: 1.4rem 1rem;
          border: 1.5px dashed var(--saf-line-strong);
          border-radius: var(--saf-radius);
          background: var(--saf-paper);
          cursor: pointer;
          text-align: center;
          transition: border-color 0.18s ease, background 0.18s ease;
        }

        .saf-file-drop:hover {
          border-color: var(--saf-navy);
          background: rgba(8,29,73,0.03);
        }

        .saf-file-drop__icon {
          font-size: 1.6rem;
          line-height: 1;
        }

        .saf-file-drop__text {
          font-size: 0.84rem;
          color: var(--saf-ink);
        }

        .saf-file-drop__text u {
          color: var(--saf-navy);
          font-weight: 700;
          text-decoration-color: var(--saf-gold);
        }

        .saf-file-input {
          position: absolute;
          width: 0;
          height: 0;
          opacity: 0;
          pointer-events: none;
        }

        /* ─── Payment action row ─────────────────── */
        .saf-pay-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        /* ─── Buttons ────────────────────────────── */
        .saf-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.82rem 1.5rem;
          border-radius: 999px;
          border: 1.5px solid transparent;
          font-size: 0.9rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, border-color 0.18s ease;
          text-decoration: none;
          white-space: nowrap;
        }

        .saf-btn:hover {
          transform: translateY(-1px);
        }

        .saf-btn:disabled {
          cursor: not-allowed;
          opacity: 0.45;
          transform: none;
          box-shadow: none;
        }

        .saf-btn--pay {
          background: var(--saf-rouge);
          color: #fff;
          box-shadow: 0 10px 24px rgba(194,31,55,0.22);
        }

        .saf-btn--pay:hover:not(:disabled) {
          box-shadow: 0 14px 28px rgba(194,31,55,0.3);
        }

        .saf-btn--pay-reopen {
          background: var(--saf-navy);
          box-shadow: 0 10px 24px rgba(8,29,73,0.18);
        }

        .saf-btn--accent {
          background: var(--saf-rouge);
          color: #fff;
          box-shadow: 0 8px 20px rgba(194,31,55,0.2);
        }

        .saf-btn--ghost {
          background: transparent;
          color: var(--saf-ink);
          border-color: var(--saf-line-strong);
        }

        .saf-btn--ghost:hover {
          border-color: var(--saf-navy);
        }

        .saf-btn--submit {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, var(--saf-navy) 0%, #0d2f6f 100%);
          color: #fff;
          font-size: 1rem;
          border-radius: var(--saf-radius);
          box-shadow: 0 12px 28px rgba(8,29,73,0.22);
          letter-spacing: 0.01em;
        }

        .saf-btn--submit:not(:disabled):hover {
          box-shadow: 0 16px 32px rgba(8,29,73,0.3);
        }

        .saf-btn__icon {
          font-style: normal;
        }

        /* ─── Payment status cards ───────────────── */
        .saf-pay-status {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          padding: 1rem 1.2rem;
          border-radius: var(--saf-radius);
          border: 1px solid var(--saf-line);
        }

        .saf-pay-status--pending {
          background: rgba(169,128,47,0.07);
          border-color: rgba(169,128,47,0.25);
        }

        .saf-pay-status--approved {
          background: var(--saf-success-soft);
          border-color: rgba(23,116,76,0.2);
        }

        .saf-pay-status__dot {
          width: 0.55rem;
          height: 0.55rem;
          border-radius: 999px;
          flex-shrink: 0;
          margin-top: 0.35rem;
        }

        .saf-pay-status--pending .saf-pay-status__dot {
          background: var(--saf-gold);
          box-shadow: 0 0 0 4px rgba(169,128,47,0.18);
          animation: saf-pulse 1.6s ease infinite;
        }

        .saf-pay-status--approved .saf-pay-status__dot {
          background: var(--saf-success);
        }

        .saf-pay-status strong {
          display: block;
          font-size: 0.88rem;
          color: var(--saf-ink);
          margin-bottom: 0.2rem;
        }

        .saf-pay-status p {
          margin: 0;
          font-size: 0.82rem;
          color: var(--saf-muted);
          line-height: 1.5;
        }

        .saf-pay-hint {
          margin: 0;
          font-size: 0.82rem;
          color: var(--saf-muted);
          padding: 0.7rem 1rem;
          background: rgba(8,29,73,0.04);
          border-radius: 10px;
          border-left: 3px solid var(--saf-gold);
        }

        @keyframes saf-pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(169,128,47,0.15); }
          50%       { box-shadow: 0 0 0 7px rgba(169,128,47,0.06); }
        }

        /* ─── Consent ────────────────────────────── */
        .saf-consent {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          padding: 1rem 1.15rem;
          border-radius: var(--saf-radius);
          background: var(--saf-paper);
          border: 1px solid var(--saf-line);
          cursor: pointer;
        }

        .saf-consent__checkbox {
          margin-top: 0.18rem;
          accent-color: var(--saf-navy);
          width: 1rem;
          height: 1rem;
          flex-shrink: 0;
        }

        .saf-consent__text {
          font-size: 0.84rem;
          color: var(--saf-muted);
          line-height: 1.55;
        }

        /* ─── Notices ────────────────────────────── */
        .saf-notice {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.9rem 1.1rem;
          border-radius: var(--saf-radius);
          border: 1px solid transparent;
          font-size: 0.88rem;
          line-height: 1.5;
          margin-bottom: 1.25rem;
        }

        .saf-notice--success {
          background: var(--saf-success-soft);
          border-color: rgba(23,116,76,0.2);
          color: var(--saf-success);
        }

        .saf-notice--error {
          background: var(--saf-danger-soft);
          border-color: rgba(179,21,38,0.2);
          color: var(--saf-danger);
        }

        .saf-notice__icon {
          font-weight: 900;
          font-size: 0.9rem;
          line-height: 1.5;
          flex-shrink: 0;
        }

        /* ─── Modal ──────────────────────────────── */
        .saf-modal {
          position: fixed;
          inset: 0;
          z-index: 60;
          display: grid;
          place-items: center;
          padding: 1rem;
        }

        .saf-modal__backdrop {
          position: absolute;
          inset: 0;
          background: rgba(8,29,73,0.6);
          backdrop-filter: blur(10px);
        }

        .saf-modal__sheet {
          position: relative;
          z-index: 1;
          width: min(1100px, 100%);
          max-height: calc(100vh - 2rem);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 1.5rem;
          border-radius: 22px;
          background: #fff;
          box-shadow: 0 32px 64px rgba(8,29,73,0.32);
          border: 1px solid rgba(255,255,255,0.7);
        }

        .saf-modal__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .saf-modal__eyebrow {
          display: block;
          font-family: "IBM Plex Mono", monospace;
          font-size: 0.65rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--saf-gold);
          margin-bottom: 0.3rem;
        }

        .saf-modal__title {
          margin: 0;
          font-family: "Source Serif 4", Georgia, serif;
          font-size: 1.4rem;
          font-weight: 600;
          color: var(--saf-navy);
          letter-spacing: -0.02em;
        }

        .saf-modal__close {
          width: 2.2rem;
          height: 2.2rem;
          border-radius: 999px;
          border: 1px solid var(--saf-line);
          background: var(--saf-paper);
          color: var(--saf-ink);
          font-size: 0.82rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.15s ease;
        }

        .saf-modal__close:hover {
          background: var(--saf-line);
        }

        .saf-modal__actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .saf-modal__success {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }

        .saf-modal__success-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 999px;
          background: var(--saf-success-soft);
          border: 2px solid var(--saf-success);
          color: var(--saf-success);
          font-size: 1.2rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ─── iframe ─────────────────────────────── */
        .saf-iframe-wrap {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--saf-line);
          min-height: 68vh;
        }

        .saf-iframe {
          width: 100%;
          height: 68vh;
          border: 0;
          display: block;
          background: #fff;
        }

        /* ─── Responsive ─────────────────────────── */
        @media (max-width: 640px) {
          .saf-step {
            grid-template-columns: 2.2rem 1fr;
            gap: 0 1rem;
          }

          .saf-step__node {
            width: 2.2rem;
            height: 2.2rem;
          }

          .saf-fields-grid {
            grid-template-columns: 1fr;
          }

          .saf-field--wide {
            grid-column: auto;
          }

          .saf-phone-row {
            flex-direction: column;
          }

          .saf-input--dial {
            max-width: 100%;
          }

          .saf-pay-row {
            flex-direction: column;
            align-items: stretch;
          }

          .saf-btn--pay {
            width: 100%;
          }

          .saf-modal {
            padding: 0;
          }

          .saf-modal__sheet {
            width: 100%;
            max-height: 100%;
            height: 100%;
            border-radius: 0;
          }

          .saf-modal__actions {
            flex-direction: column;
          }

          .saf-modal__actions .saf-btn {
            width: 100%;
          }

          .saf-iframe-wrap {
            min-height: 60vh;
          }

          .saf-iframe {
            height: 60vh;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .saf-pay-status__dot {
            animation: none;
          }
          .saf-btn, .saf-file-drop, .saf-input {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}