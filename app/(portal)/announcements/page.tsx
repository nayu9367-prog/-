import { getAnnouncements } from "@/lib/data";
import AnnouncementList from "@/components/announcements/AnnouncementList";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <i className="fa-solid fa-bullhorn text-emerald-600" /> 임상실습 공지사항
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          공지와 함께 올라온 첨부 파일은 각 공지 아래의 파일 이름을 눌러 내려받을 수 있습니다.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        {announcements.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">
            등록된 공지사항이 없습니다.
          </p>
        ) : (
          <AnnouncementList announcements={announcements} className="md:text-sm" />
        )}
      </div>
    </div>
  );
}
