import { Suspense } from "react";
import SiteLoginForm from "@/components/SiteLoginForm";
import { getActiveGroupCodes } from "@/lib/groupCodes";

export const dynamic = "force-dynamic";

export default async function SiteLoginPage() {
  // If this can't be read the form still works: the wording is the only
  // thing that depends on it.
  const useGroupCodes = await getActiveGroupCodes()
    .then((groups) => groups.length > 0)
    .catch(() => false);
  return (
    <Suspense>
      <SiteLoginForm useGroupCodes={useGroupCodes} />
    </Suspense>
  );
}
