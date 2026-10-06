import { getFaqSettings } from "@/lib/faqSettings";
import FaqAdmin from "@/components/admin/FaqAdmin";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
  const settings = await getFaqSettings();
  return <FaqAdmin initialSettings={settings} />;
}
