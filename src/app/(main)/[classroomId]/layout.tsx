import { Paths } from "@/lib/constants";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

import { validateRequest } from "@/lib/auth/validate-request";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "./_components/sidebar/app-sidebar";


export default async function MainLayout(props: { params: Promise<{ classroomId: string }>, children: React.ReactNode }) {

  const params = await props.params;
  const { user } = await validateRequest();
  
  // if (!user) redirect(Paths.Login);
  // if (!user?.isOnboarded) redirect(Paths.Onboarding);

  let classroom;
  let activities;
  let students;
  if(user) {
    classroom = await api.classroom.get.query({ id: params.classroomId, });
    activities = await api.activities.getActivities.query({ classroomId: params.classroomId });
    students = await api.classroom.students.query({ id: params.classroomId });
  }

  // if(!classroom) redirect(Paths.Onboarding);

  return (
    <>
      <SidebarProvider>
        <AppSidebar classroom={classroom} user={user ?? undefined} activities={activities ?? []} students={students ?? []} />
        <main className="w-full">
          <SidebarTrigger className="text-white" />
          {props.children}
        </main>
      </SidebarProvider>
    </>
  );
};