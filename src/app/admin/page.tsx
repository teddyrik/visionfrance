import { BrandMark } from "@/components/brand-mark";
import { StatusBadge } from "@/components/status-badge";
import {
  createScholarshipAction,
  logoutAction,
  updateApplicationStatusAction,
  updateScholarshipStatusAction,
} from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { getDashboardData, getDataMode } from "@/lib/data";
import {
  firstQueryValue,
  formatBytes,
  formatDate,
  formatDateTime,
  getApplicationStatusMeta,
  getScholarshipStatusMeta,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

type AdminDashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminDashboard({
  searchParams,
}: AdminDashboardPageProps) {
  const session = await requireAdmin();
  const { scholarships, applications, stats } = await getDashboardData();
  const dataMode = await getDataMode();
  const params = await searchParams;
  const notice = firstQueryValue(params.notice);
  const error = firstQueryValue(params.error);

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <div className="admin-topbar__inner">
          <BrandMark href="/" accent="light" />
          <div className="topbar__nav" style={{ color: "#fff" }}>
            <span>Connecte : {session.email}</span>
            <form action={logoutAction}>
              <button type="submit" className="button button--secondary">
                Deconnexion
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="admin-shell">
        {dataMode === "local" ? (
          <div className="notice notice--error">
            Supabase est configure mais le schema distant n&apos;est pas encore
            disponible. Le fallback local est actif jusqu&apos;a execution de
            <code> supabase/schema.sql</code>.
          </div>
        ) : null}
        {notice ? <div className="notice notice--success">{notice}</div> : null}
        {error ? <div className="notice notice--error">{error}</div> : null}

        <div className="stats-grid">
          <article className="stat-card">
            <span className="stat-card__label">Bourses total</span>
            <strong className="stat-card__number">{stats.scholarshipCount}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-card__label">Campagnes actives</span>
            <strong className="stat-card__number">{stats.activeScholarships}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-card__label">Candidatures</span>
            <strong className="stat-card__number">{stats.applicationCount}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-card__label">En instruction</span>
            <strong className="stat-card__number">{stats.reviewCount}</strong>
          </article>
        </div>

        <div className="admin-grid">
          <section className="panel panel--dark">
            <div>
              <span className="eyebrow">Gestion des appels</span>
              <h1 className="panel-title">Publier et piloter les bourses</h1>
            </div>

            <form action={createScholarshipAction} className="application-form">
              <div className="forms-grid">
                <div className="field">
                  <label htmlFor="title">Intitule</label>
                  <input id="title" name="title" required />
                </div>
                <div className="field">
                  <label htmlFor="institution">Institution</label>
                  <input id="institution" name="institution" required />
                </div>
                <div className="field">
                  <label htmlFor="level">Niveau</label>
                  <input id="level" name="level" placeholder="Licence / Master" required />
                </div>
                <div className="field">
                  <label htmlFor="deadline">Date limite</label>
                  <input id="deadline" name="deadline" type="date" required />
                </div>
                <div className="field">
                  <label htmlFor="location">Lieu</label>
                  <input id="location" name="location" required />
                </div>
                <div className="field">
                  <label htmlFor="coverage">Couverture</label>
                  <input id="coverage" name="coverage" required />
                </div>
                <div className="field">
                  <label htmlFor="duration">Duree</label>
                  <input id="duration" name="duration" required />
                </div>
                <div className="field">
                  <label htmlFor="language">Langue</label>
                  <input id="language" name="language" required />
                </div>
                <div className="field">
                  <label htmlFor="audience">Public cible</label>
                  <input id="audience" name="audience" required />
                </div>
                <div className="field">
                  <label htmlFor="seats">Places</label>
                  <input id="seats" name="seats" type="number" min="1" required />
                </div>
                <div className="field">
                  <label htmlFor="institutionEmail">Email etablissement</label>
                  <input id="institutionEmail" name="institutionEmail" type="email" required />
                </div>
                <div className="field">
                  <label htmlFor="status">Statut initial</label>
                  <select id="status" name="status" defaultValue="open">
                    <option value="open">Ouverte</option>
                    <option value="closing">Cloture proche</option>
                    <option value="closed">Cloturee</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="summary">Resume</label>
                <textarea id="summary" name="summary" required />
              </div>
              <div className="field">
                <label htmlFor="description">Description detaillee</label>
                <textarea id="description" name="description" required />
              </div>
              <div className="field">
                <label htmlFor="eligibility">Eligibilite</label>
                <textarea id="eligibility" name="eligibility" placeholder="Une condition par ligne" />
              </div>
              <div className="field">
                <label htmlFor="benefits">Avantages</label>
                <textarea id="benefits" name="benefits" placeholder="Un avantage par ligne" />
              </div>
              <div className="field">
                <label htmlFor="requiredDocuments">Documents requis</label>
                <textarea
                  id="requiredDocuments"
                  name="requiredDocuments"
                  placeholder="Un document par ligne"
                />
              </div>

              <label className="consent">
                <input type="checkbox" name="featured" value="yes" />
                <span>Mettre cette bourse en avant sur l&apos;accueil</span>
              </label>

              <button type="submit" className="button button--accent button--block">
                Publier la bourse
              </button>
            </form>

            <div className="admin-list">
              {scholarships.map((scholarship) => {
                const status = getScholarshipStatusMeta(scholarship.status);

                return (
                  <article className="admin-item" key={scholarship.id}>
                    <div className="application-form">
                      <div>
                        <p className="mini-label">{scholarship.institution}</p>
                        <h2 className="panel-title">{scholarship.title}</h2>
                      </div>
                      <StatusBadge label={status.label} tone={status.tone} />
                    </div>

                    <div className="admin-item__meta">
                      <span>
                        <strong>Echeance</strong>
                        {formatDate(scholarship.deadline)}
                      </span>
                      <span>
                        <strong>Places</strong>
                        {scholarship.seats}
                      </span>
                      <span>
                        <strong>Audience</strong>
                        {scholarship.audience}
                      </span>
                    </div>

                    <form action={updateScholarshipStatusAction} className="application-form">
                      <input type="hidden" name="scholarshipId" value={scholarship.id} />
                      <div className="field">
                        <label htmlFor={`status-${scholarship.id}`}>Mettre a jour le statut</label>
                        <select
                          id={`status-${scholarship.id}`}
                          name="status"
                          defaultValue={scholarship.status}
                        >
                          <option value="open">Ouverte</option>
                          <option value="closing">Cloture proche</option>
                          <option value="closed">Cloturee</option>
                        </select>
                      </div>
                      <button type="submit" className="button button--secondary">
                        Enregistrer
                      </button>
                    </form>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="panel">
            <div>
              <span className="eyebrow">Traitement des candidatures</span>
              <h2 className="panel-title">Historique, pieces et decisions</h2>
            </div>

            <div className="applications-stack">
              {applications.length === 0 ? (
                <div className="empty-state">Aucune candidature n&apos;a encore ete deposee.</div>
              ) : null}

              {applications.map((application) => {
                const status = getApplicationStatusMeta(application.status);

                return (
                  <article className="application-card" key={application.id}>
                    <div className="application-form">
                      <div>
                        <p className="mini-label">{application.scholarshipTitle}</p>
                        <h3 className="panel-title">
                          {application.applicant.firstName} {application.applicant.lastName}
                        </h3>
                      </div>
                      <StatusBadge label={status.label} tone={status.tone} />
                    </div>

                    <div className="application-meta">
                      <span>
                        <strong>Reference</strong>
                        {application.reference}
                      </span>
                      <span>
                        <strong>Depot</strong>
                        {formatDateTime(application.submittedAt)}
                      </span>
                      <span>
                        <strong>Email</strong>
                        {application.applicant.email}
                      </span>
                      <span>
                        <strong>Pays</strong>
                        {application.applicant.country}
                      </span>
                    </div>

                    <div>
                      <strong>Projet vise</strong>
                      <p className="muted">{application.applicant.programChoice}</p>
                    </div>

                    <div>
                      <strong>Motivation</strong>
                      <p className="muted">{application.applicant.motivation}</p>
                    </div>

                    {application.documents.length > 0 ? (
                      <div className="documents-list">
                        {application.documents.map((document) => (
                          <a
                            key={document.id}
                            href={`/admin/documents/${application.id}/${document.id}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span>{document.originalName}</span>
                            <span>{formatBytes(document.size)}</span>
                          </a>
                        ))}
                      </div>
                    ) : null}

                    <div className="history-list">
                      {application.statusHistory.map((entry) => {
                        const entryStatus = getApplicationStatusMeta(entry.status);

                        return (
                          <div className="history-item" key={entry.id}>
                            <div className="action-row">
                              <StatusBadge label={entryStatus.label} tone={entryStatus.tone} />
                              <span className="mini-label">{formatDateTime(entry.changedAt)}</span>
                            </div>
                            <p className="muted">{entry.note}</p>
                          </div>
                        );
                      })}
                    </div>

                    <form action={updateApplicationStatusAction} className="application-form">
                      <input type="hidden" name="applicationId" value={application.id} />
                      <div className="field">
                        <label htmlFor={`app-status-${application.id}`}>Nouveau statut</label>
                        <select
                          id={`app-status-${application.id}`}
                          name="status"
                          defaultValue={application.status}
                        >
                          <option value="received">Dossier recu</option>
                          <option value="under_review">En instruction</option>
                          <option value="preselected">Preselection</option>
                          <option value="forwarded">Transmis a l'etablissement</option>
                          <option value="approved">Admission confirmee</option>
                          <option value="rejected">Non retenue</option>
                        </select>
                      </div>
                      <div className="field">
                        <label htmlFor={`note-${application.id}`}>Note admin</label>
                        <textarea
                          id={`note-${application.id}`}
                          name="note"
                          placeholder="Commentaire visible dans les emails de suivi."
                        />
                      </div>
                      <button type="submit" className="button button--primary">
                        Mettre a jour la candidature
                      </button>
                    </form>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
