import { getSkills } from "@/lib/skills";
import SkillCertificateView from "@/components/skills/SkillCertificateView";

export const dynamic = "force-dynamic";

export default async function SkillCertificatePage() {
  const skills = await getSkills();
  return <SkillCertificateView skills={skills.map(({ id, title, videoId }) => ({ id, title, videoId }))} />;
}
