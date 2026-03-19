import Image from "next/image";
import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { ScholarshipCard } from "@/components/scholarship-card";
import { SiteFooter } from "@/components/site-footer";
import { getScholarships } from "@/lib/data";
import { editorialMedia } from "@/lib/editorial-media";
import { firstQueryValue } from "@/lib/utils";

export const dynamic = "force-dynamic";

const partners = [
  {
    name: "Institut français",
    website: "https://www.institutfrancais.com/fr",
    logo: "/partners/institut-francais.svg",
  },
  {
    name: "Fondation Alliance Française",
    website: "https://www.fondation-alliancefr.org/",
    logo: "/partners/fondation-alliance-francaise.svg",
  },
  {
    name: "AEFE",
    website: "https://aefe.gouv.fr/fr",
    logo: "/partners/aefe.svg",
  },
  {
    name: "Atout France",
    website: "https://www.atout-france.fr/",
    logo: "/partners/atout-france.svg",
  },
  {
    name: "Étudiant.gouv.fr",
    website: "https://www.etudiant.gouv.fr/fr",
    logo: "/partners/etudiant-gouv.svg",
  },
] as const;

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const filters = await searchParams;
  const scholarships = (await getScholarships()).filter((item) => Boolean(item.officialUrl));
  const verifiedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const query = firstQueryValue(filters.q)?.toLowerCase() ?? "";
  const level = firstQueryValue(filters.level) ?? "";
  const status = firstQueryValue(filters.status) ?? "";

  const filteredScholarships = scholarships.filter((scholarship) => {
    const text = [
      scholarship.title,
      scholarship.summary,
      scholarship.institution,
      scholarship.location,
      scholarship.level,
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = !query || text.includes(query);
    const matchesLevel = !level || scholarship.level.includes(level);
    const matchesStatus = !status || scholarship.status === status;

    return matchesQuery && matchesLevel && matchesStatus;
  });

  const stats = {
    institutions: new Set(scholarships.map((item) => item.institution)).size,
    openScholarships: scholarships.filter((item) => item.status !== "closed").length,
    officialSources: scholarships.filter((item) => item.officialUrl).length,
    featured: scholarships.filter((item) => item.featured).length,
  };

  return (
    <>
      <PublicHeader />
      <main>
        <section className="hero">
          <div className="container">
            <div className="hero__panel">
              <div className="hero__grid">
                <div className="hero__content">
                  <span className="eyebrow">Canal officiel Vision France</span>
                  <h1 className="display-title">
                    Les bourses d&apos;études en France, instruites sur une seule
                    plateforme.
                  </h1>
                  <p className="hero-copy">
                    Vision France liste les dispositifs de financement,
                    centralise les dossiers internationaux, informe les
                    candidats par email et transmet les candidatures aux
                    établissements pour la suite des procédures.
                  </p>
                  <div className="hero__actions">
                    <Link href="/#catalogue" className="button button--primary">
                      Explorer les bourses
                    </Link>
                    <Link href="/#suivi" className="button button--secondary">
                      Comprendre le suivi
                    </Link>
                  </div>

                  <div className="feature-grid">
                    <article className="feature-card">
                      <span className="feature-card__icon">01</span>
                      <div>
                        <h2 className="panel-title">Catalogue public</h2>
                        <p className="muted">
                          Fiches bourses détaillées, critères d&apos;éligibilité,
                          source officielle et échéance claire.
                        </p>
                      </div>
                    </article>
                    <article className="feature-card">
                      <span className="feature-card__icon">02</span>
                      <div>
                        <h2 className="panel-title">Dossier centralisé</h2>
                        <p className="muted">
                          Formulaire unique pour le dépôt initial du dossier et
                          traçabilité de chaque étape.
                        </p>
                      </div>
                    </article>
                    <article className="feature-card">
                      <span className="feature-card__icon">03</span>
                      <div>
                        <h2 className="panel-title">Notifications automatiques</h2>
                        <p className="muted">
                          Emails envoyés au candidat à chaque évolution de
                          statut et aux établissements lors des transmissions.
                        </p>
                      </div>
                    </article>
                  </div>
                </div>

                <div className="hero__stats">
                  <div className="hero-photo-grid">
                    <figure className="hero-photo-card hero-photo-card--wide">
                      <Image
                        src={editorialMedia.studentFocus.src}
                        alt={editorialMedia.studentFocus.alt}
                        width={editorialMedia.studentFocus.width}
                        height={editorialMedia.studentFocus.height}
                        className="hero-photo-card__image"
                        priority
                      />
                      <figcaption className="hero-photo-card__body">
                        <strong>{editorialMedia.studentFocus.title}</strong>
                        <span>{editorialMedia.studentFocus.caption}</span>
                      </figcaption>
                    </figure>

                    <figure className="hero-photo-card">
                      <Image
                        src={editorialMedia.parisCampus.src}
                        alt={editorialMedia.parisCampus.alt}
                        width={editorialMedia.parisCampus.width}
                        height={editorialMedia.parisCampus.height}
                        className="hero-photo-card__image"
                      />
                      <figcaption className="hero-photo-card__body">
                        <strong>{editorialMedia.parisCampus.title}</strong>
                        <span>{editorialMedia.parisCampus.caption}</span>
                      </figcaption>
                    </figure>

                    <figure className="hero-photo-card">
                      <Image
                        src={editorialMedia.parisUniversity.src}
                        alt={editorialMedia.parisUniversity.alt}
                        width={editorialMedia.parisUniversity.width}
                        height={editorialMedia.parisUniversity.height}
                        className="hero-photo-card__image"
                      />
                      <figcaption className="hero-photo-card__body">
                        <strong>{editorialMedia.parisUniversity.title}</strong>
                        <span>{editorialMedia.parisUniversity.caption}</span>
                      </figcaption>
                    </figure>
                  </div>

                  <article className="hero-highlight__card">
                    <span className="mini-label">Catalogue actualisé</span>
                    <strong>Fiches vérifiées à partir des publications officielles</strong>
                    <p>
                      Mise à jour éditoriale du catalogue le {verifiedDate}, avec
                      liens directs vers les appels institutionnels et les pages
                      de référence.
                    </p>
                  </article>

                  <div className="hero-highlight__lines">
                    <div className="hero-highlight__line">
                      <span>1</span>
                      <div>
                        <strong>{stats.openScholarships} appels actifs</strong>
                        <p className="muted">ouverts, en clôture proche ou à venir</p>
                      </div>
                    </div>
                    <div className="hero-highlight__line">
                      <span>2</span>
                      <div>
                        <strong>{stats.institutions} établissements couverts</strong>
                        <p className="muted">universités, écoles et programmes gradués</p>
                      </div>
                    </div>
                    <div className="hero-highlight__line">
                      <span>3</span>
                      <div>
                        <strong>{stats.officialSources} sources officielles</strong>
                        <p className="muted">liens institutionnels rattachés à chaque fiche</p>
                      </div>
                    </div>
                    <div className="hero-highlight__line">
                      <span>4</span>
                      <div>
                        <strong>{stats.featured} programmes à la une</strong>
                        <p className="muted">sélection éditoriale des dispositifs structurants</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container" style={{ marginBottom: "3rem" }}>
            <div className="section__head">
              <div>
                <span className="eyebrow">Partenaires institutionnels</span>
                <h2 className="section-title">Les organismes qui accompagnent Vision France</h2>
              </div>
              <p className="section-copy">
                Des acteurs publics et institutionnels engagés pour la visibilité
                des bourses, l&apos;orientation et la coordination des parcours
                étudiants.
              </p>
            </div>

            <div className="partners-grid">
              {partners.map((partner) => (
                <a
                  key={partner.website}
                  href={partner.website}
                  className="partner-card"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="partner-card__logo">
                    <img src={partner.logo} alt={`Logo ${partner.name}`} />
                  </div>
                  <div className="partner-card__meta">
                    <strong>{partner.name}</strong>
                    <span>
                      {partner.website
                        .replace(/^https?:\/\/(www\.)?/, "")
                        .replace(/\/$/, "")}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="catalogue">
          <div className="container">
            <div className="section__head">
              <div>
                <span className="eyebrow">Catalogue public</span>
                <h2 className="section-title">
                  Bourses actuellement publiées pour les candidates et candidats internationaux
                </h2>
              </div>
              <p className="section-copy">
                Un catalogue éditorial structuré, lisible et professionnel, avec
                source officielle, échéance claire et parcours de candidature
                centralisé.
              </p>
            </div>

            <div className="notice notice--success">
              Catalogue vérifié le {verifiedDate} à partir des sites officiels
              des universités, écoles et organismes porteurs.
            </div>

            <form className="catalogue-filter" method="GET">
              <div className="filters-grid">
                <div className="field">
                  <label htmlFor="q">Recherche</label>
                  <input
                    id="q"
                    name="q"
                    type="search"
                    placeholder="Nom du programme, ville, institution"
                    defaultValue={query}
                  />
                </div>
                <div className="field">
                  <label htmlFor="level">Niveau</label>
                  <select id="level" name="level" defaultValue={level}>
                    <option value="">Tous les niveaux</option>
                    <option value="Bachelor">Bachelor</option>
                    <option value="Licence">Licence</option>
                    <option value="Master">Master</option>
                    <option value="Doctorat">Doctorat</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="status">Disponibilité</label>
                  <select id="status" name="status" defaultValue={status}>
                    <option value="">Tous les statuts</option>
                    <option value="open">Ouverte</option>
                    <option value="closing">Clôture proche</option>
                    <option value="upcoming">À venir</option>
                    <option value="closed">Clôturée</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="submit">Lancer</label>
                  <button id="submit" className="button button--primary" type="submit">
                    Filtrer le catalogue
                  </button>
                </div>
              </div>
            </form>

            <div className="card-grid" style={{ marginTop: "1.25rem" }}>
              {filteredScholarships.map((scholarship) => (
                <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
              ))}
            </div>

            {filteredScholarships.length === 0 ? (
              <div className="empty-state" style={{ marginTop: "1.25rem" }}>
                Aucun programme ne correspond aux filtres actuels.
              </div>
            ) : null}
          </div>
        </section>

        <section className="section" id="processus">
          <div className="container">
            <div className="section__head">
              <div>
                <span className="eyebrow">Processus candidat</span>
                <h2 className="section-title">
                  Un circuit lisible du dépôt jusqu&apos;à la décision finale
                </h2>
              </div>
            </div>
            <div className="impact-grid">
              <article className="impact-card">
                <span className="impact-card__icon">A</span>
                <h3 className="panel-title">1. Dépôt du dossier</h3>
                <p className="muted">
                  Le candidat choisit une bourse, ouvre le formulaire avec le
                  bouton Postuler et transmet son dossier complet.
                </p>
              </article>
              <article className="impact-card">
                <span className="impact-card__icon">B</span>
                <h3 className="panel-title">2. Instruction Vision France</h3>
                <p className="muted">
                  Les équipes Vision France contrôlent les pièces, qualifient le
                  statut et gardent une trace horodatée de chaque action.
                </p>
              </article>
              <article className="impact-card">
                <span className="impact-card__icon">C</span>
                <h3 className="panel-title">3. Relais vers les établissements</h3>
                <p className="muted">
                  Lorsque le dossier est mature, la plateforme alerte
                  l&apos;université ou l&apos;école afin qu&apos;elle poursuive la procédure.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="suivi">
          <div className="container">
            <div className="section__head">
              <div>
                <span className="eyebrow">Suivi de candidature</span>
                <h2 className="section-title">Un parcours transparent pour chaque dossier</h2>
              </div>
            </div>
            <div className="impact-grid">
              <article className="impact-card">
                <span className="impact-card__icon">M</span>
                <h3 className="panel-title">Mails automatiques</h3>
                <p className="muted">
                  Confirmation de dépôt, passage en instruction, transmission
                  aux établissements et décision finale.
                </p>
              </article>
              <article className="impact-card">
                <span className="impact-card__icon">S</span>
                <h3 className="panel-title">Statuts visibles</h3>
                <p className="muted">
                  Chaque dossier suit un chemin lisible : reçu, en instruction,
                  présélection, transmission ou décision finale.
                </p>
              </article>
              <article className="impact-card">
                <span className="impact-card__icon">E</span>
                <h3 className="panel-title">Établissements informés</h3>
                <p className="muted">
                  Les écoles et universités partenaires reçoivent les dossiers à
                  l&apos;étape prévue pour poursuivre la procédure.
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
