import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <section className="not-found__card panel">
        <span className="eyebrow">Page introuvable</span>
        <h1 className="detail-title">Cette fiche n&apos;existe pas ou n&apos;est plus publiee.</h1>
        <p className="muted">
          Retournez au catalogue principal pour consulter les bourses ouvertes
          et deposer votre candidature.
        </p>
        <Link href="/" className="button button--primary">
          Revenir au catalogue
        </Link>
      </section>
    </main>
  );
}
