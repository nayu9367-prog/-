export type NavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: string;
};

export type NavGroup = {
  // The dashboard heads the menu on its own, under no heading.
  label?: string;
  items: NavItem[];
};

// The menu follows the dashboard: one group per stage of the practicum.
export const navGroups: NavGroup[] = [
  { items: [{ href: "/", label: "대시보드", icon: "fa-solid fa-chart-pie" }] },
  {
    label: "실습 전",
    items: [{ href: "/quiz", label: "지역사회 실습 퀴즈", icon: "fa-solid fa-gamepad" }],
  },
  {
    label: "실습 중",
    items: [
      { href: "/announcements", label: "공지사항", icon: "fa-solid fa-bullhorn" },
      { href: "/skills", label: "핵심술기 동영상", icon: "fa-solid fa-circle-play" },
      { href: "/tools", label: "BPRS 계산기·사정도구", icon: "fa-solid fa-calculator" },
      {
        href: "/cases",
        label: "AI 사례",
        icon: "fa-solid fa-notes-medical",
        badge: "AI",
      },
      {
        href: "/ai-tutor",
        label: "너시(Nursi)튜터",
        icon: "fa-solid fa-robot",
        badge: "AI",
      },
    ],
  },
  {
    label: "실습 후",
    items: [{ href: "/community", label: "실습 후기·Q&A", icon: "fa-solid fa-comments" }],
  },
  {
    label: "상시",
    items: [
      { href: "/resources", label: "실습 서식", icon: "fa-solid fa-folder-open" },
      { href: "/question", label: "교수님께 질문", icon: "fa-solid fa-envelope-open-text" },
      { href: "/faq", label: "자주 묻는 질문(FAQ)", icon: "fa-solid fa-circle-question" },
      { href: "/institutions", label: "실습기관 정보", icon: "fa-solid fa-hospital" },
    ],
  },
];

export const navItems: NavItem[] = navGroups.flatMap((group) => group.items);

export const adminNavItem: NavItem = {
  href: "/admin",
  label: "관리자 제어 센터",
  icon: "fa-solid fa-sliders",
};
