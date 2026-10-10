import { getReferenceVideosSettings } from "@/lib/referenceVideos";
import ReferenceVideos from "@/components/videos/ReferenceVideos";

export const dynamic = "force-dynamic";

export default async function ReferenceVideosPage() {
  const { items } = await getReferenceVideosSettings();

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        실습을 시작하기 전에 봐 두면 좋은 영상입니다. 영상을 누르면 이 화면에서 바로 재생됩니다.
      </p>
      <ReferenceVideos videos={items} />
    </div>
  );
}
