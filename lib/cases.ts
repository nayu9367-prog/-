import { neon } from "@neondatabase/serverless";
import { randomUUID } from "crypto";
import type { VisitCase } from "@/lib/casesData";

// The name is kept in the `title` column, which predates scenarios.
type VisitCaseRow = {
  id: string;
  title: string;
  scenario: string;
  created_at: string;
};

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

function toVisitCase(row: VisitCaseRow): VisitCase {
  return {
    id: row.id,
    name: row.title,
    scenario: row.scenario,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function getVisitCases(): Promise<VisitCase[]> {
  const sql = getSql();
  // Rows from before scenarios existed have none and are left out.
  const rows = (await sql`
    SELECT id, title, scenario, created_at
    FROM visit_cases
    WHERE scenario <> ''
    ORDER BY created_at ASC
  `) as VisitCaseRow[];
  return rows.map(toVisitCase);
}

export async function getVisitCase(id: string): Promise<VisitCase | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, title, scenario, created_at
    FROM visit_cases
    WHERE id = ${id} AND scenario <> ''
  `) as VisitCaseRow[];
  return rows[0] ? toVisitCase(rows[0]) : null;
}

export type VisitCaseInput = {
  name: string;
  scenario: string;
};

export async function createVisitCase(input: VisitCaseInput): Promise<VisitCase> {
  const sql = getSql();
  const id = randomUUID();
  const now = new Date().toISOString();
  const rows = (await sql`
    INSERT INTO visit_cases (id, title, scenario, created_at)
    VALUES (${id}, ${input.name}, ${input.scenario}, ${now})
    RETURNING id, title, scenario, created_at
  `) as VisitCaseRow[];
  return toVisitCase(rows[0]);
}

export async function updateVisitCase(
  id: string,
  input: VisitCaseInput
): Promise<VisitCase | null> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE visit_cases
    SET title = ${input.name}, scenario = ${input.scenario}
    WHERE id = ${id}
    RETURNING id, title, scenario, created_at
  `) as VisitCaseRow[];
  return rows[0] ? toVisitCase(rows[0]) : null;
}

export async function deleteVisitCase(id: string): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql`
    DELETE FROM visit_cases WHERE id = ${id} RETURNING id
  `) as { id: string }[];
  return rows.length > 0;
}
