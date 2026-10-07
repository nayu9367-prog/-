import { notFound } from "next/navigation";
import { getSurveySettings, isSurveyKey, SURVEY_LABELS } from "@/lib/surveys";
import SurveyForm from "@/components/survey/SurveyForm";

export const dynamic = "force-dynamic";

export default async function SurveyPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!isSurveyKey(key)) notFound();
  const survey = (await getSurveySettings())[key];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <i className="fa-solid fa-clipboard-list text-emerald-600" /> {SURVEY_LABELS[key]}
        </h3>
        {survey.intro && (
          <p className="text-xs text-slate-500 mt-1 whitespace-pre-line">{survey.intro}</p>
        )}
      </div>

      {survey.open ? (
        <SurveyForm surveyKey={key} survey={survey} />
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          아직 응답을 받지 않는 설문입니다. 교수님 안내가 있을 때 다시 방문해 주세요.
        </p>
      )}
    </div>
  );
}
