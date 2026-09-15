export type SkillCategory = "visit" | "edu" | "check" | "skill";

export type VideoProvider = "youtube" | "vimeo";

export type Skill = {
  id: string;
  cat: SkillCategory;
  tag: string;
  title: string;
  desc: string;
  provider: VideoProvider;
  videoId: string;
  steps: string[];
  createdAt: string;
};

export const skillCategories: { id: SkillCategory | "all"; label: string }[] = [
  { id: "all", label: "전체보기" },
  { id: "skill", label: "기본간호술기" },
  { id: "visit", label: "방문간호" },
  { id: "edu", label: "보건교육" },
  { id: "check", label: "건강사정" },
];
