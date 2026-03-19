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

type DocumentDescriptor =
  | Awaited<ReturnType<typeof localStore.getDocumentDescriptor>>
  | Awaited<ReturnType<typeof getDocumentDescriptorSupabase>>;

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
  if (await isSupabaseReady()) {
    try {
      const remoteScholarships = await getScholarshipsSupabase();

      if (remoteScholarships.length > 0) {
        return remoteScholarships;
      }
    } catch (error) {
      console.warn("[vision-france] Supabase indisponible, fallback local.", error);
    }
  }

  return localStore.getScholarships();
}

export async function getScholarshipBySlug(slug: string) {
  if (await isSupabaseReady()) {
    try {
      const remoteScholarship = await getScholarshipBySlugSupabase(slug);

      if (remoteScholarship) {
        return remoteScholarship;
      }
    } catch (error) {
      console.warn("[vision-france] Supabase indisponible, fallback local.", error);
    }
  }

  return localStore.getScholarshipBySlug(slug);
}

export async function getDashboardData() {
  if (await isSupabaseReady()) {
    try {
      const remoteDashboard = await getDashboardDataSupabase();

      if (
        remoteDashboard.scholarships.length > 0 ||
        remoteDashboard.applications.length > 0
      ) {
        return remoteDashboard;
      }
    } catch (error) {
      console.warn("[vision-france] Supabase indisponible, fallback local.", error);
    }
  }

  return localStore.getDashboardData();
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
  return withFallback<DocumentDescriptor>(
    () => getDocumentDescriptorSupabase(applicationId, documentId),
    () => localStore.getDocumentDescriptor(applicationId, documentId),
  );
}

export { downloadStorageObjectSupabase };

export async function getDataMode() {
  if (!(await isSupabaseReady())) {
    return "local";
  }

  try {
    const remoteScholarships = await getScholarshipsSupabase();
    return remoteScholarships.length > 0 ? "supabase" : "local";
  } catch {
    return "local";
  }
}
