"use client";

import { useEffect } from "react";

type PaymentPopupFrameProps = {
  checkoutUrl: string;
};

export function PaymentPopupFrame({
  checkoutUrl,
}: PaymentPopupFrameProps) {
  useEffect(() => {
    if (checkoutUrl) {
      window.location.replace(checkoutUrl);
    }
  }, [checkoutUrl]);

  return (
    <main className="payment-window">
      <div className="payment-window__shell">
        <section className="panel payment-window__panel">
          <div className="payment-window__header">
            <span className="eyebrow">Paiement sécurisé</span>

            <h1 className="panel-title">
              Redirection vers Chariow...
            </h1>

            <p className="muted">
              Vous allez être redirigé automatiquement vers la plateforme de
              paiement sécurisée.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "3rem 0",
            }}
          >
            <div className="spinner" />
          </div>

          <div className="payment-window__actions">
            <a
              href={checkoutUrl}
              className="button button--accent"
            >
              Si rien ne se passe, cliquez ici
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}