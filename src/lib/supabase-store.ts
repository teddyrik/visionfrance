import type {
  Application,
  ApplicationDocument,
  ApplicationHistoryEntry,
  ApplicationStatus,
  NewApplicationInput,
  NewScholarshipInput,
  Scholarship,
  ScholarshipStatus,
} from "@/lib/types";
import {
  createApplicationReference,
  createId,
  sanitizeFileName,
  sortScholarshipsByPriority,
} from "@/lib/utils";

const SUPABASE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET ?? "vision-france-documents";

let readinessCache:
  | {
      checkedAt: number;
      ready: boolean;
    }
  | undefined;

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonJwt = process.env.SUPABASE_ANON_KEY;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY;
  const authToken = serviceRoleKey ?? anonJwt ?? publishableKey;
  const apiKey = serviceRoleKey ?? publishableKey ?? anonJwt;

  if (!url || !apiKey || !authToken) {
    return null;
  }

  return {
    url,
    apiKey,
    authToken,
    usingServiceRole: Boolean(serviceRoleKey),
  };
}

function createHeaders(extra?: HeadersInit) {
  const config = getSupabaseConfig();

  if (!config) {
    throw new Error("Supabase n'est pas configuré.");
  }

  return {
    apikey: config.apiKey,
    Authorization: `Bearer ${config.authToken}`,
    ...extra,
  };
}

async function requestSupabase<T>(
  endpoint: string,
  init?: RequestInit,
): Promise<T> {
  const config = getSupabaseConfig();

  if (!config) {
    throw new Error("Supabase n'est pas configuré.");
  }

  const response = await fetch(`${config.url}${endpoint}`, {
    cache: "no-store",
    ...init,
    headers: createHeaders(init?.headers),
  });

  if (!response.ok) {
    throw new Error(`[Supabase ${response.status}] ${await response.text()}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

type ScholarshipRow = {
  id: string;
  slug: string;
  title: string;
  institution: string;
  level: string;
  deadline: string;
  deadline_label?: string | null;
  location: string;
  coverage: string;
  summary: string;
  description: string;
  eligibility: string[];
  benefits: string[];
  required_documents: string[];
  duration: string;
  language: string;
  audience: string;
  seats: number;
  institution_email: string;
  featured: boolean;
  status: ScholarshipStatus;
  official_source?: string | null;
  official_url?: string | null;
  verified_at?: string | null;
  published_at: string;
  updated_at: string;
};

type ApplicationRow = {
  id: string;
  reference: string;
  scholarship_id: string;
  scholarship_slug: string;
  scholarship_title: string;
  institution: string;
  applicant: Application["applicant"];
  submitted_at: string;
  status: ApplicationStatus;
  status_history: ApplicationHistoryEntry[];
  documents: ApplicationDocument[];
  institution_notified_at?: string | null;
};

function mapScholarship(row: ScholarshipRow): Scholarship {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    institution: row.institution,
    level: row.level,
    deadline: row.deadline,
    deadlineLabel: row.deadline_label ?? undefined,
    location: row.location,
    coverage: row.coverage,
    summary: row.summary,
    description: row.description,
    eligibility: row.eligibility ?? [],
    benefits: row.benefits ?? [],
    requiredDocuments: row.required_documents ?? [],
    duration: row.duration,
    language: row.language,
    audience: row.audience,
    seats: row.seats,
    institutionEmail: row.institution_email,
    featured: row.featured,
    status: row.status,
    officialSource: row.official_source ?? undefined,
    officialUrl: row.official_url ?? undefined,
    verifiedAt: row.verified_at ?? undefined,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  };
}

function mapApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    reference: row.reference,
    scholarshipId: row.scholarship_id,
    scholarshipSlug: row.scholarship_slug,
    scholarshipTitle: row.scholarship_title,
    institution: row.institution,
    applicant: row.applicant,
    submittedAt: row.submitted_at,
    status: row.status,
    statusHistory: row.status_history ?? [],
    documents: row.documents ?? [],
    institutionNotifiedAt: row.institution_notified_at ?? undefined,
  };
}

function encodeStoragePath(path: string) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

async function uploadDocuments(files: File[], applicationId: string) {
  const uploaded: ApplicationDocument[] = [];

  for (const file of files) {
    const objectPath = `${applicationId}/${Date.now()}-${createId("doc")}-${sanitizeFileName(file.name)}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await requestSupabase(
      `/storage/v1/object/${SUPABASE_BUCKET}/${encodeStoragePath(objectPath)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
          "x-upsert": "true",
        },
        body: buffer,
      },
    );

    uploaded.push({
      id: createId("doc"),
      originalName: file.name,
      storedName: objectPath,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    });
  }

  return uploaded;
}

export async function isSupabaseReady() {
  const config = getSupabaseConfig();

  if (!config) {
    return false;
  }

  if (readinessCache && Date.now() - readinessCache.checkedAt < 60_000) {
    return readinessCache.ready;
  }

  try {
    const response = await fetch(
      `${config.url}/rest/v1/scholarships?select=id&limit=1`,
      {
        cache: "no-store",
        headers: createHeaders(),
      },
    );

    readinessCache = {
      checkedAt: Date.now(),
      ready: response.ok,
    };
  } catch {
    readinessCache = {
      checkedAt: Date.now(),
      ready: false,
    };
  }

  return readinessCache.ready;
}

export async function getScholarshipsSupabase() {
  const rows = await requestSupabase<ScholarshipRow[]>(
    "/rest/v1/scholarships?select=*&order=featured.desc,deadline.asc",
  );

  return sortScholarshipsByPriority(rows.map(mapScholarship));
}

export async function getScholarshipBySlugSupabase(slug: string) {
  const rows = await requestSupabase<ScholarshipRow[]>(
    `/rest/v1/scholarships?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  );

  return rows[0] ? mapScholarship(rows[0]) : null;
}

export async function getDashboardDataSupabase() {
  const [scholarships, applications] = await Promise.all([
    getScholarshipsSupabase(),
    requestSupabase<ApplicationRow[]>(
      "/rest/v1/applications?select=*&order=submitted_at.desc",
    ).then((rows) => rows.map(mapApplication)),
  ]);

  return {
    scholarships,
    applications,
    stats: {
      scholarshipCount: scholarships.length,
      activeScholarships: scholarships.filter((item) => item.status !== "closed").length,
      applicationCount: applications.length,
      reviewCount: applications.filter((item) =>
        ["received", "under_review", "preselected"].includes(item.status),
      ).length,
    },
  };
}

export async function createScholarshipSupabase(input: NewScholarshipInput) {
  const slugBase = input.title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const [row] = await requestSupabase<ScholarshipRow[]>(
    "/rest/v1/scholarships",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        id: createId("sch"),
        slug: `${slugBase}-${Date.now().toString().slice(-5)}`,
        title: input.title,
        institution: input.institution,
        level: input.level,
        deadline: input.deadline,
        deadline_label: input.deadlineLabel,
        location: input.location,
        coverage: input.coverage,
        summary: input.summary,
        description: input.description,
        eligibility: input.eligibility,
        benefits: input.benefits,
        required_documents: input.requiredDocuments,
        duration: input.duration,
        language: input.language,
        audience: input.audience,
        seats: input.seats,
        institution_email: input.institutionEmail,
        featured: input.featured,
        status: input.status,
        official_source: input.officialSource || null,
        official_url: input.officialUrl || null,
        verified_at: input.verifiedAt ?? new Date().toISOString().slice(0, 10),
      }),
    },
  );

  return mapScholarship(row);
}

export async function updateScholarshipStatusSupabase(
  id: string,
  status: ScholarshipStatus,
) {
  const [row] = await requestSupabase<ScholarshipRow[]>(
    `/rest/v1/scholarships?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        status,
        updated_at: new Date().toISOString(),
      }),
    },
  );

  return mapScholarship(row);
}

export async function saveApplicationSupabase(
  input: NewApplicationInput,
  files: File[],
) {
  const scholarship = await getScholarshipBySlugSupabase(input.scholarshipSlug);

  if (!scholarship) {
    throw new Error("Bourse introuvable sur Supabase.");
  }

  const applicationId = createId("app");
  const documents = await uploadDocuments(files, applicationId);
  const history = [
    {
      id: createId("hst"),
      status: "received" as const,
      note: "Dossier déposé par le candidat sur la plateforme Vision France.",
      changedAt: new Date().toISOString(),
      changedBy: "Plateforme Vision France",
    },
  ];

  history[0]!.note =
    `Dossier depose par le candidat sur la plateforme Vision France. Reference de paiement : ${input.paymentReference}.`;

  const [row] = await requestSupabase<ApplicationRow[]>(
    "/rest/v1/applications",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        id: applicationId,
        reference: createApplicationReference(),
        scholarship_id: scholarship.id,
        scholarship_slug: scholarship.slug,
        scholarship_title: scholarship.title,
        institution: scholarship.institution,
        applicant: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          paymentReference: input.paymentReference,
          country: input.country,
          birthDate: input.birthDate,
          currentLevel: input.currentLevel,
          lastInstitution: input.lastInstitution,
          programChoice: input.programChoice,
          motivation: input.motivation,
          portfolioUrl: input.portfolioUrl,
        },
        submitted_at: new Date().toISOString(),
        status: "received",
        status_history: history,
        documents,
      }),
    },
  );

  return {
    application: mapApplication(row),
    scholarship,
  };
}

export async function updateApplicationStatusSupabase(
  applicationId: string,
  status: ApplicationStatus,
  note: string,
  changedBy: string,
) {
  const rows = await requestSupabase<ApplicationRow[]>(
    `/rest/v1/applications?select=*&id=eq.${encodeURIComponent(applicationId)}&limit=1`,
  );

  if (!rows[0]) {
    throw new Error("Candidature introuvable sur Supabase.");
  }

  const application = mapApplication(rows[0]);
  const historyEntry: ApplicationHistoryEntry = {
    id: createId("hst"),
    status,
    note: note || "Statut mis à jour par l'administration Vision France.",
    changedAt: new Date().toISOString(),
    changedBy,
  };

  const [updatedRow] = await requestSupabase<ApplicationRow[]>(
    `/rest/v1/applications?id=eq.${encodeURIComponent(applicationId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        status,
        status_history: [historyEntry, ...application.statusHistory],
        institution_notified_at:
          status === "forwarded" ? new Date().toISOString() : application.institutionNotifiedAt,
      }),
    },
  );

  const scholarship = await getScholarshipBySlugSupabase(application.scholarshipSlug);

  return {
    application: mapApplication(updatedRow),
    scholarship,
  };
}

export async function getDocumentDescriptorSupabase(
  applicationId: string,
  documentId: string,
) {
  const rows = await requestSupabase<ApplicationRow[]>(
    `/rest/v1/applications?select=documents&id=eq.${encodeURIComponent(applicationId)}&limit=1`,
  );

  const documents = rows[0]?.documents ?? [];
  const document = documents.find((item) => item.id === documentId);

  if (!document) {
    return null;
  }

  return {
    source: "supabase" as const,
    document,
    storagePath: document.storedName,
    bucket: SUPABASE_BUCKET,
  };
}

export async function downloadStorageObjectSupabase(storagePath: string) {
  const config = getSupabaseConfig();

  if (!config) {
    throw new Error("Supabase n'est pas configuré.");
  }

  const response = await fetch(
    `${config.url}/storage/v1/object/authenticated/${SUPABASE_BUCKET}/${encodeStoragePath(storagePath)}`,
    {
      cache: "no-store",
      headers: createHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(`[Supabase storage ${response.status}] ${await response.text()}`);
  }

  const mimeType =
    response.headers.get("Content-Type") ?? "application/octet-stream";
  const buffer = Buffer.from(await response.arrayBuffer());

  return {
    buffer,
    mimeType,
  };
}
