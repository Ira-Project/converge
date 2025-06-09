"use client"

import {
  ChevronsUpDown,
  Settings,
} from "lucide-react"

import Avatar from 'boring-avatars'

import {
  Avatar as ShadcnAvatar,
  AvatarImage,
} from "@/components/ui/avatar"

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
import { LogoutWithDialog } from "@/components/logout-with-dialog"
import { Paths } from "@/lib/constants"
import Link from "next/link"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string | null
  }
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <ShadcnAvatar className="h-8 w-8 rounded-full">
                {user.avatar 
                  ? <AvatarImage src={user.avatar} alt={user.name} /> 
                  : <Avatar name={user.name ?? "anonymous"} variant="bauhaus" />
                }
              </ShadcnAvatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <ShadcnAvatar className="h-8 w-8 rounded-full">
                {user.avatar 
                  ? <AvatarImage src={user.avatar} alt={user.name} /> 
                  : <Avatar name={user.name ?? "anonymous"} variant="bauhaus" />
                }
                </ShadcnAvatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={Paths.AccountSettings} className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Account Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogoutWithDialog />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
