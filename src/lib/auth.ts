import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE = "vision-france-admin";
const SESSION_MAX_AGE = 1000 * 60 * 60 * 12;

function getConfig() {
  return {
    email: (process.env.ADMIN_EMAIL ?? "admin@visionfrance.fr").trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD ?? "VisionFrance2026!",
    secret: process.env.SESSION_SECRET ?? "vision-france-secret-a-remplacer",
  };
}

function sign(payload: string) {
  return createHmac("sha256", getConfig().secret).update(payload).digest("base64url");
}

function encodeSession(email: string, expiresAt: number) {
  const payload = Buffer.from(
    JSON.stringify({
      email,
      expiresAt,
    }),
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

function decodeSession(value: string) {
  const [payload, signature] = value.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      email: string;
      expiresAt: number;
    };

    if (parsed.expiresAt < Date.now()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function validateAdminCredentials(email: string, password: string) {
  const config = getConfig();
  return email.trim().toLowerCase() === config.email && password === config.password;
}

export async function setAdminSession(email: string) {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + SESSION_MAX_AGE;

  cookieStore.set(ADMIN_COOKIE, encodeSession(email.toLowerCase(), expiresAt), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expiresAt),
    path: "/",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_COOKIE)?.value;

  if (!value) {
    return null;
  }

  return decodeSession(value);
}

export async function isAdminAuthenticated() {
  return Boolean(await getAdminSession());
}

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session!;
}
