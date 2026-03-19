import { randomUUID } from "node:crypto";
import type {
  ApplicationStatus,
  Scholarship,
  ScholarshipStatus,
} from "@/lib/types";

export function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

export function formatDateTime(dateString: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

const scholarshipStatusPriority: Record<ScholarshipStatus, number> = {
  closing: 0,
  open: 1,
  upcoming: 2,
  closed: 3,
};

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createId(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

export function createApplicationReference() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `VF-${date}-${randomUUID().slice(0, 6).toUpperCase()}`;
}

export function parseList(input: string) {
  return input
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function sanitizeFileName(value: string) {
  const parts = value.split(".");
  const extension = parts.length > 1 ? `.${parts.pop()}` : "";
  const base = slugify(parts.join(".") || "document").slice(0, 48) || "document";
  return `${base}${extension.toLowerCase()}`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function formatSeats(value: number) {
  return value > 0 ? new Intl.NumberFormat("fr-FR").format(value) : "Non communiqué";
}

export function formatScholarshipDeadline(scholarship: Scholarship) {
  return scholarship.deadlineLabel || formatDate(scholarship.deadline);
}

export function sortScholarshipsByPriority(items: Scholarship[]) {
  return [...items].sort((left, right) => {
    const statusGap =
      scholarshipStatusPriority[left.status] - scholarshipStatusPriority[right.status];

    if (statusGap !== 0) {
      return statusGap;
    }

    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    return new Date(left.deadline).getTime() - new Date(right.deadline).getTime();
  });
}

export function getScholarshipStatusMeta(status: ScholarshipStatus) {
  switch (status) {
    case "open":
      return { label: "Ouverte", tone: "blue" as const };
    case "closing":
      return { label: "Clôture proche", tone: "amber" as const };
    case "upcoming":
      return { label: "À venir", tone: "green" as const };
    case "closed":
      return { label: "Clôturée", tone: "slate" as const };
    default:
      return { label: status, tone: "slate" as const };
  }
}

export function getApplicationStatusMeta(status: ApplicationStatus) {
  switch (status) {
    case "received":
      return { label: "Dossier reçu", tone: "blue" as const };
    case "under_review":
      return { label: "En instruction", tone: "amber" as const };
    case "preselected":
      return { label: "Présélection", tone: "green" as const };
    case "forwarded":
      return { label: "Transmis à l'établissement", tone: "blue" as const };
    case "approved":
      return { label: "Admission confirmée", tone: "green" as const };
    case "rejected":
      return { label: "Non retenue", tone: "red" as const };
    default:
      return { label: status, tone: "slate" as const };
  }
}

export function readString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export function isUploadFile(value: FormDataEntryValue): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "size" in value &&
    "arrayBuffer" in value &&
    Number(value.size) > 0
  );
}

export function firstQueryValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
