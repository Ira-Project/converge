"use client"

import * as React from "react"
import { Layers} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavStudents } from "./nav-students"
import { NavUser } from "./nav-user"
import { ClassSwitcher } from "./class-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { type RouterOutputs } from "@/trpc/shared"
import Image from "next/image"


interface AppSidebarProps {
  classroom: RouterOutputs["classroom"]["get"];
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    isOnboarded: boolean;
    avatar: string | null;
  };
  activities: RouterOutputs["activities"]["getActivities"];
  students: RouterOutputs["classroom"]["students"];
}

export function AppSidebar({ classroom, user, activities, students }: AppSidebarProps) {

  // TODO: Add documentation and Analysis
  const navMain = [
    {
      title: "Topics",
      url: "/",
      icon: Layers,
      isActive: true,
      items: activities.map((topic) => ({
        title: topic.name,
        url: `#${topic.slug}`,
      })),
    }
  ]


  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <ClassSwitcher teams={[{
          name: classroom?.name ?? "Unknown",
          description: classroom?.description ?? "Unknown",
          logo: () => <Image src="/images/logo.png" alt="Ira Logo" width={48} height={48} />,
        }]} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavStudents students={students} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: user.name ?? "Unknown",
          email: user.email,
          avatar: user.avatar,
        }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
