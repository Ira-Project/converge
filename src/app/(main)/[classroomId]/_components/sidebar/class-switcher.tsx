"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"
import Link from "next/link"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import posthog from "posthog-js"
import { CreateClassroomModal } from "./create-classroom-modal"
import { Paths, Roles } from "@/lib/constants"

export function ClassSwitcher({
  teams,
  currentClassroomId,
  role,
}: {
  teams: {
    id: string
    name: string
    logo: React.ElementType
    description: string
  }[]
  currentClassroomId: string
  role: Roles
}) {
  const { isMobile } = useSidebar()
  const [activeTeam] = React.useState(teams.find((team) => team.id === currentClassroomId) ?? teams[0])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={() => {
            posthog.capture("class_switcher_opened")
          }}>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                {activeTeam?.logo && <activeTeam.logo className="size-4" />}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeTeam?.name}
                </span>
                <span className="truncate text-xs">{activeTeam?.description}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Classrooms
            </DropdownMenuLabel>
            {teams.map((team) => (
              <Link href={`${Paths.Classroom}${team.id}`} key={team.id}>
                <DropdownMenuItem
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center">
                    <team.logo className="size-4 shrink-0" />
                  </div>
                  {team.name}
                </DropdownMenuItem>
              </Link>
            ))}
            <DropdownMenuSeparator />
            {role === Roles.Teacher && <CreateClassroomModal />}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
