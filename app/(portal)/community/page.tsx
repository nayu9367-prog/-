import { getCommunityPosts } from "@/lib/community";
import CommunityBoard from "@/components/community/CommunityBoard";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const posts = await getCommunityPosts();

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        지역사회간호학 실습 꿀팁과 지침서 작성 궁금증을 나누어보세요.
      </p>

      <CommunityBoard initialPosts={posts} />
    </div>
  );
}
