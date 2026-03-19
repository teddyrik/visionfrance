import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { ScholarshipCard } from "@/components/scholarship-card";
import { SiteFooter } from "@/components/site-footer";
import { getScholarships } from "@/lib/data";
import { firstQueryValue } from "@/lib/utils";

export const dynamic = "force-dynamic";

const partners = [
  {
    name: "Institut francais",
    website: "https://www.institutfrancais.com/fr",
    logo: "/partners/institut-francais.svg",
  },
  {
    name: "Fondation Alliance Francaise",
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
    name: "Etudiant.gouv.fr",
    website: "https://www.etudiant.gouv.fr/fr",
    logo: "/partners/etudiant-gouv.svg",
  },
] as const;

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const filters = await searchParams;
  const scholarships = await getScholarships();

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
    countries: 86,
    institutions: 42,
    openScholarships: scholarships.filter((item) => item.status !== "closed").length,
    applications: 1200,
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
                    Les bourses d&apos;etudes en France, instruites sur une seule
                    plateforme.
                  </h1>
                  <p className="hero-copy">
                    Vision France liste les dispositifs de financement,
                    centralise les dossiers internationaux, informe les
                    candidats par email et transmet les candidatures aux
                    etablissements pour la suite des procedures.
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
                          Fiches bourses detaillees, criteres d&apos;eligibilite,
                          documents attendus et deadlines.
                        </p>
                      </div>
                    </article>
                    <article className="feature-card">
                      <span className="feature-card__icon">02</span>
                      <div>
                        <h2 className="panel-title">Dossiers centralises</h2>
                        <p className="muted">
                          Formulaire unique de candidature avec depot du dossier
                          et historique de traitement.
                        </p>
                      </div>
                    </article>
                    <article className="feature-card">
                      <span className="feature-card__icon">03</span>
                      <div>
                        <h2 className="panel-title">Notifications automatiques</h2>
                        <p className="muted">
                          Emails envoyes au candidat a chaque evolution de statut
                          et aux etablissements lors des transmissions.
                        </p>
                      </div>
                    </article>
                  </div>
                </div>

                <div className="hero__stats">
                  <article className="hero-highlight__card">
                    <span className="mini-label">Suivi central</span>
                    <strong>Instruction, notifications et relais vers les ecoles</strong>
                    <p>
                      Une lecture claire du parcours candidat, depuis le depot
                      jusqu&apos;a la transmission aux etablissements partenaires.
                    </p>
                  </article>

                  <div className="hero-highlight__lines">
                    <div className="hero-highlight__line">
                      <span>1</span>
                      <div>
                        <strong>{stats.openScholarships} appels actifs</strong>
                        <p className="muted">ouverts ou en cloture proche</p>
                      </div>
                    </div>
                    <div className="hero-highlight__line">
                      <span>2</span>
                      <div>
                        <strong>{stats.institutions} etablissements informes</strong>
                        <p className="muted">universites, ecoles, laboratoires</p>
                      </div>
                    </div>
                    <div className="hero-highlight__line">
                      <span>3</span>
                      <div>
                        <strong>{stats.countries} pays cibles</strong>
                        <p className="muted">visibilite internationale et procedure unifiee</p>
                      </div>
                    </div>
                    <div className="hero-highlight__line">
                      <span>4</span>
                      <div>
                        <strong>{stats.applications}+ dossiers</strong>
                        <p className="muted">capacite projetee pour la campagne 2026</p>
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
                Des acteurs publics et institutionnels engages pour la visibilite
                des bourses, l&apos;orientation et la coordination des parcours
                etudiants.
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
                  Toutes les bourses accessibles aux candidats internationaux
                </h2>
              </div>
              <p className="section-copy">
                Une presentation editoriale inspiree des codes Campus France :
                contenu institutionnel, cartes nettes, palette tricolore et
                parcours de candidature direct.
              </p>
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
                    <option value="Licence">Licence</option>
                    <option value="Master">Master</option>
                    <option value="Doctorat">Doctorat</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="status">Disponibilite</label>
                  <select id="status" name="status" defaultValue={status}>
                    <option value="">Tous les statuts</option>
                    <option value="open">Ouverte</option>
                    <option value="closing">Cloture proche</option>
                    <option value="closed">Cloturee</option>
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
                  Un circuit lisible du depot jusqu&apos;a la decision finale
                </h2>
              </div>
            </div>
            <div className="impact-grid">
              <article className="impact-card">
                <span className="impact-card__icon">A</span>
                <h3 className="panel-title">1. Depot du dossier</h3>
                <p className="muted">
                  Le candidat choisit une bourse, ouvre le formulaire avec le
                  bouton Postuler et transmet son dossier complet.
                </p>
              </article>
              <article className="impact-card">
                <span className="impact-card__icon">B</span>
                <h3 className="panel-title">2. Instruction Vision France</h3>
                <p className="muted">
                  Les equipes Vision France controlent les pieces, qualifient le
                  statut et gardent une trace horodatee de chaque action.
                </p>
              </article>
              <article className="impact-card">
                <span className="impact-card__icon">C</span>
                <h3 className="panel-title">3. Relais vers les etablissements</h3>
                <p className="muted">
                  Lorsque le dossier est mature, la plateforme alerte
                  l&apos;universite ou l&apos;ecole afin qu&apos;elle poursuive la procedure.
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
                  Confirmation de depot, passage en instruction, transmission
                  aux etablissements et decision finale.
                </p>
              </article>
              <article className="impact-card">
                <span className="impact-card__icon">S</span>
                <h3 className="panel-title">Statuts visibles</h3>
                <p className="muted">
                  Chaque dossier suit un chemin lisible : recu, en instruction,
                  preselection, transmission ou decision finale.
                </p>
              </article>
              <article className="impact-card">
                <span className="impact-card__icon">E</span>
                <h3 className="panel-title">Etablissements informes</h3>
                <p className="muted">
                  Les ecoles et universites partenaires recoivent les dossiers
                  a l&apos;etape prevue pour poursuivre la procedure.
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
