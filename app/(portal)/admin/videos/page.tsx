import { getReferenceVideosSettings } from "@/lib/referenceVideos";
import ReferenceVideosAdmin from "@/components/admin/ReferenceVideosAdmin";

export const dynamic = "force-dynamic";

export default async function AdminReferenceVideosPage() {
  const settings = await getReferenceVideosSettings();
  return <ReferenceVideosAdmin initialSettings={settings} />;
}
