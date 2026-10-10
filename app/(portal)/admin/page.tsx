import Link from "next/link";

type Section = { href: string; icon: string; title: string; desc: string };

// Grouped like the student menu: by when in the practicum each feature is
// used, with the site-wide settings last.
const groups: { label: string; sub: string; sections: Section[] }[] = [
  {
    label: "실습 전",
    sub: "준비 · 계획",
    sections: [
      {
        href: "/admin/surveys?survey=pre",
        icon: "fa-solid fa-clipboard-list",
        title: "사전 요구도 조사",
        desc: "사전 요구도 조사 문항을 입력하고 응답 결과를 확인합니다.",
      },
      {
        href: "/admin/quiz",
        icon: "fa-solid fa-gamepad",
        title: "퀴즈",
        desc: "객관식·서술형 문제, 정답, 해설을 관리합니다.",
      },
      {
        href: "/admin/safety",
        icon: "fa-solid fa-shield-heart",
        title: "안전·인권·감염관리",
        desc: "사고 보고 절차, 안전관리, 감염관리, 인권보호 안내 문구를 수정합니다.",
      },
      {
        href: "/admin/videos",
        icon: "fa-solid fa-film",
        title: "실습 참고 영상",
        desc: "유튜브 링크로 실습 전에 볼 참고 영상을 등록합니다.",
      },
    ],
  },
  {
    label: "실습 중",
    sub: "수행 · 학습",
    sections: [
      {
        href: "/admin/skills",
        icon: "fa-solid fa-circle-play",
        title: "핵심술기 영상",
        desc: "영상과 상세 프로토콜 체크리스트를 관리하고, 이수 확인증을 받은 학생을 확인합니다.",
      },
      {
        href: "/admin/cases",
        icon: "fa-solid fa-notes-medical",
        title: "AI 사례 시나리오",
        desc: "대상자 이름별 방문간호 시나리오를 등록/수정합니다.",
      },
      {
        href: "/admin/tutor-materials",
        icon: "fa-solid fa-robot",
        title: "AI 튜터 참고자료",
        desc: "AI 튜터가 읽고 답변에 활용할 PDF 자료를 등록/삭제합니다.",
      },
    ],
  },
  {
    label: "실습 후",
    sub: "점검 · 개선",
    sections: [
      {
        href: "/admin/community",
        icon: "fa-solid fa-comments",
        title: "커뮤니티 관리",
        desc: "실습 후기·질문·팁 게시글을 확인하고 삭제합니다.",
      },
      {
        href: "/admin/handover",
        icon: "fa-solid fa-right-left",
        title: "실습현장 인계사항",
        desc: "학생들이 올린 실습기관별 인계 자료(PDF)를 확인하고 삭제합니다.",
      },
      {
        href: "/admin/surveys?survey=post",
        icon: "fa-solid fa-clipboard-check",
        title: "실습 만족도 조사",
        desc: "실습 만족도 조사 문항을 입력하고 응답 결과를 확인합니다.",
      },
    ],
  },
  {
    label: "상시",
    sub: "언제든 이용",
    sections: [
      {
        href: "/admin/announcements",
        icon: "fa-solid fa-bullhorn",
        title: "공지사항",
        desc: "임상실습 공지사항을 작성/수정/삭제합니다.",
      },
      {
        href: "/admin/resources",
        icon: "fa-solid fa-folder-open",
        title: "실습 서식",
        desc: "학생이 내려받는 실습 서식(파일 포함)을 관리합니다.",
      },
      {
        href: "/admin/questions",
        icon: "fa-solid fa-envelope-open-text",
        title: "교수님께 질문",
        desc: "구글 시트로 전달된 질문을 백업용으로 확인/삭제합니다.",
      },
      {
        href: "/admin/faq",
        icon: "fa-solid fa-circle-question",
        title: "자주 묻는 질문(FAQ)",
        desc: "학생이 자주 묻는 질문과 답변을 등록/수정합니다.",
      },
      {
        href: "/admin/institutions",
        icon: "fa-solid fa-hospital",
        title: "실습기관 정보",
        desc: "실습기관의 주소, 연락처, 안내 사항을 관리합니다.",
      },
    ],
  },
  {
    label: "사이트 운영",
    sub: "설정 · 통계",
    sections: [
      {
        href: "/admin/dashboard",
        icon: "fa-solid fa-chart-pie",
        title: "대시보드",
        desc: "환영 문구, 바로가기 카드, 체크리스트를 관리합니다.",
      },
      {
        href: "/admin/student-pins",
        icon: "fa-solid fa-key",
        title: "학생 PIN 관리",
        desc: "PIN을 잊은 학생의 PIN을 초기화합니다.",
      },
      {
        href: "/admin/stats",
        icon: "fa-solid fa-chart-line",
        title: "이용 통계",
        desc: "학생들이 사이트를 얼마나, 어떻게 이용하는지 확인합니다.",
      },
    ],
  },
];

export default function AdminHomePage() {
  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.label} className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <span className="h-4 w-1.5 rounded-full bg-emerald-600" /> {group.label}
            <span className="text-xs font-medium text-emerald-700">{group.sub}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {group.sections.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all group space-y-3 block"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  <i className={s.icon} />
                </div>
                <h3 className="font-bold text-slate-900">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 pt-1">
                  관리하기 <i className="fa-solid fa-arrow-right" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
