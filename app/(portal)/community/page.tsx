import { getCommunityPosts } from "@/lib/community";
import CommunityBoard from "@/components/community/CommunityBoard";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const posts = await getCommunityPosts();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-800">실습 후기·Q&A 게시판 💬</h2>
        <p className="text-xs text-slate-500 mt-1">
          지역사회간호학 실습 꿀팁과 지침서 작성 궁금증을 나누어보세요.
        </p>
      </div>

      <CommunityBoard initialPosts={posts} />
    </div>
  );
}
