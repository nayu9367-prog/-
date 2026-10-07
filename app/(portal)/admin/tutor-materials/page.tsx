import { getTutorMaterials } from "@/lib/tutorMaterials";
import { getVisitCases } from "@/lib/cases";
import TutorMaterialsAdmin from "@/components/admin/TutorMaterialsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminTutorMaterialsPage() {
  const [materials, cases] = await Promise.all([getTutorMaterials(), getVisitCases()]);
  return (
    <TutorMaterialsAdmin
      initialMaterials={materials}
      cases={cases.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
