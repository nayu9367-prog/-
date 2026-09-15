import { neon } from "@neondatabase/serverless";
import { randomUUID } from "crypto";

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

export async function recordPageView(path: string, visitorId: string): Promise<void> {
  const sql = getSql();
  const id = randomUUID();
  const now = new Date().toISOString();
  await sql`
    INSERT INTO page_views (id, path, visitor_id, created_at)
    VALUES (${id}, ${path}, ${visitorId}, ${now})
  `;
}

export type DailyCount = { day: string; count: number };
export type PathCount = { path: string; count: number };

export type AnalyticsSummary = {
  totalViews: number;
  uniqueVisitors: number;
  viewsLast7Days: number;
  topPaths: PathCount[];
  dailyViews: DailyCount[];
};

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const sql = getSql();

  const [totalsRow] = (await sql`
    SELECT
      count(*)::int AS total_views,
      count(DISTINCT visitor_id)::int AS unique_visitors,
      count(*) FILTER (WHERE created_at > now() - interval '7 days')::int AS views_last_7_days
    FROM page_views
  `) as { total_views: number; unique_visitors: number; views_last_7_days: number }[];

  const topPaths = (await sql`
    SELECT path, count(*)::int AS count
    FROM page_views
    GROUP BY path
    ORDER BY count DESC
    LIMIT 10
  `) as PathCount[];

  const dailyViews = (await sql`
    SELECT to_char(date_trunc('day', created_at), 'MM/DD') AS day, count(*)::int AS count
    FROM page_views
    WHERE created_at > now() - interval '14 days'
    GROUP BY date_trunc('day', created_at)
    ORDER BY date_trunc('day', created_at) ASC
  `) as DailyCount[];

  return {
    totalViews: totalsRow?.total_views ?? 0,
    uniqueVisitors: totalsRow?.unique_visitors ?? 0,
    viewsLast7Days: totalsRow?.views_last_7_days ?? 0,
    topPaths,
    dailyViews,
  };
}
