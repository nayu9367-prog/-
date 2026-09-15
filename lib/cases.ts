import { neon } from "@neondatabase/serverless";
import { randomUUID } from "crypto";
import type { VisitCase } from "@/lib/casesData";

type VisitCaseRow = {
  id: string;
  category: string;
  title: string;
  summary: string;
  patient_info: string;
  assessment: string;
  omaha_diagnosis: string;
  interventions: string;
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
    category: row.category,
    title: row.title,
    summary: row.summary,
    patientInfo: row.patient_info,
    assessment: row.assessment,
    omahaDiagnosis: row.omaha_diagnosis,
    interventions: row.interventions,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function getVisitCases(): Promise<VisitCase[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, category, title, summary, patient_info, assessment, omaha_diagnosis, interventions, created_at
    FROM visit_cases
    ORDER BY created_at ASC
  `) as VisitCaseRow[];
  return rows.map(toVisitCase);
}

export type VisitCaseInput = {
  category: string;
  title: string;
  summary: string;
  patientInfo: string;
  assessment: string;
  omahaDiagnosis: string;
  interventions: string;
};

export async function createVisitCase(input: VisitCaseInput): Promise<VisitCase> {
  const sql = getSql();
  const id = randomUUID();
  const now = new Date().toISOString();
  const rows = (await sql`
    INSERT INTO visit_cases (id, category, title, summary, patient_info, assessment, omaha_diagnosis, interventions, created_at)
    VALUES (${id}, ${input.category}, ${input.title}, ${input.summary}, ${input.patientInfo}, ${input.assessment}, ${input.omahaDiagnosis}, ${input.interventions}, ${now})
    RETURNING id, category, title, summary, patient_info, assessment, omaha_diagnosis, interventions, created_at
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
    SET category = ${input.category}, title = ${input.title}, summary = ${input.summary},
        patient_info = ${input.patientInfo}, assessment = ${input.assessment},
        omaha_diagnosis = ${input.omahaDiagnosis}, interventions = ${input.interventions}
    WHERE id = ${id}
    RETURNING id, category, title, summary, patient_info, assessment, omaha_diagnosis, interventions, created_at
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
