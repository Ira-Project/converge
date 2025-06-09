import { SidebarTrigger } from "@/components/ui/sidebar";

export default function SettingsLayout({
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