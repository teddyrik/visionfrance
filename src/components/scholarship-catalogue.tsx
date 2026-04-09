import { ScholarshipCard } from "@/components/scholarship-card";
import type { Scholarship } from "@/lib/types";

type ScholarshipCatalogueProps = {
  eyebrow: string;
  title: string;
  description: string;
  verifiedDate: string;
  filteredScholarships: Scholarship[];
  query: string;
  level: string;
  status: string;
  emptyMessage: string;
  sectionId?: string;
  includeSectionWrapper?: boolean;
};

export function ScholarshipCatalogue({
  eyebrow,
  title,
  description,
  verifiedDate,
  filteredScholarships,
  query,
  level,
  status,
  emptyMessage,
  sectionId = "catalogue",
  includeSectionWrapper = true,
}: ScholarshipCatalogueProps) {
  const content = (
    <>
      <div className="section__head">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="section-title">{title}</h2>
        </div>
        <p className="section-copy">{description}</p>
      </div>

      <div className="notice notice--success">
        Catalogue verifie le {verifiedDate} a partir des sites officiels des
        universites, ecoles et organismes porteurs.
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
            <label htmlFor="status">Disponibilite</label>
            <select id="status" name="status" defaultValue={status}>
              <option value="">Tous les statuts</option>
              <option value="open">Ouverte</option>
              <option value="closing">Cloture proche</option>
              <option value="upcoming">A venir</option>
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
          {emptyMessage}
        </div>
      ) : null}
    </>
  );

  if (!includeSectionWrapper) {
    return content;
  }

  return (
    <section className="section" id={sectionId}>
      <div className="container">{content}</div>
    </section>
  );
}
