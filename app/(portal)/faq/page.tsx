import { getFaqSettings } from "@/lib/faqSettings";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const { items } = await getFaqSettings();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <i className="fa-solid fa-circle-question text-emerald-600" /> 자주 묻는 질문(FAQ)
      </h3>

      {items.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          아직 등록된 질문이 없습니다.
        </p>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="group bg-white rounded-2xl border border-slate-200 shadow-sm open:border-emerald-300"
          >
            <summary className="flex cursor-pointer list-none items-center gap-3 p-5 text-sm font-bold text-slate-800">
              <span className="text-emerald-600">Q.</span>
              <span className="flex-1">{item.question}</span>
              <i className="fa-solid fa-chevron-down text-xs text-slate-400 transition-transform group-open:rotate-180" />
            </summary>
            <p className="whitespace-pre-line border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
