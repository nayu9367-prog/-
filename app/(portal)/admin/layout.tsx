import AdminTopBar from "@/components/admin/AdminTopBar";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-col gap-6">
      <AdminTopBar />
      {children}
    </div>
  );
}
