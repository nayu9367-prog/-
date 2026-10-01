import { neon } from "@neondatabase/serverless";
import { randomUUID } from "crypto";

export type Announcement = {
  id: string;
  title: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
  updatedAt: string;
};

export type AnnouncementInput = {
  title: string;
  content: string;
  // Omitted (or empty) means no attachment — on update, that removes one.
  fileUrl?: string;
  fileName?: string;
};

type AnnouncementRow = {
  id: string;
  title: string;
  content: string;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
  updated_at: string;
};

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL(또는 POSTGRES_URL) 환경변수가 설정되지 않았습니다."
    );
  }
  return url;
}

function getSql() {
  return neon(requireDatabaseUrl());
}

function toAnnouncement(row: AnnouncementRow): Announcement {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    ...(row.file_url ? { fileUrl: row.file_url, fileName: row.file_name ?? undefined } : {}),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, title, content, file_url, file_name, created_at, updated_at
    FROM announcements
    ORDER BY created_at DESC
  `) as AnnouncementRow[];
  return rows.map(toAnnouncement);
}

export async function createAnnouncement(input: AnnouncementInput): Promise<Announcement> {
  const sql = getSql();
  const id = randomUUID();
  const now = new Date().toISOString();
  const rows = (await sql`
    INSERT INTO announcements (id, title, content, file_url, file_name, created_at, updated_at)
    VALUES (${id}, ${input.title}, ${input.content}, ${input.fileUrl || null}, ${input.fileName || null}, ${now}, ${now})
    RETURNING id, title, content, file_url, file_name, created_at, updated_at
  `) as AnnouncementRow[];
  return toAnnouncement(rows[0]);
}

export async function updateAnnouncement(
  id: string,
  input: AnnouncementInput
): Promise<Announcement | null> {
  const sql = getSql();
  const now = new Date().toISOString();
  const rows = (await sql`
    UPDATE announcements
    SET title = ${input.title}, content = ${input.content},
        file_url = ${input.fileUrl || null}, file_name = ${input.fileName || null},
        updated_at = ${now}
    WHERE id = ${id}
    RETURNING id, title, content, file_url, file_name, created_at, updated_at
  `) as AnnouncementRow[];
  return rows[0] ? toAnnouncement(rows[0]) : null;
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql`
    DELETE FROM announcements WHERE id = ${id} RETURNING id
  `) as { id: string }[];
  return rows.length > 0;
}
