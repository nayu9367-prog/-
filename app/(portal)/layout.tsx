import { cookies } from "next/headers";
import PortalShell from "@/components/portal/PortalShell";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

export default async function PortalLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const isAdmin = await verifySessionToken(token);

  return <PortalShell isAdmin={isAdmin}>{children}</PortalShell>;
}
