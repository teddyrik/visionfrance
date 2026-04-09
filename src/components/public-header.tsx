import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export function PublicHeader() {
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <BrandMark href="/" />
        <nav className="topbar__nav" aria-label="Navigation principale">
          <Link href="/bourses">Bourses</Link>
          <Link href="/guides">Guides</Link>
          <Link href="/guides/campus-france">Campus France</Link>
          <Link href="/guides/visa-etudiant-france">Visa etudiant</Link>
          <Link href="/#processus">Processus</Link>
          <Link href="/#suivi">Suivi</Link>
        </nav>
      </div>
    </header>
  );
}
