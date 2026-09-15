import { neon } from "@neondatabase/serverless";
import { randomUUID } from "crypto";
import type { Skill, SkillCategory, VideoProvider } from "@/lib/skillsData";

type SkillRow = {
  id: string;
  cat: string;
  tag: string;
  title: string;
  description: string;
  provider: string;
  video_id: string;
  steps: string[];
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

function toSkill(row: SkillRow): Skill {
  return {
    id: row.id,
    cat: row.cat as SkillCategory,
    tag: row.tag,
    title: row.title,
    desc: row.description,
    provider: row.provider as VideoProvider,
    videoId: row.video_id,
    steps: row.steps,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function getSkills(): Promise<Skill[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, cat, tag, title, description, provider, video_id, steps, created_at
    FROM skills
    ORDER BY created_at ASC
  `) as SkillRow[];
  return rows.map(toSkill);
}

export type SkillInput = {
  cat: SkillCategory;
  tag: string;
  title: string;
  desc: string;
  provider: VideoProvider;
  videoId: string;
  steps: string[];
};

export async function createSkill(input: SkillInput): Promise<Skill> {
  const sql = getSql();
  const id = randomUUID();
  const now = new Date().toISOString();
  const rows = (await sql`
    INSERT INTO skills (id, cat, tag, title, description, provider, video_id, steps, created_at)
    VALUES (${id}, ${input.cat}, ${input.tag}, ${input.title}, ${input.desc}, ${input.provider}, ${input.videoId}, ${input.steps}, ${now})
    RETURNING id, cat, tag, title, description, provider, video_id, steps, created_at
  `) as SkillRow[];
  return toSkill(rows[0]);
}

export async function updateSkill(id: string, input: SkillInput): Promise<Skill | null> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE skills
    SET cat = ${input.cat}, tag = ${input.tag}, title = ${input.title}, description = ${input.desc},
        provider = ${input.provider}, video_id = ${input.videoId}, steps = ${input.steps}
    WHERE id = ${id}
    RETURNING id, cat, tag, title, description, provider, video_id, steps, created_at
  `) as SkillRow[];
  return rows[0] ? toSkill(rows[0]) : null;
}

export async function deleteSkill(id: string): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql`
    DELETE FROM skills WHERE id = ${id} RETURNING id
  `) as { id: string }[];
  return rows.length > 0;
}
