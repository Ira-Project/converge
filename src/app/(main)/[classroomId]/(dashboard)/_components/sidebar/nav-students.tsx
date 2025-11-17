"use client"

import {
  MoreHorizontal,
} from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { type RouterOutputs } from "@/trpc/shared";
import { useState } from "react";
import AddStudentsModal from "./add-students-modal";
import { Roles } from "@/lib/constants";

export function NavStudents({
  classroomId,
  students,
  role,
}: {
  classroomId: string;
  students: RouterOutputs["classroom"]["students"];
  role: Roles;
}) {
  const [showAll, setShowAll] = useState(false)

  const displayedStudents = showAll ? students : students.slice(0, 5)

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Students</SidebarGroupLabel>
      <SidebarMenu>
        {students.length === 0 ? (
          <SidebarMenuItem>
            <span className="text-sidebar-foreground/70 text-sm p-2">
              No students have joined yet
            </span>
          </SidebarMenuItem>
        ) : (
          <>
            {displayedStudents.map((student) => (
              <SidebarMenuItem key={student.user.id}>
                <SidebarMenuButton asChild>
                  <span>{student.user.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {students.length > 5 && (
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className="text-sidebar-foreground/70"
                  onClick={() => setShowAll(!showAll)}
                >
                  <MoreHorizontal className="text-sidebar-foreground/70" />
                  <span>{showAll ? 'Show Less' : 'More'}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </>
        )}
      </SidebarMenu>
      {role === Roles.Teacher && (
        <AddStudentsModal classroomId={classroomId} />
      )}
    </SidebarGroup>
  )
}
