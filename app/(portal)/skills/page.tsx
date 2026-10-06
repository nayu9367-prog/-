import { getSkills } from "@/lib/skills";
import SkillsExplorer from "@/components/skills/SkillsExplorer";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const skills = await getSkills();

  return <SkillsExplorer skills={skills} />;
}
