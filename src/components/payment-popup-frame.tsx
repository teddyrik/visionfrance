"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

type PaymentPopupFrameProps = {
  paymentUrl: string;
};

export function PaymentPopupFrame({ paymentUrl }: PaymentPopupFrameProps) {
  const router = useRouter();
  const successUrl = useMemo(
    () => `/paiement/succes?paymentUrl=${encodeURIComponent(paymentUrl)}`,
    [paymentUrl],
  );

  return (
    <main className="payment-window">
      <div className="payment-window__shell">
        <section className="panel payment-window__panel">
          <div className="payment-window__header">
            <span className="eyebrow">Paiement du dossier</span>
            <h1 className="panel-title">Finaliser le paiement en pop-up</h1>
            <p className="muted">
              Effectuez le paiement dans cette fenetre. Lorsque MoneyFusion vous a
              affiche la fin de paiement, cliquez sur le bouton de confirmation
              ci-dessous pour revenir au formulaire avec votre reference.
            </p>
          </div>

          <div className="payment-frame">
            <iframe
              src={paymentUrl}
              title="Paiement MoneyFusion"
              className="payment-frame__iframe"
              allow="payment *"
            />
          </div>

          <div className="payment-window__actions">
            <a
              href={paymentUrl}
              target="_blank"
              rel="noreferrer"
              className="button button--secondary"
            >
              Ouvrir dans un onglet
            </a>
            <button
              type="button"
              className="button button--accent"
              onClick={() => router.push(successUrl)}
            >
              J&apos;ai termine le paiement
            </button>
          </div>

          <p className="payment-note">
            Si le paiement n&apos;est pas alle jusqu&apos;au bout, n&apos;avancez pas vers
            l&apos;ecran de succes.
          </p>
        </section>
      </div>
    </main>
  );
}
