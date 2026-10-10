import { getSkills } from "@/lib/skills";
import { getSkillCertificates } from "@/lib/skillCertificates";
import SkillsAdmin from "@/components/admin/SkillsAdmin";
import SkillCertificatesAdmin from "@/components/admin/SkillCertificatesAdmin";

export const dynamic = "force-dynamic";

export default async function AdminSkillsPage() {
  const [skills, certificates] = await Promise.all([getSkills(), getSkillCertificates()]);
  return (
    <div className="flex flex-col gap-6">
      <SkillsAdmin initialSkills={skills} />
      <SkillCertificatesAdmin initialCertificates={certificates} />
    </div>
  );
}
