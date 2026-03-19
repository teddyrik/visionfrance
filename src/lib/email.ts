import type { Application, Scholarship } from "@/lib/types";
import { formatDate, getApplicationStatusMeta } from "@/lib/utils";

type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
};

function wrapEmail(title: string, body: string) {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; background:#f4f7fb; padding:32px;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid rgba(5,22,53,.08);">
        <div style="height:8px;background:linear-gradient(90deg,#0d2f6f 0 34%,#ffffff 34% 66%,#d71424 66% 100%);"></div>
        <div style="padding:32px;">
          <p style="margin:0 0 8px;color:#0d2f6f;font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;">Vision France</p>
          <h1 style="margin:0 0 18px;font-size:28px;color:#051635;">${title}</h1>
          <div style="color:#31476f;line-height:1.7;font-size:15px;">${body}</div>
          <p style="margin:24px 0 0;color:#31476f;">Equipe Vision France</p>
        </div>
      </div>
    </div>
  `;
}

async function deliverEmail(payload: EmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "Vision France <notifications@visionfrance.fr>";

  if (!apiKey) {
    console.info("[vision-france][email:log]", {
      to: payload.to,
      subject: payload.subject,
    });
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Echec de l'envoi email: ${detail}`);
  }
}

export async function sendApplicationReceipt(
  application: Application,
  scholarship: Scholarship,
) {
  const subject = `[Vision France] Candidature recue - ${scholarship.title}`;
  const html = wrapEmail(
    "Votre dossier a bien ete recu",
    `
      <p>Bonjour ${application.applicant.firstName},</p>
      <p>Votre candidature <strong>${application.reference}</strong> pour <strong>${scholarship.title}</strong> a ete enregistree avec succes.</p>
      <p>Prochaine etape : controle administratif du dossier puis mise en instruction. Vous recevrez un email a chaque evolution de statut.</p>
      <p>Date limite du programme : <strong>${formatDate(scholarship.deadline)}</strong>.</p>
    `,
  );

  await deliverEmail({
    to: application.applicant.email,
    subject,
    html,
    text: `Votre candidature ${application.reference} pour ${scholarship.title} a ete recue sur Vision France.`,
  });
}

export async function sendInstitutionNewApplication(
  application: Application,
  scholarship: Scholarship,
) {
  if (!scholarship.institutionEmail) {
    return;
  }

  const html = wrapEmail(
    "Nouveau dossier recu sur Vision France",
    `
      <p>Un nouveau dossier vient d'etre depose sur la plateforme Vision France.</p>
      <p><strong>Candidat :</strong> ${application.applicant.firstName} ${application.applicant.lastName}<br />
      <strong>Reference :</strong> ${application.reference}<br />
      <strong>Programme :</strong> ${scholarship.title}</p>
      <p>Le dossier reste visible dans l'administration centrale jusqu'a son eventuelle transmission a votre etablissement.</p>
    `,
  );

  await deliverEmail({
    to: scholarship.institutionEmail,
    subject: `[Vision France] Nouveau dossier - ${application.reference}`,
    html,
    text: `Nouveau dossier ${application.reference} recu pour ${scholarship.title}.`,
  });
}

export async function sendApplicationStatusUpdate(
  application: Application,
  scholarship: Scholarship,
  note: string,
) {
  const status = getApplicationStatusMeta(application.status);
  const html = wrapEmail(
    "Mise a jour de votre candidature",
    `
      <p>Bonjour ${application.applicant.firstName},</p>
      <p>Le statut de votre candidature <strong>${application.reference}</strong> est maintenant : <strong>${status.label}</strong>.</p>
      <p>${note || "Aucune precision complementaire n'a ete ajoutee pour cette etape."}</p>
      <p>Programme concerne : <strong>${scholarship.title}</strong>.</p>
    `,
  );

  await deliverEmail({
    to: application.applicant.email,
    subject: `[Vision France] Statut mis a jour - ${status.label}`,
    html,
    text: `Le statut de votre candidature ${application.reference} est maintenant ${status.label}.`,
  });
}

export async function sendInstitutionForwardedUpdate(
  application: Application,
  scholarship: Scholarship,
  note: string,
) {
  if (!scholarship.institutionEmail) {
    return;
  }

  const html = wrapEmail(
    "Dossier transmis a l'etablissement",
    `
      <p>Le dossier suivant vient d'etre transmis a votre etablissement pour poursuite de procedure.</p>
      <p><strong>Reference :</strong> ${application.reference}<br />
      <strong>Candidat :</strong> ${application.applicant.firstName} ${application.applicant.lastName}<br />
      <strong>Programme :</strong> ${scholarship.title}</p>
      <p>${note || "Merci de poursuivre l'examen pedagogique dans votre circuit interne."}</p>
    `,
  );

  await deliverEmail({
    to: scholarship.institutionEmail,
    subject: `[Vision France] Dossier transmis - ${application.reference}`,
    html,
    text: `Le dossier ${application.reference} a ete transmis a ${scholarship.institution}.`,
  });
}
