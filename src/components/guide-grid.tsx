import Link from "next/link";
import { guidePages } from "@/lib/guide-content";

type GuideGridProps = {
  eyebrow: string;
  title: string;
  description: string;
  sectionId?: string;
  includeSectionWrapper?: boolean;
  excludeSlugs?: string[];
};

export function GuideGrid({
  eyebrow,
  title,
  description,
  sectionId,
  includeSectionWrapper = true,
  excludeSlugs = [],
}: GuideGridProps) {
  const guides = guidePages.filter((guide) => !excludeSlugs.includes(guide.slug));

  const content = (
    <>
      <div className="section__head">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="section-title">{title}</h2>
        </div>
        <p className="section-copy">{description}</p>
      </div>

      <div className="guide-grid">
        {guides.map((guide) => (
          <article key={guide.slug} className="panel guide-card">
            <div className="guide-card__head">
              <span className="mini-label">{guide.readingLabel}</span>
              <span className="status-badge" data-tone="blue">
                {guide.keywords[0]}
              </span>
            </div>

            <div>
              <h3 className="panel-title">{guide.title}</h3>
              <p className="muted">{guide.description}</p>
            </div>

            <div className="guide-card__footer">
              <Link href={`/guides/${guide.slug}`} className="inline-link">
                Lire le guide
              </Link>
              <Link href="/bourses" className="button button--secondary">
                Voir les bourses
              </Link>
            </div>
          </article>
        ))}
      </div>
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
