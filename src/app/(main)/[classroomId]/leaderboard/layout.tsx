import { SidebarTrigger } from "@/components/ui/sidebar";

export default function LeaderboardLayout({
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