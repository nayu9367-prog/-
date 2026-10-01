const encoder = new TextEncoder();
const SESSION_COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

const SITE_SESSION_COOKIE_NAME = "site_session";
const SITE_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

// Set once a student has proven their student ID with their PIN. The server
// reads the student ID from this cookie, never from the request, so one
// student can't act as or read the records of another.
const STUDENT_SESSION_COOKIE_NAME = "student_session";
const STUDENT_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function requireSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET 환경변수가 설정되지 않았습니다.");
  }
  return secret;
}

async function getKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toBase64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// What a token grants. It is part of the signed payload: both kinds are
// signed with the same secret, so without it a student's site token would
// verify just as well when presented as the admin cookie.
export type SessionScope = "admin" | "site";

export async function createSessionToken(
  scope: SessionScope,
  ttlMs: number = SESSION_TTL_MS
): Promise<string> {
  const secret = requireSecret();
  const expiresAt = Date.now() + ttlMs;
  const payload = `${scope}:${expiresAt}`;
  const key = await getKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${toBase64Url(signature)}`;
}

export async function verifySessionToken(
  token: string | undefined | null,
  scope: SessionScope
): Promise<boolean> {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const [tokenScope, expiry] = payload.split(":");
  if (tokenScope !== scope || !expiry) return false;
  const expiresAt = Number(expiry);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  try {
    const secret = requireSecret();
    const key = await getKey(secret);
    return await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signature),
      encoder.encode(payload)
    );
  } catch {
    return false;
  }
}

export async function createStudentSessionToken(studentId: string): Promise<string> {
  const secret = requireSecret();
  const expiresAt = Date.now() + STUDENT_SESSION_TTL_MS;
  // Student IDs are free text; base64url keeps the "." and ":" separators safe.
  const payload = `student:${expiresAt}:${toBase64Url(encoder.encode(studentId).buffer)}`;
  const key = await getKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${toBase64Url(signature)}`;
}

// The student ID a valid, unexpired student token was issued for, else null.
export async function readStudentSessionToken(
  token: string | undefined | null
): Promise<string | null> {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const [scope, expiry, encodedId] = payload.split(":");
  if (scope !== "student" || !expiry || !encodedId) return null;
  const expiresAt = Number(expiry);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;

  try {
    const key = await getKey(requireSecret());
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signature),
      encoder.encode(payload)
    );
    if (!valid) return null;
    return new TextDecoder().decode(fromBase64Url(encodedId)) || null;
  } catch {
    return null;
  }
}

export {
  STUDENT_SESSION_COOKIE_NAME,
  STUDENT_SESSION_TTL_MS,
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
  SITE_SESSION_COOKIE_NAME,
  SITE_SESSION_TTL_MS,
};
