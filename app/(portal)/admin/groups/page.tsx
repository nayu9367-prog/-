import { getGroupCodes, getGroupLogins } from "@/lib/groupCodes";
import GroupCodesAdmin from "@/components/admin/GroupCodesAdmin";

export const dynamic = "force-dynamic";

export default async function AdminGroupCodesPage() {
  const [settings, logins] = await Promise.all([getGroupCodes(), getGroupLogins()]);
  return <GroupCodesAdmin initialSettings={settings} logins={logins} />;
}
