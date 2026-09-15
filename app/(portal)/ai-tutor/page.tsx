import AiTutorChat from "@/components/ai-tutor/AiTutorChat";
import { getVisitCases } from "@/lib/cases";

export const dynamic = "force-dynamic";

export default async function AiTutorPage(props: PageProps<"/ai-tutor">) {
  const searchParams = await props.searchParams;
  const caseId = typeof searchParams.case === "string" ? searchParams.case : undefined;
  const selectedCase = caseId
    ? (await getVisitCases()).find((c) => c.id === caseId) ?? null
    : null;

  return <AiTutorChat initialCase={selectedCase} />;
}
