import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { loginAction } from "@/app/admin/actions";
import { isAdminAuthenticated } from "@/lib/auth";
import { firstQueryValue } from "@/lib/utils";

export const dynamic = "force-dynamic";

type AdminLoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const error = firstQueryValue((await searchParams).error);

  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="application-form">
          <BrandMark />
          <div>
            <span className="eyebrow">Administration</span>
            <h1 className="detail-title">Acces au pilotage Vision France</h1>
            <p className="muted">
              Connexion simple pour l&apos;administration des bourses, le suivi des
              candidatures et la transmission aux etablissements.
            </p>
          </div>
        </div>

        {error ? <div className="notice notice--error">{error}</div> : null}

        <form action={loginAction} className="application-form" style={{ marginTop: "1.5rem" }}>
          <div className="field">
            <label htmlFor="email">Email admin</label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue="admin@visionfrance.fr"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              defaultValue="VisionFrance2026!"
              required
            />
          </div>
          <button className="button button--primary button--block" type="submit">
            Se connecter
          </button>
        </form>
      </section>
    </main>
  );
}
