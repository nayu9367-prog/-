import { getSurveyResponses, getSurveySettings, isSurveyKey } from "@/lib/surveys";
import SurveysAdmin from "@/components/admin/SurveysAdmin";

export const dynamic = "force-dynamic";

export default async function AdminSurveysPage({
  searchParams,
}: {
  searchParams: Promise<{ survey?: string }>;
}) {
  // The control centre links straight to one survey's tab.
  const { survey } = await searchParams;
  const [settings, pre, post] = await Promise.all([
    getSurveySettings(),
    getSurveyResponses("pre"),
    getSurveyResponses("post"),
  ]);
  return (
    <SurveysAdmin
      initialSettings={settings}
      responses={{ pre, post }}
      initialSurvey={isSurveyKey(survey) ? survey : "pre"}
    />
  );
}
