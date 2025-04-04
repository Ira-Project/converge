import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

import { validateRequest } from "@/lib/auth/validate-request";
import { api } from "@/trpc/server";
import { ActivitySidebar } from "./_components/sidebar/activity-sidebar";
import posthog from "posthog-js";
import PostHogClient from "@/lib/posthog";


export default async function ActivityLayout(props: { params: Promise<{ activityId: string }>, children: React.ReactNode }) {

  const params = await props.params;
  const { user } = await validateRequest();
  
  let activity;
  if(user) {
    const posthogClient = PostHogClient();
    posthogClient.identify({
      distinctId: user.id,
      properties: {
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
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