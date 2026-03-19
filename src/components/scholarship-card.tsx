import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import type { Scholarship } from "@/lib/types";
import {
  formatScholarshipDeadline,
  getScholarshipStatusMeta,
} from "@/lib/utils";

type ScholarshipCardProps = {
  scholarship: Scholarship;
};

export function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  const status = getScholarshipStatusMeta(scholarship.status);

  return (
    <article className="scholarship-card">
      <div className="action-row">
        <StatusBadge label={status.label} tone={status.tone} />
        {scholarship.featured ? (
          <span className="status-badge" data-tone="red">
            Mise en avant
          </span>
        ) : null}
      </div>

      <div>
        <p className="mini-label">{scholarship.institution}</p>
        <h3 className="scholarship-card__title">{scholarship.title}</h3>
      </div>

      <p className="muted">{scholarship.summary}</p>

      <div className="scholarship-card__meta">
        <div>
          <strong>Niveau</strong>
          <span>{scholarship.level}</span>
        </div>
        <div>
          <strong>Échéance</strong>
          <span>{formatScholarshipDeadline(scholarship)}</span>
        </div>
        <div>
          <strong>Lieu</strong>
          <span>{scholarship.location}</span>
        </div>
      </div>

      <ul className="tag-list">
        <li className="tag">{scholarship.coverage}</li>
        <li className="tag">{scholarship.language}</li>
      </ul>

      {scholarship.officialUrl ? (
        <div className="scholarship-card__source">
          <span className="mini-label">
            Source officielle
            {scholarship.verifiedAt ? ` · vérifiée le ${scholarship.verifiedAt}` : ""}
          </span>
          <a
            href={scholarship.officialUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-link"
          >
            {scholarship.officialSource ?? "Consulter la publication"}
          </a>
        </div>
      ) : null}

      <div className="scholarship-card__footer">
        <Link href={`/bourses/${scholarship.slug}`} className="inline-link">
          Consulter la fiche
        </Link>
        <Link
          href={`/bourses/${scholarship.slug}#formulaire-candidature`}
          className="button button--primary"
        >
          Postuler
        </Link>
      </div>
    </article>
  );
}
