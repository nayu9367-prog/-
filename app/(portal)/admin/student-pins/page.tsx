import { getStudentPinRecords } from "@/lib/studentPins";
import StudentPinsAdmin from "@/components/admin/StudentPinsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminStudentPinsPage() {
  const records = await getStudentPinRecords();
  return <StudentPinsAdmin initialRecords={records} />;
}
