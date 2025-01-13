"use client"

import * as React from "react"
import { Activity, ArrowLeft} from "lucide-react"

import { NavUser } from "./nav-user"
import { ClassSwitcher } from "./class-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import { type RouterOutputs } from "@/trpc/shared"
import Image from "next/image"
import { type ActivityType, Paths } from "@/lib/constants"
import { getMetaDataFromActivityType } from "@/lib/utils/activityUtils"
import Link from "next/link"

interface ActivitySidebarProps {
  activity: RouterOutputs["activities"]["getActivity"];
  user?: {
    id: string;
    name: string | null;
    email: string;
    isOnboarded: boolean;
    avatar: string | null;
    classroomId: string | null;
  } | null;
}

export function ActivitySidebar({ activity, user }: ActivitySidebarProps) {

  const activityMetaData = getMetaDataFromActivityType(activity?.type as ActivityType, activity?.id);

  // TODO: Add documentation and Analysis
  const navMain = [
    {
      title: "Back to Classroom",
      url: `${Paths.Classroom}${activity?.classroomId ?? user?.classroomId}`,
      icon: ArrowLeft,
      isActive: false,
    },
    {
      title: "Activity Page",
      url: `${activityMetaData?.url}`,
      icon: Activity,
      isActive: false,
    }
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <ClassSwitcher teams={[{
          name: activity?.classroom?.name ?? "Unknown",
          description: activity?.classroom?.description ?? "Unknown",
          logo: () => <Image src="/images/logo.png" alt="Ira Logo" width={48} height={48} />,
        }]} />
      </SidebarHeader>
      <SidebarContent>
        {navMain.map((item) => (
          <SidebarMenuButton asChild key={item.title}>
            <Link href={item.url}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        ))}
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
