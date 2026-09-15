import { getSkills } from "@/lib/skills";
import SkillsExplorer from "@/components/skills/SkillsExplorer";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const skills = await getSkills();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">지역사회 & 방문간호 핵심술기 동영상 관 📹</h2>
        <p className="text-xs text-slate-500 mt-1">
          방문간호 가방 세팅, 노인 기능 사정, 혈압/혈당 측정, 만성질환 보건교육 영상 및 프로토콜
          지침입니다.
        </p>
      </div>
      <SkillsExplorer skills={skills} />
    </div>
  );
}
