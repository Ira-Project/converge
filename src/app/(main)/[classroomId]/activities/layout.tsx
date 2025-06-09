import { SidebarTrigger } from "@/components/ui/sidebar";

export default function ActivitiesLayout({
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