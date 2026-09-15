import { neon } from "@neondatabase/serverless";
import { randomUUID } from "crypto";

export type CommunityPost = {
  id: string;
  category: string;
  title: string;
  body: string;
  authorName: string;
  createdAt: string;
};

type CommunityPostRow = {
  id: string;
  category: string;
  title: string;
  body: string;
  author_name: string;
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

function toPost(row: CommunityPostRow): CommunityPost {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    body: row.body,
    authorName: row.author_name,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function getCommunityPosts(): Promise<CommunityPost[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, category, title, body, author_name, created_at
    FROM community_posts
    ORDER BY created_at DESC
  `) as CommunityPostRow[];
  return rows.map(toPost);
}

export async function createCommunityPost(input: {
  category: string;
  title: string;
  body: string;
  authorName: string;
}): Promise<CommunityPost> {
  const sql = getSql();
  const id = randomUUID();
  const now = new Date().toISOString();
  const rows = (await sql`
    INSERT INTO community_posts (id, category, title, body, author_name, created_at)
    VALUES (${id}, ${input.category}, ${input.title}, ${input.body}, ${input.authorName}, ${now})
    RETURNING id, category, title, body, author_name, created_at
  `) as CommunityPostRow[];
  return toPost(rows[0]);
}
