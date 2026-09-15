import { getCommunityPosts } from "@/lib/community";
import CommunityBoard from "@/components/community/CommunityBoard";
import QuestionForm from "@/components/QuestionForm";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const posts = await getCommunityPosts();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-800">실습 후기 & Q&A 게시판 💬</h2>
        <p className="text-xs text-slate-500 mt-1">
          지역사회간호학 실습 꿀팁과 지침서 작성 궁금증을 나누어보세요.
        </p>
      </div>

      <CommunityBoard initialPosts={posts} />

      <section className="flex flex-col gap-4 border-t border-slate-200 pt-8">
        <h3 className="text-lg font-semibold text-slate-800">담당 교수님께 질문하기</h3>
        <p className="text-xs text-slate-500 -mt-2">
          이름, 학번과 함께 질문을 남기면 담당 교수님께 바로 전달됩니다.
        </p>
        <QuestionForm />
      </section>
    </div>
  );
}
