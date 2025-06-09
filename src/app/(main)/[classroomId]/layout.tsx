import { Paths, Roles } from "@/lib/constants";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

import { validateRequest } from "@/lib/auth/validate-request";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "./(dashboard)/_components/sidebar/app-sidebar";

export default async function MainLayout(props: { params: Promise<{ classroomId: string }>, children: React.ReactNode }) {

  const params = await props.params;
  const { user } = await validateRequest();
  
  let classroom;
  let classrooms;
  let activities;
  let students;
  let usersToClassrooms;
  if(user) {
    classroom = await api.classroom.get.query({ id: params.classroomId, });
    classrooms = await api.classroom.getClassrooms.query();
    activities = await api.activities.getAllActivities.query({ classroomId: params.classroomId });
    students = await api.classroom.students.query({ id: params.classroomId });
    usersToClassrooms = await api.classroom.getOrCreateUserToClassroom.query({ classroomId: params.classroomId });
    
    if(!user.isOnboarded && user.role === Roles.Teacher) {
      redirect(Paths.Onboarding);
    }
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar role={usersToClassrooms?.role ?? Roles.Student} classrooms={classrooms ?? []} classroom={classroom} user={user ?? undefined} activities={activities ?? []} students={students ?? []} />
        <main className="w-full">
          {props.children}
        </main>
      </SidebarProvider>
    </>
  );
};