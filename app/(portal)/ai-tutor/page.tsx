import AiTutorChat from "@/components/ai-tutor/AiTutorChat";
import { getVisitCases } from "@/lib/cases";

export const dynamic = "force-dynamic";

export default async function AiTutorPage(props: PageProps<"/ai-tutor">) {
  const searchParams = await props.searchParams;
  const caseId = typeof searchParams.case === "string" ? searchParams.case : undefined;

  return <AiTutorChat cases={await getVisitCases()} initialCaseId={caseId} />;
}
