import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { seedScholarships } from "@/lib/seed-data";
import type {
  Application,
  ApplicationDocument,
  ApplicationHistoryEntry,
  ApplicationStatus,
  NewApplicationInput,
  NewScholarshipInput,
  Scholarship,
  ScholarshipStatus,
  Store,
} from "@/lib/types";
import {
  createApplicationReference,
  createId,
  sanitizeFileName,
  sortScholarshipsByPriority,
  slugify,
} from "@/lib/utils";

const STORAGE_DIR = process.env.VERCEL
  ? path.join(tmpdir(), "vision-france")
  : path.join(process.cwd(), "storage");
const STORE_PATH = path.join(STORAGE_DIR, "store.json");
const UPLOADS_DIR = path.join(STORAGE_DIR, "uploads");
const legacySeedScholarshipIds = new Set([
  "sch_eiffel",
  "sch_afrique",
  "sch_green",
  "sch_numeric",
  "sch_mer",
  "sch_health",
]);

let writeQueue: Promise<void> = Promise.resolve();

async function fileExists(target: string) {
  try {
    await access(target, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function shouldRepairEncoding(value: string) {
  return /Ã|Â|â€|â€™|â€œ|â€“|�/.test(value);
}

function repairString(value: string) {
  if (!shouldRepairEncoding(value)) {
    return value;
  }

  try {
    const repaired = Buffer.from(value, "latin1").toString("utf8");
    return repaired.includes("�") ? value : repaired;
  } catch {
    return value;
  }
}

function repairEncodingDeep<T>(value: T): T {
  if (typeof value === "string") {
    return repairString(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => repairEncodingDeep(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, repairEncodingDeep(entry)]),
    ) as T;
  }

  return value;
}

function mergeSeedScholarships(existingScholarships: Scholarship[]) {
  const existingById = new Map(existingScholarships.map((item) => [item.id, item]));
  const syncedSeed = seedScholarships.map((seed) => {
    const existing = existingById.get(seed.id);

    return existing
      ? {
          ...existing,
          ...seed,
          publishedAt: existing.publishedAt ?? seed.publishedAt,
          updatedAt: seed.updatedAt,
        }
      : seed;
  });
  const extraScholarships = existingScholarships.filter(
    (item) =>
      !seedScholarships.some((seed) => seed.id === item.id) &&
      !legacySeedScholarshipIds.has(item.id),
  );

  return [...syncedSeed, ...extraScholarships];
}

function normalizeStore(store: Store): Store {
  const repaired = repairEncodingDeep(store);

  return {
    scholarships: mergeSeedScholarships(repaired.scholarships ?? []),
    applications: repaired.applications ?? [],
  };
}

async function ensureStore() {
  await mkdir(STORAGE_DIR, { recursive: true });
  await mkdir(UPLOADS_DIR, { recursive: true });

  if (!(await fileExists(STORE_PATH))) {
    const initialStore: Store = {
      scholarships: seedScholarships,
      applications: [],
    };

    await writeFile(STORE_PATH, JSON.stringify(initialStore, null, 2), "utf8");
    return;
  }

  const rawStore = await readFile(STORE_PATH, "utf8");
  const parsedStore = JSON.parse(rawStore) as Store;
  const normalizedStore = normalizeStore(parsedStore);

  if (JSON.stringify(parsedStore) !== JSON.stringify(normalizedStore)) {
    await writeFile(STORE_PATH, JSON.stringify(normalizedStore, null, 2), "utf8");
  }
}

async function readStore() {
  await ensureStore();
  const raw = await readFile(STORE_PATH, "utf8");
  return JSON.parse(raw) as Store;
}

async function commitStore(store: Store) {
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

async function updateStore<T>(updater: (store: Store) => Promise<T> | T) {
  const next = writeQueue.then(async () => {
    const store = await readStore();
    const result = await updater(store);
    await commitStore(store);
    return result;
  });

  writeQueue = next.then(
    () => undefined,
    () => undefined,
  );

  return next;
}

function sortScholarships(items: Scholarship[]) {
  return sortScholarshipsByPriority(items);
}

function sortApplications(items: Application[]) {
  return [...items].sort(
    (left, right) =>
      new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime(),
  );
}

function createHistoryEntry(
  status: ApplicationStatus,
  note: string,
  changedBy: string,
): ApplicationHistoryEntry {
  return {
    id: createId("hst"),
    status,
    note,
    changedAt: new Date().toISOString(),
    changedBy,
  };
}

async function saveDocuments(applicationId: string, files: File[]) {
  const applicationDir = path.join(UPLOADS_DIR, applicationId);
  await mkdir(applicationDir, { recursive: true });

  const documents: ApplicationDocument[] = [];

  for (const file of files) {
    const sanitized = sanitizeFileName(file.name);
    const storedName = `${Date.now()}-${createId("doc")}-${sanitized}`;
    const target = path.join(applicationDir, storedName);
    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(target, buffer);

    documents.push({
      id: createId("doc"),
      originalName: file.name,
      storedName,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    });
  }

  return documents;
}

export async function getScholarships() {
  const store = await readStore();
  return sortScholarships(store.scholarships);
}

export async function getScholarshipBySlug(slug: string) {
  const store = await readStore();
  return store.scholarships.find((item) => item.slug === slug) ?? null;
}

export async function getDashboardData() {
  const store = await readStore();
  const scholarships = sortScholarships(store.scholarships);
  const applications = sortApplications(store.applications);

  const stats = {
    scholarshipCount: scholarships.length,
    activeScholarships: scholarships.filter((item) => item.status !== "closed").length,
    applicationCount: applications.length,
    reviewCount: applications.filter((item) =>
      ["received", "under_review", "preselected"].includes(item.status),
    ).length,
  };

  return { scholarships, applications, stats };
}

export async function createScholarship(input: NewScholarshipInput) {
  return updateStore(async (store) => {
    const titleSlug = slugify(input.title);
    const uniqueSlug = store.scholarships.some((item) => item.slug === titleSlug)
      ? `${titleSlug}-${Date.now().toString().slice(-5)}`
      : titleSlug;

    const scholarship: Scholarship = {
      id: createId("sch"),
      slug: uniqueSlug,
      title: input.title,
      institution: input.institution,
      level: input.level,
      deadline: input.deadline,
      deadlineLabel: input.deadlineLabel,
      location: input.location,
      coverage: input.coverage,
      summary: input.summary,
      description: input.description,
      eligibility: input.eligibility,
      benefits: input.benefits,
      requiredDocuments: input.requiredDocuments,
      duration: input.duration,
      language: input.language,
      audience: input.audience,
      seats: input.seats,
      institutionEmail: input.institutionEmail,
      featured: input.featured,
      status: input.status,
      officialSource: input.officialSource,
      officialUrl: input.officialUrl,
      verifiedAt: input.verifiedAt ?? new Date().toISOString().slice(0, 10),
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.scholarships.unshift(scholarship);
    return scholarship;
  });
}

export async function updateScholarshipStatus(id: string, status: ScholarshipStatus) {
  return updateStore(async (store) => {
    const scholarship = store.scholarships.find((item) => item.id === id);

    if (!scholarship) {
      throw new Error("Bourse introuvable.");
    }

    scholarship.status = status;
    scholarship.updatedAt = new Date().toISOString();

    return scholarship;
  });
}

export async function saveApplication(input: NewApplicationInput, files: File[]) {
  return updateStore(async (store) => {
    const scholarship = store.scholarships.find(
      (item) => item.slug === input.scholarshipSlug,
    );

    if (!scholarship) {
      throw new Error("Bourse introuvable.");
    }

    const applicationId = createId("app");
    const documents = await saveDocuments(applicationId, files);
    const statusHistory = [
      createHistoryEntry(
        "received",
        "Dossier déposé par le candidat sur la plateforme Vision France.",
        "Plateforme Vision France",
      ),
    ];

    statusHistory[0]!.note =
      `Dossier depose par le candidat sur la plateforme Vision France. Reference de paiement : ${input.paymentReference}.`;

    const application: Application = {
      id: applicationId,
      reference: createApplicationReference(),
      scholarshipId: scholarship.id,
      scholarshipSlug: scholarship.slug,
      scholarshipTitle: scholarship.title,
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
      submittedAt: new Date().toISOString(),
      status: "received",
      statusHistory,
      documents,
    };

    store.applications.unshift(application);
    scholarship.updatedAt = new Date().toISOString();

    return { application, scholarship };
  });
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  note: string,
  changedBy: string,
) {
  return updateStore(async (store) => {
    const application = store.applications.find((item) => item.id === applicationId);

    if (!application) {
      throw new Error("Candidature introuvable.");
    }

    application.status = status;
    application.statusHistory.unshift(
      createHistoryEntry(
        status,
        note || "Statut mis à jour par l'administration Vision France.",
        changedBy,
      ),
    );

    if (status === "forwarded") {
      application.institutionNotifiedAt = new Date().toISOString();
    }

    const scholarship = store.scholarships.find(
      (item) => item.id === application.scholarshipId,
    );

    if (scholarship) {
      scholarship.updatedAt = new Date().toISOString();
    }

    return { application, scholarship: scholarship ?? null };
  });
}

export async function getDocumentDescriptor(
  applicationId: string,
  documentId: string,
) {
  const store = await readStore();
  const application = store.applications.find((item) => item.id === applicationId);

  if (!application) {
    return null;
  }

  const document = application.documents.find((item) => item.id === documentId);

  if (!document) {
    return null;
  }

  return {
    source: "local" as const,
    document,
    filePath: path.join(UPLOADS_DIR, applicationId, document.storedName),
  };
}
