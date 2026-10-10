import { neon } from "@neondatabase/serverless";

// Videos to watch before the practicum, given as YouTube links.
export type ReferenceVideo = {
  title: string;
  // The link as the admin pasted it, so it reads the same when edited.
  url: string;
  videoId: string;
  desc: string;
};

export type ReferenceVideosSettings = {
  items: ReferenceVideo[];
};

const SETTINGS_KEY = "reference-videos";

export const DEFAULT_REFERENCE_VIDEOS_SETTINGS: ReferenceVideosSettings = { items: [] };

// The video's ID from any of the forms a YouTube link comes in (watch,
// youtu.be, shorts, live, embed), or null when it isn't one.
export function parseYouTubeId(input: string): string | null {
  const value = input.trim();
  if (/^[\w-]{11}$/.test(value)) return value;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m|music)\./, "");
  let id: string | null = null;
  if (host === "youtu.be") {
    id = url.pathname.split("/")[1] ?? null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    id =
      url.pathname === "/watch"
        ? url.searchParams.get("v")
        : (url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/]+)/)?.[1] ?? null);
  }
  return id && /^[\w-]{11}$/.test(id) ? id : null;
}

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

export async function getReferenceVideosSettings(): Promise<ReferenceVideosSettings> {
  const sql = getSql();
  const rows = (await sql`
    SELECT value FROM site_settings WHERE key = ${SETTINGS_KEY}
  `) as { value: ReferenceVideosSettings }[];
  return rows[0]?.value ?? DEFAULT_REFERENCE_VIDEOS_SETTINGS;
}

export async function updateReferenceVideosSettings(
  value: ReferenceVideosSettings
): Promise<ReferenceVideosSettings> {
  const sql = getSql();
  const now = new Date().toISOString();
  const rows = (await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${SETTINGS_KEY}, ${JSON.stringify(value)}::jsonb, ${now})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
    RETURNING value
  `) as { value: ReferenceVideosSettings }[];
  return rows[0].value;
}
