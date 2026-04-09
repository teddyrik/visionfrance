import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p>
          Vision France centralise les candidatures, notifie les candidats et
          relaie les dossiers aux etablissements partenaires tout en publiant des
          contenus utiles sur les bourses d&apos;etudes en France, Campus France et
          le visa etudiant.
        </p>
        <div className="footer__meta">
          <Link href="/bourses">Bourses</Link>
          <Link href="/guides">Guides</Link>
          <Link href="/guides/campus-france">Campus France</Link>
          <Link href="/guides/visa-etudiant-france">Visa etudiant</Link>
          <Link href="/guides/etudier-en-france">Etudier en France</Link>
          <Link href="/#processus">Procedure</Link>
          <Link href="/#suivi">Suivi</Link>
        </div>
      </div>
    </footer>
  );
}
