import { getAnnouncements } from "@/lib/data";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const announcements = await getAnnouncements();
  return <AdminDashboard initialAnnouncements={announcements} />;
}
