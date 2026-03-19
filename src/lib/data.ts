import * as localStore from "@/lib/local-store";
import {
  createScholarshipSupabase,
  downloadStorageObjectSupabase,
  getDashboardDataSupabase,
  getDocumentDescriptorSupabase,
  getScholarshipBySlugSupabase,
  getScholarshipsSupabase,
  isSupabaseReady,
  saveApplicationSupabase,
  updateApplicationStatusSupabase,
  updateScholarshipStatusSupabase,
} from "@/lib/supabase-store";
import type {
  ApplicationStatus,
  NewApplicationInput,
  NewScholarshipInput,
  ScholarshipStatus,
} from "@/lib/types";

async function withFallback<T>(
  remoteOperation: () => Promise<T>,
  localOperation: () => Promise<T>,
) {
  if (await isSupabaseReady()) {
    try {
      return await remoteOperation();
    } catch (error) {
      console.warn("[vision-france] Supabase indisponible, fallback local.", error);
    }
  }

  return localOperation();
}

export async function getScholarships() {
  return withFallback(getScholarshipsSupabase, localStore.getScholarships);
}

export async function getScholarshipBySlug(slug: string) {
  return withFallback(
    () => getScholarshipBySlugSupabase(slug),
    () => localStore.getScholarshipBySlug(slug),
  );
}

export async function getDashboardData() {
  return withFallback(getDashboardDataSupabase, localStore.getDashboardData);
}

export async function createScholarship(input: NewScholarshipInput) {
  return withFallback(
    () => createScholarshipSupabase(input),
    () => localStore.createScholarship(input),
  );
}

export async function updateScholarshipStatus(
  id: string,
  status: ScholarshipStatus,
) {
  return withFallback(
    () => updateScholarshipStatusSupabase(id, status),
    () => localStore.updateScholarshipStatus(id, status),
  );
}

export async function saveApplication(input: NewApplicationInput, files: File[]) {
  return withFallback(
    () => saveApplicationSupabase(input, files),
    () => localStore.saveApplication(input, files),
  );
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  note: string,
  changedBy: string,
) {
  return withFallback(
    () => updateApplicationStatusSupabase(applicationId, status, note, changedBy),
    () => localStore.updateApplicationStatus(applicationId, status, note, changedBy),
  );
}

export async function getDocumentDescriptor(
  applicationId: string,
  documentId: string,
) {
  return withFallback(
    () => getDocumentDescriptorSupabase(applicationId, documentId),
    () => localStore.getDocumentDescriptor(applicationId, documentId),
  );
}

export { downloadStorageObjectSupabase };

export async function getDataMode() {
  return (await isSupabaseReady()) ? "supabase" : "local";
}
