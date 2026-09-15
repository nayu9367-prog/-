export type NavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: string;
};

export const navItems: NavItem[] = [
  { href: "/", label: "대시보드", icon: "fa-solid fa-chart-pie" },
  {
    href: "/cases",
    label: "AI 사례",
    icon: "fa-solid fa-notes-medical",
    badge: "AI",
  },
  {
    href: "/ai-tutor",
    label: "보건교육 튜터",
    icon: "fa-solid fa-robot",
    badge: "AI",
  },
  { href: "/quiz", label: "지역사회 실습 퀴즈", icon: "fa-solid fa-gamepad", badge: "HOT" },
  { href: "/skills", label: "핵심술기 동영상", icon: "fa-solid fa-circle-play" },
  { href: "/tools", label: "BPRN 계산기·사정도구", icon: "fa-solid fa-calculator" },
  { href: "/resources", label: "OMAHA·실습 서식", icon: "fa-solid fa-folder-open" },
  { href: "/community", label: "실습 후기·Q&A", icon: "fa-solid fa-comments" },
];

export const adminNavItem: NavItem = {
  href: "/admin",
  label: "관리자 제어 센터",
  icon: "fa-solid fa-sliders",
};
