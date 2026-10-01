import { neon } from "@neondatabase/serverless";
import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { readStudentSessionToken, STUDENT_SESSION_COOKIE_NAME } from "@/lib/session";

export const PIN_PATTERN = /^\d{4}$/;
export const MAX_STUDENT_ID_LENGTH = 30;

export type StudentPinRecord = { studentId: string; createdAt: string };

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    throw new Error("DATABASE_URL(또는 POSTGRES_URL) 환경변수가 설정되지 않았습니다.");
  }
  return url;
}

function getSql() {
  return neon(requireDatabaseUrl());
}

export function normalizeStudentId(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, MAX_STUDENT_ID_LENGTH) : "";
}

/** The student ID the request's PIN-verified session belongs to, or null. */
export async function getSessionStudentId(request: NextRequest): Promise<string | null> {
  return readStudentSessionToken(request.cookies.get(STUDENT_SESSION_COOKIE_NAME)?.value);
}

export async function isStudentRegistered(studentId: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`SELECT 1 FROM student_pins WHERE student_id = ${studentId}`;
  return rows.length > 0;
}

/**
 * Sets the PIN for a student ID that has none yet. Returns false if one was
 * registered in the meantime (the caller then has to verify instead), so two
 * people can't both "create" the same ID.
 */
export async function registerStudentPin(studentId: string, pin: string): Promise<boolean> {
  const sql = getSql();
  const hash = await bcrypt.hash(pin, 10);
  const rows = await sql`
    INSERT INTO student_pins (student_id, pin_hash, created_at)
    VALUES (${studentId}, ${hash}, ${new Date().toISOString()})
    ON CONFLICT (student_id) DO NOTHING
    RETURNING student_id
  `;
  return rows.length > 0;
}

// A 4-digit PIN has only 10,000 possibilities, so wrong guesses against one
// student ID are capped regardless of where they come from. Per-instance
// memory, like lib/rateLimit.
const MAX_WRONG_ATTEMPTS = 5;
const LOCKOUT_MS = 10 * 60 * 1000;
const wrongAttempts = new Map<string, { count: number; resetAt: number }>();

export type PinCheck = "ok" | "wrong" | "locked";

export async function verifyStudentPin(studentId: string, pin: string): Promise<PinCheck> {
  const now = Date.now();
  const attempts = wrongAttempts.get(studentId);
  if (attempts && attempts.resetAt > now && attempts.count >= MAX_WRONG_ATTEMPTS) return "locked";

  const sql = getSql();
  const rows = (await sql`
    SELECT pin_hash FROM student_pins WHERE student_id = ${studentId}
  `) as { pin_hash: string }[];
  const matches = rows[0] ? await bcrypt.compare(pin, rows[0].pin_hash) : false;

  if (matches) {
    wrongAttempts.delete(studentId);
    return "ok";
  }
  const fresh = !attempts || attempts.resetAt <= now;
  wrongAttempts.set(studentId, {
    count: fresh ? 1 : attempts.count + 1,
    resetAt: fresh ? now + LOCKOUT_MS : attempts.resetAt,
  });
  return "wrong";
}

export async function getStudentPinRecords(): Promise<StudentPinRecord[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT student_id, created_at FROM student_pins ORDER BY created_at DESC
  `) as { student_id: string; created_at: string }[];
  return rows.map((r) => ({
    studentId: r.student_id,
    createdAt: new Date(r.created_at).toISOString(),
  }));
}

// Removing the PIN lets the student set a new one; their records stay.
export async function resetStudentPin(studentId: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    DELETE FROM student_pins WHERE student_id = ${studentId} RETURNING student_id
  `;
  wrongAttempts.delete(studentId);
  return rows.length > 0;
}
