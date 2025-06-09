import { SidebarTrigger } from "@/components/ui/sidebar";

export default function ActivityLibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SidebarTrigger className="text-white" />
      {children}
    </>
  );
} 