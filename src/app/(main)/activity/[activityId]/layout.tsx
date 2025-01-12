import { Paths } from "@/lib/constants";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

import { validateRequest } from "@/lib/auth/validate-request";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { ActivitySidebar } from "./_components/sidebar/activity-sidebar";


export default async function ActivityLayout(props: { params: Promise<{ activityId: string }>, children: React.ReactNode }) {

  const params = await props.params;
  const { user } = await validateRequest();
  
  if (user && (!user.isOnboarded || !user.classroomId)) redirect(Paths.Onboarding);

  let activity;
  if(user) {
    activity = await api.activities.getActivity.query({ activityId: params.activityId });
  }

  return (
    <>
      <SidebarProvider>
        <ActivitySidebar activity={activity} user={user} />
        <main className="w-full">
          <SidebarTrigger />
          {props.children}
        </main>
      </SidebarProvider>
    </>
  );
};