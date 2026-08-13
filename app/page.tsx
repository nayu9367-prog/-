import Link from "next/link";
import { getAnnouncements } from "@/lib/data";
import { formatDate } from "@/lib/format";
import QuestionForm from "@/components/QuestionForm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const announcements = await getAnnouncements();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">공지사항</h1>
        <p className="mt-2 text-sm text-neutral-500">
          최신 공지사항을 확인하고 궁금한 점을 남겨주세요.
        </p>
      </header>

      <section aria-labelledby="announcements-heading" className="flex flex-col gap-4">
        <h2 id="announcements-heading" className="text-lg font-semibold text-neutral-800">
          공지사항 목록
        </h2>
        {announcements.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
            등록된 공지사항이 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {announcements.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-neutral-900">{a.title}</h3>
                  <time dateTime={a.createdAt} className="text-xs text-neutral-400">
                    {formatDate(a.createdAt)}
                  </time>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-600">
                  {a.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        aria-labelledby="question-heading"
        className="flex flex-col gap-4 border-t border-neutral-200 pt-8"
      >
        <h2 id="question-heading" className="text-lg font-semibold text-neutral-800">
          질문하기
        </h2>
        <QuestionForm />
      </section>

      <footer className="text-center text-xs text-neutral-400">
        <Link href="/admin/login" className="hover:underline">
          관리자
        </Link>
      </footer>
    </main>
  );
}
