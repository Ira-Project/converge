import { SidebarTrigger } from "@/components/ui/sidebar";

export default function AnalyticsLayout({
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