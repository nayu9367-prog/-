import { getAnalyticsSummary } from "@/lib/analytics";
import { getAiTutorLogCount, getAiTutorLogs } from "@/lib/aiTutorLogs";
import StatsView from "@/components/admin/StatsView";
import AiTutorLogsView from "@/components/admin/AiTutorLogsView";

export const dynamic = "force-dynamic";

export default async function AdminStatsPage() {
  const [summary, logs, logCount] = await Promise.all([
    getAnalyticsSummary(),
    getAiTutorLogs(),
    getAiTutorLogCount(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <StatsView summary={summary} />
      <AiTutorLogsView initialLogs={logs} totalCount={logCount} />
    </div>
  );
}
