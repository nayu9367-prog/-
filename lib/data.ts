import { neon } from "@neondatabase/serverless";
import { randomUUID } from "crypto";

export type Announcement = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type AnnouncementRow = {
  id: string;
  title: string;
  content: string;
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
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, title, content, created_at, updated_at
    FROM announcements
    ORDER BY created_at DESC
  `) as AnnouncementRow[];
  return rows.map(toAnnouncement);
}

export async function createAnnouncement(input: {
  title: string;
  content: string;
}): Promise<Announcement> {
  const sql = getSql();
  const id = randomUUID();
  const now = new Date().toISOString();
  const rows = (await sql`
    INSERT INTO announcements (id, title, content, created_at, updated_at)
    VALUES (${id}, ${input.title}, ${input.content}, ${now}, ${now})
    RETURNING id, title, content, created_at, updated_at
  `) as AnnouncementRow[];
  return toAnnouncement(rows[0]);
}

export async function updateAnnouncement(
  id: string,
  input: { title: string; content: string }
): Promise<Announcement | null> {
  const sql = getSql();
  const now = new Date().toISOString();
  const rows = (await sql`
    UPDATE announcements
    SET title = ${input.title}, content = ${input.content}, updated_at = ${now}
    WHERE id = ${id}
    RETURNING id, title, content, created_at, updated_at
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
