import { getAnalyticsSummary } from "@/lib/analytics";
import StatsView from "@/components/admin/StatsView";

export const dynamic = "force-dynamic";

export default async function AdminStatsPage() {
  const summary = await getAnalyticsSummary();
  return <StatsView summary={summary} />;
}
