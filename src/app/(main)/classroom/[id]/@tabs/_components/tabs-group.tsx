'use client';
import { Button } from "@/components/ui/button";
import { Roles } from "@/lib/constants";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

enum Tabs {
  Assignments = "assignments",
  People = "people",
}

export function TabsGroup({ id, role }: { id: string, role: Roles }) {

  const activeTab = useSelectedLayoutSegment('tabs');

  return (
    <div className="flex gap-4">
      <Link href={`/classroom/${id}/`}>
        <Button variant={activeTab !== Tabs.People ? "secondary" : "ghost"} >
          Assignments
        </Button>
      </Link>
      { 
        role === Roles.Teacher && 
        <Button variant={activeTab === Tabs.People ? "secondary" : "ghost"}>
          <Link href={`/classroom/${id}/people`}>People</Link>
        </Button>
      }
    </div>
  );
}