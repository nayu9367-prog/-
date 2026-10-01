import { getTutorMaterials } from "@/lib/tutorMaterials";
import TutorMaterialsAdmin from "@/components/admin/TutorMaterialsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminTutorMaterialsPage() {
  const materials = await getTutorMaterials();
  return <TutorMaterialsAdmin initialMaterials={materials} />;
}
