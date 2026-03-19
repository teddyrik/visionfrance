export type ScholarshipStatus = "open" | "closing" | "upcoming" | "closed";

export type ApplicationStatus =
  | "received"
  | "under_review"
  | "preselected"
  | "forwarded"
  | "approved"
  | "rejected";

export type Scholarship = {
  id: string;
  slug: string;
  title: string;
  institution: string;
  level: string;
  deadline: string;
  deadlineLabel?: string;
  location: string;
  coverage: string;
  summary: string;
  description: string;
  eligibility: string[];
  benefits: string[];
  requiredDocuments: string[];
  duration: string;
  language: string;
  audience: string;
  seats: number;
  institutionEmail: string;
  featured: boolean;
  status: ScholarshipStatus;
  officialSource?: string;
  officialUrl?: string;
  verifiedAt?: string;
  publishedAt: string;
  updatedAt: string;
};

export type ApplicationDocument = {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
};

export type ApplicationHistoryEntry = {
  id: string;
  status: ApplicationStatus;
  note: string;
  changedAt: string;
  changedBy: string;
};

export type Application = {
  id: string;
  reference: string;
  scholarshipId: string;
  scholarshipSlug: string;
  scholarshipTitle: string;
  institution: string;
  applicant: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    paymentReference?: string;
    country: string;
    birthDate: string;
    currentLevel: string;
    lastInstitution: string;
    programChoice: string;
    motivation: string;
    portfolioUrl: string;
  };
  submittedAt: string;
  status: ApplicationStatus;
  statusHistory: ApplicationHistoryEntry[];
  documents: ApplicationDocument[];
  institutionNotifiedAt?: string;
};

export type Store = {
  scholarships: Scholarship[];
  applications: Application[];
};

export type NewScholarshipInput = {
  title: string;
  institution: string;
  level: string;
  deadline: string;
  deadlineLabel?: string;
  location: string;
  coverage: string;
  summary: string;
  description: string;
  eligibility: string[];
  benefits: string[];
  requiredDocuments: string[];
  duration: string;
  language: string;
  audience: string;
  seats: number;
  institutionEmail: string;
  featured: boolean;
  status: ScholarshipStatus;
  officialSource?: string;
  officialUrl?: string;
  verifiedAt?: string;
};

export type NewApplicationInput = {
  scholarshipSlug: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  paymentReference: string;
  country: string;
  birthDate: string;
  currentLevel: string;
  lastInstitution: string;
  programChoice: string;
  motivation: string;
  portfolioUrl: string;
};
