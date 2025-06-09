import { SidebarTrigger } from "@/components/ui/sidebar";

export default function ActivityPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SidebarTrigger className="text-black" />
      {children}
    </>
  );
} 