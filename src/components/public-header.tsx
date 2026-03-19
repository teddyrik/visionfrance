import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export function PublicHeader() {
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <BrandMark href="/" />
        <nav className="topbar__nav" aria-label="Navigation principale">
          <Link href="/#catalogue">Bourses</Link>
          <Link href="/#processus">Processus</Link>
          <Link href="/#suivi">Suivi</Link>
        </nav>
      </div>
    </header>
  );
}
