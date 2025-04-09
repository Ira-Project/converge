"use client"

import * as React from "react"
import { BookOpen, FileText, Plus, ChartLine, ChartNoAxesColumn, Home } from "lucide-react"

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
import { ComponentIds, Paths, Roles } from "@/lib/constants"


interface AppSidebarProps {
  classroom: RouterOutputs["classroom"]["get"];
  user?: {
    id: string;
    name: string | null;
    email: string;
    isOnboarded: boolean;
    avatar: string | null;
  };
  role: Roles;
  activities: RouterOutputs["activities"]["getActivities"];
  students: RouterOutputs["classroom"]["students"];
}

export function AppSidebar({ classroom, user, activities, students, role }: AppSidebarProps) {

  let filteredActivities = activities;
  if (role === Roles.Student) {
    filteredActivities = activities.filter((activity) => activity.activities.some((a) => a.isLive));
  }
  
  const navMain = [
    {
      title: "Home",
      url: `/${classroom?.id}`,
      icon: Home,
      isActive: true,
    },
    {
      title: "Activity Library",
      url: `${classroom?.id}${Paths.Activities}`,
      icon: BookOpen,
      isActive: true,
      items: filteredActivities.map((topic) => ({
        title: topic.name,
        url: `/${classroom?.id}${Paths.Activities}#${topic.slug}`,
      })),
    },
    {
      title: "Documentation",
      url: `${classroom?.id}${Paths.Documentation}`,
      icon: FileText,
      isActive: true,
    },

  ]

  if(role === Roles.Teacher) {
    if(classroom?.showLeaderboardTeachers) {
      navMain.push({
        title: "Leaderboard",
        url: `/${classroom?.id}${Paths.Leaderboard}`,
        icon: ChartNoAxesColumn,
        isActive: true,
      })
    }
    navMain.push({
      title: "Analytics",
      url: `/${classroom?.id}${Paths.Analytics}`,
      icon: ChartLine,
      isActive: true,
    })
    navMain.push({
      title: "Create Activity",
      url: `/${classroom?.id}#${ComponentIds.CreateAssignment}`,
      icon: Plus,
      isActive: true,
    })
  } else if(role === Roles.Student) {
    if(classroom?.showLeaderboardStudents) {
      navMain.push({
        title: "Leaderboard",
        url: `/${classroom?.id}${Paths.Leaderboard}`,
        icon: ChartNoAxesColumn,
        isActive: true,
      })
    }
  }

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
        <NavStudents students={students} classroomId={classroom?.id ?? ""} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: user?.name ?? "Unknown",
          email: user?.email ?? "Unknown",
          avatar: user?.avatar ?? null,
        }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
