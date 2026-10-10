import type { Announcement } from "@/lib/data";
import { formatDate } from "@/lib/format";

export default function AnnouncementList({
  announcements,
  className = "",
}: {
  announcements: Announcement[];
  className?: string;
}) {
  return (
    <ul className={`space-y-3 text-sm text-slate-600 ${className}`}>
      {announcements.map((a) => (
        <li key={a.id} className="p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
          <div className="flex items-start justify-between gap-2">
            <span className="font-medium text-slate-800">{a.title}</span>
            <time dateTime={a.createdAt} className="text-slate-400 text-xs shrink-0">
              {formatDate(a.createdAt)}
            </time>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-slate-500">{a.content}</p>
          {a.fileUrl && (
            <a
              href={a.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 font-medium text-emerald-700 transition hover:bg-emerald-100"
            >
              <i className="fa-solid fa-paperclip shrink-0" />
              <span className="truncate">{a.fileName || "첨부파일"}</span>
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
