import { getResourcesSettings } from "@/lib/resourcesSettings";
import ResourcesAdmin from "@/components/admin/ResourcesAdmin";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const settings = await getResourcesSettings();
  return <ResourcesAdmin initialSettings={settings} />;
}
