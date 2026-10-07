import { getSurveyResponses, getSurveySettings } from "@/lib/surveys";
import SurveysAdmin from "@/components/admin/SurveysAdmin";

export const dynamic = "force-dynamic";

export default async function AdminSurveysPage() {
  const [settings, pre, post] = await Promise.all([
    getSurveySettings(),
    getSurveyResponses("pre"),
    getSurveyResponses("post"),
  ]);
  return <SurveysAdmin initialSettings={settings} responses={{ pre, post }} />;
}
