import CopyTemplateButton from "@/components/resources/CopyTemplateButton";

const omahaDomains = [
  {
    title: "1. 환경 영역 (Environmental)",
    desc: "수질, 주거환경, 안전, 난방, 위생 상태 등 물리적 주변 환경 문제.",
    example: "예: 불결한 주거환경, 낙상 위험 환경",
    color: "text-emerald-800",
    dot: "bg-emerald-600",
  },
  {
    title: "2. 사회심리 영역 (Psychosocial)",
    desc: "사회적 고립, 우울, 가족관계, 학대, 자존감 등 동반 관계 문제.",
    example: "예: 사회적 고립, 방임/우울",
    color: "text-sky-800",
    dot: "bg-sky-600",
  },
  {
    title: "3. 생리 영역 (Physiological)",
    desc: "신체 기능, 질병 증상, 통증, 감각, 시력/청력 상태 등 생리학적 문제.",
    example: "예: 신체활동 장애, 혈당 조절 장애",
    color: "text-teal-800",
    dot: "bg-teal-600",
  },
  {
    title: "4. 건강관련 행위 영역 (Health-related Behaviors)",
    desc: "영양, 식이, 영양섭취, 운동, 복약 이행, 흡연/음주 수칙.",
    example: "예: 약물 복용 이행 부적절, 불균형적 영양",
    color: "text-amber-800",
    dot: "bg-amber-600",
  },
];

const templates = [
  {
    id: "omaha",
    icon: "fa-solid fa-file-contract",
    iconColor: "text-emerald-600",
    title: "OMAHA 진단 문제목록 양식",
    desc: "영역-문제-증상표징(S/S) 3단계 구조화 양식입니다.",
    buttonClass: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700",
    text:
      "=== OMAHA 간호진단 문제목록 양식 ===\n1. 영역 (Domain):\n2. 문제 (Problem):\n3. 증상 및 표징 (Signs/Symptoms):\n4. 목표 (Outcome Target):\n5. 간호중재 (Interventions):",
  },
  {
    id: "edu",
    icon: "fa-solid fa-chalkboard-user",
    iconColor: "text-teal-600",
    title: "15분 보건교육 계획안 템플릿",
    desc: "도입-전개-정리 3단계 시안 양식입니다.",
    buttonClass: "bg-teal-50 hover:bg-teal-100 text-teal-700",
    text:
      "=== 15분 보건교육 계획안 ===\n- 교육 주제:\n- 대상자:\n- 도입 (3분): 동기 유발 및 형성 평가\n- 전개 (9분): 핵심 내용 전달 및 시연\n- 정리 (3분): 요약 및 퀴즈 평가",
  },
  {
    id: "visit",
    icon: "fa-solid fa-house-user",
    iconColor: "text-sky-600",
    title: "방문간호 가정환경 사정도구",
    desc: "낙상위험 및 보행장애 체크리스트 양식입니다.",
    buttonClass: "bg-sky-50 hover:bg-sky-100 text-sky-700",
    text:
      "=== 방문간호 가정환경 사정표 ===\n[ ] 현관/복도 조도\n[ ] 욕실 미끄럼 방지 매트\n[ ] 방 문턱 장애물\n[ ] 보행보조기구 고무 패드 상태",
  },
];

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <i className="fa-solid fa-folder-open text-amber-500" /> OMAHA 간호진단 체계 4대 영역
          안내서
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {omahaDomains.map((domain) => (
            <div key={domain.title} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <h4 className={`font-bold flex items-center gap-1.5 ${domain.color}`}>
                <span className={`w-2 h-2 rounded-full ${domain.dot}`} /> {domain.title}
              </h4>
              <p className="text-slate-600">{domain.desc}</p>
              <span className="text-[11px] text-slate-400">{domain.example}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((t) => (
          <div key={t.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <i className={`${t.icon} text-2xl ${t.iconColor}`} />
            <h4 className="font-bold text-slate-800 text-sm">{t.title}</h4>
            <p className="text-xs text-slate-500">{t.desc}</p>
            <CopyTemplateButton text={t.text} colorClass={t.buttonClass} />
          </div>
        ))}
      </div>
    </div>
  );
}
