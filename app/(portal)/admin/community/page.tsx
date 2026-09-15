import { getCommunityPosts } from "@/lib/community";
import CommunityAdmin from "@/components/admin/CommunityAdmin";

export const dynamic = "force-dynamic";

export default async function AdminCommunityPage() {
  const posts = await getCommunityPosts();
  return <CommunityAdmin initialPosts={posts} />;
}
