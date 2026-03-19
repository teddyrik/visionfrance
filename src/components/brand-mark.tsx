import Link from "next/link";

type BrandMarkProps = {
  href?: string;
  accent?: "dark" | "light";
};

function Content({ accent = "dark" }: Pick<BrandMarkProps, "accent">) {
  return (
    <div className={`brand-mark${accent === "light" ? " brand-mark--light" : ""}`}>
      <div className="brand-mark__icon" aria-hidden="true">
        <svg viewBox="0 0 64 64" role="img" aria-hidden="true">
          <path
            d="M10 17C15 10 23 6 32 6s17 4 22 11v14c0 15-10.1 25-22 25S10 46 10 31V17Z"
            fill="#fff"
          />
          <path
            d="M10 17C15 10 23 6 32 6v50c-11.9 0-22-10-22-25V17Z"
            fill="#0d2f6f"
          />
          <path
            d="M54 17C49 10 41 6 32 6v50c11.9 0 22-10 22-25V17Z"
            fill="#d71424"
          />
          <path d="M19 38 32 31l13 7-13 7-13-7Z" fill="#051635" />
          <path
            d="M17 45c4.5 3 9.7 4.5 15 4.5S42.5 48 47 45"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M21 50c3.6-1.6 7.4-2.4 11-2.4s7.4.8 11 2.4"
            fill="none"
            stroke="#051635"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M32 14c2.6 0 4.7 2.2 4.7 4.8s-2.1 4.8-4.7 4.8-4.7-2.2-4.7-4.8S29.4 14 32 14Zm0 9v9"
            fill="none"
            stroke="#051635"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div>
        <p className="brand-mark__title">Vision France</p>
        <p className="brand-mark__subtitle">Plateforme des bourses d'etudes</p>
      </div>
    </div>
  );
}

export function BrandMark(props: BrandMarkProps) {
  if (!props.href) {
    return <Content accent={props.accent} />;
  }

  return (
    <Link href={props.href} className="brand-link">
      <Content accent={props.accent} />
    </Link>
  );
}
