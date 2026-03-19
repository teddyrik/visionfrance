import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p>
          Vision France centralise les candidatures, notifie les candidats et
          relaie les dossiers aux etablissements partenaires.
        </p>
        <div className="footer__meta">
          <Link href="/#catalogue">Catalogue</Link>
          <Link href="/#processus">Procedure</Link>
          <Link href="/#suivi">Suivi</Link>
        </div>
      </div>
    </footer>
  );
}
