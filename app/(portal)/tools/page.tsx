import BprnCalculator from "@/components/tools/BprnCalculator";

const labValues = [
  {
    name: "공복 혈당 (FBS)",
    range: "70 ~ 99 mg/dL",
    note: "126 mg/dL 이상 시 당뇨병 의증, 방문 시 8시간 공복 확인",
  },
  {
    name: "수동 혈압 (BP)",
    range: "수축기 < 120 / 이완기 < 80 mmHg",
    note: "140/90 mmHg 이상 시 고혈압 분류, 5분 휴식 후 재측정",
  },
  {
    name: "당화혈색소 (HbA1c)",
    range: "4.0 ~ 5.6 %",
    note: "6.5% 이상 시 당뇨 조절 불량, 지난 2~3개월 당조절 지표",
  },
  {
    name: "체질량지수 (BMI)",
    range: "18.5 ~ 22.9 kg/m²",
    note: "25 이상 비만, 노인 복부 비만 및 낙상 위험 사정 필요",
  },
];

export default function ToolsPage() {
  return (
    <div className="space-y-6">
      <BprnCalculator />

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <i className="fa-solid fa-notes-medical text-sky-600" /> 지역사회 주요 건강사정 수치 &
          정상 범위 퀵 참고표
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600 border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">검사 및 항목</th>
                <th className="p-3">정상 범위 (Reference)</th>
                <th className="p-3">임상적 의의 및 주의사항</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {labValues.map((row) => (
                <tr key={row.name}>
                  <td className="p-3 font-semibold text-slate-800">{row.name}</td>
                  <td className="p-3 text-emerald-700 font-bold whitespace-nowrap">{row.range}</td>
                  <td className="p-3">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
