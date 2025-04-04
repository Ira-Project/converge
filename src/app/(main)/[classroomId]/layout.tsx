import { Paths, Roles } from "@/lib/constants";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

import { validateRequest } from "@/lib/auth/validate-request";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "./_components/sidebar/app-sidebar";
// import PostHogClient from "@/lib/posthog";
import posthog from "posthog-js";

export default async function MainLayout(props: { params: Promise<{ classroomId: string }>, children: React.ReactNode }) {

  const params = await props.params;
  const { user } = await validateRequest();
  
  let classroom;
  let activities;
  let students;
  let usersToClassrooms;
  if(user) {
    // const posthog = PostHogClient();
    posthog.identify(user.id, {
      email: user.email,
      name: user.name,
      role: user.role,
    });

    classroom = await api.classroom.get.query({ id: params.classroomId, });
    activities = await api.activities.getActivities.query({ classroomId: params.classroomId });
    students = await api.classroom.students.query({ id: params.classroomId });
    usersToClassrooms = await api.classroom.getOrCreateUserToClassroom.query({ classroomId: params.classroomId });
    
    if(!user.isOnboarded && user.role === Roles.Teacher) {
      redirect(Paths.Onboarding);
    }
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar role={usersToClassrooms?.role ?? Roles.Student} classroom={classroom} user={user ?? undefined} activities={activities ?? []} students={students ?? []} />
        <main className="w-full">
          <SidebarTrigger className="text-white" />
          {props.children}
        </main>
      </SidebarProvider>
    </>
  );
};