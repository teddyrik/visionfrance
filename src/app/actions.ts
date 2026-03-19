"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getScholarshipBySlug, saveApplication } from "@/lib/data";
import {
  sendApplicationReceipt,
  sendInstitutionNewApplication,
} from "@/lib/email";
import { isUploadFile, readString } from "@/lib/utils";

export async function submitApplication(formData: FormData) {
  const scholarshipSlug = readString(formData.get("scholarshipSlug"));
  const scholarship = await getScholarshipBySlug(scholarshipSlug);

  if (!scholarship) {
    redirect("/?error=Bourse introuvable");
  }

  const phoneCountryCode = readString(formData.get("phoneCountryCode"));
  const phoneNumber = readString(formData.get("phoneNumber"));

  const payload = {
    scholarshipSlug,
    firstName: readString(formData.get("firstName")),
    lastName: readString(formData.get("lastName")),
    email: readString(formData.get("email")),
    phone: [phoneCountryCode, phoneNumber].filter(Boolean).join(" "),
    country: readString(formData.get("country")),
    birthDate: readString(formData.get("birthDate")),
    currentLevel: readString(formData.get("currentLevel")),
    lastInstitution: readString(formData.get("lastInstitution")),
    programChoice: readString(formData.get("programChoice")),
    motivation: readString(formData.get("motivation")),
    portfolioUrl: readString(formData.get("portfolioUrl")),
  };

  const requiredValues = [
    payload.firstName,
    payload.lastName,
    payload.email,
    phoneCountryCode,
    phoneNumber,
    payload.country,
    payload.birthDate,
    payload.currentLevel,
    payload.lastInstitution,
    payload.programChoice,
    payload.motivation,
  ];

  if (requiredValues.some((value) => !value)) {
    redirect(
      `/bourses/${scholarship.slug}?error=${encodeURIComponent(
        "Merci de renseigner tous les champs obligatoires du dossier.",
      )}#formulaire-candidature`,
    );
  }

  if (!formData.has("consent")) {
    redirect(
      `/bourses/${scholarship.slug}?error=${encodeURIComponent(
        "Vous devez confirmer l'exactitude des informations transmises.",
      )}#formulaire-candidature`,
    );
  }

  const files = [
    formData.get("identityDocument"),
    formData.get("lastDegreeDocument"),
  ].filter(isUploadFile);

  if (files.length !== 2) {
    redirect(
      `/bourses/${scholarship.slug}?error=${encodeURIComponent(
        "Ajoutez la Carte Nationale d'identite et le Dernier diplome pour finaliser votre candidature.",
      )}#formulaire-candidature`,
    );
  }

  const { application } = await saveApplication(payload, files);

  revalidatePath("/");
  revalidatePath(`/bourses/${scholarship.slug}`);
  revalidatePath("/admin");

  void Promise.allSettled([
    sendApplicationReceipt(application, scholarship),
    sendInstitutionNewApplication(application, scholarship),
  ]);

  redirect(
    `/bourses/${scholarship.slug}?success=${encodeURIComponent(application.reference)}#formulaire-candidature`,
  );
}
