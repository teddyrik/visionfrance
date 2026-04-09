"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { PAYMENT_SUCCESS_MESSAGE_TYPE } from "@/lib/payment";

type PaymentSuccessPageProps = {
  paymentUrl: string;
};

export function PaymentSuccessPage({ paymentUrl }: PaymentSuccessPageProps) {
  const [paymentReference, setPaymentReference] = useState("");
  const [localError, setLocalError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function approvePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedReference = paymentReference.trim();

    if (!normalizedReference) {
      setLocalError("Renseignez la reference affichee apres votre paiement.");
      return;
    }

    setLocalError("");
    setSubmitted(true);

    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(
        {
          type: PAYMENT_SUCCESS_MESSAGE_TYPE,
          paymentReference: normalizedReference,
        },
        window.location.origin,
      );

      window.setTimeout(() => {
        window.close();
      }, 120);
    }
  }

  return (
    <main className="payment-window">
      <div className="payment-window__shell payment-window__shell--compact">
        <section className="panel payment-window__panel">
          <div className="payment-window__header">
            <span className="eyebrow">Paiement reussi</span>
            <h1 className="panel-title">Valider le retour vers le formulaire</h1>
            <p className="muted">
              Saisissez la reference de paiement affichee par MoneyFusion pour
              approuver la soumission du dossier sur Vision France.
            </p>
          </div>

          <form className="payment-success" onSubmit={approvePayment}>
            <div className="field">
              <label htmlFor="paymentReference">Reference de paiement</label>
              <input
                id="paymentReference"
                name="paymentReference"
                value={paymentReference}
                onChange={(event) => setPaymentReference(event.target.value)}
                placeholder="Ex. MF-2026-001234"
                autoFocus
                required
              />
              <small>
                Copiez la reference fournie par MoneyFusion. Elle sera renvoyee
                automatiquement dans le formulaire.
              </small>
            </div>

            {localError ? <div className="notice notice--error">{localError}</div> : null}

            {submitted ? (
              <div className="notice notice--success">
                Paiement approuve. Si cette fenetre ne se ferme pas seule, revenez
                au formulaire principal.
              </div>
            ) : null}

            <div className="payment-success__actions">
              <Link
                href={`/paiement?paymentUrl=${encodeURIComponent(paymentUrl)}`}
                className="button button--secondary"
              >
                Retour au paiement
              </Link>
              <button type="submit" className="button button--accent">
                Approuver la soumission
              </button>
            </div>
          </form>

          <p className="payment-note">
            Si le popup a ete ouvert dans un onglet sans fenetre parente, copiez la
            reference puis revenez manuellement au formulaire.
          </p>
        </section>
      </div>
    </main>
  );
}
