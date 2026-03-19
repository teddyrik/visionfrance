"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  requireAdmin,
  setAdminSession,
  validateAdminCredentials,
} from "@/lib/auth";
import {
  createScholarship,
  updateApplicationStatus,
  updateScholarshipStatus,
} from "@/lib/data";
import {
  sendApplicationStatusUpdate,
  sendInstitutionForwardedUpdate,
} from "@/lib/email";
import type { ApplicationStatus, ScholarshipStatus } from "@/lib/types";
import { parseList, readString } from "@/lib/utils";

function adminNotice(type: "notice" | "error", message: string) {
  return `/admin?${type}=${encodeURIComponent(message)}`;
}

export async function loginAction(formData: FormData) {
  const email = readString(formData.get("email"));
  const password = readString(formData.get("password"));

  if (!validateAdminCredentials(email, password)) {
    redirect(
      `/admin/login?error=${encodeURIComponent(
        "Identifiants invalides. Verifiez la configuration admin.",
      )}`,
    );
  }

  await setAdminSession(email);
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/");
}

export async function createScholarshipAction(formData: FormData) {
  await requireAdmin();

  const title = readString(formData.get("title"));
  const institution = readString(formData.get("institution"));
  const level = readString(formData.get("level"));
  const deadline = readString(formData.get("deadline"));
  const location = readString(formData.get("location"));
  const coverage = readString(formData.get("coverage"));
  const summary = readString(formData.get("summary"));
  const description = readString(formData.get("description"));
  const duration = readString(formData.get("duration"));
  const language = readString(formData.get("language"));
  const audience = readString(formData.get("audience"));
  const institutionEmail = readString(formData.get("institutionEmail"));
  const status = readString(formData.get("status")) as ScholarshipStatus;
  const seats = Number.parseInt(readString(formData.get("seats")), 10);

  if (
    !title ||
    !institution ||
    !level ||
    !deadline ||
    !location ||
    !coverage ||
    !summary ||
    !description ||
    !duration ||
    !language ||
    !audience ||
    !institutionEmail ||
    Number.isNaN(seats)
  ) {
    redirect(adminNotice("error", "Tous les champs de creation de bourse sont requis."));
  }

  await createScholarship({
    title,
    institution,
    level,
    deadline,
    location,
    coverage,
    summary,
    description,
    eligibility: parseList(readString(formData.get("eligibility"))),
    benefits: parseList(readString(formData.get("benefits"))),
    requiredDocuments: parseList(readString(formData.get("requiredDocuments"))),
    duration,
    language,
    audience,
    seats,
    institutionEmail,
    featured: formData.has("featured"),
    status,
  });

  revalidatePath("/");
  revalidatePath("/admin");

  redirect(adminNotice("notice", "La bourse a ete publiee."));
}

export async function updateScholarshipStatusAction(formData: FormData) {
  await requireAdmin();

  const scholarshipId = readString(formData.get("scholarshipId"));
  const status = readString(formData.get("status")) as ScholarshipStatus;

  if (!scholarshipId || !status) {
    redirect(adminNotice("error", "Impossible de mettre a jour cette bourse."));
  }

  await updateScholarshipStatus(scholarshipId, status);

  revalidatePath("/");
  revalidatePath("/admin");

  redirect(adminNotice("notice", "Le statut de la bourse a ete mis a jour."));
}

export async function updateApplicationStatusAction(formData: FormData) {
  const session = await requireAdmin();
  const applicationId = readString(formData.get("applicationId"));
  const status = readString(formData.get("status")) as ApplicationStatus;
  const note = readString(formData.get("note"));

  if (!applicationId || !status) {
    redirect(adminNotice("error", "Impossible de mettre a jour la candidature."));
  }

  const { application, scholarship } = await updateApplicationStatus(
    applicationId,
    status,
    note,
    session.email,
  );

  revalidatePath("/");
  revalidatePath(`/bourses/${application.scholarshipSlug}`);
  revalidatePath("/admin");

  if (scholarship) {
    const tasks = [sendApplicationStatusUpdate(application, scholarship, note)];

    if (status === "forwarded") {
      tasks.push(sendInstitutionForwardedUpdate(application, scholarship, note));
    }

    void Promise.allSettled(tasks);
  }

  redirect(adminNotice("notice", "La candidature a ete mise a jour."));
}
