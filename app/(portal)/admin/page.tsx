import Link from "next/link";

const sections = [
  {
    href: "/admin/announcements",
    icon: "fa-solid fa-bullhorn",
    title: "공지사항",
    desc: "임상실습 공지사항을 작성/수정/삭제합니다.",
  },
  {
    href: "/admin/dashboard",
    icon: "fa-solid fa-chart-pie",
    title: "대시보드",
    desc: "환영 문구, 바로가기 카드, 체크리스트를 관리합니다.",
  },
  {
    href: "/admin/quiz",
    icon: "fa-solid fa-gamepad",
    title: "퀴즈",
    desc: "퀴즈 문제, 보기, 정답, 해설을 관리합니다.",
  },
  {
    href: "/admin/skills",
    icon: "fa-solid fa-circle-play",
    title: "핵심술기 영상",
    desc: "영상과 상세 프로토콜 체크리스트를 관리합니다.",
  },
  {
    href: "/admin/resources",
    icon: "fa-solid fa-folder-open",
    title: "자료실",
    desc: "OMAHA 영역 안내와 실습 서식(파일 포함)을 관리합니다.",
  },
  {
    href: "/admin/stats",
    icon: "fa-solid fa-chart-line",
    title: "이용 통계",
    desc: "학생들이 사이트를 얼마나, 어떻게 이용하는지 확인합니다.",
  },
];

export default function AdminHomePage() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {sections.map((s) => (
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
  );
}
